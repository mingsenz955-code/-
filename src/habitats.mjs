import {ORIGINAL_HABITATS,HABITATS_PER_LEVEL} from '../assets/original/data/habitats.mjs';
import {SPECIES,RULES} from './data.mjs';
export {ORIGINAL_HABITATS};
export const habitatDefinition=id=>ORIGINAL_HABITATS.find(h=>h.id===id);
// Existing generic habitats retain their capacity, inhabitants and accumulated gold.
export function habitatInfo(h){return habitatDefinition(h.buildingId)??{nameCN:h.name,capacity:RULES.habitatCapacity,maxGold:7500,image:'assets/original/world/0024_habitat_plant_1_g_bg.png',legacy:true}}
export function acceptsDragon(h,species){if(h.job?.kind==='build')return false;const info=habitatInfo(h);return info.legacy||SPECIES[species]?.attributes?.includes(info.element_type)}
export function habitatLimit(level){return HABITATS_PER_LEVEL[Math.min(level,HABITATS_PER_LEVEL.length)-1]}
export function habitatPosition(h,index){return h.position??[[41,50],[59,51],[48,66],[67,65],[31,65],[56,39]][index]??[25+(index%7)*8,36+Math.floor(index/7)*9]}
