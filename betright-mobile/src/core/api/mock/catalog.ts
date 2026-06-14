/** Static onboarding catalog (sports, leagues, competitions, teams) for the FE phase. */

export interface CatalogSport {
  code: string;
  name: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  sublabel?: string;
}

export const catalogSports: CatalogSport[] = [
  { code: 'football', name: 'Football' },
  { code: 'basketball', name: 'Basketball' },
  { code: 'tennis', name: 'Tennis' },
  { code: 'rugby', name: 'Rugby' },
  { code: 'cricket', name: 'Cricket' },
  { code: 'esports', name: 'Esports' },
];

export const catalogLeagues: CatalogItem[] = [
  { id: 'epl', name: 'Premier League', sublabel: 'England' },
  { id: 'laliga', name: 'La Liga', sublabel: 'Spain' },
  { id: 'seriea', name: 'Serie A', sublabel: 'Italy' },
  { id: 'bundesliga', name: 'Bundesliga', sublabel: 'Germany' },
  { id: 'ligue1', name: 'Ligue 1', sublabel: 'France' },
  { id: 'psl', name: 'PSL', sublabel: 'South Africa' },
];

export const catalogCompetitions: CatalogItem[] = [
  { id: 'ucl', name: 'UEFA Champions League' },
  { id: 'uel', name: 'UEFA Europa League' },
  { id: 'wc', name: 'World Cup' },
  { id: 'afcon', name: 'AFCON' },
  { id: 'copa', name: 'Copa America' },
];

export const catalogTeams: CatalogItem[] = [
  { id: 'mci', name: 'Manchester City', sublabel: 'Premier League' },
  { id: 'rma', name: 'Real Madrid', sublabel: 'La Liga' },
  { id: 'fcb', name: 'Barcelona', sublabel: 'La Liga' },
  { id: 'liv', name: 'Liverpool', sublabel: 'Premier League' },
  { id: 'ars', name: 'Arsenal', sublabel: 'Premier League' },
  { id: 'bay', name: 'Bayern Munich', sublabel: 'Bundesliga' },
  { id: 'psg', name: 'Paris Saint-Germain', sublabel: 'Ligue 1' },
  { id: 'juv', name: 'Juventus', sublabel: 'Serie A' },
];
