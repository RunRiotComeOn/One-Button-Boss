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

export interface RankDisplayRow {
  rank: number;
  player_name: string;
  score: number;
  graze_count: number;
  wave: number;
  time_ms: number;
  isPlayer?: boolean;
  isEllipsis?: boolean;
}

export async function fetchRankContext(mode: 'normal' | 'endless', playerName: string): Promise<{ rows: RankDisplayRow[]; playerRank: number } | null> {
  if (!supabase) return null;
  const sortField = mode === 'normal' ? 'score' : 'wave';
  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('mode', mode)
    .order(sortField, { ascending: false });
  if (!data) return null;

  const normalized = playerName.toLowerCase();
  const idx = data.findIndex(e => e.player_name === normalized);
  if (idx === -1) return null;

  const playerRank = idx + 1;
  const rows: RankDisplayRow[] = [];

  const toRow = (entry: LeaderboardEntry, rank: number, isPlayer = false): RankDisplayRow => ({
    rank,
    player_name: entry.player_name,
    score: entry.score,
    graze_count: entry.graze_count,
    wave: entry.wave,
    time_ms: entry.time_ms,
    isPlayer,
  });

  // Always show top 3
  const top3 = Math.min(3, data.length);
  for (let i = 0; i < top3; i++) {
    rows.push(toRow(data[i], i + 1, i === idx));
  }

  if (idx < 3) {
    // Player is in top 3, also show rank 4 if exists
    if (data.length > 3) {
      rows.push(toRow(data[3], 4, idx === 3));
      if (data.length > 4) {
        rows.push({ rank: 0, player_name: '', score: 0, graze_count: 0, wave: 0, time_ms: 0, isEllipsis: true });
      }
    }
  } else {
    // Player is beyond top 3
    // Ellipsis between top 3 and player context
    if (idx > 3) {
      rows.push({ rank: 0, player_name: '', score: 0, graze_count: 0, wave: 0, time_ms: 0, isEllipsis: true });
    }
    // Previous entry
    if (idx - 1 >= top3) {
      rows.push(toRow(data[idx - 1], idx));
    }
    // Player
    rows.push(toRow(data[idx], idx + 1, true));
    // Next entry
    if (idx + 1 < data.length) {
      rows.push(toRow(data[idx + 1], idx + 2));
    }
    // Trailing ellipsis
    if (idx + 2 < data.length) {
      rows.push({ rank: 0, player_name: '', score: 0, graze_count: 0, wave: 0, time_ms: 0, isEllipsis: true });
    }
  }

  return { rows, playerRank };
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
