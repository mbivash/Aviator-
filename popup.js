async function load() {
  const { rounds = [] } = await chrome.storage.local.get({ rounds: [] });
  const values = rounds.map(r => Number(r.value)).filter(Number.isFinite);
  const n = values.length;
  const recent = values.slice(-100);
  const avg = recent.length ? recent.reduce((a,b)=>a+b,0)/recent.length : 0;
  const sorted = [...recent].sort((a,b)=>a-b);
  const median = sorted.length ? sorted[Math.floor(sorted.length/2)] : null;
  const low = recent.length ? recent.filter(x=>x<2).length/recent.length*100 : 0;
  const high = recent.length ? recent.filter(x=>x>=5).length/recent.length*100 : 0;
  const variance = recent.length ? recent.reduce((s,x)=>s+(x-avg)**2,0)/recent.length : 0;
  const volatility = Math.sqrt(variance);
  let streak = 0;
  for (let i=values.length-1; i>=0 && values[i]<2; i--) streak++;
  const risk = recent.length ? Math.max(0,Math.min(100,Math.round(low*0.7 + Math.min(volatility/Math.max(avg,1),3)*10))) : null;

  document.getElementById('count').textContent = n;
  document.getElementById('avg').textContent = recent.length ? avg.toFixed(2)+'x' : '—';
  document.getElementById('median').textContent = median !== null ? median.toFixed(2)+'x' : '—';
  document.getElementById('low').textContent = recent.length ? low.toFixed(1)+'%' : '—';
  document.getElementById('high').textContent = recent.length ? high.toFixed(1)+'%' : '—';
  document.getElementById('vol').textContent = recent.length ? volatility.toFixed(2) : '—';
  document.getElementById('risk').textContent = risk === null ? '—' : risk+'/100';
  document.getElementById('streak').textContent = streak;
  let state = 'COLLECTING';
  if (n >= 30) state = risk >= 70 ? 'HIGH RISK / OBSERVE' : risk >= 45 ? 'ELEVATED / OBSERVE' : 'NO CLEAR EDGE';
  document.getElementById('signal').textContent = state;
  document.getElementById('rounds').textContent = values.length ? values.slice(-20).reverse().map((x,i)=>`${n-i}. ${x.toFixed(2)}x`).join('  •  ') : 'No rounds collected yet.';
}
document.getElementById('clear').addEventListener('click', async()=>{await chrome.storage.local.set({rounds:[]});load();});
load();
setInterval(load, 1000);
