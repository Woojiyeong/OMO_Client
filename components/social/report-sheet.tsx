import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

export type ReportReason = 'SPAM' | 'ABUSE' | 'INAPPROPRIATE' | 'ETC';

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: '스팸' },
  { value: 'ABUSE', label: '욕설/괴롭힘' },
  { value: 'INAPPROPRIATE', label: '부적절한 내용' },
  { value: 'ETC', label: '기타' },
];

type Props = {
  visible: boolean;
  title: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: { reason: ReportReason; description?: string }) => void;
};

export function ReportSheet({
  visible,
  title,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<ReportReason>('ETC');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!visible) return;
    setReason('ETC');
    setDescription('');
  }, [visible]);

  const handleSubmit = () => {
    onSubmit({
      reason,
      description: description.trim() || undefined,
    });
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.wrap}
            >
              <View
                style={[
                  styles.sheet,
                  { paddingBottom: Math.max(insets.bottom, Spacing.base) },
                ]}
              >
                <View style={styles.handle} />
                <Text style={styles.title}>{title}</Text>
                <View style={styles.reasonGrid}>
                  {REASONS.map((item) => {
                    const active = item.value === reason;
                    return (
                      <Pressable
                        key={item.value}
                        onPress={() => setReason(item.value)}
                        style={[styles.reason, active && styles.reasonActive]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <Text
                          style={[
                            styles.reasonText,
                            active && styles.reasonTextActive,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="상세 사유를 입력해 주세요."
                  placeholderTextColor={Palette.gray300}
                  maxLength={500}
                  multiline
                  style={styles.input}
                />
                <Pressable
                  onPress={handleSubmit}
                  disabled={submitting}
                  style={[styles.submit, submitting && styles.submitDisabled]}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !!submitting, busy: !!submitting }}
                >
                  <Text style={styles.submitText}>
                    {submitting ? '신고 중' : '신고하기'}
                  </Text>
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  wrap: {
    width: '100%',
  },
  sheet: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    backgroundColor: Palette.white,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    marginBottom: Spacing.base,
    borderRadius: 2,
    backgroundColor: Palette.gray200,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Palette.textPrimary,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  reason: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: Radius.pill,
  },
  reasonActive: {
    borderColor: Palette.pink500,
    backgroundColor: Palette.pink500,
  },
  reasonText: {
    fontFamily: FontFamily.semibold,
    fontSize: 13,
    color: Palette.gray500,
  },
  reasonTextActive: {
    color: Palette.white,
  },
  input: {
    minHeight: 96,
    marginTop: Spacing.base,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderRadius: Radius.md,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Palette.textPrimary,
    textAlignVertical: 'top',
  },
  submit: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.base,
    borderRadius: Radius.pill,
    backgroundColor: Palette.pink500,
  },
  submitDisabled: {
    opacity: 0.65,
  },
  submitText: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    color: Palette.white,
  },
});
