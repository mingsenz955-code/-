import {SINGLE_RECHARGE_TIERS} from './recharge.mjs';
import {deliverLoot} from './loot.mjs';
export const createActivities=()=>({policy:'offline-activities-v1',singleEligible:[],singleClaimed:[]});
export function validateActivities(s){const a=s.activities,valid=xs=>Array.isArray(xs)&&xs.length<=SINGLE_RECHARGE_TIERS.length&&new Set(xs).size===xs.length&&xs.every(id=>SINGLE_RECHARGE_TIERS.some(t=>t.id===id));if(!a||a.policy!=='offline-activities-v1'||!valid(a.singleEligible)||!valid(a.singleClaimed)||a.singleClaimed.some(id=>!a.singleEligible.includes(id)))throw Error('活动领奖记录无效。');}
// The original panel delegates eligibility to the server. Offline edition uses
// exact product price, one claim per source tier; it has no fabricated live dates.
export function recordActivityRecharge(s,product){const tier=SINGLE_RECHARGE_TIERS.find(t=>t.costYuan===product.priceYuan);if(tier&&!s.activities.singleEligible.includes(tier.id))s.activities.singleEligible.push(tier.id);}
export function claimSingleRecharge(s,id){const tier=SINGLE_RECHARGE_TIERS.find(t=>t.id===id);if(!tier||!s.activities.singleEligible.includes(id))throw Error('需先完成对应档位的单笔测试充值。');if(s.activities.singleClaimed.includes(id))throw Error('该档奖励已领取。');deliverLoot(s,tier.awards.map(a=>({type:a.type,itemId:a.id,amount:a.num})));s.activities.singleClaimed.push(id);return `已领取单笔 ${tier.costYuan} 元档奖励。`;}
