import type { ImageSourcePropType } from 'react-native';

import { apiFetch, resolveApiAssetUrl } from '@/features/api/client';
import { getProductCategoryLabel } from '@/features/products/categories';

type ApiProductImage = {
  id?: string;
  imageUrl?: string;
  url?: string;
  order?: number;
};

type ApiProduct = {
  id: string;
  name: string;
  brand?: string;
  brandName?: string | null;
  category?: string;
  price?: number | null;
  priceWon?: number | null;
  thumbnailUrl?: string | null;
  productUrl?: string | null;
  purchaseUrl?: string | null;
  images?: ApiProductImage[];
};

export type ProductDetail = {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceWon: number;
  thumbnail?: ImageSourcePropType;
  images: ImageSourcePropType[];
  productUrl?: string;
};

function imageSource(uri?: string | null): ImageSourcePropType | undefined {
  const resolved = resolveApiAssetUrl(uri);
  return resolved ? { uri: resolved } : undefined;
}

function mapProduct(product: ApiProduct): ProductDetail {
  const sortedImages = [...(product.images ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const images = sortedImages
    .map((image) => imageSource(image.imageUrl ?? image.url))
    .filter((image): image is ImageSourcePropType => !!image);
  const thumbnail = imageSource(product.thumbnailUrl);

  return {
    id: product.id,
    name: product.name,
    brand: product.brandName ?? product.brand ?? '',
    category: getProductCategoryLabel(product.category),
    priceWon: product.priceWon ?? product.price ?? 0,
    thumbnail,
    images,
    productUrl: product.productUrl ?? product.purchaseUrl ?? undefined,
  };
}

export async function fetchProduct(id: string): Promise<ProductDetail> {
  return mapProduct(await apiFetch<ApiProduct>(`/products/${encodeURIComponent(id)}`));
}
