import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  mode: 'normal' | 'endless';
  score: number;
  graze_count: number;
  wave: number;
  time_ms: number;
  created_at: string;
}

export interface SubmitScoreData {
  player_name: string;
  mode: 'normal' | 'endless';
  score: number;
  graze_count: number;
  wave: number;
  time_ms: number;
}

export async function submitScore(data: SubmitScoreData): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('leaderboard').insert(data);
  if (error) {
    console.error('Failed to submit score:', error);
    return false;
  }
  return true;
}

export async function fetchLeaderboard(mode: 'normal' | 'endless'): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];
  const orderBy = mode === 'normal' ? 'score' : 'wave';
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('mode', mode)
    .order(orderBy, { ascending: false })
    .limit(10);
  if (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
  return data as LeaderboardEntry[];
}
