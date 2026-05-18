import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

export type PostMoreVariant = 'report' | 'delete' | 'unsave';

const VARIANT_LABEL: Record<PostMoreVariant, string> = {
  report: '글 신고하기',
  delete: '게시글 삭제',
  unsave: '저장 목록에서 빼기',
};

type Props = {
  visible: boolean;
  variant: PostMoreVariant;
  onClose: () => void;
  onConfirm: () => void;
};

export function PostMoreSheet({ visible, variant, onClose, onConfirm }: Props) {
  const insets = useSafeAreaInsets();
  const actionLabel = VARIANT_LABEL[variant];

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom, Spacing.base) },
              ]}
            >
              <View style={styles.handle} />
              <Pressable
                onPress={onConfirm}
                style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
                accessibilityRole="button"
                accessibilityLabel={actionLabel}
              >
                <Text style={styles.destructiveText}>{actionLabel}</Text>
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
                accessibilityRole="button"
                accessibilityLabel="취소"
              >
                <Text style={styles.cancelText}>취소</Text>
              </Pressable>
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
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.gray200,
    marginBottom: Spacing.sm,
  },
  action: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
  },
  actionPressed: {
    backgroundColor: Palette.gray50,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
  },
  destructiveText: {
    fontFamily: FontFamily.semibold,
    fontSize: 16,
    color: Palette.danger,
  },
  cancelText: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    color: Palette.textPrimary,
  },
});
