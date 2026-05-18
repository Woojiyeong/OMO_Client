import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { FontFamily } from '@/constants/typography';
import type { UploadProduct } from '@/features/upload/types';

type Props = {
  product: UploadProduct;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PinProductCard({ product, onPress }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 80 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${product.category} ${product.name} 수정`}
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.thumb}>
        {product.thumbnail ? (
          <Image source={product.thumbnail} style={styles.thumbImage} resizeMode="cover" />
        ) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.category} numberOfLines={1}>
          {product.category}
        </Text>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{product.priceWon.toLocaleString('ko-KR')}원</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ededed',
    borderRadius: 14,
    backgroundColor: '#fff',
    marginTop: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#e9e9e9',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    minHeight: 72,
  },
  category: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: '#999',
  },
  name: {
    marginTop: 2,
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: '#111',
    lineHeight: 18,
  },
  price: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: '#888',
  },
});
