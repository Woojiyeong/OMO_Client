import WheelPicker from '@quidone/react-native-wheel-picker';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { OnboardingScreen } from '@/components/ui/onboarding-screen';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { FontFamily } from '@/constants/typography';
import { ApiError } from '@/features/api/client';
import { signUp } from '@/features/onboarding/api';
import { useOnboardingStore } from '@/features/onboarding/store';

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => {
    const value = from + i;
    return { value, label: String(value) };
  });

const HEIGHTS = range(140, 190);
const WEIGHTS = range(35, 120);

const PICKER_WIDTH = 56;
const UNIT_GAP = 4;

export default function BodyScreen() {
  const store = useOnboardingStore();
  const setField = useOnboardingStore((s) => s.setField);
  const markOnboarded = useOnboardingStore((s) => s.markOnboarded);
  const reset = useOnboardingStore((s) => s.reset);

  const [height, setHeight] = useState(store.height);
  const [weight, setWeight] = useState(store.weight);
  const [submitting, setSubmitting] = useState(false);

  const itemTextStyle = useMemo(() => styles.itemText, []);

  const onComplete = async () => {
    setField('height', height);
    setField('weight', weight);
    setSubmitting(true);
    try {
      await signUp({
        email: store.email,
        username: store.username,
        password: store.password,
        style: store.style!,
        name: store.name,
        height,
        weight,
      });
      reset();
      markOnboarded();
      router.replace('/(tabs)');
    } catch (e) {
      if (e instanceof ApiError) {
        console.warn('signup failed', {
          status: e.status,
          message: e.message,
          body: e.body,
        });
      } else {
        console.warn('signup failed', e);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingScreen
      progress={1}
      title="신체 사이즈를 알려주세요."
      footer={
        <Button onPress={onComplete} loading={submitting} disabled={submitting}>
          완료
        </Button>
      }
    >
      <Text style={styles.groupLabel}>키와 몸무게</Text>
      <View style={styles.row}>
        <View style={styles.pickerRow}>
          <WheelPicker
            data={HEIGHTS}
            value={height}
            onValueChanged={({ item }) => setHeight(item.value)}
            itemHeight={40}
            visibleItemCount={3}
            width={PICKER_WIDTH}
            renderOverlay={null}
            itemTextStyle={itemTextStyle}
          />
          <Text style={styles.unit}>cm</Text>
        </View>
        <View style={styles.pickerRow}>
          <WheelPicker
            data={WEIGHTS}
            value={weight}
            onValueChanged={({ item }) => setWeight(item.value)}
            itemHeight={40}
            visibleItemCount={3}
            width={PICKER_WIDTH}
            renderOverlay={null}
            itemTextStyle={itemTextStyle}
          />
          <Text style={styles.unit}>kg</Text>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    color: Palette.black,
    textAlign: 'center',
    marginTop: Spacing.xxl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xxl,
    marginTop: Spacing.xl,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unit: {
    fontFamily: FontFamily.semibold,
    fontSize: 18,
    lineHeight: 22,
    color: '#777777',
    marginLeft: UNIT_GAP,
  },
  itemText: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 24,
    color: Palette.black,
    textAlign: 'center',
  },
});
