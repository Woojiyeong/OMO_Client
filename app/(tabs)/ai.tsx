import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { TabHeader } from '@/components/ui/tab-header';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';

const PLACEHOLDER = '친구 만나러가는데 꾸안꾸 추천해줘';
const HEADLINE_TOP_FROM_SCREEN = 200;
const TAB_HEADER_HEIGHT = 56;

export default function AiScreen() {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const [kbVisible, setKbVisible] = useState(false);
  const headlineMarginTop = Math.max(
    HEADLINE_TOP_FROM_SCREEN - insets.top - TAB_HEADER_HEIGHT,
    0,
  );

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, () => setKbVisible(true));
    const hideSub = Keyboard.addListener(hideEvt, () => setKbVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    router.push({ pathname: '/ai-loading', params: { query: trimmed } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView edges={['top']} style={styles.flex}>
        <TabHeader title="오모" />
        <View style={styles.body}>
          <View style={[styles.headline, { marginTop: headlineMarginTop }]}>
            <Text style={styles.main}>오늘은 어떤 하루인가요?</Text>
            <Text style={styles.sub}>상황을 입력하면 오모가 추천해드려요!</Text>
          </View>

          <View
            style={[
              styles.inputWrap,
              { paddingBottom: kbVisible ? Spacing.xs : Spacing.base },
            ]}
          >
            <View style={styles.inputRow}>
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={PLACEHOLDER}
                placeholderTextColor={Palette.gray400}
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
              />
              <Pressable
                onPress={handleSubmit}
                hitSlop={8}
                disabled={!value.trim()}
                style={[styles.sendBtn, !value.trim() && styles.sendBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="추천 요청 보내기"
              >
                <ArrowUp />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function ArrowUp() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19V5M5 12l7-7 7 7"
        stroke={Palette.white}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const SEND_SIZE = 36;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  headline: {
    alignItems: 'center',
  },
  main: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Palette.textPrimary,
    lineHeight: 32,
    textAlign: 'center',
  },
  sub: {
    marginTop: Spacing.sm,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: Palette.pink500,
    textAlign: 'center',
  },
  inputWrap: {
    marginTop: 'auto',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: Palette.gray150,
    borderRadius: Radius.pill,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
    backgroundColor: Palette.white,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    lineHeight: 18,
    color: Palette.black,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 2 : 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: SEND_SIZE,
    height: SEND_SIZE,
    borderRadius: SEND_SIZE / 2,
    backgroundColor: Palette.pink500,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  sendBtnDisabled: {
    backgroundColor: Palette.pink100,
  },
});
