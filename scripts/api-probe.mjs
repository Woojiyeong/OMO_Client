import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_BASE_URL =
  process.env.OMO_API_BASE_URL ?? 'https://omo.mirim-it-show.site/api/v1';
const OUT_DIR = process.env.OMO_PROBE_OUT_DIR ?? 'reports/api-probe';
const LOGIN_ID = process.env.OMO_LOGIN_ID;
const PASSWORD = process.env.OMO_PASSWORD;
const EMAIL = process.env.OMO_PROBE_EMAIL;
const IMAGE_PATH = process.env.OMO_PROBE_IMAGE;
const INCLUDE_MUTATIONS = process.argv.includes('--mutations');

let accessToken = process.env.OMO_ACCESS_TOKEN ?? null;
let refreshToken = process.env.OMO_REFRESH_TOKEN ?? null;

const results = [];
const state = {
  postId: process.env.OMO_POST_ID ?? null,
  userId: process.env.OMO_USER_ID ?? null,
  otherUserId: process.env.OMO_OTHER_USER_ID ?? null,
  productId: process.env.OMO_PRODUCT_ID ?? null,
  detectedProductId: process.env.OMO_DETECTED_PRODUCT_ID ?? null,
  aiSessionId: null,
  createdPostId: null,
};

function redact(value) {
  if (!value) return value;
  return '[redacted]';
}

function urlFor(pathname) {
  return `${API_BASE_URL}${pathname}`;
}

function safeJson(value) {
  return JSON.stringify(value, null, 2);
}

function sanitizeBody(body) {
  if (Array.isArray(body)) return body.map(sanitizeBody);
  if (!body || typeof body !== 'object') return body;

  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => {
      if (key === 'accessToken' || key === 'refreshToken') {
        return [key, redact(value)];
      }
      return [key, sanitizeBody(value)];
    }),
  );
}

async function responseBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(name, pathname, options = {}) {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type') && options.body && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.auth && accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const startedAt = Date.now();
  let response;
  let body;
  let error = null;
  try {
    response = await fetch(urlFor(pathname), {
      ...options,
      headers,
    });
    body = await responseBody(response);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const result = {
    name,
    method: options.method ?? 'GET',
    path: pathname,
    auth: !!options.auth,
    status: response?.status ?? null,
    ok: response?.ok ?? false,
    durationMs: Date.now() - startedAt,
    body: sanitizeBody(body),
    error,
  };
  results.push(result);
  const status = result.status ?? 'ERR';
  console.log(`${result.ok ? 'OK ' : 'BAD'} ${result.method} ${pathname} ${status} ${name}`);
  return { ...result, body };
}

function listFrom(value, keys) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key];
  }
  return [];
}

function rememberFromPost(post) {
  if (!post || typeof post !== 'object') return;
  state.postId ??= post.id ?? post.postId ?? null;
  state.userId ??= post.author?.id ?? post.author?.userId ?? post.user?.id ?? null;
  if (post.author?.id && post.author.id !== state.userId) {
    state.otherUserId ??= post.author.id;
  }
  const detected = listFrom(post.detectedProducts, []);
  const firstDetected = detected[0];
  state.detectedProductId ??= firstDetected?.id ?? null;
  state.productId ??= firstDetected?.productId ?? null;
  const product = listFrom(post.products, [])[0] ?? listFrom(post.items, [])[0];
  state.productId ??= product?.id ?? product?.productId ?? null;
}

function rememberFromPostsResponse(body) {
  const posts = listFrom(body, ['posts', 'items', 'data', 'content']);
  posts.forEach(rememberFromPost);
}

function rememberUser(body) {
  if (!body || typeof body !== 'object') return;
  state.userId ??= body.id ?? body.userId ?? null;
}

