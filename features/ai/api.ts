import type { ImageSourcePropType } from "react-native";

import { apiFetch, resolveApiAssetUrl } from "@/features/api/client";
import { toAppStyleKeyword } from "@/features/api/style-keyword";
import { fetchProduct, type ProductDetail } from "@/features/products/api";
import { getProductCategoryLabel } from "@/features/products/categories";

import type { AiCoordiDetail, AiCoordiItem, AiCoordiSummary } from "./types";

type ApiChatSessionResponse = {
  sessionId: string;
};

type ApiChatImage = {
  id: string;
  imageUrl: string;
  order: number;
};

type ApiChatHashtag = {
  id: string;
  name: string;
};

type ApiChatProduct = {
  id: string;
  name?: string | null;
  brand?: string | null;
  imageUrl?: string | null;
  price?: number | null;
  purchaseUrl?: string | null;
  category: string | null;
  confidence: number | null;
  positionX: number | null;
  positionY: number | null;
  width: number | null;
  height: number | null;
  productId: string | null;
  isEdited: boolean;
};

type ApiChatPost = {
  id: string;
  title: string | null;
  description: string | null;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  trendScore: number;
  detectionStatus: string;
  createdAt: string;
  author: {
    id: string;
    nickname: string;
    profileImage: string | null;
    styleKeyword?: string | null;
  };
  images: ApiChatImage[];
  hashtags: ApiChatHashtag[];
  detectedProducts: ApiChatProduct[];
  isLiked: boolean;
  isBookmarked: boolean;
  musinsaUrl: string | null;
};

type ApiChatResponse = {
  sessionId: string | null;
  posts: ApiChatPost[];
};

export type AiChatResult = {
  sessionId: string | null;
  summaries: AiCoordiSummary[];
  details: Record<string, AiCoordiDetail>;
};

function imageSource(uri?: string | null): ImageSourcePropType {
  const resolved = resolveApiAssetUrl(uri);
  return resolved ? { uri: resolved } : require("@/assets/images/icon.png");
}

function firstImage(post: ApiChatPost) {
  return [...post.images].sort((a, b) => a.order - b.order)[0]?.imageUrl;
}

function productName(product: ApiChatProduct) {
  return (
    [product.brand, product.name].filter(Boolean).join(" ") ||
    getProductCategoryLabel(product.category) ||
    "상품"
  );
}

function postTitle(post: ApiChatPost) {
  return post.title?.trim() || post.description?.trim() || "추천 코디";
}

function postDescription(post: ApiChatPost) {
  return post.description?.trim() || post.title?.trim() || "";
}

function needsProductDetail(product: ApiChatProduct) {
  return (
    !!product.productId &&
    (!product.name || !product.brand || !product.price || !product.imageUrl)
  );
}

async function fetchProductDetails(posts: ApiChatPost[]) {
  const ids = Array.from(
    new Set(
      posts
        .flatMap((post) => post.detectedProducts)
        .filter(needsProductDetail)
        .map((product) => product.productId)
        .filter((id): id is string => !!id),
    ),
  );

  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        return [id, await fetchProduct(id)] as const;
      } catch {
        return [id, null] as const;
      }
    }),
  );

  return new Map<string, ProductDetail | null>(entries);
}

function detailFor(
  details: Map<string, ProductDetail | null>,
  product: ApiChatProduct,
) {
  return product.productId ? details.get(product.productId) ?? null : null;
}

function itemName(product: ApiChatProduct, detail: ProductDetail | null) {
  if (detail) return [detail.brand, detail.name].filter(Boolean).join(" ");
  return productName(product);
}

function itemThumbnail(product: ApiChatProduct, detail: ProductDetail | null) {
  if (product.imageUrl) return imageSource(product.imageUrl);
  return detail?.thumbnail ?? detail?.images[0] ?? imageSource(null);
}

function mapItem(
  product: ApiChatProduct,
  details: Map<string, ProductDetail | null>,
): AiCoordiItem {
  const detail = detailFor(details, product);
  return {
    id: product.productId ?? product.id,
    detailId: product.productId ?? undefined,
    category: getProductCategoryLabel(detail?.category ?? product.category),
    name: itemName(product, detail),
    priceWon: detail?.priceWon ?? product.price ?? 0,
    thumbnail: itemThumbnail(product, detail),
    productUrl: detail?.productUrl ?? product.purchaseUrl ?? undefined,
    pin:
      product.positionX !== null && product.positionY !== null
        ? { x: product.positionX, y: product.positionY }
        : undefined,
  };
}

function mapDetail(
  post: ApiChatPost,
  details: Map<string, ProductDetail | null>,
): AiCoordiDetail {
  const items = post.detectedProducts.map((product) => mapItem(product, details));

  return {
    id: post.id,
    images: [...post.images]
      .sort((a, b) => a.order - b.order)
      .map((image) => imageSource(image.imageUrl)),
    title: postTitle(post),
    description: postDescription(post),
    hashtags: post.hashtags.map((tag) => tag.name),
    totalBudgetWon: items.reduce((sum, item) => sum + item.priceWon, 0),
    likes: post.likeCount,
    liked: post.isLiked,
    bookmarked: post.isBookmarked,
    author: {
      id: post.author.id,
      nickname: post.author.nickname,
      keyword: toAppStyleKeyword(post.author.styleKeyword),
      avatarUri: resolveApiAssetUrl(post.author.profileImage),
    },
    items,
  };
}

function mapSummary(
  post: ApiChatPost,
  details: Map<string, ProductDetail | null>,
): AiCoordiSummary {
  const total = post.detectedProducts.reduce(
    (sum, product) =>
      sum + (detailFor(details, product)?.priceWon ?? product.price ?? 0),
    0,
  );

  return {
    id: post.id,
    name: postTitle(post),
    priceWon: total,
    thumbnail: imageSource(firstImage(post)),
  };
}

export async function createAiChatSession() {
  return apiFetch<ApiChatSessionResponse>("/ai-service/chat/session", {
    method: "POST",
  });
}

export async function requestAiChatRecommendations(payload: {
  message: string;
  sessionId?: string | null;
}): Promise<AiChatResult> {
  const response = await apiFetch<ApiChatResponse>("/ai-service/chat", {
    method: "POST",
    body: JSON.stringify({
      message: payload.message,
      sessionId: payload.sessionId || undefined,
    }),
  });
  const productDetails = await fetchProductDetails(response.posts);

  return {
    sessionId: response.sessionId,
    summaries: response.posts.map((post) => mapSummary(post, productDetails)),
    details: Object.fromEntries(
      response.posts.map((post) => [post.id, mapDetail(post, productDetails)]),
    ),
  };
}
