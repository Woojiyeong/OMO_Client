import { router } from 'expo-router';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import GarbIcon from '@/assets/images/garb.svg';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import type { ProductRecommendation } from '@/features/feed/types';
import { getProductCategoryLabel } from '@/features/products/categories';

export const PRODUCT_CARD_WIDTH = 280;

type Props = {
  product: ProductRecommendation;
  width?: number | `${number}%` | 'auto';
};

export function ProductCard({ product, width = PRODUCT_CARD_WIDTH }: Props) {
  const detailId = product.detailId ?? product.id;
  const canOpenDetail = !!product.detailId;
  const canOpenExternal = !!product.productUrl;
  const canPress = canOpenDetail || canOpenExternal;
  const category = getProductCategoryLabel(product.category);

  return (
    <Pressable
      onPress={() => {
        if (product.productUrl) {
          Linking.openURL(product.productUrl).catch(() => undefined);
          return;
        }
        if (canOpenDetail) {
          router.push(`/product-detail?id=${encodeURIComponent(detailId)}` as never);
        }
      }}
      accessibilityRole="button"
      accessibilityLabel={`${product.name} 상품 링크 열기`}
      disabled={!canPress}
      style={[styles.card, { width }]}
    >
      <View style={styles.imageBox}>
        {product.thumbnail ? (
          <Image source={product.thumbnail} style={styles.image} resizeMode="cover" />
        ) : (
          <GarbIcon width={IMAGE_SIZE} height={IMAGE_SIZE} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.category} numberOfLines={1}>
          {category}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
      </View>
      <Text style={styles.price}>{product.priceWon.toLocaleString('ko-KR')}원</Text>
    </Pressable>
  );
}

const IMAGE_SIZE = 70;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: Radius.md,
    backgroundColor: Palette.white,
  },
  imageBox: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: Radius.sm,
    backgroundColor: Palette.gray150,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    minHeight: IMAGE_SIZE,
  },
  category: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Palette.gray500,
    marginBottom: 2,
  },
  name: {
    fontFamily: FontFamily.semibold,
    fontSize: 15,
    color: Palette.textPrimary,
    lineHeight: 20,
  },
  price: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Palette.textPrimary,
  },
});
