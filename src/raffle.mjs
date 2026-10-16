import {RAFFLE_PREVIEW_ROWS} from '../assets/original/data/raffle.mjs';

// The shipped DragonRafflePanelNew only calls SocketSender.sendRandDragon(level, count)
// and renders whatever the server sends back, so no client table holds the real
// per-machine pool or odds. What the client does prove, and what this module encodes, is:
// the three machines and their prices, the three ticket ids, the junior free single draw,
// the 10-draw 必得紫/橙 counter on the middle and senior machines, and the on-screen rule
// that a free single draw does not advance that counter. The pool itself is an explicit
// offline inference over the client's own 53 preview entries and must never be presented
// as the original probability.
export const RAFFLE_POLICY='offline-raffle-preview-v1';
export const RAFFLE_CAPACITY=60;
export const RAFFLE_GUARANTEE_DRAWS=10;
const MACHINES=Object.freeze({
 junior:Object.freeze({key:'junior',name:'初级',ticket:6047,single:0,ten:10,qualities:Object.freeze([2,3]),guarantee:3}),
 mid:Object.freeze({key:'mid',name:'中级',ticket:6048,single:100,ten:900,qualities:Object.freeze([2,3,4]),guarantee:4}),
 senior:Object.freeze({key:'senior',name:'高级',ticket:6049,single:280,ten:2500,qualities:Object.freeze([3,4,5]),guarantee:5}),
});
export const RAFFLE_MACHINES=MACHINES;
// Quality 4 is 紫 and 5 is 橙 in EquipInfo-style numbering; the client's own preview rows
// only ever use 2..5.
export const RAFFLE_QUALITY_NAMES=Object.freeze({1:'白',2:'绿',3:'蓝',4:'紫',5:'橙'});
// Lower qualities stay more common. The client publishes no weights, so these are the
// documented offline inference, not server odds.
const WEIGHTS=Object.freeze({2:60,3:30,4:9,5:1});
const preview=RAFFLE_PREVIEW_ROWS.map(row=>({index:row[0],dragonId:row[1],quality:row[2]}));

export function raffleMachine(key){return MACHINES[key]??null}

export function rafflePool(key){
 const machine=MACHINES[key];
 if(!machine)throw new Error('扭蛋机档位无效。');
 return preview.filter(row=>machine.qualities.includes(row.quality));
}

export function raffleCost(raffle,key,count){
 const machine=MACHINES[key];
 if(!machine||![1,10].includes(count))throw new Error('请选择扭蛋机与单抽或十连。');
 const total=count===1?machine.single:machine.ten;
 const held=raffle?.tickets?.[machine.ticket]??0;
 const free=key==='junior'&&count===1; // Existing offline free-single policy, not a verified cooldown.
 const tickets=free?0:Math.min(held,count),missing=count-tickets;
 if(key==='junior'&&!free&&missing>0)throw new Error('初级十连需要10张召唤卡。');
 // One card replaces one draw. The client's mixed-card confirmation quotes
 // missing * single price; a wholly paid ten-draw uses the displayed ten price.
 // Mixed-card server discounts remain unverified and are documented separately.
 const gems=free||missing===0?0:tickets===0?total:missing*machine.single;
 return {tickets,gems,total,ticketKey:String(machine.ticket),free};
}

export function sampleRaffle(key,random=Math.random,{guarantee=false}={}){
 const machine=MACHINES[key];
 if(!machine)throw new Error('扭蛋机档位无效。');
 const unit=()=>{const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw new Error('抽奖随机值无效。');return value};
 let candidates=machine.guarantee===null?[]:rafflePool(key).filter(row=>row.quality===machine.guarantee);
 if(!guarantee||!candidates.length)candidates=rafflePool(key);
 if(!candidates.length)throw new Error('该扭蛋机的奖池未取得。');
 const totalWeight=candidates.reduce((sum,row)=>sum+WEIGHTS[row.quality],0);
 let roll=unit()*totalWeight,picked=candidates.at(-1);
 for(const row of candidates){roll-=WEIGHTS[row.quality];if(roll<0){picked=row;break}}
 return {policy:RAFFLE_POLICY,machine:key,dragonId:picked.dragonId,quality:picked.quality,previewIndex:picked.index};
}

// A middle/senior draw advances the guaranteed counter; a free single draw does not, and
// drawing the guaranteed quality resets it, which is what the client's on-screen text says.
export function advanceRaffleCounter(counter,result,{free=false}={}){
 const machine=MACHINES[result.machine];
 if(!machine||machine.guarantee===null||free)return counter;
 if(result.quality===machine.guarantee)return 0;
 return counter+1;
}

export function raffleOdds(key){const pool=rafflePool(key),total=pool.reduce((n,r)=>n+WEIGHTS[r.quality],0);return pool.map(r=>({...r,probability:WEIGHTS[r.quality]/total}));}
