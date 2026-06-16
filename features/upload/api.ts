import type { ImageSourcePropType } from 'react-native';

import { apiFetch, resolveApiAssetUrl } from '@/features/api/client';

import type { UploadProduct } from './types';

type UploadImageFile = {
  uri: string;
  name?: string;
  type?: string;
};

type AiSearchProduct = {
  id?: string;
  productId?: string | null;
  name?: string | null;
  brand?: string | null;
  brandName?: string | null;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  imageUrl?: string | null;
  productUrl?: string | null;
  purchaseUrl?: string | null;
  price?: number | null;
  priceWon?: number | null;
  category?: string | null;
  score?: number | null;
};

type AiSearchItem = {
  id?: string;
  uuid?: string;
  detectedProductId?: string;
  productId?: string | null;
  category?: string | null;
  croppedImagePath?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  positionX?: number | null;
  positionY?: number | null;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  product?: AiSearchProduct | null;
  matchedProduct?: AiSearchProduct | null;
  products?: AiSearchProduct[];
  recommendations?: AiSearchProduct[];
};

type AiSearchResponse =
  | AiSearchItem[]
  | {
      items?: AiSearchItem[];
      detectedProducts?: AiSearchItem[];
      products?: AiSearchItem[];
      data?: AiSearchItem[];
      results?: AiSearchItem[];
    };

function imageSource(uri?: string | null): ImageSourcePropType {
  const resolved = resolveApiAssetUrl(uri);
  return resolved ? { uri: resolved } : require('@/assets/images/icon.png');
}

function clampPin(value: number) {
  return Math.max(0, Math.min(1, value));
}

function normalizePinValue(value: number) {
  return value > 1 ? value / 100 : value;
}

function getItemPin(item: AiSearchItem, index: number, total: number) {
  const rawX = item.positionX ?? item.x;
  const rawY = item.positionY ?? item.y;
  if (typeof rawX === 'number' && typeof rawY === 'number') {
    return {
      x: clampPin(normalizePinValue(rawX)),
      y: clampPin(normalizePinValue(rawY)),
    };
  }

  return defaultPin(index, total);
}

function defaultPin(index: number, total: number) {
  if (total <= 1) return { x: 0.5, y: 0.52 };

  const columns = Math.min(total, 3);
  const col = index % columns;
  const row = Math.floor(index / columns);
  const rows = Math.ceil(total / columns);

  return {
    x: (col + 1) / (columns + 1),
    y: (row + 1) / (rows + 1),
  };
}

function firstProduct(item: AiSearchItem) {
  return (
    item.product ??
    item.matchedProduct ??
    item.products?.[0] ??
    item.recommendations?.[0] ??
    null
  );
}

function getSearchItems(response: AiSearchResponse) {
  if (Array.isArray(response)) return response;
  return (
    response.items ??
    response.detectedProducts ??
    response.products ??
    response.data ??
    response.results ??
    []
  );
}

function mapAiItem(item: AiSearchItem, index: number, total: number): UploadProduct {
  const product = firstProduct(item);
  const brand = product?.brandName ?? product?.brand;
  const category = product?.category ?? item.category ?? '상품';
  const name = [brand, product?.name].filter(Boolean).join(' ') || category;
  const detectedProductId = item.detectedProductId ?? item.id ?? item.uuid;
  const detectedItemId = detectedProductId ?? `ai-item-${index}`;
  const productId = item.productId ?? product?.productId ?? product?.id;
  const productUrl = product?.productUrl ?? product?.purchaseUrl;

  return {
    id: detectedItemId,
    detectedProductId,
    productId: productId ?? undefined,
    category,
    name,
    priceWon: product?.priceWon ?? product?.price ?? 0,
    thumbnail: imageSource(
      product?.thumbnailUrl ??
        product?.thumbnail ??
        product?.imageUrl ??
        item.croppedImagePath ??
        item.thumbnailUrl ??
        item.imageUrl,
    ),
    pin: getItemPin(item, index, total),
    link: productUrl ?? undefined,
    productUrl: productUrl ?? undefined,
  };
}

export async function searchImageProducts(
  image: UploadImageFile,
): Promise<UploadProduct[]> {
  const formData = new FormData();
  formData.append('image', {
    uri: image.uri,
    name: image.name ?? 'upload.jpg',
    type: image.type ?? 'image/jpeg',
  } as unknown as Blob);

  const response = await apiFetch<AiSearchResponse>('/ai/search', {
    method: 'POST',
    body: formData,
  });

  const items = getSearchItems(response);
  if (__DEV__) {
    console.log(
      '[upload] ai/search parsed items',
      JSON.stringify(
        {
          itemCount: items.length,
          items,
        },
        null,
        2,
      ),
    );
  }

  return items.map((item, index) =>
    mapAiItem(item, index, items.length),
  );
}
