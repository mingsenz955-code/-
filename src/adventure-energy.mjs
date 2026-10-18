import {vipInfo} from './vip.mjs';
export const energyCapacity=s=>Math.max(10,vipInfo(s).pvePower??10);
export const energyDay=now=>Math.floor((now+28800000)/86400000);
export function validateEnergyPurchases(s){s.adventure.energyPurchases??={day:energyDay(s.updatedAt),count:0};const r=s.adventure.energyPurchases;if(!r||!Number.isSafeInteger(r.day)||r.day<0||!Number.isSafeInteger(r.count)||r.count<0||r.count>1000)throw Error('体力购买记录无效。');}
export function energyPurchasePlan(s,now=Date.now()){const a=s.adventure,r=a.energyPurchases,limit=vipInfo(s).pveBuyPowerTime??1,count=r?.day===energyDay(now)?r.count:0;return {cost:50,capacity:energyCapacity(s),limit,count,remaining:Math.max(0,limit-count)};}
