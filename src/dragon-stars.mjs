import ROWS from '../assets/original/data/dragon-stars.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {SPECIES} from './data.mjs';
const definitions=new Map(CATALOG.map(r=>[r.id,r])),rows=new Map(ROWS.map(r=>[`${r.dragonId}:${r.star}`,r]));
// Legacy saves used rarity as the attribute-row selector. Preserve those values until
// an explicit upgrade; fresh hatchlings carry star:1 independently of their rarity.
export const dragonStars=d=>d?.star??SPECIES[d?.species]?.quality??1;
export const dragonStarRow=(d,star=dragonStars(d))=>rows.get(`${SPECIES[d?.species]?.originalId}:${star}`)??null;
export const dragonStarLimit=d=>definitions.get(SPECIES[d?.species]?.originalId)?.extended.maxStar??5;
export const mutationRecord=species=>CATALOG.find(r=>r.id>=2000&&r.extended.baseID===SPECIES[species]?.originalId)??null;
export function dragonRemovalError(state,id){
 const d=state.dragons.find(v=>v.id===id);if(!d)return '找不到这条龙。';
 // Parent IDs remain referenced until the associated egg leaves the tower.
 if([state.breeding,state.incubator].some(j=>j?.parents?.includes(id)))return '这条龙仍关联培育或孵化任务，请完成任务后再操作。';
 if(state.runes.some(r=>r.dragonid===id))return '请先卸下这条龙装备的符文。';
 if(state.equipment.some(e=>e.dragonid===id))return '请先卸下这条龙装备的装备。';
 return null;
}
export function dragonStarMaterialError(state,target,material){
 if(!target||!material||target.id===material.id)return '不能吞噬自身。';
 const t=SPECIES[target.species]?.originalId,m=SPECIES[material.species]?.originalId;
 if(t!==m&&!(t>=2000&&dragonStars(target)>=5&&m===t-1000))return '只能吞噬同种龙；变异龙五星后可吞噬对应普通龙。';
 return dragonRemovalError(state,material.id);
}
export function dragonStarPlan(state,id,ids=[]){
 const d=state.dragons.find(v=>v.id===id);if(!d)throw Error('找不到这条龙。');
 if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.length>100)throw Error('升星材料选择无效。');
 let star=dragonStars(d),exp=d.starExp??0,gained=0;
 const current=dragonStarRow(d);if(!current)throw Error('这条龙的升星数据尚未取得。');
 for(const key of ids){const material=state.dragons.find(v=>v.id===key),error=dragonStarMaterialError(state,d,material);if(error)throw Error(error);const row=dragonStarRow(material);if(!row)throw Error('材料龙经验数据尚未取得。');gained+=row.xp;}
 exp+=gained;
 // Above five stars this client uses a separate awakening protocol. Never consume
 // dragons using the 90000 placeholder in its old perxp column.
 const cap=Math.min(5,dragonStarLimit(d));
 while(star<cap&&exp>=dragonStarRow(d,star).perxp){exp-=dragonStarRow(d,star).perxp;star++;}
 return {dragon:d,current,star,exp,gained,cap,limit:dragonStarLimit(d),ids};
}
