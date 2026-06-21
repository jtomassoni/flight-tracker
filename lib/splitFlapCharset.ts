/** Character drum order — Solari modules only advance forward through the stack. */
export const SPLIT_FLAP_CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-';

/** One flap fall (ms) — keep in sync with --solari-flip-duration in split-flap-board.css */
export const SPLIT_FLAP_DURATION_MS = 580;

/** Pause between drum steps on the same module */
export const SPLIT_FLAP_STEP_GAP_MS = 110;

/** Delay between adjacent modules updating (classic master-controller cadence) */
export const SPLIT_FLAP_STAGGER_MS = 165;

export function normalizeSplitFlapChar(char: string): string {
  if (!char || char.trim() === '') return ' ';
  const upper = char.toUpperCase();
  if (upper === '—' || upper === '–') return '-';
  if (SPLIT_FLAP_CHARSET.includes(upper)) return upper;
  if (upper === ' ') return ' ';
  return '-';
}

/** Forward steps through the drum from one character to the next. */
export function splitFlapSteps(from: string, to: string): string[] {
  const start = normalizeSplitFlapChar(from);
  const end = normalizeSplitFlapChar(to);
  if (start === end) return [];

  const fromIdx = SPLIT_FLAP_CHARSET.indexOf(start);
  const toIdx = SPLIT_FLAP_CHARSET.indexOf(end);
  if (fromIdx === -1 || toIdx === -1) return [end];

  const steps: string[] = [];
  let idx = fromIdx;
  while (idx !== toIdx) {
    idx = (idx + 1) % SPLIT_FLAP_CHARSET.length;
    steps.push(SPLIT_FLAP_CHARSET[idx]!);
  }
  return steps;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
