import { Tabs } from 'expo-router';

import { BottomTabBar } from '@/components/nav/BottomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="favourites" />
      <Tabs.Screen name="matches" />
      <Tabs.Screen name="predict" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
