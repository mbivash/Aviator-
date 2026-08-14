export function cleanRounds(rounds) {
  return rounds
    .filter(r => Number.isFinite(Number(r.value)) && Number(r.value) >= 1)
    .sort((a, b) => a.ts - b.ts)
    .map(r => ({ ...r, value: Number(r.value) }));
}

export function analyze(rounds, windowSize = 100) {
  const data = cleanRounds(rounds).slice(-windowSize).map(r => r.value);
  if (!data.length) return { count: 0, average: null, median: null, under2Rate: null, over5Rate: null, volatility: null, streakUnder2: 0, riskScore: null };
  const sorted = [...data].sort((a,b) => a-b);
  const avg = data.reduce((a,b) => a+b, 0) / data.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const under2 = data.filter(x => x < 2).length / data.length;
  const over5 = data.filter(x => x >= 5).length / data.length;
  const variance = data.reduce((s,x) => s + (x-avg)**2, 0) / data.length;
  let streak = 0;
  for (let i=data.length-1; i>=0 && data[i] < 2; i--) streak++;
  const volatility = Math.sqrt(variance);
  const riskScore = Math.max(0, Math.min(100, Math.round(under2 * 70 + Math.min(volatility / Math.max(avg, 1), 3) * 10)));
  return { count: data.length, average: avg, median, under2Rate: under2, over5Rate: over5, volatility, streakUnder2: streak, riskScore };
}

export function backtestThreshold(rounds, threshold = 2, windowSize = 100) {
  const data = cleanRounds(rounds).map(r => r.value);
  if (data.length < windowSize + 1) return { samples: 0, hits: 0, accuracy: null };
  let hits = 0;
  let samples = 0;
  for (let i=windowSize; i<data.length; i++) {
    const window = data.slice(i-windowSize, i);
    const p = window.filter(x => x < threshold).length / window.length;
    const predicted = p >= 0.5;
    const actual = data[i] < threshold;
    if (predicted === actual) hits++;
    samples++;
  }
  return { samples, hits, accuracy: samples ? hits / samples : null };
}
