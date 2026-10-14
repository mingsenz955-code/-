import {ORIGINAL_EQUIPMENT} from '../assets/original/data/equipment.mjs';

// Source definition queries only. Ownership, random rolls and combat totals are
// deliberately not inferred from a definition or its resale price.
export const EQUIPMENT_SLOTS=Object.freeze(['武器','鳞片','龙骨','龙角','羽翼','皇冠']);
export const EQUIPMENT_QUALITIES=Object.freeze(['白','绿','蓝','紫','橙']);
// EquipInfo.lua column 5. 9 means unrestricted in this table and must not be read
// as a legendary-only slot.
export const EQUIPMENT_PROPERTIES=Object.freeze({1:'土',2:'火',3:'水',4:'植物',5:'金',6:'冰',7:'电',8:'暗',9:'无限制'});
// The shipped 阵容 page (ui_formation_info) draws six slots. Left to right the layout
// places equip5, equip1, equip2, equip3, equip4, equip6 and the live client fills them
// with 羽翼, 武器, 鳞片, 龙骨, 龙角, 皇冠 - read from Century洛龙兰's 2022-10-07 footage,
// where the empty first slot shows the ui_starup_zb5.png wing and the filled slots are
// named 幽灵龙爪/邪风龙鳞/诅咒龙骨/残酷龙角/珍珠皇冠. That is EquipInfo parts 4,0,1,2,3,5.
export const EQUIPMENT_SLOTS_LAYOUT=Object.freeze([
 Object.freeze({node:'equip5',part:4}),
 Object.freeze({node:'equip1',part:0}),
 Object.freeze({node:'equip2',part:1}),
 Object.freeze({node:'equip3',part:2}),
 Object.freeze({node:'equip4',part:3}),
 Object.freeze({node:'equip6',part:5}),
]);
// Empty slots show the client's own part art. zb5 and zb6 are the wing and the crown.
const EMPTY_ICONS=Object.freeze({0:'ui_starup_zb1.png',1:'ui_starup_zb2.png',2:'ui_starup_zb4.png',3:'ui_starup_zb3.png',4:'ui_starup_zb5.png',5:'ui_starup_zb6.png'});
export function equipmentEmptyIcon(part){return EMPTY_ICONS[part]?`assets/original/ui/${EMPTY_ICONS[part]}`:''}
export const EQUIPMENT_INSTANCE_ID=/^eq-[1-9][0-9]*$/;
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

// ---- Player instances -------------------------------------------------------
// ExEquipData_pb.lua defines the server instance as id(string), type, exp,
// randinfo[{traitid}], dragonid and star. The client keeps no other ownership
// field, so an instance belongs to a dragon exactly while dragonid is set.
export function equipmentIcon(definition){return definition?`assets/original/ui/thumbs_equip_${definition.quality}_${definition.part}.png`:''}

// EquipSelecter and DragonInfor both print the upgrade tier as "+grade-1".
export function equipmentGradeText(definition){return definition&&definition.grade>1?`+${definition.grade-1}`:''}

export function createEquipmentInstance(id,type){
 if(typeof id!=='string'||!EQUIPMENT_INSTANCE_ID.test(id))throw new Error('装备实例编号无效。');
 if(!equipmentDefinition(type))throw new Error('装备定义不存在。');
 return {id,type,exp:0,star:0,randinfo:[],dragonid:0};
}

export function equipmentInstance(state,id){return (state.equipment??[]).find(instance=>instance.id===id)??null}

export function equipmentOfDragon(state,dragonid){return (state.equipment??[]).filter(instance=>instance.dragonid===dragonid)}

export function definitionPart(instance){return equipmentDefinition(instance?.type)?.part??-1}

export function equipmentInPart(list,part){return list.find(instance=>definitionPart(instance)===part)??null}

// Definition values only. star, exp and randinfo are carried on the instance but
// equipinfostar/equipinforand rollout rules are not confirmed, so they are never
// folded into a total here and the UI must not present them as combat values.
export function equipmentBonus(list){
 const total={atk:0,def:0,hp:0,resist:0,antResist:0};
 for(const instance of list){const definition=equipmentDefinition(instance.type);if(!definition)continue;for(const key of Object.keys(total))total[key]+=definition[key]??0}
 return total;
}

export function equipmentLabel(instance){
 const definition=equipmentDefinition(instance?.type);
 return definition?`${definition.name}${definition.grade>1?` +${definition.grade-1}`:''}`:'';
}
export const EQUIPMENT_MATERIAL_NAMES={stone:'强化石',wing:'羽翼',crystal:'水晶'};
export function equipmentDecomposePlan(state,ids){
 if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)throw Error('请选择要分解的装备。');
 const materials={stone:0,wing:0,crystal:0};
 for(const id of ids){const item=equipmentInstance(state,id),info=equipmentDefinition(item?.type);if(!item||!info)throw Error('找不到要分解的装备。');if(item.dragonid)throw Error('请先卸下装备再分解。');if(!Number.isSafeInteger(info.decomposePkgID)||info.decomposePkgID<=0)throw Error('该装备没有可核实的分解产物。');materials[info.part===4?'wing':info.part===5?'crystal':'stone']+=info.decomposePkgID}
 return materials;
}
export function equipmentEnhancePlan(instance,count=1){
 if(![1,10].includes(count))throw new Error('强化次数无效。');
 let info=equipmentDefinition(instance?.type);if(!info)throw new Error('找不到这件装备。');
 const material=info.part===4?'wing':info.part===5?'crystal':'stone';let cost=0,steps=0;
 for(let i=0;i<count;i++){const next=equipmentUpgradeTarget(info.id);if(!next)break;cost+=info.enhancedCost;info=next;steps++;}
 if(!steps)throw new Error('已达到最高强化等级。');
 return {type:info.id,material,cost,steps,definition:info};
}
