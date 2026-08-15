(() => {
  const MULTIPLIER_RE = /(?:^|\s)(\d{1,5}(?:\.\d{1,4})?)\s*x\b/gi;
  const MAX_HISTORY = 5000;
  let lastBodyText = '';
  let lastValue = null;
  let lastRecordedAt = 0;
  let scans = 0;

  async function status(extra = {}) {
    await chrome.storage.local.set({ monitorStatus: { connected: true, url: location.href, frame: window.top === window ? 'top' : 'iframe', scans, at: Date.now(), ...extra } });
  }

  function extract(text) {
    const values = [];
    MULTIPLIER_RE.lastIndex = 0;
    let m;
    while ((m = MULTIPLIER_RE.exec(text || ''))) {
      const v = Number(m[1]);
      if (Number.isFinite(v) && v >= 1 && v <= 100000) values.push(v);
    }
    return values;
  }

  function visible(el) {
    if (!el) return false;
    const r = el.getBoundingClientRect?.();
    const s = getComputedStyle(el);
    return !!r && r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  }

  function findBestValue() {
    const nodes = document.querySelectorAll('body *');
    let best = null;
    for (const el of nodes) {
      if (!visible(el) || el.children.length > 0) continue;
      const text = (el.textContent || '').trim();
      if (!/^\d{1,5}(?:\.\d{1,4})?\s*x$/i.test(text)) continue;
      const v = Number(text.replace(/x/i, '').trim());
      if (!Number.isFinite(v) || v < 1 || v > 100000) continue;
      const r = el.getBoundingClientRect();
      const score = r.width * r.height - Math.abs((r.left + r.width / 2) - innerWidth / 2) * 2;
      if (!best || score > best.score) best = { value: v, score };
    }
    if (best) return best.value;
    const values = extract(document.body?.innerText || '');
    return values.length ? values[values.length - 1] : null;
  }

  async function record(value) {
    if (value === null) return;
    const now = Date.now();
    if (value === lastValue && now - lastRecordedAt < 2500) return;
    lastValue = value;
    lastRecordedAt = now;
    const { rounds = [] } = await chrome.storage.local.get({ rounds: [] });
    const previous = rounds[rounds.length - 1];
    if (previous && Number(previous.value) === value && now - previous.ts < 4000) return;
    const next = rounds.concat({ value, ts: now, source: location.hostname });
    if (next.length > MAX_HISTORY) next.splice(0, next.length - MAX_HISTORY);
    await chrome.storage.local.set({ rounds: next, lastObservation: { value, ts: now, frame: window.top === window ? 'top' : 'iframe' } });
  }

  function scan() {
    scans++;
    const text = document.body?.innerText || '';
    if (text === lastBodyText) { status(); return; }
    lastBodyText = text;
    const value = findBestValue();
    status({ lastCandidate: value });
    record(value);
  }

  window.addEventListener('__aviator_ws__', e => status({ websocket: e.detail?.type || 'event', websocketUrl: e.detail?.url || '' }));

  const observer = new MutationObserver(() => {
    clearTimeout(window.__aviatorScanTimer);
    window.__aviatorScanTimer = setTimeout(scan, 200);
  });

  function start() {
    if (!document.body) return setTimeout(start, 500);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });
    scan();
    setInterval(scan, 1000);
  }
  start();
})();
