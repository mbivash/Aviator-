// Conservative round detector. It records a multiplier only when the visible page
// changes from one multiplier value to another and ignores repeated DOM mutations.
const MULTIPLIER_RE = /\b(\d+(?:\.\d+)?)\s*x\b/i;

export function extractMultiplier(text) {
  const match = String(text || '').match(MULTIPLIER_RE);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value >= 1 && value <= 100000 ? value : null;
}

export function createRoundDetector(onRound) {
  let lastValue = null;
  let lastSeenAt = 0;
  return function process(text) {
    const value = extractMultiplier(text);
    if (value === null) return false;
    const now = Date.now();
    // Same visible value is not a new round. Allow a value to recur after the
    // page has visibly changed and at least 1.5s have elapsed.
    if (value === lastValue && now - lastSeenAt < 1500) return false;
    if (value === lastValue) return false;
    lastValue = value;
    lastSeenAt = now;
    onRound({ value, ts: now, source: location.hostname });
    return true;
  };
}
