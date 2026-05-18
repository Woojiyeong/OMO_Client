import { useMemo } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { FontFamily } from '@/constants/typography';

type Segment = { text: string; isHashtag: boolean };

const HASHTAG_RE = /#[A-Za-z0-9_ㄱ-ㆎ가-힣]+/g;

function parseSegments(input: string): Segment[] {
  if (!input) return [];
  const segments: Segment[] = [];
  let cursor = 0;
  for (const m of input.matchAll(HASHTAG_RE)) {
    const start = m.index ?? 0;
    if (start > cursor) {
      segments.push({ text: input.slice(cursor, start), isHashtag: false });
    }
    segments.push({ text: m[0], isHashtag: true });
    cursor = start + m[0].length;
  }
  if (cursor < input.length) {
    segments.push({ text: input.slice(cursor), isHashtag: false });
  }
  return segments;
}

type Props = {
  value: string;
  onChange: (next: string) => void;
};

const PLACEHOLDER =
  '예시) #셔츠 를 활용한 #꾸안꾸 룩입니다.\n\n#직장인 #데일리룩 #개발자 #봄코디 #체크셔츠';

const PADDING = 16;
const FONT_SIZE = 15;
const LINE_HEIGHT = 24;
const TOP_OFFSET = Platform.select({ ios: 3.5, android: 0.5, default: 0.5 }) ?? 0;

export function DescriptionInput({ value, onChange }: Props) {
  const segments = useMemo(() => parseSegments(value), [value]);
  const hasHashtag = segments.some((s) => s.isHashtag);

  return (
    <View style={styles.wrapper}>
      <TextInput
        multiline
        value={value}
        onChangeText={onChange}
        placeholder={PLACEHOLDER}
        placeholderTextColor="#b5b5b5"
        textAlignVertical="top"
        autoCapitalize="none"
        autoCorrect={false}
        selectionColor="#ff007f"
        style={styles.input}
      />
      {hasHashtag ? (
        <Text style={styles.overlay} pointerEvents="none">
          {segments.map((s, i) => (
            <Text
              key={i}
              style={s.isHashtag ? styles.hashtag : styles.invisible}
            >
              {s.text}
            </Text>
          ))}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    minHeight: 140,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 14,
    backgroundColor: '#fff',
    position: 'relative',
  },
  input: {
    minHeight: 140,
    padding: PADDING,
    fontFamily: FontFamily.regular,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
    color: '#111',
  },
  overlay: {
    position: 'absolute',
    top: PADDING + TOP_OFFSET,
    left: PADDING,
    right: PADDING,
    fontFamily: FontFamily.regular,
    fontSize: FONT_SIZE,
    lineHeight: LINE_HEIGHT,
  },
  hashtag: {
    color: '#ff007f',
  },
  invisible: {
    color: 'transparent',
  },
});
