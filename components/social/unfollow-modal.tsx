import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

type Props = {
  visible: boolean;
  targetName?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function UnfollowModal({ visible, targetName, onCancel, onConfirm }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>팔로우를 취소하시겠어요?</Text>
              {targetName ? <Text style={styles.subtitle}>{targetName}</Text> : null}

              <View style={styles.actions}>
                <Pressable
                  onPress={onCancel}
                  style={styles.actionButton}
                  accessibilityRole="button"
                  accessibilityLabel="취소"
                >
                  <Text style={[styles.actionText, styles.cancelText]}>취소</Text>
                </Pressable>
                <View style={styles.actionDivider} />
                <Pressable
                  onPress={onConfirm}
                  style={styles.actionButton}
                  accessibilityRole="button"
                  accessibilityLabel="언팔로우"
                >
                  <Text style={[styles.actionText, styles.confirmText]}>언팔로우</Text>
                </Pressable>
              </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Palette.white,
    borderRadius: 20,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xs,
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: Palette.gray400,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Palette.borderSubtle,
  },
  actionText: {
    fontFamily: FontFamily.semibold,
    fontSize: 15,
  },
  cancelText: {
    color: Palette.grayBorder,
  },
  confirmText: {
    color: Palette.pink500,
    fontFamily: FontFamily.bold,
  },
});
