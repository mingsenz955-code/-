import SKILL_DETAILS from '../assets/original/data/skill-descriptions.mjs';
import {dragonStars} from './dragon-stars.mjs';
import {ORIGINAL_RUNES} from '../assets/original/data/progression.mjs';
import DATA from '../assets/original/data/rune-skills.mjs';
import {SPECIES} from './data.mjs';
const definitions=new Map(ORIGINAL_RUNES.map(r=>[r.id,r])),dragonRows=new Map(DATA.dragonSkills.map(r=>[`${r.dragonId}:${r.quality}`,r.skills]));
export const RUNE_TYPES=['','攻击符文','特技符文','被动符文·天','被动符文·地','碎片'];
export const runeDefinition=id=>definitions.get(Number(id))??null;
export const runeInstance=(state,id)=>state.runes?.find(v=>v.id===id)??null;
export const runeOfDragon=(state,id,slot)=>(state.runes??[]).find(v=>v.dragonid===id&&runeDefinition(v.type)?.equipType===slot)??null;
// The hunt entry has no explicit target. Prefer the selected eligible dragon,
// then an eligible owner, instead of silently binding the starter red dragon.
export function defaultRuneDragon(state,selectedId){
 const selected=state.dragons.find(d=>d.id===selectedId);
 if(selected&&SPECIES[selected.species].quality>=3)return selected;
 return (state.formation??[]).map(id=>state.dragons.find(d=>d.id===id)).find(d=>d&&SPECIES[d.species].quality>=3)??state.dragons.find(d=>SPECIES[d.species].quality>=3)??selected??state.dragons[0];
}
export function bestRunesForDragon(state,dragon){
 if(!dragon||SPECIES[dragon.species].quality<=2)throw Error('蓝色品质以上的龙才能装备符文。');
 const result=[];
 for(let slot=1;slot<=4;slot++){
  const current=runeOfDragon(state,dragon.id,slot);let best=current;
  for(const item of state.runes){const def=runeDefinition(item.type),previous=runeDefinition(best?.type);if(item.dragonid||def.equipType!==slot||runeEquipError(state,dragon,item))continue;if(!previous||def.quality>previous.quality||def.quality===previous.quality&&def.level>previous.level)best=item;}
  if(best&&best!==current)result.push(best.id);
 }
 return result;
}
export const runeIcon=def=>def?.image?`assets/original/ui/thumbs_fuwen_${def.image}.png`:null;
export function dragonSkillIds(dragon){const s=SPECIES[dragon?.species];return dragonRows.get(`${s?.originalId}:${dragonStars(dragon)}`)??[-1,-1,-1,-1]}
export function runeSkill(dragon,def=null,slot=def?.equipType){const id=dragonSkillIds(dragon)[slot-1],base=DATA.skills[id];if(!base)return null;const common=DATA.skillCommon[base.kind]??{},result={...base,...common};if(!def)return result;const c=DATA.runeColour[base.runeColour],l=DATA.runeLevel[base.runeLevel],i=(def.quality-2)*3;if(!c||!l||i<0||i+2>=c.length)return null;const n=def.level-1;return {...result,damageVector:c[i]+n*l[i],damageValue:c[i+1]+n*l[i+1],addPower:slot<=2?c[i+2]+n*l[i+2]:0,addPowerDisplay:c[i+2]+n*l[i+2]}}
export function runePower(state,dragon){return [1,2,3,4].reduce((sum,slot)=>{const item=runeOfDragon(state,dragon.id,slot);return sum+(item?runeSkill(dragon,runeDefinition(item.type))?.addPower??0:0)},0)}
export function runeEquipError(state,dragon,item,{allowLegacy=false}={}){const def=runeDefinition(item?.type);if(!dragon||!def)return '找不到龙或符文。';if(SPECIES[dragon.species].quality<=2&&!(allowLegacy&&SPECIES[dragon.species].quality===2&&item.dragonid===dragon.id))return '蓝色品质以上的龙才能装备符文。';if(def.equipType===5)return '碎片只能用于升级符文。';if(item.dragonid&&item.dragonid!==dragon.id)return '符文已装备给另一条龙，请先卸下。';if(!runeSkill(dragon,def))return '这条龙没有对应技能，或原技能增幅表未覆盖此符文。';return null}
export function runeUpgradePlan(state,id,materials){const target=runeInstance(state,id);let def=runeDefinition(target?.type),exp=target?.exp;if(!def||def.equipType===5||!runeDefinition(def.levelUpID))throw Error('此符文不能继续升级。');if(!Array.isArray(materials)||!materials.length||new Set(materials).size!==materials.length)throw Error('请选择要吞噬的符文或碎片。');for(const key of materials){const item=runeInstance(state,key),d=runeDefinition(item?.type);if(!d||key===id||item.dragonid)throw Error('只能吞噬未装备的其它符文或碎片。');exp+=d.offerExp}while(runeDefinition(def.levelUpID)&&exp>=def.needExp){exp-=def.needExp;def=runeDefinition(def.levelUpID)}return {type:def.id,exp}}
export function validateRunes(state){state.runes??=[];state.nextRuneId??=1;if(!Array.isArray(state.runes)||state.runes.length>100||!Number.isSafeInteger(state.nextRuneId)||state.nextRuneId<1)throw Error('符文背包无效。');const ids=new Set(),slots=new Set();for(const v of state.runes){const d=runeDefinition(v?.type);if(!/^fw-[1-9][0-9]*$/.test(v?.id)||ids.has(v.id)||Number(v.id.slice(3))>=state.nextRuneId||!d||!Number.isSafeInteger(v.exp)||v.exp<0||v.exp>1e9||!Number.isSafeInteger(v.dragonid)||v.dragonid<0)throw Error('符文实例无效。');ids.add(v.id);if(v.dragonid){const dragon=state.dragons.find(x=>x.id===v.dragonid),key=`${v.dragonid}:${d.equipType}`;if(slots.has(key)||runeEquipError(state,dragon,v,{allowLegacy:true}))throw Error('符文装备关系无效。');slots.add(key)}}}

// Dragon.updateAttribute: permanent type-3 skills contribute buff.arg2 to the
// attribute selected by arg1 (0 attack, 1 defence, 2 life, 3 crit, 4 uncrit).
// Equipped rune quality/level select the extended buff; no rune uses suffix 000.
export function passiveAttributes(dragon,state=null){
 const bonus={attack:0,defend:0,life:0,crit:0,uncrit:0},keys=Object.keys(bonus);
 for(let slot=1;slot<=4;slot++){
  const skill=runeSkill(dragon,null,slot);if(skill?.type!==3)continue;
  const base=SKILL_DETAILS.skills[skill.id],item=state?runeOfDragon(state,dragon.id,slot):null,def=runeDefinition(item?.type);
  const buff=SKILL_DETAILS.buffs[base?.buff1ID*1000+(def?def.quality*100+def.level:0)];
  if(buff&&keys[buff.arg1]&&Number.isFinite(buff.arg2))bonus[keys[buff.arg1]]+=buff.arg2;
 }
 return bonus;
}
