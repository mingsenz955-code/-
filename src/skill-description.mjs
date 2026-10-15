import DATA from '../assets/original/data/skill-descriptions.mjs';
import {runeSkill,runeOfDragon,runeDefinition} from './runes.mjs';
export function skillDescription(state,dragon,slot,runeOverride=undefined){
 const item=runeOfDragon(state,dragon.id,slot),rune=runeOverride===undefined?runeDefinition(item?.type):runeOverride,display=runeSkill(dragon,rune,slot);if(!display)return null;
 const skill={...DATA.skills[display.id],...display},description=DATA.descriptions[DATA.common[skill.kind]];if(!description)return {skill,text:skill.name};
 const buffId=skill.buff1ID*1000+(rune?rune.quality*100+rune.level:0),buff=DATA.buffs[buffId],damage=`${skill.damageVector/100}%${skill.damageValue>0?'+'+skill.damageValue+'点':''}`;let args=[];
 switch(description.type){case 1:args=[buff?.arg2];break;case 2:args=[damage];break;case 3:args=[damage,skill.suckBloodPercent/100];break;case 4:args=[damage,skill.buff1ActiveProb<10000?`有${skill.buff1ActiveProb/100}%几率`:'',buff?.rounds];break;case 5:args=[damage,buff?.arg2/100,buff?.rounds];break;}
 let i=0;const text=description.text.replace(/%%|%[sdg]/g,token=>token==='%%'?'%':String(args[i++]??'—'));
 return {skill,text,rune,buff};
}
