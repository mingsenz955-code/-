import {recordActivitySpend} from './historical-activities.mjs';
import SOURCE from '../assets/original/data/arena-vip.mjs';
import {vipInfo} from './vip.mjs';
export {vipInfo} from './vip.mjs';
import {treeDifficultyReference,monster,WORLD_SOURCE} from './world-encounters.mjs';
import {configuredLineup,lineupPower} from './battle.mjs';
import {deliverLoot,lootProp,equipmentFragment} from './loot.mjs';
import {equipmentDefinition} from './equipment.mjs';
export {SOURCE as ARENA_SOURCE};
export const arenaDay=now=>Math.floor((now+28800000)/86400000);
export const createArena=now=>({policy:'offline-arena-v1',day:arenaDay(now),rank:5000,best:5000,attempts:5,bought:0,readyAt:0,medals:0,claimedDay:-1,generation:0,records:[]});
export function validateArena(s){const a=s.arena,ints=['day','rank','best','attempts','bought','readyAt','medals','generation'];if(!a||a.policy!=='offline-arena-v1'||ints.some(k=>!Number.isSafeInteger(a[k])||a[k]<0)||a.rank<1||a.rank>100000||a.best<1||a.best>a.rank||!Number.isSafeInteger(a.claimedDay)||a.claimedDay< -1||a.claimedDay>a.day||!Array.isArray(a.records)||a.records.length>50||a.records.some(r=>!Number.isSafeInteger(r.at)||r.at<0||typeof r.won!=='boolean'||!Number.isSafeInteger(r.from)||!Number.isSafeInteger(r.to)||r.from<1||r.to<1||r.to>r.from||!Number.isSafeInteger(r.power)||r.power<1||typeof r.name!=='string'||r.name.length>80))throw Error('竞技之神存档无效。');}
export function refreshArena(s,now){if(arenaDay(now)>s.arena.day)Object.assign(s.arena,{day:arenaDay(now),attempts:5,bought:0,generation:s.arena.generation+1});}
export const arenaToken=s=>`${s.arena.day}:${s.arena.generation}:${s.arena.rank}`;
export const arenaAward=rank=>SOURCE.awards.find(r=>r.maxRank<=rank&&r.minRank>=rank);
export function arenaOpponents(s){const reference=treeDifficultyReference(s);return [0,1,2,3].map(i=>{const row=WORLD_SOURCE.robots[(i+s.arena.generation)%WORLD_SOURCE.robots.length],base=monster(row.monsterId),rank=Math.max(1,s.arena.rank-[40,100,250,500][i]),ratio=[.65,.85,1.05,1.3][i]*(1+(5000-rank)/10000),scale=reference.bucket*ratio/(base.attack+base.defend+base.life/3),enemy={...base,level:Math.min(50,reference.level+i),attack:Math.max(1,Math.floor(base.attack*scale)),defend:Math.max(1,Math.floor(base.defend*scale)),life:Math.max(1,Math.floor(base.life*scale))};return {id:i,name:`${row.name}·${i+1}`,rank,enemy,power:Math.floor(enemy.attack+enemy.defend+enemy.life/3)};});}
export function arenaPlan(s,id,now=Date.now(),token=arenaToken(s)){if(token!==arenaToken(s))throw Error('对手列表已变化，请重新选择。');if(!s.arena.attempts)throw Error('今日已无挑战次数，请点击+购买。');if(!vipInfo(s).pvpNoCD&&now<s.arena.readyAt)throw Error('挑战尚在冷却，可等待或花费50魔晶重置。');const team=configuredLineup(s);if(!team.length)throw Error('还没有选择出战的龙。');const op=arenaOpponents(s).find(r=>r.id===id);if(!op)throw Error('挑战对手不存在。');return {...op,won:lineupPower(team,s)>=op.power};}
export const exchangeSupported=r=>r.exchangeType===1&&([1,2,19,20,21,22].includes(r.itemType)||r.itemType===4&&!!lootProp(r.itemID)||r.itemType===8&&!!equipmentDefinition(r.itemID)||r.itemType===9&&!!equipmentFragment(r.itemID));
export function arenaAction(s,type,payload,now){refreshArena(s,now);const a=s.arena,pay=n=>{if(s.gems<n)throw Error('魔晶不足。');s.gems-=n;recordActivitySpend(s,n);};
 switch(type){
 case 'arenaChallenge':{if(typeof payload.token!=='string')throw Error('请重新选择对手。');const op=arenaPlan(s,payload.id,now,payload.token);a.attempts--;const from=a.rank;if(op.won)a.rank=op.rank;a.best=Math.min(a.best,a.rank);a.readyAt=vipInfo(s).pvpNoCD?0:now+600000;a.generation++;a.records.unshift({at:now,name:op.name,power:op.power,won:op.won,from,to:a.rank});a.records=a.records.slice(0,50);return op.won?`挑战获胜，当前单机排名 ${a.rank}。`:'挑战失败，调整布阵后再试。';}
 case 'arenaBuy':if(a.bought>=vipInfo(s).pvpBuyTime)throw Error(`当前VIP每日最多购买 ${vipInfo(s).pvpBuyTime} 次。`);pay(10);a.bought++;a.attempts++;return '已增加一次挑战次数。';
 case 'arenaReset':if(vipInfo(s).pvpNoCD||now>=a.readyAt)throw Error('已经不需要刷新了，快去战斗吧。');pay(50);a.readyAt=0;return '挑战冷却已重置。';
 case 'arenaRefresh':a.generation++;return '已更换单机NPC对手。';
 case 'arenaClaim':{if(a.claimedDay===a.day)throw Error('今日排名奖励已领取。');const r=arenaAward(a.rank);if(!r||!r.awardNumForRank&&!r.goldForRank)throw Error('当前排名暂无奖励。');a.medals+=r.awardNumForRank;s.gems+=r.goldForRank;a.claimedDay=a.day;return `获得奖章 ${r.awardNumForRank}、魔晶 ${r.goldForRank}。`;}
 case 'arenaExchange':{const r=SOURCE.exchange.find(r=>r.id===payload.id);if(!r||!exchangeSupported(r))throw Error('该兑换尚未开放。');if(a.medals<r.exNeedNum)throw Error('竞技奖章不足。');deliverLoot(s,[{type:r.itemType,itemId:r.itemID,amount:r.itemNum}]);a.medals-=r.exNeedNum;return '兑换成功，奖励已入库。';}
 default:throw Error('竞技操作无效。');
 }
}
