import CATALOG from '../assets/original/catalog.mjs';
import {SPECIES} from './data.mjs';
const definitions=new Map(CATALOG.map(v=>[v.id,v.extended]));
export function formationDefinition(dragon){return definitions.get(SPECIES[dragon?.species]?.originalId)??null}
export function formationPosition(dragon){return formationDefinition(dragon)?.position??0}
export function formationCounts(dragons){return {sky:dragons.filter(d=>formationPosition(d)===1).length,land:dragons.filter(d=>formationPosition(d)===0).length}}
export function formationError(dragons){
 if(dragons.length>6)return '最多只能上阵6条龙。';
 if(dragons.some(d=>d.level<7))return '龙达到7级后才能出战。';
 if(new Set(dragons.map(d=>SPECIES[d.species]?.originalId??d.species)).size!==dragons.length)return '同一龙种不能重复上阵。';
 const count=formationCounts(dragons);
 if(count.sky>4)return '飞行龙最多上阵4条。';
 if(count.land>4)return '爬行龙最多上阵4条。';
 return null;
}
export function formationReplacement(state,slot,id){
 const ids=[...state.formation];if(!Number.isInteger(slot)||slot<0||slot>5)throw new Error('阵位无效。');
 if(id==null){if(slot<ids.length)ids.splice(slot,1)}else if(slot<ids.length)ids[slot]=id;else ids.push(id);
 const dragons=ids.map(v=>state.dragons.find(d=>d.id===v));if(dragons.some(d=>!d))throw new Error('找不到这条龙。');
 const error=formationError(dragons);if(error)throw new Error(error);return ids;
}
export function formationSwap(state,a,b){
 const ids=[...state.formation],i=ids.indexOf(a),j=ids.indexOf(b);if(i<0||j<0||i===j)throw Error('请选择两条不同的出战龙。');
 if(formationPosition(state.dragons.find(d=>d.id===a))!==formationPosition(state.dragons.find(d=>d.id===b)))throw Error('只能交换同为飞行或爬行的阵位。');
 [ids[i],ids[j]]=[ids[j],ids[i]];return ids;
}
