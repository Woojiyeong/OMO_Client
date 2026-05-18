import { StyleSheet, Text, View } from 'react-native';

import { FontFamily } from '@/constants/typography';

type Props = {
  totalWon: number;
};

export function FloatingTotalPill({ totalWon }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.pill}>
        <Text style={styles.label}>예상 금액</Text>
        <Text style={styles.amount}>{totalWon.toLocaleString('ko-KR')}원</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: -16,
    marginBottom: -8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: '#999',
  },
  amount: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: '#111',
  },
});
