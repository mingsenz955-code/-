import {sixNpcRoster} from './npc-roster.mjs';
import {simulateCombat} from './combat.mjs';
import {vipInfo} from './vip.mjs';
import {recordActivitySpend} from './historical-activities.mjs';
import SOURCE from '../assets/original/data/blood-front.mjs';
import {SPECIES} from './data.mjs';
import {configuredLineup,dragonAttributes,dragonPower} from './battle.mjs';
export {SOURCE as BLOOD_SOURCE};
const day=now=>Math.floor((now+28800000)/86400000);
export const bloodWaves=stage=>SOURCE.waves.filter(w=>w.actId===stage);
export const bloodLevel=stage=>SOURCE.levels.find(l=>l.id===stage);
export const createBloodFront=(now,state=null)=>({policy:'offline-blood-front-v1',stage:1,wave:0,score:0,totalScore:0,buffs:[],best:{},day:day(now),resets:state?vipInfo(state).bloodTime:1,generation:0,finished:false,last:null});
export function validateBloodFront(s){
 const b=s.bloodFront,n=v=>Number.isSafeInteger(v)&&v>=0;
 if(!b||b.policy!=='offline-blood-front-v1'||!bloodLevel(b.stage)||!n(b.wave)||b.wave>=bloodWaves(b.stage).length||!['score','totalScore','day','resets','generation'].every(k=>n(b[k]))||b.resets>3||b.score>b.wave*3||typeof b.finished!=='boolean'||!Array.isArray(b.buffs)||new Set(b.buffs).size!==b.buffs.length||b.buffs.some(i=>![1,2,3].includes(i))||!b.best||Array.isArray(b.best)||Object.entries(b.best).some(([k,v])=>!bloodLevel(+k)||!n(v)||v>bloodWaves(+k).length*3))throw Error('血战前线存档无效。');
 if(b.finished&&(b.stage!==50||b.wave!==0||b.score!==0)||b.last!==null&&(!b.last||!bloodLevel(b.last.stage)||typeof b.last.won!=='boolean'||!n(b.last.score)||!n(b.last.award)||!n(b.last.at)))throw Error('血战结算记录无效。');
}
export function refreshBloodFront(s,now){if(day(now)>s.bloodFront.day){s.bloodFront.day=day(now);s.bloodFront.resets=vipInfo(s).bloodTime;}}
export const bloodToken=s=>`${s.bloodFront.generation}:${s.bloodFront.stage}:${s.bloodFront.wave}`;
const bloodSpecies=new Map(Object.entries(SPECIES).map(([key,d])=>[d.originalId,key]));
const bloodPool=SOURCE.monsters.map(r=>({...r,species:bloodSpecies.get(r.dragonId)})).filter(r=>r.species);
export function bloodEnemies(wave,difficulty){
 const group=SOURCE.groups.find(g=>g.id===wave['pack'+difficulty]);if(!group)throw Error('血战敌阵不存在。');
 const originals=group.monsterIds.map(id=>{const r=SOURCE.monsters.find(m=>m.id===id),species=Object.keys(SPECIES).find(k=>SPECIES[k].originalId===r?.dragonId);if(!species)throw Error('血战怪物资料缺失。');return {...r,species};});
 return sixNpcRoster(originals,bloodPool);
}
export function bloodTeamStats(s){const b=s.bloodFront,l=bloodLevel(b.stage),stats={};for(const d of configuredLineup(s)){const a={...dragonAttributes(d,s)};for(const [i,key] of [[1,'attack'],[2,'defend'],[3,'life']])if(b.buffs.includes(i))a[key]=Math.floor(a[key]*(1+parseFloat(l['desc'+i])/100));stats[d.id]=a;}return stats;}
export function bloodTeamPower(s){const stats=bloodTeamStats(s);return Math.floor(configuredLineup(s).reduce((n,d)=>{const a=dragonAttributes(d,s),b=stats[d.id];return n+dragonPower(d,s)+(b.attack-a.attack)+(b.defend-a.defend)+(b.life-a.life)/3;},0));}
export function bloodPlan(s,difficulty=1,token=bloodToken(s)){
 const b=s.bloodFront;if(token!==bloodToken(s))throw Error('血战进度已变化，请重新选择。');if(b.finished)throw Error('血战全部关卡已通关。');if(![1,2,3].includes(difficulty))throw Error('请选择一至三星敌阵。');if(!configuredLineup(s).length)throw Error('你还没有派龙出战。');
 const wave=bloodWaves(b.stage)[b.wave],enemies=bloodEnemies(wave,difficulty),required=Math.floor(enemies.reduce((n,e)=>n+e.attack+e.defend+e.life/3+e.crit+e.uncrit,0)),power=bloodTeamPower(s);
 const allyStats=bloodTeamStats(s),combat=simulateCombat(s,enemies,{allyStats});return {token,stage:b.stage,wave:wave.id,waveIndex:b.wave+1,difficulty,enemies,required,power,won:combat.won,allyStats,combat};
}
export function bloodAction(s,type,p,now){
 refreshBloodFront(s,now);const b=s.bloodFront,l=bloodLevel(b.stage);
 if(type==='bloodBuff'){if(![1,2,3].includes(p.id)||!['score','gems'].includes(p.currency))throw Error('请选择增益和花费方式。');if(b.finished||b.buffs.includes(p.id))throw Error('该增益已经激活或血战已结束。');const price=p.currency==='score'?l['cost'+p.id]:l.costMojing;if(!Number.isSafeInteger(price)||price<0)throw Error('增益费用尚未取得。');if(p.currency==='score'){if(b.totalScore<price)throw Error('积分不足。');b.totalScore-=price;}else{if(s.gems<price)throw Error('魔晶不足。');s.gems-=price;recordActivitySpend(s,price);}b.buffs.push(p.id);b.generation++;return '本关增益已激活。';}
 if(type==='bloodReset'){if(!b.resets)throw Error('今日剩余重置次数为0。');b.resets--;Object.assign(b,{stage:1,wave:0,score:0,totalScore:0,buffs:[],finished:false,last:null,generation:b.generation+1});return '血战已重新从第1关开始，最高纪录和已获奖励保留。';}
 if(!['bloodFight','bloodSweep'].includes(type))throw Error('血战操作无效。');
 if(p.token!==bloodToken(s))throw Error('血战进度已变化，请重新选择。');
 let plan,score;
 if(type==='bloodSweep'){if(b.finished||b.wave!==0||(b.best[b.stage]??0)<l.autoPassNeed)throw Error('本关满积分通关后才能自动过关。');score=b.best[b.stage];plan={stage:b.stage,won:true,sweep:true,power:bloodTeamPower(s),required:0};}
 else{plan=bloodPlan(s,p.difficulty,p.token);score=b.score+(plan.won?p.difficulty:0);}
 b.generation++;
 if(!plan.won){b.last={stage:b.stage,won:false,score:b.score,award:0,at:now};b.wave=0;b.score=0;b.totalScore=0;b.buffs=[];return '本关挑战失败，提升战力或选择较低难度后重新闯关。';}
 b.totalScore+=type==='bloodSweep'?score:p.difficulty;
 const completed=type==='bloodSweep'||b.wave+1===bloodWaves(b.stage).length;
 if(!completed){b.wave++;b.score=score;b.last=null;return `第${plan.waveIndex}波胜利，获得${p.difficulty}积分。`;}
 const award=score*l.passAward;b.best[b.stage]=Math.max(b.best[b.stage]??0,score);s.items[6022]=(s.items[6022]??0)+award;b.last={stage:b.stage,won:true,score,award,at:now};
 if(l.nextID===-1){b.finished=true;b.totalScore=0;}else b.stage=l.nextID;
 b.wave=0;b.score=0;b.buffs=[];return `血战第${plan.stage}关通关，本关${score}积分，获得${award}培养丹。`;
}
