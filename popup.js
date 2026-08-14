async function load() {
  const { rounds = [] } = await chrome.storage.local.get({ rounds: [] });
  const values = rounds.map(r => Number(r.value)).filter(Number.isFinite);
  const n = values.length;
  const avg = n ? values.reduce((a,b)=>a+b,0)/n : 0;
  const low = n ? values.filter(x=>x<2).length/n*100 : 0;
  const high = n ? values.filter(x=>x>=5).length/n*100 : 0;
  document.getElementById('count').textContent = n;
  document.getElementById('avg').textContent = n ? avg.toFixed(2)+'x' : '—';
  document.getElementById('low').textContent = n ? low.toFixed(1)+'%' : '—';
  document.getElementById('high').textContent = n ? high.toFixed(1)+'%' : '—';
  const recent = values.slice(-20).reverse();
  document.getElementById('rounds').textContent = recent.length ? recent.map((x,i)=>`${n-i}. ${x.toFixed(2)}x`).join('  •  ') : 'No rounds collected yet.';
  let state = 'COLLECTING';
  if (n >= 30) state = low >= 65 ? 'HIGH LOW-MULTIPLIER CONCENTRATION' : (low <= 35 ? 'LOW LOW-MULTIPLIER CONCENTRATION' : 'NORMAL / NO CLEAR EDGE');
  document.getElementById('signal').textContent = state;
}
document.getElementById('clear').addEventListener('click', async()=>{await chrome.storage.local.set({rounds:[]});load();});
load();
