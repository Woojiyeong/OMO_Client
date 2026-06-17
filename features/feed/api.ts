import type { ImageSourcePropType } from 'react-native';

import { ApiError, apiFetch, resolveApiAssetUrl } from '@/features/api/client';
import { toAppStyleKeyword } from '@/features/api/style-keyword';
import { useAuthStore } from '@/features/auth/store';
import { getProductCategoryLabel } from '@/features/products/categories';

import type { FeedPost, ProductRecommendation, TrendItem } from './types';

export type FeedSort = 'trending' | 'following';

type ApiListResponse<T> =
  | T[]
  | {
      items?: T[];
      posts?: T[];
      bookmarks?: T[];
      data?: T[];
      content?: T[];
      nextCursor?: string | null;
      cursor?: string | null;
    };

export type FeedPage = {
  posts: FeedPost[];
  nextCursor: string | null;
};

type ApiAuthor = {
  id?: string;
  userId?: string;
  nickname?: string;
  name?: string;
  styleKeyword?: string;
  keyword?: string;
  profileImage?: string | null;
  avatarUri?: string;
  isFollowing?: boolean;
};

type ApiProduct = {
  id?: string;
  productId?: string | null;
  detailId?: string;
  canOpenDetail?: boolean;
  category?: string;
  name?: string;
  brand?: string;
  brandName?: string | null;
  priceWon?: number;
  price?: number;
  thumbnail?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  image?: string;
  productImageUrl?: string | null;
  purchaseUrl?: string | null;
  productUrl?: string | null;
};

type ApiImage = {
  id: string;
  imageUrl: string;
  order: number;
};

type ApiHashtag = {
  id: string;
  name: string;
};

type ApiDetectedProduct = {
  id: string;
  name?: string | null;
  brand?: string | null;
  brandName?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  productImageUrl?: string | null;
  price?: number | null;
  priceWon?: number | null;
  purchaseUrl?: string | null;
  productUrl?: string | null;
  category: string | null;
  confidence: number | null;
  positionX: number | null;
  positionY: number | null;
  width: number | null;
  height: number | null;
  productId: string | null;
  isEdited: boolean;
  product?: ApiProduct | null;
  matchedProduct?: ApiProduct | null;
};

export type PostDetectedProduct = ApiDetectedProduct;

export type ReportReason = 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'ETC';

type ApiBookmark = {
  id: string;
  createdAt: string;
  post: ApiPost;
};

type ApiPost = {
  id?: string;
  postId?: string;
  author?: ApiAuthor;
  user?: ApiAuthor;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  images?: ApiImage[];
  likes?: number;
  likeCount?: number;
  title?: string;
  description?: string;
  content?: string;
  detectionStatus?: string;
  hashtags?: string[] | ApiHashtag[];
  tags?: string[];
  products?: ApiProduct[];
  items?: ApiProduct[];
  detectedProducts?: ApiDetectedProduct[];
  liked?: boolean;
  isLiked?: boolean;
  bookmarked?: boolean;
  isBookmarked?: boolean;
};

function imageSource(uri?: string): ImageSourcePropType {
  const resolved = resolveApiAssetUrl(uri);
  return resolved ? { uri: resolved } : require('@/assets/images/icon.png');
}

function optionalImageSource(uri?: string | null): ImageSourcePropType | undefined {
  const resolved = resolveApiAssetUrl(uri);
  return resolved ? { uri: resolved } : undefined;
}

function listItems<T>(response: ApiListResponse<T>): T[] {
  if (Array.isArray(response)) return response;
  return (
    response.items ??
    response.posts ??
    response.bookmarks ??
    response.data ??
    response.content ??
    []
  );
}

function nextCursor<T>(response: ApiListResponse<T>) {
  if (Array.isArray(response)) return null;
  return response.nextCursor ?? response.cursor ?? null;
}

