function mean(xs) { return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : 0; }

export function walkForward(values, { windowSize=100, threshold=2, minSamples=30 } = {}) {
  const data = values.map(Number).filter(Number.isFinite);
  const predictions = [];
  for (let i=windowSize; i<data.length; i++) {
    const window = data.slice(i-windowSize, i);
    const p = window.filter(x => x < threshold).length / window.length;
    predictions.push({ index:i, probability:p, predictedLow:p >= 0.5, actualLow:data[i] < threshold });
  }
  if (predictions.length < minSamples) return { samples: predictions.length, accuracy:null, brier:null, baseline:null, lift:null };
  const accuracy = predictions.filter(p=>p.predictedLow===p.actualLow).length / predictions.length;
  const brier = mean(predictions.map(p=>(p.probability-(p.actualLow?1:0))**2));
  const baselineRate = mean(data.slice(windowSize).map(x=>x<threshold?1:0));
  const baselineAccuracy = Math.max(baselineRate, 1-baselineRate);
  return { samples:predictions.length, accuracy, brier, baseline:baselineAccuracy, lift:accuracy-baselineAccuracy };
}

export function simulateFixedStake(values, { windowSize=100, threshold=2, stake=1, cashout=2 } = {}) {
  const data = values.map(Number).filter(Number.isFinite);
  let balance=0, bets=0, wins=0;
  for(let i=windowSize;i<data.length;i++) {
    const window=data.slice(i-windowSize,i);
    const p=window.filter(x=>x<threshold).length/window.length;
    if(p>=0.5) continue;
    bets++;
    if(data[i]>=cashout){ balance += stake*(cashout-1); wins++; }
    else balance -= stake;
  }
  return { bets, wins, winRate:bets?wins/bets:null, profit:balance, roi:bets?balance/(bets*stake):null };
}
