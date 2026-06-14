import { Image } from 'expo-image';

import { Box, useTheme } from '@/core/theme/restyle';
import { BRText } from '@/components/primitives/BRText';

export interface TeamCrestProps {
  name: string;
  shortName?: string;
  logoUrl?: string;
  size?: number;
  testID?: string;
}

/**
 * Team badge. Uses the crest image when available, otherwise a clean monogram
 * derived from the short name — so the UI is complete before logo assets exist.
 */
export function TeamCrest({ name, shortName, logoUrl, size = 44, testID }: TeamCrestProps) {
  const theme = useTheme();
  const initials = (shortName ?? name).slice(0, 3).toUpperCase();

  if (logoUrl) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="contain"
        testID={testID}
      />
    );
  }

  return (
    <Box
      width={size}
      height={size}
      borderRadius="pill"
      alignItems="center"
      justifyContent="center"
      backgroundColor="surfaceAlt"
      borderWidth={1}
      borderColor="border"
      testID={testID}
    >
      <BRText style={{ fontSize: size * 0.3, fontWeight: '800', color: theme.colors.textPrimary }}>
        {initials}
      </BRText>
    </Box>
  );
}
