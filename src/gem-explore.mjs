import POOLS from '../assets/original/data/gem-explore.mjs';
import {gemDefinition,gemSocket} from './gems.mjs';
export const GEM_EXPLORE_POLICY='offline-source-weighted-gem-v1';
export const GEM_EXPLORE_MODES={low:{name:'初级探索',cd:600,one:20,ten:200,pool:9000001},normal:{name:'中级探索',cd:86400,one:80,ten:720,pool:9000002},high:{name:'高级探索',cd:259200,one:200,ten:1800,pool:9000003}};
const day=now=>Math.floor((now+28800000)/86400000);
export function createGemExplore(now=Date.now()){return {policy:GEM_EXPLORE_POLICY,day:day(now),lowFree:5,last:{low:null,normal:null,high:null},balls:{low:0,normal:0,high:0},draws:0}}
export function validateGemExplore(s){s.gemExplore??=createGemExplore(s.updatedAt);const h=s.gemExplore,integer=v=>Number.isSafeInteger(v)&&v>=0;if(h.policy!==GEM_EXPLORE_POLICY||!integer(h.day)||!integer(h.lowFree)||h.lowFree>5||!integer(h.draws)||!h.last||!h.balls)throw Error('宝石探索存档无效。');for(const k in GEM_EXPLORE_MODES)if(!(h.last[k]===null||integer(h.last[k]))||!integer(h.balls[k]))throw Error('宝石探索记录无效。')}
export function gemExploreStatus(s,now=Date.now()){const h=structuredClone(s.gemExplore??createGemExplore(now));if(day(now)>h.day){h.day=day(now);h.lowFree=5}return h}
export function gemExplorePlan(s,mode,count,now=Date.now()){
 const def=GEM_EXPLORE_MODES[mode];if(!def||![1,10].includes(count))throw Error('宝石探索次数无效。');
 const h=gemExploreStatus(s,now),readyAt=h.last[mode]===null?0:h.last[mode]+def.cd*1000,free=count===1&&(mode!=='low'||h.lowFree>0)&&now>readyAt;
 if(s.gemInventory.filter(v=>gemSocket(s,v.id)<0).length+count>150)throw Error('宝石背包空间不足。');
 let balls=0,gems=0;if(!free){if(mode==='low'){balls=count===1?def.one:def.ten}else{balls=Math.min(count,h.balls[mode]);gems=balls===0?(count===1?def.one:def.ten):(count-balls)*def.one}}
 return {h,def,free,readyAt,balls,gems,count,mode};
}
export function sampleGemExplore(mode,random=Math.random,guarantee=false){const def=GEM_EXPLORE_MODES[mode];if(!def)throw Error('探索类型无效。');const min=guarantee?(mode==='normal'?3:mode==='high'?4:0):0,rows=POOLS.filter(r=>r.pool===def.pool&&r.weight>0&&gemDefinition(r.itemId)?.quality>=min),total=rows.reduce((a,r)=>a+r.weight,0),roll=random();if(!total||!Number.isFinite(roll)||roll<0||roll>=1)throw Error('宝石随机值无效。');let value=roll*total;for(const row of rows){value-=row.weight;if(value<0)return row}return rows.at(-1)}