function mapProduct(product: ApiProduct, index: number): ProductRecommendation {
  const productId = product.productId ?? product.id;
  const detailId =
    product.canOpenDetail === false
      ? undefined
      : product.detailId ?? productId ?? undefined;
  const brand = product.brandName ?? product.brand;
  const name = [brand, product.name].filter(Boolean).join(' ') || product.name || '';

  return {
    id: productId ?? `product-${index}`,
    detailId,
    category: getProductCategoryLabel(product.category),
    name,
    priceWon: product.priceWon ?? product.price ?? 0,
    thumbnail: optionalImageSource(
      product.thumbnailUrl ??
        product.thumbnail ??
        product.imageUrl ??
        product.image ??
        product.productImageUrl,
    ),
    productUrl: product.productUrl ?? product.purchaseUrl ?? undefined,
  };
}

function mapDetectedProduct(product: ApiDetectedProduct): ApiProduct {
  const matchedProduct = product.product ?? product.matchedProduct ?? null;
  const productId =
    product.productId ?? matchedProduct?.productId ?? matchedProduct?.id ?? null;
  const brand =
    matchedProduct?.brandName ??
    matchedProduct?.brand ??
    product.brandName ??
    product.brand;
  const name =
    matchedProduct?.name ??
    product.name ??
    getProductCategoryLabel(matchedProduct?.category ?? product.category) ??
    '상품';

  return {
    id: productId ?? product.id,
    detailId: productId ?? undefined,
    canOpenDetail: !!productId,
    category: matchedProduct?.category ?? product.category ?? '',
    name: [brand, name].filter(Boolean).join(' ') || '상품',
    priceWon: matchedProduct?.priceWon ?? product.priceWon ?? undefined,
    price: matchedProduct?.price ?? product.price ?? 0,
    thumbnailUrl:
      matchedProduct?.thumbnailUrl ??
      matchedProduct?.productImageUrl ??
      product.thumbnailUrl ??
      product.productImageUrl ??
      undefined,
    thumbnail: matchedProduct?.thumbnail,
    imageUrl:
      matchedProduct?.imageUrl ??
      matchedProduct?.image ??
      product.imageUrl ??
      undefined,
    productUrl:
      matchedProduct?.productUrl ??
      matchedProduct?.purchaseUrl ??
      product.productUrl ??
      product.purchaseUrl ??
      undefined,
  };
}

export function mapPost(post: ApiPost): FeedPost {
  const author = post.author ?? post.user ?? {};
  const id = post.id ?? post.postId ?? '';
  const sortedImages = [...(post.images ?? [])].sort((a, b) => a.order - b.order);
  const imageUrl =
    sortedImages[0]?.imageUrl ??
    post.imageUrl ??
    post.image ??
    post.thumbnailUrl ??
    post.thumbnail;
  const hashtags = post.hashtags ?? post.tags ?? [];
  const products =
    post.products ??
    post.items ??
    post.detectedProducts?.map(mapDetectedProduct) ??
    [];

  return {
    id,
    author: {
      id: author.id ?? author.userId ?? '',
      name: author.nickname ?? author.name ?? '',
      keyword: toAppStyleKeyword(author.styleKeyword ?? author.keyword),
      avatarUri: resolveApiAssetUrl(author.profileImage ?? author.avatarUri),
      isFollowing: author.isFollowing,
    },
    image: imageSource(imageUrl),
    likes: post.likeCount ?? post.likes ?? 0,
    title: post.title ?? '',
    description: post.description ?? post.content ?? '',
    hashtags: hashtags.map((tag) => (typeof tag === 'string' ? tag : tag.name)),
    products: products.map(mapProduct),
    liked: post.isLiked ?? post.liked ?? false,
    bookmarked: post.isBookmarked ?? post.bookmarked ?? false,
  };
}

export async function fetchPostsPage({
  sort,
  cursor,
  limit = 20,
}: {
  sort: FeedSort;
  cursor?: string;
  limit?: number;
}): Promise<FeedPage> {
  const params = new URLSearchParams({ sort, limit: String(limit) });
  if (cursor) params.set('cursor', cursor);

  const response = await apiFetch<ApiListResponse<ApiPost>>(`/posts?${params.toString()}`);
  return {
    posts: listItems(response).map(mapPost),
    nextCursor: nextCursor(response),
  };
}

