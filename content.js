(() => {
  const MULTIPLIER_RE = /(?:^|\s)(\d+(?:\.\d+)?)\s*x\b/gi;
  const seen = new Set();
  const MAX_HISTORY = 5000;

  function parseMultipliers(text) {
    const values = [];
    let match;
    MULTIPLIER_RE.lastIndex = 0;
    while ((match = MULTIPLIER_RE.exec(text)) !== null) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n >= 1 && n <= 100000) values.push(n);
    }
    return values;
  }

  async function record(values) {
    if (!values.length) return;
    const data = await chrome.storage.local.get({ rounds: [] });
    const rounds = data.rounds.slice();
    for (const value of values) {
      const key = `${value}-${Math.floor(Date.now() / 1000)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rounds.push({ value, ts: Date.now(), source: location.hostname });
    }
    if (rounds.length > MAX_HISTORY) rounds.splice(0, rounds.length - MAX_HISTORY);
    await chrome.storage.local.set({ rounds });
    window.dispatchEvent(new CustomEvent('aviator-analyzer-update'));
  }

  const scan = () => record(parseMultipliers(document.body?.innerText || ''));
  const observer = new MutationObserver(() => {
    clearTimeout(window.__aviatorScanTimer);
    window.__aviatorScanTimer = setTimeout(scan, 250);
  });

  if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  scan();
})();
