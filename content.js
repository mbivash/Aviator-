(() => {
  const MULTIPLIER_RE = /\b(\d+(?:\.\d+)?)\s*x\b/gi;
  const MAX_HISTORY = 5000;
  let lastText = '';
  let lastValue = null;
  let lastRecordedAt = 0;

  function extractCandidates(text) {
    const out = [];
    let match;
    MULTIPLIER_RE.lastIndex = 0;
    while ((match = MULTIPLIER_RE.exec(text)) !== null) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value >= 1 && value <= 100000) out.push(value);
    }
    return out;
  }

  function findCurrentMultiplier(text) {
    // Prefer short lines that look like the current/live multiplier.
    const chunks = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
    for (const chunk of chunks.slice(0, 100)) {
      if (/current|live multiplier|cash out/i.test(chunk)) {
        const candidates = extractCandidates(chunk);
        if (candidates.length) return candidates[candidates.length - 1];
      }
    }
    const candidates = extractCandidates(text);
    return candidates.length ? candidates[candidates.length - 1] : null;
  }

  async function record(value) {
    if (value === null) return;
    const now = Date.now();
    if (value === lastValue && now - lastRecordedAt < 3000) return;
    lastValue = value;
    lastRecordedAt = now;
    const data = await chrome.storage.local.get({ rounds: [] });
    const rounds = data.rounds.slice();
    const previous = rounds[rounds.length - 1];
    if (previous && Number(previous.value) === value && now - previous.ts < 5000) return;
    rounds.push({ value, ts: now, source: location.hostname });
    if (rounds.length > MAX_HISTORY) rounds.splice(0, rounds.length - MAX_HISTORY);
    await chrome.storage.local.set({ rounds });
  }

  const scan = () => {
    const text = document.body?.innerText || '';
    if (text === lastText) return;
    lastText = text;
    record(findCurrentMultiplier(text));
  };

  const observer = new MutationObserver(() => {
    clearTimeout(window.__aviatorScanTimer);
    window.__aviatorScanTimer = setTimeout(scan, 300);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    scan();
  }
})();