async function loginIfPossible() {
  if (accessToken) return;
  if (!LOGIN_ID || !PASSWORD) {
    console.log('SKIP login: set OMO_LOGIN_ID and OMO_PASSWORD for auth probes');
    return;
  }

  const result = await request('auth.login', '/auth/login', {
    method: 'POST',
    body: safeJson({ loginId: LOGIN_ID, password: PASSWORD }),
  });
  if (result.ok && result.body && typeof result.body === 'object') {
    accessToken = result.body.accessToken ?? null;
    refreshToken = result.body.refreshToken ?? null;
    console.log(`TOKENS access=${redact(accessToken)} refresh=${redact(refreshToken)}`);
  }
}

async function appendFileForm(form, field, filePath) {
  const buffer = await readFile(filePath);
  const name = path.basename(filePath);
  const ext = path.extname(name).toLowerCase();
  const type =
    ext === '.png' ? 'image/png' :
    ext === '.webp' ? 'image/webp' :
    'image/jpeg';
  form.append(field, new Blob([buffer], { type }), name);
}

async function runSafePublicProbes() {
  await request('server.root', '/');
  await request('auth.checkLoginId', `/auth/check-login-id?loginId=${encodeURIComponent(`probe_${Date.now()}`)}`);
  if (EMAIL) {
    await request('auth.email.sendCode', '/auth/email/send-code', {
      method: 'POST',
      body: safeJson({ email: EMAIL }),
    });
  }

  const trending = await request('posts.list.trending', '/posts?sort=trending&limit=5', {
    auth: true,
  });
  rememberFromPostsResponse(trending.body);
  const following = await request('posts.list.following', '/posts?sort=following&limit=5', {
    auth: true,
  });
  rememberFromPostsResponse(following.body);
}

async function runSafeAuthProbes() {
  if (!accessToken) return;

  const profile = await request('auth.profile.get', '/auth/profile', { auth: true });
  rememberUser(profile.body);

  await request('ai.chat.session', '/ai/chat/session', {
    method: 'POST',
    auth: true,
  }).then((result) => {
    if (result.ok && result.body && typeof result.body === 'object') {
      state.aiSessionId = result.body.sessionId ?? null;
    }
  });

  await request('ai.chat', '/ai/chat', {
    method: 'POST',
    auth: true,
    body: safeJson({
      message: '데일리 캐주얼 코디 추천해줘',
      sessionId: state.aiSessionId ?? undefined,
    }),
  }).then((result) => rememberFromPostsResponse(result.body));

  if (state.postId) {
    const detail = await request('posts.detail', `/posts/${encodeURIComponent(state.postId)}`, {
      auth: true,
    });
    rememberFromPost(detail.body);
  }

  await request('posts.bookmarks.me', '/posts/bookmarks/me?limit=5', { auth: true })
    .then((result) => rememberFromPostsResponse(result.body));

  if (state.userId) {
    await request('users.detail', `/users/${encodeURIComponent(state.userId)}`, { auth: true });
    await request('users.posts', `/users/${encodeURIComponent(state.userId)}/posts?limit=5`, { auth: true })
      .then((result) => rememberFromPostsResponse(result.body));
    await request('users.followers', `/users/${encodeURIComponent(state.userId)}/followers?limit=5`, { auth: true });
    await request('users.followings', `/users/${encodeURIComponent(state.userId)}/followings?limit=5`, { auth: true });
    await request('users.followStatus', `/users/${encodeURIComponent(state.userId)}/follow-status`, { auth: true });
  }

  if (state.productId) {
    await request('products.detail', `/products/${encodeURIComponent(state.productId)}`, { auth: true });
  }

  if (refreshToken) {
    const refreshed = await request('auth.refresh', '/auth/refresh', {
      method: 'POST',
      body: safeJson({ refreshToken }),
    });
    if (refreshed.ok && refreshed.body && typeof refreshed.body === 'object') {
      accessToken = refreshed.body.accessToken ?? accessToken;
      refreshToken = refreshed.body.refreshToken ?? refreshToken;
    }
  }
}

