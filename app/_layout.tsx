import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';

import { Intro } from '@/components/intro';
import { useSocialStore } from '@/features/social/store';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(onboarding)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [introDone, setIntroDone] = useState(false);
  const handleIntroFinish = useCallback(() => setIntroDone(true), []);

  const [fontsLoaded] = useFonts({
    'Pretendard-Medium': require('@/assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-SemiBold': require('@/assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-Bold': require('@/assets/fonts/Pretendard-Bold.ttf'),
    Chab: require('@/assets/fonts/chab.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const { loadFollowing, loadFollowers } = useSocialStore.getState();
    loadFollowing().catch(() => {});
    loadFollowers().catch(() => {});
  }, []);

  if (!fontsLoaded) return null;

  const showIntro = !introDone;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile-edit"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="follow-list"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="user-profile"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="account-id-edit"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="account-password-edit"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="post-detail"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="product-detail"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="ai-loading"
          options={{ headerShown: false, presentation: 'card', gestureEnabled: false }}
        />
        <Stack.Screen
          name="ai-results"
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="ai-detail"
          options={{ headerShown: false, presentation: 'card' }}
        />
      </Stack>
      {showIntro && <Intro onFinish={handleIntroFinish} />}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
