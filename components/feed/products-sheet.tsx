import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import type { ProductRecommendation } from '@/features/feed/types';

import { ProductCard } from './product-card';

type Props = {
  visible: boolean;
  products: ProductRecommendation[];
  onClose: () => void;
};

export function ProductsSheet({ visible, products, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom, Spacing.base) + Spacing.sm },
              ]}
            >
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.title}>전체 상품 ({products.length})</Text>
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="닫기"
                >
                  <Text style={styles.closeText}>닫기</Text>
                </Pressable>
              </View>
              <ScrollView
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
              >
                {products.map((p) => (
                  <View key={p.id} style={styles.row}>
                    <ProductCard product={p} width="100%" />
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: Spacing.sm,
    maxHeight: '80%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.gray200,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.textPrimary,
  },
  closeText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Palette.gray500,
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  row: {
    width: '100%',
  },
});
