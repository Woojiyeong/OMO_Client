import { Image, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import type { ProductRecommendation } from '@/features/feed/types';

export const PRODUCT_CARD_WIDTH = 280;

type Props = {
  product: ProductRecommendation;
  width?: number | `${number}%` | 'auto';
};

export function ProductCard({ product, width = PRODUCT_CARD_WIDTH }: Props) {
  return (
    <View style={[styles.card, { width }]}>
      <View style={styles.imageBox}>
        {product.thumbnail ? (
          <Image source={product.thumbnail} style={styles.image} resizeMode="cover" />
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
      </View>
      <Text style={styles.price}>{product.priceWon.toLocaleString('ko-KR')}원</Text>
    </View>
  );
}

const IMAGE_SIZE = 64;

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
    fontSize: 11,
    color: Palette.gray500,
    marginBottom: 2,
  },
  name: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.textPrimary,
    lineHeight: 18,
  },
  price: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
});
