import {configuredLineup,dragonAttributes,BATTLE_ROUND_LIMIT} from './battle.mjs';
import {runeSkill,runeOfDragon,runeDefinition,sourceSkill} from './runes.mjs';
// Local deterministic solver. Source attributes and skill coefficients are used;
// targeting, defence mitigation and skill cadence are offline rules, not server AI.
export const COMBAT_POLICY='offline-hp-combat-v1';
export function hitDamage(attack,defend,skill){
 if(!Number.isFinite(attack)||attack<0||!Number.isFinite(defend)||defend<0)throw Error('战斗攻防属性无效。');
 const coefficient=Number.isFinite(skill?.damageVector)&&skill.damageVector>=0?skill.damageVector/10000:1;
 const flat=Math.max(0,skill?.damageValue??0),raw=Math.max(0,attack)*coefficient+flat;
 return Math.max(1,Math.floor(raw*Math.max(1,attack)/(Math.max(1,attack)+Math.max(0,defend))));
}
export function simulateCombat(state,enemies,{allyStats={},roundLimit=BATTLE_ROUND_LIMIT}={}){
 if(!Number.isInteger(roundLimit)||roundLimit<1||roundLimit>BATTLE_ROUND_LIMIT)throw Error('战斗回合上限无效。');
 const units=(items,side)=>items.map((item,index)=>{const source=side==='ally'?(allyStats[item.id]??dragonAttributes(item,state)):item;if(!source||!Number.isFinite(source.life)||source.life<=0)throw Error('战斗生命属性无效。');return {item,side,index,stats:{...source},maxHp:Math.floor(source.life),hp:Math.floor(source.life)};});
 const allies=units(configuredLineup(state),'ally'),opponents=units(enemies,'enemy');if(!allies.length||!opponents.length)throw Error('双方都必须有出战的龙。');
 const events=[];let rounds=0;
 for(let round=1;round<=roundLimit&&allies.some(u=>u.hp>0)&&opponents.some(u=>u.hp>0);round++){
  rounds=round;
  for(let i=0;i<Math.max(allies.length,opponents.length);i++)for(const [side,team,targets] of [['ally',allies,opponents],['enemy',opponents,allies]]){
   const actor=team[i],alive=targets.filter(t=>t.hp>0);if(!actor||actor.hp<=0||!alive.length)continue;
   const target=alive[i%alive.length],slot=round%2===0?2:1,rune=side==='ally'?runeOfDragon(state,actor.item.id,slot):null,skill=side==='enemy'?(sourceSkill(actor.item['skill'+slot])??runeSkill(actor.item,null,slot)):runeSkill(actor.item,runeDefinition(rune?.type),slot);
   const effectiveSkill=side==='enemy'&&Number.isFinite(actor.item.skillValueScale)&&skill?{...skill,damageValue:Math.floor((skill.damageValue??0)*Math.max(0,actor.item.skillValueScale))}:skill;
   const damage=hitDamage(actor.stats.attack,target.stats.defend,effectiveSkill),hpBefore=target.hp;target.hp=Math.max(0,target.hp-damage);
   events.push({round,side,actor:i,target:target.index,slot,skillId:skill?.id??null,damage,appliedDamage:hpBefore-target.hp,hpBefore,hpAfter:target.hp,maxHp:target.maxHp});
  }
 }
 return {policy:COMBAT_POLICY,won:opponents.every(u=>u.hp===0)&&allies.some(u=>u.hp>0),draw:allies.some(u=>u.hp>0)&&opponents.some(u=>u.hp>0),rounds,events,allies:allies.map(u=>({hp:u.hp,maxHp:u.maxHp})),enemies:opponents.map(u=>({hp:u.hp,maxHp:u.maxHp}))};
}
