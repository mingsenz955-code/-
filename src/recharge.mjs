import {ORIGINAL_RECHARGE_PRODUCTS,ORIGINAL_SINGLE_RECHARGE_TIERS,ORIGINAL_VIP_LEVELS} from '../assets/original/data/recharge.mjs';

// 充值 = 到账魔晶. The panel's own card renderer (ui/vip/VipStoreRender.lua) prints
// `data.amount .. " 魔晶"`, `"¥" .. data.price / 10` and `"再送" .. amount/rebate .. "魔晶"`, and
// its data is pcf/treasure_items rows 95..100 (LibTreasureInfo columns, shoptype 2, platform 1 =
// android). Those six rows match payment/StoreController.productForAn (icount/iback) exactly, so
// the amount and the rebate are the client's own numbers, not an inference.
//
// The real payment path is deliberately NOT implemented: this build grants a product for free and
// says so on screen, which is what the user asked for. Nothing here pretends to charge money.
export const RECHARGE_POLICY='original-recharge-products-v1';
export const RECHARGE_TEST_MODE=true;
export const RECHARGE_DAILY_LIMIT_YUAN=2000;
export const RECHARGE_NOTICE='测试模式：点击即到账，不进行任何真实扣款；每日最多2000元。';
export const RECHARGE_PRODUCTS=Object.freeze(ORIGINAL_RECHARGE_PRODUCTS.map(product=>Object.freeze({
 id:product.id,name:product.name,gems:product.gems,priceYuan:product.priceYuan,priceJiao:product.priceJiao,
 rebate:product.rebate,firstGift:product.rebateMultiple>0?product.gems:product.rebate,xid:product.xid,img:product.img,
})));

// pcf/danchong is the client's 单笔充值 activity: it hands out its own gift on top of the 魔晶 the
// account received. It is a limited-time activity, NOT this panel, so it stays separate here.
export const SINGLE_RECHARGE_TIERS=Object.freeze(ORIGINAL_SINGLE_RECHARGE_TIERS.map(tier=>Object.freeze({
 id:tier.id,gems:tier.gems,gemsIOS:tier.gemsIOS,costYuan:tier.costYuan,costIOS:tier.costIOS,
 awards:Object.freeze(tier.awards.map(award=>Object.freeze({...award}))),
})));

// VipInfo.lua arr[2] needExp: the bar on the panel counts 累计充值魔晶.
export const VIP_LEVELS=Object.freeze(ORIGINAL_VIP_LEVELS.map(entry=>Object.freeze({level:entry.level,needExp:entry.needExp})));

export function rechargeProduct(id){return RECHARGE_PRODUCTS.find(product=>product.id===id)??null}
export function rechargeProductIds(){return RECHARGE_PRODUCTS.map(product=>product.id)}
export function rechargeDayKey(now=Date.now()){return new Date(now+8*60*60*1000).toISOString().slice(0,10)}
export function rechargeDailyUsage(recharge,now=Date.now()){const used=recharge?.dailyDay===rechargeDayKey(now)?recharge.dailyYuan??0:0;return {day:rechargeDayKey(now),used,remaining:Math.max(0,RECHARGE_DAILY_LIMIT_YUAN-used)}}
// First purchase of a tier doubles it ("再送" the same amount, the client's itwice/doublecashs
// flag); every later purchase of that tier adds its own rebate instead.
export function rechargeGift(product,{firstPurchase}){return firstPurchase?product.firstGift:product.rebate}
export function rechargeDelivery(product,{firstPurchase}){const gift=rechargeGift(product,{firstPurchase});return {gems:product.gems+gift,gift,firstPurchase}}
export function vipProgress(totalGems){
 const total=Number.isFinite(totalGems)&&totalGems>0?Math.floor(totalGems):0;
 const current=[...VIP_LEVELS].filter(entry=>entry.needExp<=total).at(-1)??VIP_LEVELS[0];
 const next=VIP_LEVELS.find(entry=>entry.level===current.level+1)??null;
 return {level:current.level,total,next,remaining:next?Math.max(0,next.needExp-total):0,percent:next?Math.min(100,Math.floor(total/next.needExp*100)):100};
}
