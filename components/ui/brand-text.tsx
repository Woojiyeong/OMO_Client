import { StyleSheet, Text, View } from 'react-native';

const PINK = '#FF007F';
const DARK = '#212020';

type Size = 'lg' | 'sm';
type Align = 'center' | 'left';

const SIZES: Record<Size, { kor: number; eng: number }> = {
  lg: { kor: 48, eng: 24 },
  sm: { kor: 30, eng: 22 },
};

type Props = {
  size?: Size;
  align?: Align;
};

export function BrandText({ size = 'lg', align = 'center' }: Props = {}) {
  const s = SIZES[size];

  return (
    <View style={[styles.wrap, align === 'left' && styles.wrapLeft]}>
      <Text style={[styles.kor, { fontSize: s.kor }]}>오모</Text>
      <Text style={[styles.eng, { fontSize: s.eng }]}>
        <Text style={styles.pink}>O</Text>
        <Text style={styles.dark}>h </Text>
        <Text style={styles.pink}>M</Text>
        <Text style={styles.dark}>y </Text>
        <Text style={styles.pink}>O</Text>
        <Text style={styles.dark}>utfit</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  wrapLeft: {
    alignItems: 'flex-start',
  },
  kor: {
    fontFamily: 'Chab',
    color: PINK,
  },
  eng: {
    fontFamily: 'Chab',
  },
  pink: { color: PINK },
  dark: { color: DARK },
});
