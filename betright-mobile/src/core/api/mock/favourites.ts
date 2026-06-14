/** Mock data for the personalised Favourites hub (teams, leagues, updates). */

export type FavUpdateKind = 'prediction_changed' | 'lineup' | 'confidence_up' | 'starting_soon' | 'result';

export interface FavUpdate {
  id: string;
  kind: FavUpdateKind;
  title: string;
  detail: string;
  timeAgo: string;
}

export type FormResult = 'W' | 'D' | 'L';

export interface FavTeam {
  id: string;
  name: string;
  shortName: string;
  opponent: string;
  kickoff: string; // display string e.g. "Today 18:30"
  form: FormResult[];
  predLabel: string;
  predPct: number;
}

export interface FavLeague {
  id: string;
  name: string;
  matchesToday: number;
  highConfidence: number;
  note: string;
}

export const mockFavUpdates: FavUpdate[] = [
  { id: 'u1', kind: 'prediction_changed', title: 'Prediction changed', detail: 'Confidence moved from 58% to 62% after a lineup update.', timeAgo: '20m ago' },
  { id: 'u2', kind: 'lineup', title: 'Lineup confirmed', detail: 'Starting eleven announced for your favourite team.', timeAgo: '45m ago' },
  { id: 'u3', kind: 'confidence_up', title: 'Confidence increased', detail: 'Opponent expected to rotate. Win probability +4%.', timeAgo: '1h ago' },
  { id: 'u4', kind: 'starting_soon', title: 'Match starting soon', detail: 'A favourite team kicks off in under 2 hours.', timeAgo: '2h ago' },
];

export const mockFavTeams: FavTeam[] = [
  { id: 'ars', name: 'Arsenal', shortName: 'ARS', opponent: 'Chelsea', kickoff: 'Today 18:30', form: ['W', 'W', 'D', 'L', 'W'], predLabel: 'Arsenal Win', predPct: 58 },
  { id: 'rma', name: 'Real Madrid', shortName: 'RMA', opponent: 'Barcelona', kickoff: 'Tomorrow 21:00', form: ['W', 'D', 'W', 'W', 'L'], predLabel: 'Real Madrid Win', predPct: 61 },
  { id: 'mci', name: 'Man City', shortName: 'MCI', opponent: 'Man United', kickoff: 'Today 20:00', form: ['W', 'W', 'W', 'D', 'W'], predLabel: 'Man City Win', predPct: 62 },
];

export const mockFavLeagues: FavLeague[] = [
  { id: 'epl', name: 'Premier League', matchesToday: 5, highConfidence: 2, note: 'Arsenal plays at 18:30' },
  { id: 'ucl', name: 'UEFA Champions League', matchesToday: 3, highConfidence: 1, note: 'Man City vs Man United tonight' },
  { id: 'laliga', name: 'La Liga', matchesToday: 4, highConfidence: 1, note: 'El Clasico tomorrow' },
];
