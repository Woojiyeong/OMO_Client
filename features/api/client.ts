import Constants from 'expo-constants';
import { Platform } from 'react-native';
import config from '@/config';
import { useAuthStore } from '@/features/auth/store';

type ApiErrorBody = {
  message?: string;
  error?: string;
};

type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const API_BASE_URL = config.apiBaseUrl;

function shouldLogApi() {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeForLog);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => {
      if (
        key.toLowerCase().includes('token') ||
        key.toLowerCase() === 'authorization'
      ) {
        return [key, '[redacted]'];
      }
      return [key, sanitizeForLog(item)];
    }),
  );
}

function describeRequestBody(body: BodyInit | null | undefined) {
  if (!body) return undefined;
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return { type: 'FormData', note: 'multipart body omitted' };
  }
  if (typeof body === 'string') {
    try {
      return sanitizeForLog(JSON.parse(body));
    } catch {
      return body;
    }
  }
  return { type: typeof body };
}

function logApiRequest(
  label: string,
  method: string,
  url: string,
  body?: BodyInit | null,
) {
  if (!shouldLogApi()) return;
  console.log(`[API] ${label} -> ${method} ${url}`);
  console.log('[API] request payload', JSON.stringify({
    requestBody: describeRequestBody(body),
  }, null, 2));
}

function logApiResponse(
  label: string,
  method: string,
  url: string,
  response: Response,
  body: unknown,
) {
  if (!shouldLogApi()) return;
  console.log(`[API] ${label} <- ${method} ${url}`);
  console.log('[API] response payload', JSON.stringify({
    status: response.status,
    ok: response.ok,
    responseBody: sanitizeForLog(body),
  }, null, 2));
}

function getExpoHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (!hostUri || typeof hostUri !== 'string') return null;
  return hostUri.split(':')[0];
}

function normalizeApiBaseUrl(url: string) {
  const trimmedUrl = url.trim().replace(/\/$/, '');
  const parsedUrl = new URL(trimmedUrl);
  const isLocalhost =
    parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';

  if (Platform.OS === 'web' || !isLocalhost) return trimmedUrl;

  const expoHost = getExpoHost();
  if (expoHost) {
    parsedUrl.hostname = expoHost;
    return parsedUrl.toString().replace(/\/$/, '');
  }

  if (Platform.OS === 'android') {
    parsedUrl.hostname = '10.0.2.2';
    return parsedUrl.toString().replace(/\/$/, '');
  }

  return trimmedUrl;
}

export function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL이 설정되지 않았어요.');
  }
  return normalizeApiBaseUrl(API_BASE_URL);
}

export function resolveApiAssetUrl(uri?: string | null) {
  if (!uri) return undefined;
  if (/^(https?:|file:|data:|blob:)/.test(uri)) return uri;

  const apiUrl = new URL(getApiBaseUrl());
  const origin = `${apiUrl.protocol}//${apiUrl.host}`;
  return uri.startsWith('/') ? `${origin}${uri}` : `${origin}/${uri}`;
}

async function parseResponseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === 'object') {
    const errorBody = body as ApiErrorBody;
    return errorBody.message ?? errorBody.error ?? fallback;
  }
  if (typeof body === 'string' && body.trim()) return body;
  return fallback;
}

async function refreshAuthTokens() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  const url = `${getApiBaseUrl()}/auth/refresh`;
  const bodyPayload = JSON.stringify({ refreshToken });
  logApiRequest('refresh request', 'POST', url, bodyPayload);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: bodyPayload,
  });

  const body = await parseResponseBody(response);
  logApiResponse('refresh response', 'POST', url, response, body);
  if (!response.ok) return null;

  const tokens = body as AuthTokenResponse;
  useAuthStore.getState().setTokens(tokens);
  return tokens.accessToken;
}

type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;
  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }
  if (!skipAuth && !headers.has('Authorization')) {
    const token = useAuthStore.getState().accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const method = fetchOptions.method ?? 'GET';
  const url = `${getApiBaseUrl()}${path}`;

  logApiRequest('request', method, url, fetchOptions.body);
  let response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (
    response.status === 401 &&
    path !== '/auth/login' &&
    path !== '/auth/refresh'
  ) {
    const nextAccessToken = await refreshAuthTokens();
    if (nextAccessToken) {
      headers.set('Authorization', `Bearer ${nextAccessToken}`);
      logApiRequest('retry after refresh', method, url, fetchOptions.body);
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    }
  }

  const body = await parseResponseBody(response);
  logApiResponse('response', method, url, response, body);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(body, `API 요청에 실패했어요. (${response.status})`),
      response.status,
      body,
    );
  }

  return body as T;
}
