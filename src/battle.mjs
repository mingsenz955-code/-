import {ORIGINAL_DRAGON_ATK} from '../assets/original/data/battle.mjs';
import {SPECIES} from './data.mjs';

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
