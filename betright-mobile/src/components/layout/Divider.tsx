import { Box, useTheme } from '@/core/theme/restyle';

export interface DividerProps {
  /** Inset both ends by the standard screen gutter so the line stops short of the card border. */
  inset?: boolean;
  /** Explicit left inset (e.g. to clear a leading icon column). Overrides `inset` on the left. */
  leftInset?: number;
  /** Explicit right inset. Overrides `inset` on the right. */
  rightInset?: number;
}

/**
 * 1px horizontal divider used between rows in the table-style cards (Followed,
 * News, Favourites). See DESIGN_SYSTEM.md: row dividers should be inset so they
 * never touch the card border, and inset past a leading icon when present.
 */
export function Divider({ inset = false, leftInset, rightInset }: DividerProps) {
  const theme = useTheme();
  const ml = leftInset ?? (inset ? theme.spacing.md : 0);
  const mr = rightInset ?? (inset ? theme.spacing.md : 0);
  return <Box style={{ height: 1, marginLeft: ml, marginRight: mr, backgroundColor: theme.colors.border }} />;
}
