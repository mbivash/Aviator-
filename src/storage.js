export const STORAGE_KEY = 'rounds';
export const MAX_ROUNDS = 5000;

export async function getRounds() {
  const { [STORAGE_KEY]: rounds = [] } = await chrome.storage.local.get({ [STORAGE_KEY]: [] });
  return rounds.filter(r => Number.isFinite(Number(r.value)));
}

export async function addRound(round) {
  const rounds = await getRounds();
  const value = Number(round.value);
  if (!Number.isFinite(value) || value < 1) return false;
  const last = rounds[rounds.length-1];
  if (last && Number(last.value) === value && Number(round.ts)-Number(last.ts) < 3000) return false;
  rounds.push({ value, ts: Number(round.ts)||Date.now(), source: String(round.source||location.hostname) });
  const trimmed = rounds.slice(-MAX_ROUNDS);
  await chrome.storage.local.set({ [STORAGE_KEY]: trimmed });
  return true;
}

export async function exportRounds() {
  const rounds = await getRounds();
  return JSON.stringify({ version:1, exportedAt:new Date().toISOString(), rounds }, null, 2);
}
