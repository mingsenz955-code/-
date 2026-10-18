import CATALOG from '../assets/original/catalog.mjs';
import {EVOLUTION_COSTS,EVOLUTION_ROWS} from '../assets/original/data/evolution.mjs';
const qualities=new Map(CATALOG.map(record=>[record.id,record.extended.quality]));
export const EVOLUTION_FRUIT=7027,HOLY_FRUIT=7028;
export const evolutionPhase=d=>d.evolution?.phase??0;
export const evolutionRate=d=>[1,1.15,1.3224999999999998][evolutionPhase(d)];
export function evolutionRequirements(originalId,phase=0){
 if(!Number.isSafeInteger(phase)||phase<0||phase>2)throw new Error('进化阶段无效。');
 const quality=qualities.get(originalId);
 if(!quality)return null;
 if(phase===2)return {quality,phase,max:true,costs:null,minLevel:null,cap:100};
 const record=EVOLUTION_COSTS[quality+'_'+(phase+1)];
 if(!record)return null;
 return {quality,phase,max:false,minLevel:phase===0?15:25,cap:phase===0?20:50,costs:{coins:record.gcost,food:record.fcost,evolutionFruit:record.ecost,holyFruit:record.lcost}};
}
export function evolutionPlan(s,id,originalId){
 const dragon=s.dragons.find(d=>d.id===id);if(!dragon)throw Error('找不到这条龙。');
 const info=evolutionRequirements(originalId,evolutionPhase(dragon));if(!info)throw Error('该龙没有原进化配置。');
 const value=dragon.evolution?.value??0,row=info.max?null:EVOLUTION_ROWS.find(r=>r[1]===info.quality&&r[2]===info.phase+1&&value>=r[3]&&value<=r[4]);
 const costs=info.max?[]:[{key:'coins',held:s.coins,need:info.costs.coins},{key:'food',held:s.food,need:info.costs.food},{key:'ef',itemId:EVOLUTION_FRUIT,held:s.items[EVOLUTION_FRUIT]??0,need:info.costs.evolutionFruit},{key:'lf',itemId:HOLY_FRUIT,held:s.items[HOLY_FRUIT]??0,need:info.costs.holyFruit}].filter(c=>c.need>0);
 const error=info.max?'已达到当前最高阶段。':dragon.level<info.minLevel?`小龙${info.minLevel}级开启${info.phase+1}阶进化。`:costs.some(c=>c.held<c.need)?'进化材料不足。':null;
 return {...info,dragon,value,costs,probability:row?row[5]/100:0,error};
}
// Source UI exposes phase/value/costs and +15% each phase. Range/rate columns
// are interpreted locally; the original server settlement is unavailable.
export function evolveDragon(s,id,originalId,random=Math.random){
 const p=evolutionPlan(s,id,originalId);if(p.error)throw Error(p.error);
 const roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)throw Error('进化随机值无效。');
 for(const c of p.costs){if(c.itemId)s.items[c.itemId]-=c.need;else s[c.key]-=c.need;}
 const success=roll<p.probability;
 p.dragon.evolution=success?{phase:p.phase+1,value:0}:{phase:p.phase,value:Math.min(p.cap,p.value+1)};
 return success?`突破进化成功！当前${p.phase+1}阶。`:`突破进化失败，进化值增加至${p.dragon.evolution.value}/${p.cap}。`;
}
export function validateEvolution(d){if(d.evolution===undefined)return;const e=d.evolution;if(!e||!Number.isSafeInteger(e.phase)||e.phase<0||e.phase>2||!Number.isSafeInteger(e.value)||e.value<0||e.value>(e.phase===0?20:e.phase===1?50:0))throw Error('进化存档无效。');}
