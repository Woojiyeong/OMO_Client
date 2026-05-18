import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { AiIcon, FeedIcon, MyIcon, UploadIcon } from '@/components/ui/tab-icons';
import { Palette } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Palette.pink500,
        tabBarInactiveTintColor: Palette.grayBorder,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Pretendard-Medium',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '피드',
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color }) => <AiIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: '업로드',
          tabBarIcon: ({ color }) => <UploadIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '마이',
          tabBarIcon: ({ color }) => <MyIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
