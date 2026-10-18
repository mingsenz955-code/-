import {formationPosition} from './formation.mjs';
// User-requested offline six-dragon squads, retaining the original total stat budget.
export function sixNpcRoster(originals,pool){
 if(!originals.length)throw Error('NPC阵容缺失。');
 if(originals.length===6)return originals.map(m=>({...m}));
 const chosen=originals.slice(0,6).map(m=>({...m})),seen=new Set(chosen.map(m=>m.species)),counts=[0,0];
 for(const m of chosen)counts[formationPosition(m)]++;
 for(const m of pool){if(chosen.length===6)break;const pos=formationPosition(m);if(!m.species||seen.has(m.species)||counts[pos]>=4)continue;chosen.push({...m});seen.add(m.species);counts[pos]++;}
 if(chosen.length!==6)throw Error('NPC六龙阵容资料不足。');
 const rawAttacks=chosen.map(m=>m.attack);
 for(const key of ['attack','defend','life','crit','uncrit']){
  if(!originals.some(m=>Number.isFinite(m[key])))continue;
  const budget=originals.reduce((n,m)=>n+(m[key]??0),0),total=chosen.reduce((n,m)=>n+(m[key]??0),0),min=['attack','life'].includes(key)?1:0;
  const target=Math.max(min*6,budget),available=target-min*6;let used=0;
  chosen.forEach((m,i)=>{const share=i===5?available-used:Math.floor(available*(total?(m[key]??0)/total:1/6));m[key]=min+share;used+=share;});
 }
 chosen.forEach((m,i)=>m.skillValueScale=(m.skillValueScale??1)*m.attack/Math.max(1,rawAttacks[i]));
 return chosen;
}
