import {ORIGINAL_GEMS} from '../assets/original/data/progression.mjs';
import {formationPosition} from './formation.mjs';
const defs=new Map(ORIGINAL_GEMS.map(v=>[v.id,v]));
export const GEM_ATTRS={attack:'攻击',defend:'防御',blood:'生命',crit:'暴击',uncrit:'免暴',anti:'抗性',unanti:'穿透'};
export const gemDefinition=id=>defs.get(Number(id))??null;
export const gemItem=(state,id)=>state.gemInventory?.find(v=>v.id===id)??null;
export const gemSocket=(state,id)=>(state.gemSockets??[]).indexOf(id);
export function gemAutoFusionMaterials(state,id){
 const target=gemItem(state,id),current=gemDefinition(target?.type);
 if(!current)throw new Error('找不到这颗宝石。');
 if(!gemDefinition(current.nextlevel))throw new Error('宝石已达到最高等级。');
 const choices=state.gemInventory.filter(v=>v.id!==id&&gemSocket(state,v.id)<0&&gemDefinition(v.type).quality<=current.quality).sort((a,b)=>gemDefinition(a.type).quality-gemDefinition(b.type).quality||gemDefinition(a.type).level-gemDefinition(b.type).level||a.id.localeCompare(b.id));
 const materials=[];for(const item of choices){materials.push(item.id);const plan=gemFusionPlan(state,id,materials);if(!gemDefinition(gemDefinition(plan.type).nextlevel))break}
 if(!materials.length)throw new Error('没有可吞噬的背包宝石。');
 return materials;
}
export function gemBonus(state,dragon){const sum=Object.fromEntries(Object.keys(GEM_ATTRS).map(k=>[k,0]));const start=formationPosition(dragon)===1?6:0;for(const id of (state.gemSockets??[]).slice(start,start+6)){const d=gemDefinition(gemItem(state,id)?.type);if(d)for(const key in sum)sum[key]+=d[key]??0}return sum}
export function gemInsertIndex(state,id,tab){const item=gemItem(state,id),d=gemDefinition(item?.type);if(!d)throw new Error('找不到这颗宝石。');if(!['air','land'].includes(tab))throw new Error('祭坛无效。');const start=tab==='air'?6:0;for(let i=start;i<start+6;i++){const old=gemDefinition(gemItem(state,state.gemSockets[i])?.type);if(old?.type===d.type){if(old.quality>d.quality)throw new Error('已经镶嵌更高品质的同类宝石。');return i}}const empty=state.gemSockets.findIndex((v,i)=>i>=start&&i<start+6&&!v);if(empty<0)throw new Error('祭坛没有空槽。');return empty}
export function gemFusionPlan(state,id,materials){const target=gemItem(state,id),current=gemDefinition(target?.type);if(!current)throw new Error('找不到这颗宝石。');if(!Array.isArray(materials)||!materials.length||new Set(materials).size!==materials.length)throw new Error('请选择要吞噬的宝石。');if(!gemDefinition(current.nextlevel))throw new Error('宝石已达到最高等级。');let exp=target.exp,definition=current;for(const key of materials){const item=gemItem(state,key),info=gemDefinition(item?.type);if(!item||key===id||gemSocket(state,key)>=0||info.quality>current.quality)throw new Error('只能吞噬背包中不高于目标品质的其它宝石。');exp+=info.eatexp+item.exp}while(gemDefinition(definition.nextlevel)&&exp>=definition.levelupexp){exp-=definition.levelupexp;definition=gemDefinition(definition.nextlevel)}return {type:definition.id,exp}}
export function validateGems(state){
 state.gemInventory??=[];state.gemSockets??=Array(12).fill(null);state.nextGemId??=1;
 if(!Array.isArray(state.gemInventory)||!Array.isArray(state.gemSockets)||state.gemSockets.length!==12||!Number.isSafeInteger(state.nextGemId)||state.nextGemId<1)throw new Error('宝石存档无效。');
 const ids=new Set();for(const item of state.gemInventory){if(!/^gm-[1-9][0-9]*$/.test(item?.id)||ids.has(item.id)||Number(item.id.slice(3))>=state.nextGemId||!gemDefinition(item.type)||!Number.isSafeInteger(item.exp)||item.exp<0||item.exp>1e9)throw new Error('宝石实例无效。');ids.add(item.id)}
 const worn=new Set();for(const id of state.gemSockets){if(id===null)continue;if(!ids.has(id)||worn.has(id))throw new Error('祭坛宝石重复或不存在。');worn.add(id)}
 if(state.gemInventory.length-worn.size>150)throw new Error('宝石背包已满。');
 for(const start of [0,6]){const types=(state.gemSockets??[]).slice(start,start+6).filter(Boolean).map(id=>gemDefinition(gemItem(state,id).type).type);if(new Set(types).size!==types.length)throw new Error('同一祭坛不能重复镶嵌同类宝石。')}
}