async function runImageProbes() {
  if (!accessToken || !IMAGE_PATH) return;

  const searchForm = new FormData();
  await appendFileForm(searchForm, 'image', IMAGE_PATH);
  await request('ai.search', '/ai/search', {
    method: 'POST',
    auth: true,
    body: searchForm,
  });

  const profileForm = new FormData();
  await appendFileForm(profileForm, 'image', IMAGE_PATH);
  await request('auth.profile.image', '/auth/profile/image', {
    method: 'POST',
    auth: true,
    body: profileForm,
  });
}

async function runMutationProbes() {
  if (!INCLUDE_MUTATIONS || !accessToken) return;

  if (IMAGE_PATH) {
    const createForm = new FormData();
    createForm.append('title', `probe-${Date.now()}`);
    createForm.append('description', 'temporary API probe post');
    createForm.append('hashtags[]', 'probe');
    await appendFileForm(createForm, 'images', IMAGE_PATH);
    const created = await request('posts.create', '/posts', {
      method: 'POST',
      auth: true,
      body: createForm,
    });
    if (created.ok && created.body && typeof created.body === 'object') {
      state.createdPostId = created.body.id ?? null;
      rememberFromPost(created.body);
    }
  }

  if (state.createdPostId) {
    const updateForm = new FormData();
    updateForm.append('title', `probe-updated-${Date.now()}`);
    updateForm.append('description', 'temporary API probe post updated');
    updateForm.append('hashtags[]', 'probe');
    await request('posts.update', `/posts/${encodeURIComponent(state.createdPostId)}`, {
      method: 'PATCH',
      auth: true,
      body: updateForm,
    });
    await request('posts.detect', `/posts/${encodeURIComponent(state.createdPostId)}/detect`, {
      method: 'POST',
      auth: true,
    });
    await request(
      'posts.detectedProducts.update.empty',
      `/posts/${encodeURIComponent(state.createdPostId)}/detected-products`,
      {
        method: 'PATCH',
        auth: true,
        body: safeJson({ items: [] }),
      },
    );
  }

  if (!state.postId) return;

  await request('posts.like.toggle', `/posts/${encodeURIComponent(state.postId)}/like`, {
    method: 'POST',
    auth: true,
  });
  await request('posts.like.toggleBack', `/posts/${encodeURIComponent(state.postId)}/like`, {
    method: 'POST',
    auth: true,
  });
  await request('posts.bookmark.toggle', `/posts/${encodeURIComponent(state.postId)}/bookmark`, {
    method: 'POST',
    auth: true,
  });
  await request('posts.bookmark.toggleBack', `/posts/${encodeURIComponent(state.postId)}/bookmark`, {
    method: 'POST',
    auth: true,
  });

  if (state.otherUserId) {
    await request('users.follow', `/users/${encodeURIComponent(state.otherUserId)}/follow`, {
      method: 'POST',
      auth: true,
    });
    await request('users.unfollow', `/users/${encodeURIComponent(state.otherUserId)}/follow`, {
      method: 'DELETE',
      auth: true,
    });
  }

  if (state.createdPostId) {
    await request('posts.delete', `/posts/${encodeURIComponent(state.createdPostId)}`, {
      method: 'DELETE',
      auth: true,
    });
  }
}

async function runLogoutProbe() {
  if (!refreshToken) return;
  await request('auth.logout', '/auth/logout', {
    method: 'DELETE',
    body: safeJson({ refreshToken }),
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await loginIfPossible();
  await runSafePublicProbes();
  await runSafeAuthProbes();
  await runImageProbes();
  await runMutationProbes();
  await runLogoutProbe();

  const output = {
    generatedAt: new Date().toISOString(),
    apiBaseUrl: API_BASE_URL,
    includeMutations: INCLUDE_MUTATIONS,
    state,
    results,
  };
  const file = path.join(OUT_DIR, `probe-${Date.now()}.json`);
  await writeFile(file, safeJson(output));
  await writeFile(path.join(OUT_DIR, 'latest.json'), safeJson(output));
  console.log(`WROTE ${file}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
