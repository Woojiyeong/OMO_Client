import { MaterialIcons } from '@expo/vector-icons';
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

import { FontFamily } from '@/constants/typography';
import { CATEGORY_OPTIONS, type CategoryOption, type UploadProduct } from '@/features/upload/types';

type Props = {
  visible: boolean;
  product: UploadProduct | null;
  onClose: () => void;
  onSubmit: (next: { category: CategoryOption; link: string }) => void;
};

export function EditProductSheet({ visible, product, onClose, onSubmit }: Props) {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [link, setLink] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (visible && product) {
      setCategory((product.category as CategoryOption) ?? null);
      setLink(product.link ?? '');
      setDropdownOpen(false);
    }
  }, [visible, product]);

  const handleSubmit = () => {
    if (!category) return;
    onSubmit({ category, link: link.trim() });
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetWrap}
            >
              <View
                style={[
                  styles.sheet,
                  { paddingBottom: Math.max(insets.bottom, 16) + 8 },
                ]}
              >
                <View style={styles.handle} />
                <Text style={styles.title}>상품 정보 수정</Text>

                <Pressable
                  onPress={() => setDropdownOpen((v) => !v)}
                  style={styles.field}
                  accessibilityRole="button"
                  accessibilityLabel="의류 유형 선택"
                >
                  <Text style={[styles.fieldText, !category && styles.placeholder]}>
                    {category ?? '의류 유형'}
                  </Text>
                  <MaterialIcons
                    name={dropdownOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={22}
                    color="#999"
                  />
                </Pressable>

                {dropdownOpen ? (
                  <View style={styles.dropdown}>
                    {CATEGORY_OPTIONS.map((opt) => {
                      const active = opt === category;
                      return (
                        <Pressable
                          key={opt}
                          onPress={() => {
                            setCategory(opt);
                            setDropdownOpen(false);
                          }}
                          style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                          accessibilityRole="button"
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              active && styles.dropdownItemTextActive,
                            ]}
                          >
                            {opt}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                <TextInput
                  value={link}
                  onChangeText={setLink}
                  placeholder="상품 링크를 기입해 주세요."
                  placeholderTextColor="#b5b5b5"
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.field, styles.input]}
                />

                <Pressable
                  onPress={handleSubmit}
                  disabled={!category}
                  style={[styles.submit, !category && styles.submitDisabled]}
                  accessibilityRole="button"
                  accessibilityLabel="확인"
                >
                  <Text style={styles.submitText}>확인</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e2e2',
    marginBottom: 12,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: '#111',
    marginBottom: 16,
  },
  field: {
    height: 52,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: '#fff',
  },
  fieldText: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: '#111',
  },
  placeholder: {
    color: '#b5b5b5',
  },
  input: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: '#111',
  },
  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingVertical: 4,
    backgroundColor: '#fff',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemActive: {
    backgroundColor: '#fff1f7',
  },
  dropdownItemText: {
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: '#111',
  },
  dropdownItemTextActive: {
    color: '#ff007f',
    fontFamily: FontFamily.semibold,
  },
  submit: {
    marginTop: 20,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#ff007f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitDisabled: {
    backgroundColor: '#ffd1e6',
  },
  submitText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#fff',
  },
});
