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

  // 昵称统一转小写，确保大小写不敏感
  const normalizedName = data.player_name.toLowerCase();

  // 查找同名同模式的所有已有记录
  const { data: existingRows } = await supabase
    .from('leaderboard')
    .select('id')
    .eq('player_name', normalizedName)
    .eq('mode', data.mode)
    .order('created_at', { ascending: true });

  if (existingRows && existingRows.length > 0) {
    // 保留第一条，删除多余的重复记录
    const keepId = existingRows[0].id;
    if (existingRows.length > 1) {
      const duplicateIds = existingRows.slice(1).map(r => r.id);
      await supabase.from('leaderboard').delete().in('id', duplicateIds);
    }

    // 覆盖保留的那条记录
    const { error } = await supabase
      .from('leaderboard')
      .update({
        score: data.score,
        graze_count: data.graze_count,
        wave: data.wave,
        time_ms: data.time_ms,
        created_at: new Date().toISOString()
      })
      .eq('id', keepId);
    if (error) {
      console.error('Failed to update score:', error);
      return false;
    }
  } else {
    const { error } = await supabase.from('leaderboard').insert({ ...data, player_name: normalizedName });
    if (error) {
      console.error('Failed to submit score:', error);
      return false;
    }
  }
  return true;
}

export async function fetchLeaderboard(mode: 'normal' | 'endless', orderBy?: string): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];
  const sortField = orderBy || (mode === 'normal' ? 'score' : 'wave');
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('mode', mode)
    .order(sortField, { ascending: false })
    .limit(10);
  if (error) {
    console.error('Failed to fetch leaderboard:', error);
    return [];
  }
  return data as LeaderboardEntry[];
}
