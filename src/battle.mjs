import {awakeningAttributes} from './dragon-awakening.mjs';
import {dragonStars} from './dragon-stars.mjs';
import {runePower,passiveAttributes} from './runes.mjs';
import {gemBonus} from './gems.mjs';
import {equipmentBonus,equipmentOfDragon} from './equipment.mjs';
import {ORIGINAL_DRAGON_ATK} from '../assets/original/data/battle.mjs';
import {SPECIES} from './data.mjs';
import {ORIGINAL_ADVENTURE_LEVELS} from '../assets/original/data/adventure.mjs';
import {ORIGINAL_OFFLINE_ENEMY_GROUPS} from '../assets/original/data/enemies.mjs';

// Baseline combat values only. The client's own attribute update and getPower are known from
// static disassembly (see docs/reference/dragon-attributes-disassembly.txt):
//   attack = floor(baseAttack + (level-1)*attackQuality + ...)
//   power  = floor(attack + defend + maxblood/3 + crit + uncrit + getRunePower())
// Permanent passive skills, runes, equipment and gems are included. Awakening
// and treasure terms remain incomplete; this is not the full original total.
export const BATTLE_POLICY='offline-power-baseline-v1';
export const BATTLE_SLOTS=6;
export const BATTLE_ROUND_LIMIT=30;
const rows=new Map(ORIGINAL_DRAGON_ATK.map(row=>[`${row.dragonId}:${row.quality}`,row]));

export function dragonCombatRow(originalId,quality){return rows.get(`${originalId}:${quality}`)??null}

export function dragonAttributes(dragon,state=null){
 const species=SPECIES[dragon?.species];
 if(!species?.originalId)return null;
 const row=dragonCombatRow(species.originalId,dragonStars(dragon));
 if(!row)return null;
 const passive=passiveAttributes(dragon,state),wake=awakeningAttributes(dragon);
 const level=Math.max(1,dragon.level??1);
 const gems=state?gemBonus(state,dragon):{attack:0,defend:0,blood:0,crit:0,uncrit:0};
 const bonus=state?equipmentBonus(equipmentOfDragon(state,dragon.id)):{atk:0,def:0,hp:0};
 const attack=Math.floor(row.baseAttack+(level-1)*row.attackQuality+passive.attack)+bonus.atk+gems.attack+(dragon.training?.attack??0)+wake.attack;
 const defend=Math.floor(row.baseDefence+(level-1)*row.defenceQuality+passive.defend)+bonus.def+gems.defend+(dragon.training?.defend??0)+wake.defend;
 const life=Math.floor(row.baseLife+(level-1)*row.lifeQuality+passive.life)+bonus.hp+gems.blood+(dragon.training?.life??0)+wake.blood;
 return {attack,defend,life,crit:wake.crit+passive.crit+gems.crit+(bonus.antResist??0),uncrit:wake.uncrit+passive.uncrit+gems.uncrit+(bonus.resist??0),quality:species.quality};
}

export function dragonPower(dragon,state=null){
 const stats=dragonAttributes(dragon,state);
 return stats?Math.floor(stats.attack+stats.defend+stats.life/3+stats.crit+stats.uncrit+(state?runePower(state,dragon):0)):null;
}

// The client shows six slots per side; a ranch with fewer dragons simply leaves slots empty.
export function battleLineup(state,side='left'){
 if(side!=='left')return [];
 return (state.dragons??[]).slice(0,BATTLE_SLOTS);
}

export function lineupPower(dragons,state=null){
 return dragons.reduce((total,dragon)=>total+(dragonPower(dragon,state)??0),0);
}
export const OFFLINE_BATTLE_POLICY='offline-adventure-balance-v1';
const levelIdOfEvent=nodeId=>(Math.floor(nodeId/100)-900)*1000+nodeId%100;
// Retain the existing 40% offline adventure balance in actual attributes, not only the win threshold.
export function battleEnemyGroup(nodeId){const index=ORIGINAL_ADVENTURE_LEVELS.findIndex(row=>row[0]===levelIdOfEvent(nodeId));if(index<0)return null;const group=ORIGINAL_OFFLINE_ENEMY_GROUPS[Math.min(index,ORIGINAL_OFFLINE_ENEMY_GROUPS.length-1)];return {...group,monsters:group.monsters.map(monster=>{const species=Object.entries(SPECIES).find(([,value])=>value.originalId===monster.dragonId)?.[0]??null;return {...monster,species,attack:Math.max(1,Math.floor(monster.attack*.4)),defend:Math.max(0,Math.floor(monster.defend*.4)),life:Math.max(1,Math.floor(monster.life*.4))}})}}
export function battleRequirement(nodeId){const power=battleEnemyGroup(nodeId)?.power;return power==null?null:Math.floor(power*.4)}

export function configuredLineup(state){const ids=Array.isArray(state.formation)?state.formation:state.dragons.slice(0,BATTLE_SLOTS).map(d=>d.id);return ids.map(id=>state.dragons.find(d=>d.id===id)).filter(Boolean).slice(0,BATTLE_SLOTS)}
