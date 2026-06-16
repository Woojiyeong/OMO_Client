import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/social/screen-header';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { fetchProduct, type ProductDetail } from '@/features/products/api';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProduct(id)
      .then((next) => {
        if (!cancelled) setProduct(next);
      })
      .catch(() => {
        if (!cancelled) router.back();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const hero = useMemo(
    () => product?.images[0] ?? product?.thumbnail,
    [product],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScreenHeader title="상품 상세" onBack={() => router.back()} />
      {loading || !product ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Palette.pink500} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            {hero ? <Image source={hero} style={styles.heroImage} resizeMode="cover" /> : null}
          </View>
          <View style={styles.info}>
            <Text style={styles.brand}>{product.brand || product.category}</Text>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>
              {product.priceWon.toLocaleString('ko-KR')}원
            </Text>
          </View>
          {product.images.length > 1 ? (
            <View style={styles.images}>
              {product.images.slice(1).map((image, index) => (
                <Image
                  key={`${product.id}-${index}`}
                  source={image}
                  style={styles.subImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  hero: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Palette.gray150,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    padding: Spacing.base,
    gap: Spacing.xs,
  },
  brand: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.gray500,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    color: Palette.textPrimary,
  },
  price: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Palette.textPrimary,
  },
  images: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
  },
  subImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: Radius.md,
    backgroundColor: Palette.gray150,
  },
});
