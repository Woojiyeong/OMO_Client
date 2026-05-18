import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import type { AiCoordiSummary } from '@/features/ai/types';

type Props = {
  product: AiCoordiSummary;
  width: number;
};

export function ProductGridCard({ product, width }: Props) {
  const handlePress = () => {
    router.push({ pathname: '/ai-detail', params: { id: product.id } });
  };

  return (
    <Pressable onPress={handlePress} style={{ width }}>
      <View style={styles.imageBox}>
        {product.thumbnail ? (
          <Image source={product.thumbnail} style={styles.image} resizeMode="cover" />
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.price}>{product.priceWon.toLocaleString('ko-KR')}원</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.lg,
    backgroundColor: Palette.gray150,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  price: {
    marginTop: 4,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.gray500,
  },
});
