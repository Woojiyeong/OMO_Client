import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { ProductPin } from '@/components/upload/product-pin';
import type { UploadProduct, UploadStatus } from '@/features/upload/types';

type Props = {
  imageUri: string | null;
  status: UploadStatus;
  pins: UploadProduct[];
  onPickImage: () => void;
  onPinPress: (productId: string) => void;
};

export function UploadImageArea({ imageUri, status, pins, onPickImage, onPinPress }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    if (status === 'analyzing') {
      shimmer.value = -1;
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      cancelAnimation(shimmer);
      shimmer.value = -1;
    }
  }, [status, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => {
    const w = size.width || 0;
    return {
      transform: [{ translateX: shimmer.value * w }],
    };
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  const showImage = imageUri && status !== 'idle';
  const canPick = status === 'idle' || status === 'picked';

  return (
    <Pressable
      onPress={canPick ? onPickImage : undefined}
      onLayout={handleLayout}
      style={styles.container}
      accessibilityRole={canPick ? 'button' : undefined}
      accessibilityLabel={canPick ? '이미지 업로드' : undefined}
    >
      {showImage ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <MaterialIcons name="image" size={40} color="#b5b5b5" />
          <Text style={styles.placeholderText}>클릭하여 이미지 업로드</Text>
        </View>
      )}

      {status === 'analyzing' ? (
        <>
          <View style={styles.dim} pointerEvents="none" />
          <Animated.View style={[styles.shimmer, shimmerStyle]} pointerEvents="none" />
        </>
      ) : null}

      {status === 'completed' && size.width > 0
        ? pins.map((p) => (
            <ProductPin
              key={p.id}
              x={p.pin.x}
              y={p.pin.y}
              containerWidth={size.width}
              containerHeight={size.height}
              onPress={() => onPinPress(p.id)}
            />
          ))
        : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#efefef',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    color: '#b5b5b5',
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '60%',
    backgroundColor: 'rgba(255,255,255,0.55)',
    opacity: 0.9,
  },
});
