import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Star, CalendarDays, Sparkles, User, type LucideIcon } from 'lucide-react-native';

import { Box, useTheme } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import { BRText } from '@/components/primitives/BRText';

/**
 * Minimal structural type for the subset of the navigation tabBar props we use.
 * Avoids depending on expo-router's internal bottom-tabs fork path.
 */
interface TabRoute {
  key: string;
  name: string;
}
interface TabBarProps {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

const ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  home: { icon: Home, label: 'Home' },
  favourites: { icon: Star, label: 'Favourites' },
  matches: { icon: CalendarDays, label: 'Matches' },
  predict: { icon: Sparkles, label: 'Predict' },
  profile: { icon: User, label: 'Profile' },
};

/**
 * Custom theme-aware bottom navigation. The active tab takes the kit accent and,
 * on glow kits (Home/Third), a subtle accent glow — flat on the Away glass kit.
 */
export function BottomTabBar({ state, navigation }: TabBarProps) {
  const theme = useTheme();
  const r = useResponsive();
  const insets = useSafeAreaInsets();

  return (
    <Box
      flexDirection="row"
      backgroundColor="surface"
      borderTopWidth={1}
      borderColor="border"
      paddingTop="sm"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      {state.routes.map((route, index) => {
        const meta = ICONS[route.name] ?? { icon: Home, label: route.name };
        const focused = state.index === index;
        const color = focused ? theme.colors.primary : theme.colors.textSecondary;
        const Icon = meta.icon;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            style={{ flex: 1 }}
          >
            <Box alignItems="center" gap="xxs">
              <Box
                alignItems="center"
                justifyContent="center"
                paddingHorizontal="sm"
                paddingVertical="xxs"
                borderRadius="pill"
                style={{
                  backgroundColor: focused ? theme.colors.primary + '24' : 'transparent',
                  borderWidth: 1,
                  borderColor: focused ? theme.colors.primary + '4D' : 'transparent',
                }}
              >
                <Icon size={r.s(17)} color={color} strokeWidth={focused ? 2.5 : 2} />
              </Box>
              <BRText
                style={{
                  fontSize: r.s(8),
                  lineHeight: r.s(10),
                  fontFamily: focused ? theme.fonts.semibold : theme.fonts.medium,
                  color,
                }}
              >
                {meta.label}
              </BRText>
            </Box>
          </Pressable>
        );
      })}
    </Box>
  );
}
