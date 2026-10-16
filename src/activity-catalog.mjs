import SOURCE from '../assets/original/data/activities.mjs';
// Presentation only: original keys, rewards and saved claims remain independent.
export const ACTIVITY_FAMILIES=Object.freeze([
 {key:'seven',title:'七日福利',keys:['seven-login','seven-tasks','seven-shop']},
 {key:'tycoon',title:'土豪节',keys:['tycoon-1','tycoon-2','tycoon-3','tycoon-4']},
 {key:'materials',title:'养成材料特惠',keys:['enhance-sale-1','enhance-sale-2','enhance-sale-3']},
 {key:'training',title:'培养回馈',keys:['train-points','training-rank','training-missions','train-tasks']},
 {key:'breeding',title:'龙蛋培育',keys:Array.from({length:10},(_,i)=>`egg-event-${i+1}`)},
 {key:'wheel',title:'幸运抽奖',keys:Array.from({length:6},(_,i)=>`wheel-${i}`)},
 {key:'fire',title:'点燃圣火',keys:['fire-1','fire-2','fire-3','fire-4']},
 {key:'recharge-wheel',title:'充值转盘',keys:['recharge-wheel-1','recharge-wheel-2','recharge-wheel-3']},
 {key:'limited',title:'限时神龙',keys:['limited-1','limited-2','limited-3','limited-4','limited-5']},
]);
export const activityFamily=key=>ACTIVITY_FAMILIES.find(f=>f.key===key)??null;
export const activityFamilyEntries=key=>(activityFamily(key)?.keys??[]).map(k=>SOURCE.activities.find(d=>d.key===k));
// Keep distinct playable activities; retire overlapping historical versions from the menu.
export const ACTIVE_ACTIVITY_KEYS=Object.freeze(['first','growth','monthly-sign','seven-tasks','training-missions','train-points','egg-event-10','dragon-exchange','chest-exchange','collection','lucky-cat','wheel-5','limited-5','children-eggs','monopoly-3','daily-sale','month-card','cdkeys','single']);
export const ACTIVITY_CATALOG=Object.freeze(ACTIVE_ACTIVITY_KEYS.map(key=>SOURCE.activities.find(d=>d.key===key)));
export const RETIRED_ACTIVITY_KEYS=Object.freeze(SOURCE.activities.filter(d=>!ACTIVE_ACTIVITY_KEYS.includes(d.key)).map(d=>d.key));