export async function fetchPosts(params: {
  sort: FeedSort;
  cursor?: string;
  limit?: number;
}): Promise<FeedPost[]> {
  return (await fetchPostsPage(params)).posts;
}

export async function fetchMyPostsPage({
  cursor,
  limit = 20,
}: {
  cursor?: string;
  limit?: number;
} = {}): Promise<FeedPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);

  let response: ApiListResponse<ApiPost>;
  try {
    response = await apiFetch<ApiListResponse<ApiPost>>(
      `/posts/me?${params.toString()}`,
    );
  } catch (error) {
    const userId = useAuthStore.getState().currentUserId;
    if (!(error instanceof ApiError) || error.status !== 404 || !userId) {
      throw error;
    }
    response = await apiFetch<ApiListResponse<ApiPost>>(
      `/users/${encodeURIComponent(userId)}/posts?${params.toString()}`,
    );
  }

  const posts = listItems(response);
  return {
    posts: posts.map(mapPost),
    nextCursor: nextCursor(response),
  };
}

export async function fetchMyPosts(params?: {
  cursor?: string;
  limit?: number;
}): Promise<FeedPost[]> {
  return (await fetchMyPostsPage(params)).posts;
}

export async function fetchUserPostsPage({
  userId,
  cursor,
  limit = 20,
}: {
  userId: string;
  cursor?: string;
  limit?: number;
}): Promise<FeedPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);

  const response = await apiFetch<ApiListResponse<ApiPost>>(
    `/users/${encodeURIComponent(userId)}/posts?${params.toString()}`,
  );
  return {
    posts: listItems(response).map(mapPost),
    nextCursor: nextCursor(response),
  };
}

export async function fetchUserPosts(params: {
  userId: string;
  cursor?: string;
  limit?: number;
}): Promise<FeedPost[]> {
  return (await fetchUserPostsPage(params)).posts;
}

export async function fetchPost(id: string): Promise<FeedPost> {
  return mapPost(await apiFetch<ApiPost>(`/posts/${encodeURIComponent(id)}`));
}

export async function fetchPostDetectionSnapshot(id: string): Promise<{
  detectionStatus: string;
  detectedProducts: PostDetectedProduct[];
}> {
  const post = await apiFetch<ApiPost>(`/posts/${encodeURIComponent(id)}`);
  return {
    detectionStatus: post.detectionStatus ?? '',
    detectedProducts: post.detectedProducts ?? [],
  };
}

export async function waitForPostDetection(
  id: string,
  {
    attempts = 8,
    intervalMs = 2500,
  }: {
    attempts?: number;
    intervalMs?: number;
  } = {},
): Promise<PostDetectedProduct[]> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const snapshot = await fetchPostDetectionSnapshot(id);
    if (snapshot.detectedProducts.length > 0) return snapshot.detectedProducts;
    if (snapshot.detectionStatus === 'FAILED') return [];
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  return [];
}

export async function waitForDetectedPost(
  id: string,
  {
    attempts = 12,
    intervalMs = 2500,
  }: {
    attempts?: number;
    intervalMs?: number;
  } = {},
): Promise<FeedPost> {
  let latestPost: ApiPost | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    latestPost = await apiFetch<ApiPost>(`/posts/${encodeURIComponent(id)}`);
    if (
      latestPost.detectionStatus === 'COMPLETED' ||
      latestPost.detectionStatus === 'FAILED'
    ) {
      return mapPost(latestPost);
    }
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return latestPost ? mapPost(latestPost) : fetchPost(id);
}

export async function togglePostLike(id: string): Promise<{ liked: boolean }> {
  return apiFetch<{ liked: boolean }>(`/posts/${encodeURIComponent(id)}/like`, {
    method: 'POST',
  });
}

