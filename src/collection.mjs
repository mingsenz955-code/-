import {SPECIES} from './data.mjs';
export const ELEMENT_FILTERS=['all','e','f','w','p','el','i','m','d','l'];
const legacy={bloom:['f','p'],mist:['w','p'],steam:['f','w']};
export const dragonElements=species=>SPECIES[species]?.attributes??legacy[species]??[];
export function ownedDragons(state,filter='all'){
 if(!ELEMENT_FILTERS.includes(filter))throw new Error('请选择有效的龙族属性。');
 return state.dragons.filter(d=>filter==='all'||dragonElements(d.species).includes(filter)).toSorted((a,b)=>a.id-b.id);
}
