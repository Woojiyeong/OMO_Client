export const PRODUCT_CATEGORY_OPTIONS = [
  '상의',
  '아우터',
  '바지',
  '원피스/스커트',
  '가방',
  '신발',
  '스포츠/레저',
  '속옷/홈웨어',
  '모자',
  '주얼리/액세서리',
] as const;

export type ProductCategoryOption = (typeof PRODUCT_CATEGORY_OPTIONS)[number];

const PRODUCT_CATEGORY_LABEL_BY_CODE: Record<string, ProductCategoryOption> = {
  '001': '상의',
  '002': '아우터',
  '003': '바지',
  '100': '원피스/스커트',
  '004': '가방',
  '103': '신발',
  '017': '스포츠/레저',
  '026': '속옷/홈웨어',
  '005': '모자',
  '007': '주얼리/액세서리',
  accessory: '주얼리/액세서리',
  accessories: '주얼리/액세서리',
  bag: '가방',
  bags: '가방',
  bottom: '바지',
  bottoms: '바지',
  dress: '원피스/스커트',
  hat: '모자',
  outer: '아우터',
  outerwear: '아우터',
  pants: '바지',
  shoes: '신발',
  skirt: '원피스/스커트',
  sports: '스포츠/레저',
  top: '상의',
  tops: '상의',
  underwear: '속옷/홈웨어',
};

const PRODUCT_CATEGORY_LABELS = new Set<string>(PRODUCT_CATEGORY_OPTIONS);

export function getProductCategoryLabel(category?: string | null) {
  const value = category?.trim();
  if (!value) return '';

  return PRODUCT_CATEGORY_LABEL_BY_CODE[value.toLowerCase()] ?? value;
}

export function toProductCategoryOption(
  category?: string | null,
): ProductCategoryOption | null {
  const label = getProductCategoryLabel(category);
  return PRODUCT_CATEGORY_LABELS.has(label) ? (label as ProductCategoryOption) : null;
}
