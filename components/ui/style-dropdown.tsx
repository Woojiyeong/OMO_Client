import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { STYLE_OPTIONS, type StyleOption } from '@/features/onboarding/styles';

type Props = {
  value: StyleOption | null;
  onChange: (v: StyleOption) => void;
  placeholder?: string;
  error?: string;
};

export function StyleDropdown({ value, onChange, placeholder = '스타일', error }: Props) {
  const [open, setOpen] = useState(false);
  const selected = STYLE_OPTIONS.find((o) => o.value === value);

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={selected ? `스타일 ${selected.label}` : placeholder}
        style={[styles.field, error && styles.fieldError]}
      >
        <Text style={[styles.value, !selected && styles.placeholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Palette.gray600} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <FlatList
                  data={STYLE_OPTIONS}
                  keyExtractor={(o) => o.value}
                  ItemSeparatorComponent={() => <View style={styles.sep} />}
                  renderItem={({ item }) => {
                    const active = item.value === value;
                    return (
                      <Pressable
                        onPress={() => {
                          onChange(item.value);
                          setOpen(false);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        style={({ pressed }) => [
                          styles.option,
                          pressed && styles.optionPressed,
                        ]}
                      >
                        <Text style={[styles.optionText, active && styles.optionTextActive]}>
                          {item.label}
                        </Text>
                        {active && (
                          <Ionicons name="checkmark" size={18} color={Palette.pink500} />
                        )}
                      </Pressable>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    height: 52,
    borderWidth: 1,
    borderColor: Palette.gray200,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.white,
  },
  fieldError: { borderColor: Palette.pink500 },
  value: { ...Typography.body, color: Palette.black },
  placeholder: { color: Palette.gray400 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
  },
  option: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionPressed: { backgroundColor: Palette.gray50 },
  optionText: { ...Typography.body, color: Palette.black },
  optionTextActive: { color: Palette.pink500 },
  sep: { height: 1, backgroundColor: Palette.gray100 },
});
