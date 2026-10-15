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
const owners=new Map(ACTIVITY_FAMILIES.flatMap(f=>f.keys.map(k=>[k,f])));
export const ACTIVITY_CATALOG=SOURCE.activities.flatMap(d=>{
 const family=owners.get(d.key);
 if(family&&family.keys[0]!==d.key)return [];
 return [{...d,...(family?{key:family.key,title:family.title,family:family.key}:{}),search:family?[family.title,...activityFamilyEntries(family.key).map(v=>v.title)].join(' '):d.title}];
});
