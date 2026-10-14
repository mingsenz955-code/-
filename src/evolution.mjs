import CATALOG from '../assets/original/catalog.mjs';
import {EVOLUTION_COSTS} from '../assets/original/data/evolution.mjs';
const qualities=new Map(CATALOG.map(record=>[record.id,record.extended.quality]));
// This is a source-backed condition preview. No random success/fruit balance or
// server total attributes are synthesized here.
export function evolutionRequirements(originalId,phase=0){
 if(!Number.isSafeInteger(phase)||phase<0||phase>2)throw new Error('进化阶段无效。');
 const quality=qualities.get(originalId);
 if(!quality)return null;
 if(phase===2)return {quality,phase,max:true,costs:null,minLevel:null,cap:null};
 const record=EVOLUTION_COSTS[quality+'_'+(phase+1)];
 if(!record)return null;
 return {quality,phase,max:false,minLevel:phase===0?15:25,cap:phase===0?20:50,costs:{coins:record.gcost,food:record.fcost,evolutionFruit:record.ecost,holyFruit:record.lcost}};
}
