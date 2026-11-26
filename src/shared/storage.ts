/** localStorage wrapper that never throws (private mode, blocked storage, SSR/tests). */
const PREFIX = 'arcade:';

export function loadNumber(key: string, fallback = 0): number {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    const n = raw === null ? NaN : Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function saveNumber(key: string, value: number): void {
  try {
    localStorage.setItem(PREFIX + key, String(value));
  } catch {
    /* ignore */
  }
}

/** Keep a per-game high score. Returns the (possibly new) best. */
export function submitHighScore(slug: string, score: number): number {
  const best = loadNumber(`best:${slug}`, 0);
  if (score > best) {
    saveNumber(`best:${slug}`, score);
    return score;
  }
  return best;
}

export function getHighScore(slug: string): number {
  return loadNumber(`best:${slug}`, 0);
}
