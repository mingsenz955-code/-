import {ORIGINAL_EQUIPMENT} from '../assets/original/data/equipment.mjs';

// Source definition queries only. Ownership, random rolls and combat totals are
// deliberately not inferred from a definition or its resale price.
export const EQUIPMENT_SLOTS=Object.freeze(['武器','鳞片','龙骨','龙角','羽翼','皇冠']);
export const EQUIPMENT_QUALITIES=Object.freeze(['白','绿','蓝','紫','橙']);
const definitions=new Map(ORIGINAL_EQUIPMENT.map(record=>[record.id,Object.freeze(record)]));

export function equipmentDefinition(id){return definitions.get(id)??null;}

export function equipmentCatalog({part=null,quality=null,property=null,grade=1}={}){
 for(const [value,min,max,name] of [[part,0,5,'部位'],[quality,1,5,'品质'],[property,1,9,'系别'],[grade,1,1000,'阶级']]){
  if(value!==null&&(!Number.isSafeInteger(value)||value<min||value>max))throw new Error(`装备${name}筛选无效。`);
 }
 return ORIGINAL_EQUIPMENT.filter(record=>(part===null||record.part===part)&&(quality===null||record.quality===quality)&&(property===null||record.property===property)&&(grade===null||record.grade===grade));
}

export function equipmentUpgradeTarget(id){
 const current=equipmentDefinition(id);
 return current?equipmentDefinition(current.nextGradeID):null;
}

export function equipmentDowngradeTarget(id){
 const current=equipmentDefinition(id);
 return current?equipmentDefinition(current.prevGradeID):null;
}
