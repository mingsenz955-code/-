import {ORIGINAL_LOTTERY_ROWS} from '../assets/original/data/lottery.mjs';
export const LOTTERY_POLICY='offline-cumulative-v1';
export const LOTTERY_CAPACITY=30;
export const LOTTERY_MODES=Object.freeze({1:Object.freeze({name:'普通基础抽奖',cost:30,tokens:'normalTokens'}),2:Object.freeze({name:'高级基础抽奖',cost:80,tokens:'advancedTokens'})});
const rows=new Map(ORIGINAL_LOTTERY_ROWS.map(row=>[row[0],Object.freeze({id:row[0],mode:row[1],type:row[2],itemId:row[3],min:row[4],max:row[5],offlineCumulative:row[6]})]));
export function lotteryRow(id){return rows.get(id)??null;}
export function lotteryPool(mode){return [...rows.values()].filter(row=>row.mode===mode);}
export function lotteryCost(lottery,mode,count){
 const definition=LOTTERY_MODES[mode];
 if(!Number.isSafeInteger(mode)||!definition||![1,10].includes(count))throw new Error('请选择基础抽奖档位与单抽/十连。');
 const total=definition.cost*count,tokens=Math.min(lottery[definition.tokens],total);
 return {tokens,gems:total-tokens,total,tokenKey:definition.tokens};
}
export function sampleLottery(mode,random=Math.random){
 const pool=lotteryPool(mode);if(!pool.length)throw new Error('奖池未取得。');
 const unit=()=>{const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw new Error('抽奖随机值无效。');return value};
 const roll=Math.floor(unit()*pool.at(-1).offlineCumulative)+1;
 const row=pool.find(row=>roll<=row.offlineCumulative);
 const amount=row.min===row.max?row.min:row.min+Math.floor(unit()*(row.max-row.min+1));
 return {sourceRow:row.id,mode,type:row.type,itemId:row.itemId,amount,policy:LOTTERY_POLICY};
}
