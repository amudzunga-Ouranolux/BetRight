import { useState } from 'react';
import { ScrollView } from 'react-native';

import { Box } from '@/core/theme/restyle';
import { useResponsive } from '@/core/theme/responsive';
import {
  catalogCompetitions,
  catalogLeagues,
  catalogTeams,
  type CatalogItem,
} from '@/core/api/mock/catalog';
import { BRText } from '@/components/primitives/BRText';
import { SegmentedTabs } from '@/components/inputs/SegmentedTabs';
import { SelectableRow } from '@/components/inputs/SelectableRow';
import { TeamCrest } from '@/components/media/TeamCrest';

import { toggleId, type FavouritesSelection, type FavouritesSelectorProps } from './types';

type Tab = 'leagues' | 'competitions' | 'teams';

/**
 * Away favourites selector: segmented Leagues / Competitions / Teams tabs over
 * "Popular" lists, with chip-style selection. A genuinely different selection
 * method from Home/Third (matches the teal-glass onboarding mock).
 */
export function TabbedFavSelector({ value, onChange }: FavouritesSelectorProps) {
  const r = useResponsive();
  const [tab, setTab] = useState<Tab>('leagues');

  const data: Record<Tab, { items: CatalogItem[]; key: keyof FavouritesSelection; withCrest: boolean }> = {
    leagues: { items: catalogLeagues, key: 'leagues', withCrest: false },
    competitions: { items: catalogCompetitions, key: 'competitions', withCrest: false },
    teams: { items: catalogTeams, key: 'teams', withCrest: true },
  };

  const active = data[tab];

  return (
    <Box flex={1} gap="md">
      <SegmentedTabs<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: 'leagues', label: 'Leagues' },
          { value: 'competitions', label: 'Competitions' },
          { value: 'teams', label: 'Teams' },
        ]}
      />
      <BRText variant="label">Popular {tab}</BRText>
      <ScrollView showsVerticalScrollIndicator={false}>
        {active.items.map((item) => (
          <SelectableRow
            key={item.id}
            label={item.name}
            sublabel={item.sublabel}
            indicator="chip"
            selected={value[active.key].includes(item.id)}
            onToggle={() => onChange({ ...value, [active.key]: toggleId(value[active.key], item.id) })}
            leading={active.withCrest ? <TeamCrest name={item.name} size={r.s(36)} /> : undefined}
            testID={`fav-${tab}-${item.id}`}
          />
        ))}
      </ScrollView>
    </Box>
  );
}
