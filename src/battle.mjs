import {ORIGINAL_DRAGON_ATK} from '../assets/original/data/battle.mjs';
import {SPECIES} from './data.mjs';
import {ORIGINAL_ADVENTURE_LEVELS} from '../assets/original/data/adventure.mjs';

// Baseline combat values only. The client's own attribute update and getPower are known from
// static disassembly (see docs/reference/dragon-attributes-disassembly.txt):
//   attack = floor(baseAttack + (level-1)*attackQuality + ...)
//   power  = floor(attack + defend + maxblood/3 + crit + uncrit + getRunePower())
// Crit, uncrit, awakening, treasure and rune terms are NOT modelled yet, so a power value
// produced here is a documented baseline and sits below the original total.
export const BATTLE_POLICY='offline-power-baseline-v1';
export const BATTLE_SLOTS=6;
export const BATTLE_ROUND_LIMIT=30;
const rows=new Map(ORIGINAL_DRAGON_ATK.map(row=>[`${row.dragonId}:${row.quality}`,row]));

export function dragonCombatRow(originalId,quality){return rows.get(`${originalId}:${quality}`)??null}

export function dragonAttributes(dragon){
 const species=SPECIES[dragon?.species];
 if(!species?.originalId)return null;
 const row=dragonCombatRow(species.originalId,species.quality);
 if(!row)return null;
 const level=Math.max(1,dragon.level??1);
 const attack=Math.floor(row.baseAttack+(level-1)*row.attackQuality);
 const defend=Math.floor(row.baseDefence+(level-1)*row.defenceQuality);
 const life=Math.floor(row.baseLife+(level-1)*row.lifeQuality);
 return {attack,defend,life,quality:species.quality};
}

export function dragonPower(dragon){
 const stats=dragonAttributes(dragon);
 return stats?Math.floor(stats.attack+stats.defend+stats.life/3):null;
}

// The client shows six slots per side; a ranch with fewer dragons simply leaves slots empty.
export function battleLineup(state,side='left'){
 if(side!=='left')return [];
 return (state.dragons??[]).slice(0,BATTLE_SLOTS);
}

export function lineupPower(dragons){
 return dragons.reduce((total,dragon)=>total+(dragonPower(dragon)??0),0);
}
export const OFFLINE_BATTLE_POLICY='offline-adventure-balance-v1';
const levelIdOfEvent=nodeId=>(Math.floor(nodeId/100)-900)*1000+nodeId%100;
export function battleRequirement(nodeId){const index=ORIGINAL_ADVENTURE_LEVELS.findIndex(row=>row[0]===levelIdOfEvent(nodeId));return index<0?null:Math.floor(800*(1+index*.055))}
export function battleReward(nodeId){const index=ORIGINAL_ADVENTURE_LEVELS.findIndex(row=>row[0]===levelIdOfEvent(nodeId));return index<0?null:{coins:150+index*20,food:10+Math.floor(index/20)*5}}
export function configuredLineup(state){const ids=state.formation?.length?state.formation:state.dragons.slice(0,BATTLE_SLOTS).map(d=>d.id);return ids.map(id=>state.dragons.find(d=>d.id===id)).filter(Boolean).slice(0,BATTLE_SLOTS)}
