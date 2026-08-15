export function buildFeatures(values, windowSize = 100) {
  const data = values.map(Number).filter(Number.isFinite).slice(-windowSize);
  if (!data.length) return null;
  const under = t => data.filter(x => x < t).length / data.length;
  const mean = data.reduce((a,b) => a+b, 0) / data.length;
  const variance = data.reduce((s,x) => s + (x-mean)**2, 0) / data.length;
  let streak = 0;
  for (let i=data.length-1; i>=0 && data[i] < 2; i--) streak++;
  return {
    n: data.length,
    mean,
    median: [...data].sort((a,b)=>a-b)[Math.floor(data.length/2)],
    under12: under(1.2),
    under15: under(1.5),
    under2: under(2),
    over5: data.filter(x=>x>=5).length/data.length,
    over10: data.filter(x=>x>=10).length/data.length,
    volatility: Math.sqrt(variance),
    lowStreak: streak,
    last: data[data.length-1]
  };
}

// A transparent baseline: probability of the next result being below a threshold
// estimated only from the preceding window. It is a benchmark, not a prediction guarantee.
export function baselineProbability(values, threshold = 2, windowSize = 100) {
  const data = values.map(Number).filter(Number.isFinite).slice(-windowSize);
  if (!data.length) return null;
  return data.filter(x => x < threshold).length / data.length;
}
