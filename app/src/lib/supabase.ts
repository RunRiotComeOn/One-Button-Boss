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

export async function fetchRankPreview(mode: 'normal' | 'endless', playerScore: number, playerWave: number): Promise<{ rows: RankDisplayRow[]; playerRank: number } | null> {
  if (!supabase) return null;
  const sortField = mode === 'normal' ? 'score' : 'wave';
  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('mode', mode)
    .order(sortField, { ascending: false });
  if (!data) return null;

  // 计算玩家会排在第几名（虚拟插入）
  const playerValue = mode === 'normal' ? playerScore : playerWave;
  let idx = data.findIndex(e => playerValue >= (mode === 'normal' ? e.score : e.wave));
  if (idx === -1) idx = data.length; // 排最后

  const playerRank = idx + 1;
  const rows: RankDisplayRow[] = [];
  const ellipsis: RankDisplayRow = { rank: 0, player_name: '', score: 0, graze_count: 0, wave: 0, time_ms: 0, isEllipsis: true };

  const toRow = (entry: LeaderboardEntry, rank: number): RankDisplayRow => ({
    rank,
    player_name: entry.player_name,
    score: entry.score,
    graze_count: entry.graze_count,
    wave: entry.wave,
    time_ms: entry.time_ms,
  });

  const playerRow: RankDisplayRow = {
    rank: playerRank,
    player_name: 'YOU',
    score: playerScore,
    graze_count: 0,
    wave: playerWave,
    time_ms: 0,
    isPlayer: true,
  };

  // 插入玩家后，原来 idx 及之后的人排名 +1
  const getRank = (origIdx: number) => origIdx < idx ? origIdx + 1 : origIdx + 2;

  // Always show top 3 (accounting for player insertion)
  const top3End = Math.min(3, data.length + 1); // total entries including player
  let dataPtr = 0;
  for (let rank = 1; rank <= top3End; rank++) {
    if (rank === playerRank) {
      rows.push(playerRow);
    } else {
      if (dataPtr < data.length) {
        rows.push(toRow(data[dataPtr], rank));
        dataPtr++;
      }
    }
  }

  if (playerRank <= 3) {
    // Player is in top 3, show one more entry if exists
    if (dataPtr < data.length && rows.length < 4) {
      rows.push(toRow(data[dataPtr], rows.length + 1));
      dataPtr++;
    }
    if (dataPtr < data.length) {
      rows.push({ ...ellipsis });
    }
  } else {
    // Player is beyond top 3
    if (playerRank > 4) {
      rows.push({ ...ellipsis });
    }
    // Previous entry (the one just above player)
    const prevOrigIdx = idx - 1;
    if (prevOrigIdx >= 0 && getRank(prevOrigIdx) > top3End) {
      rows.push(toRow(data[prevOrigIdx], playerRank - 1));
    }
    // Player
    rows.push(playerRow);
    // Next entry (the one just below player)
    if (idx < data.length) {
      rows.push(toRow(data[idx], playerRank + 1));
    }
    // Trailing ellipsis
    if (idx + 1 < data.length) {
      rows.push({ ...ellipsis });
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