export async function togglePostBookmark(
  id: string,
): Promise<{ bookmarked: boolean }> {
  return apiFetch<{ bookmarked: boolean }>(
    `/posts/${encodeURIComponent(id)}/bookmark`,
    {
      method: 'POST',
    },
  );
}

type PostImageFile = {
  uri: string;
  name?: string;
  type?: string;
};

export async function createPost(payload: {
  title: string;
  description: string;
  hashtags: string[];
  images: PostImageFile[];
}): Promise<FeedPost> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('description', payload.description);
  payload.hashtags.forEach((tag) => formData.append('hashtags[]', tag));
  payload.images.forEach((image, index) => {
    formData.append('images', {
      uri: image.uri,
      name: image.name ?? `post-${index + 1}.jpg`,
      type: image.type ?? 'image/jpeg',
    } as unknown as Blob);
  });

  return mapPost(
    await apiFetch<ApiPost>('/posts', {
      method: 'POST',
      body: formData,
    }),
  );
}

export async function updatePost(
  id: string,
  payload: {
    title?: string;
    description?: string;
    hashtags?: string[];
    images?: PostImageFile[];
  },
): Promise<FeedPost> {
  const formData = new FormData();
  if (payload.title !== undefined) formData.append('title', payload.title);
  if (payload.description !== undefined) {
    formData.append('description', payload.description);
  }
  payload.hashtags?.forEach((tag) => formData.append('hashtags[]', tag));
  payload.images?.forEach((image, index) => {
    formData.append('images', {
      uri: image.uri,
      name: image.name ?? `post-${index + 1}.jpg`,
      type: image.type ?? 'image/jpeg',
    } as unknown as Blob);
  });

  return mapPost(
    await apiFetch<ApiPost>(`/posts/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: formData,
    }),
  );
}

export async function deletePost(id: string): Promise<void> {
  await apiFetch<unknown>(`/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function triggerPostDetection(
  id: string,
): Promise<{ detectionStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' }> {
  return apiFetch<{
    detectionStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  }>(`/posts/${encodeURIComponent(id)}/detect`, {
    method: 'POST',
  });
}

export async function removeMyBookmark(id: string): Promise<void> {
  await apiFetch<{ bookmarked: boolean }>(
    `/posts/${encodeURIComponent(id)}/bookmark`,
    {
      method: 'POST',
    },
  );
}

export async function updateDetectedProducts(
  id: string,
  items: { id: string; productId?: string; isEdited?: boolean }[],
): Promise<void> {
  await apiFetch<unknown>(`/posts/${encodeURIComponent(id)}/detected-products`, {
    method: 'PATCH',
    body: JSON.stringify({ items }),
  });
}

export async function reportPost(
  id: string,
  payload: { reason: ReportReason; description?: string },
): Promise<void> {
  await apiFetch<unknown>(`/posts/${encodeURIComponent(id)}/report`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchMyBookmarksPage({
  cursor,
  limit = 20,
}: {
  cursor?: string;
  limit?: number;
} = {}): Promise<FeedPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);

  const response = await apiFetch<ApiListResponse<ApiBookmark | ApiPost>>(
    `/posts/bookmarks/me?${params.toString()}`,
  );
  return {
    posts: listItems(response).map(mapBookmark),
    nextCursor: nextCursor(response),
  };
}

export async function fetchMyBookmarks(params?: {
  cursor?: string;
  limit?: number;
}): Promise<FeedPost[]> {
  return (await fetchMyBookmarksPage(params)).posts;
}

function mapBookmark(bookmarkOrPost: ApiBookmark | ApiPost): FeedPost {
  if ('post' in bookmarkOrPost && bookmarkOrPost.post) {
    return { ...mapPost(bookmarkOrPost.post), bookmarked: true };
  }
  return { ...mapPost(bookmarkOrPost), bookmarked: true };
}

export function toTrendItems(posts: FeedPost[]): TrendItem[] {
  return posts.map((post) => ({
    id: `trend-${post.id}`,
    postId: post.id,
    image: post.image,
  }));
}
