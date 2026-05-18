import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontFamily } from '@/constants/typography';

type Props<T extends string> = {
  options: readonly T[];
  selected: T[];
  onChange: (next: T[]) => void;
  max: number;
};

export function ChipSelector<T extends string>({
  options,
  selected,
  onChange,
  max,
}: Props<T>) {
  const toggle = (opt: T) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else if (selected.length < max) {
      onChange([...selected, opt]);
    }
  };

  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        const isDisabled = !isSelected && selected.length >= max;
        return (
          <Pressable
            key={opt}
            onPress={() => toggle(opt)}
            disabled={isDisabled}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
              isDisabled && styles.chipDisabled,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            accessibilityLabel={opt}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  chipSelected: {
    borderColor: '#ff007f',
    backgroundColor: '#ff007f',
  },
  chipDisabled: {
    opacity: 0.45,
  },
  chipText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: '#888',
  },
  chipTextSelected: {
    fontFamily: FontFamily.semibold,
    color: '#fff',
  },
});
