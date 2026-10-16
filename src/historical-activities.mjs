import SOURCE from '../assets/original/data/activities.mjs';
import {SPECIES,speciesKey,ORIGINAL_LEVELS} from './data.mjs';
import {gemDefinition} from './gems.mjs';
import {deliverLoot,lootProp,equipmentFragment} from './loot.mjs';
import {equipmentDefinition} from './equipment.mjs';
import {runeDefinition,runeIcon} from './runes.mjs';
import {vipInfo} from './vip.mjs';
export const obsoleteActivityPrize=p=>[12,13,30].includes(p.type)||(p.type===4&&[6025,6026,6027].includes(p.itemId));
// Preserve raw source IDs for existing claim records; retire obsolete reward rows.
export const HISTORICAL_ACTIVITIES=SOURCE.activities.map(d=>({...d,items:d.items.map(r=>({...r,rewards:r.rewards.filter(p=>!obsoleteActivityPrize(p))}))}));
export const visibleActivities=()=>HISTORICAL_ACTIVITIES.filter(d=>d.key!=='legacy-sign');
export const activityPropMeta=id=>SOURCE.items[id]??null;
export const activityGiftPack=id=>SOURCE.fixedPacks[id]??SOURCE.randomPacks[id]??null;
export const activityGiftBlock=id=>SOURCE.blockedPacks[id]?.reason??null;
export const activityDefinition=key=>HISTORICAL_ACTIVITIES.find(d=>d.key===key);
export const activityDay=now=>Math.floor((now+28800000)/86400000);
const integer=(x,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
export const createHistory=now=>({startedAt:now,days:[activityDay(now)],claims:{},counts:{},inventory:{},cards:{},boards:{},packets:{},eggs:{},revision:0,spent:0,paid:0,paidDays:{},pointsUsed:{},spentDays:{},bred:{},discovered:[],growth:false,last:[]});
export function validateHistory(s){const a=s.activities;a.history??={...createHistory(s.updatedAt),pendingStart:true};const h=a.history;h.spentDays??={};h.bred??={};if(h.pendingStart!==undefined&&typeof h.pendingStart!=='boolean')throw Error('活动开放状态无效。');
 if(!h||!integer(h.startedAt)||!Array.isArray(h.days)||h.days.length>40000||!h.days.every(v=>integer(v))||new Set(h.days).size!==h.days.length||!['revision','spent','paid'].every(k=>integer(h[k]))||typeof h.growth!=='boolean'||!Array.isArray(h.discovered)||h.discovered.some(k=>!SPECIES[k])||new Set(h.discovered).size!==h.discovered.length||!Array.isArray(h.last)||h.last.length>50)throw Error('历史活动进度无效。');
 for(const k of ['claims','counts','inventory','cards','boards','packets','eggs','paidDays','spentDays','bred','pointsUsed'])if(!h[k]||typeof h[k]!=='object'||Array.isArray(h[k]))throw Error('历史活动记录无效。');
 for(const [key,ids] of Object.entries(h.claims)){const d=activityDefinition(key);if(!d||!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!d.items.some(r=>r.id===id)))throw Error('活动奖励领取记录无效。');}
 for(const [key,n] of Object.entries(h.counts))if(!/^[a-z0-9-]+(?::[0-9]+)?$/.test(key)||!integer(n,0,1e9))throw Error('活动次数无效。');
 for(const [key,n] of Object.entries(h.inventory))if(!/^([0-9]|[12][0-9]|3[0-3]):-?[0-9]+$/.test(key)||!integer(n,0,1e9))throw Error('活动库存无效。');
 for(const record of [h.paidDays,h.spentDays])for(const [key,n] of Object.entries(record))if(!/^\d+$/.test(key)||!integer(n,0,1e9))throw Error('活动充值记录无效。');
 for(const [key,n] of Object.entries(h.bred))if(!SPECIES[speciesKey(Number(key))]||!integer(n,0,1e9))throw Error('活动龙蛋培育记录无效。');
 for(const [key,n] of Object.entries(h.pointsUsed))if(!['recharge-points','chest-exchange','train-points','train-tasks'].includes(key)||!integer(n))throw Error('活动积分无效。');
 for(const [key,c] of Object.entries(h.cards))if(!HISTORICAL_ACTIVITIES.find(d=>d.kind==='card'&&d.items.some(r=>String(r.id)===key))||!integer(c.end)||!Number.isSafeInteger(c.claimed)||c.claimed< -1)throw Error('月卡活动存档无效。');
 for(const [key,b] of Object.entries(h.boards)){const d=activityDefinition(key);if(d?.kind!=='board'||!integer(b.position,0,d.points.length-1)||!integer(b.rolls)||!integer(b.dice,0,6))throw Error('大富翁进度无效。');}
 for(const [key,p] of Object.entries(h.packets))if(!activityDefinition('red-packets').items.some(r=>String(r.id)===key)||!integer(p.left)||!integer(p.opens))throw Error('红包记录无效。');
 for(const [key,p] of Object.entries(h.eggs)){const r=activityDefinition('children-eggs').items.find(r=>String(r.id)===key);if(!r||!integer(p.hits,0,r.health))throw Error('砸蛋记录无效。');}
 for(const p of h.last)if(!p||!integer(p.type,0,33)||!Number.isSafeInteger(p.itemId)||!integer(p.amount,1,1e9))throw Error('活动结果无效。');
}
export function observeActivityDay(s,now){const h=s.activities.history,day=activityDay(now);if(h.pendingStart){h.startedAt=now;h.days=[];delete h.pendingStart;}if(!h.days.includes(day))h.days.push(day);for(const d of s.dragons)if(!h.discovered.includes(d.species))h.discovered.push(d.species);}
export function recordActivitySpend(s,amount){const h=s.activities?.history;if(h){h.spent+=amount;const day=h.days.at(-1);h.spentDays[day]=(h.spentDays[day]??0)+amount;}}
export function recordHistoryRecharge(s,product,now){const h=s.activities.history;h.paid+=product.priceYuan;const day=activityDay(now);h.paidDays[day]=(h.paidDays[day]??0)+product.gems;}
const held=(s,t,id)=>{const h=s.activities.history;if(t===1)return s.coins;if(t===2)return s.food;if(t===3)return s.gems;if(t===4)return [6047,6048,6049].includes(id)?s.raffle.tickets[id]??0:s.items[id]??0;if(t===9)return s.equipmentFragments[id]??0;if(t===19)return s.equipmentMaterials.stone;if(t===26)return s.equipmentMaterials.wing;if(t===27)return s.equipmentMaterials.crystal;if(t===28)return s.runeHunt.shenfu;return h.inventory[`${t}:${id}`]??0;};
export function activityPay(s,p){if(!p||!integer(p.amount,1,1e9))throw Error('活动费用无效。');if(held(s,p.type,p.itemId)<p.amount)throw Error(`${activityPrizeInfo(p).name}不足。`);const n=-p.amount,id=p.itemId,t=p.type,h=s.activities.history;if(t===1)s.coins+=n;else if(t===2)s.food+=n;else if(t===3){s.gems+=n;recordActivitySpend(s,p.amount);}else if(t===4){if([6047,6048,6049].includes(id))s.raffle.tickets[id]+=n;else s.items[id]+=n;}else if(t===9)s.equipmentFragments[id]+=n;else if([19,26,27].includes(t))s.equipmentMaterials[{19:'stone',26:'wing',27:'crystal'}[t]]+=n;else if(t===28)s.runeHunt.shenfu+=n;else h.inventory[`${t}:${id}`]+=n;}
export function activityDeliver(s,prizes){for(const p of prizes){if(obsoleteActivityPrize(p))continue;if(!integer(p.type,0,33)||!Number.isSafeInteger(p.itemId)||!integer(p.amount,1,1e9))throw Error('活动奖励无效。');const t=p.type,id=p.itemId;
 if([1,2,19,20,21,22].includes(t)||t===4&&lootProp(id)||t===8&&equipmentDefinition(id)||t===9&&equipmentFragment(id)){deliverLoot(s,[p]);continue;}
 if(t===4){if(!SOURCE.items[id])throw Error('活动道具定义缺失。');s.items[id]=(s.items[id]??0)+p.amount;continue;}
 if(t===3){s.gems+=p.amount;continue;}
 if(t===5){const species=SPECIES[speciesKey(id)];if(!species)throw Error('该奖励龙蛋资料未取得。');if(s.giftEggs.length+p.amount>200)throw Error('龙蛋仓库已满，请先处理已有龙蛋。');for(let i=0;i<p.amount;i++)s.giftEggs.push({id:s.nextId++,dragonId:id,quality:p.quality??species.quality,source:'activity'});continue;}
 if(t===26||t===27){s.equipmentMaterials[t===26?'wing':'crystal']+=p.amount;continue;}
 if(t===28){s.runeHunt.shenfu+=p.amount;continue;}
 if(t===23){s.arena.medals+=p.amount;continue;}
 if(t===29&&runeDefinition(id)){if(s.runes.length+p.amount>100)throw Error('符文背包已满。');for(let i=0;i<p.amount;i++)s.runes.push({id:`fw-${s.nextRuneId++}`,type:id,exp:0,dragonid:0});continue;}
 const k=`${t}:${id}`;s.activities.history.inventory[k]=(s.activities.history.inventory[k]??0)+p.amount;
}}
const unit=random=>{const v=random();if(!Number.isFinite(v)||v<0||v>=1)throw Error('随机值无效。');return v;};
function pick(items,random){const total=items.reduce((sum,r)=>sum+Math.max(0,r.weight??1),0);if(!total)throw Error('活动奖池无效。');let n=unit(random)*total;for(const r of items){n-=Math.max(0,r.weight??1);if(n<0)return r;}return items.at(-1);}
export function activityPrizeInfo(p){const t=p.type,id=p.itemId,d=t===9?equipmentFragment(id):t===8?equipmentDefinition(id):null,sp=t===5?SPECIES[speciesKey(id)]:null,r=t===29?runeDefinition(id):null,meta=SOURCE.items[id],names={0:'经验',1:'金币',2:'龙粮',3:'魔晶',7:'龙魂',13:'旧版宝石',19:'强化石',20:'初级龙珠',21:'中级龙珠',22:'高级龙珠',23:'竞技奖章',26:'羽翼',27:'水晶',28:'神符',30:'旧版符文碎片',31:'冒险岛入场券',32:'宝藏岛入场券',33:'金银岛入场券'};return {name:sp?sp.name+'龙蛋':d?.name??r?.name??(t===4?meta?.name:null)??((names[t]??'活动道具')+([7,13,30].includes(t)?` ${id}`:'')),image:sp?`assets/original/ui/thumbs_${sp.original}_0.png`:t===9&&d?`assets/original/ui/thumbs_${d.icon}.png`:t===8&&d?`assets/original/ui/thumbs_equip_${d.quality}_${d.part}.png`:r?runeIcon(r):t===4&&meta?.image?'assets/original/ui/'+meta.image:'assets/original/ui/'+({1:'ui_main_06.png',2:'ui_main_07.png',3:'ui_main_08.png',19:'resource_icon_80_qhs.png',20:'ui_main_10.png',21:'ui_main_11.png',22:'ui_main_12.png',26:'resource_icon_80_yuyi.png',27:'resource_icon_80_shuijing.png',31:'thumbs_store_t1_l.png',32:'thumbs_store_t2_l.png',33:'thumbs_store_t3_l.png'}[t]??'ui_common_DaoJuKuang1.png'),quality:p.quality??d?.quality??meta?.quality??1};}
export const activityToken=s=>String(s.activities.history.revision);
const visits=s=>s.activities.history.days.length;
function taskProgress(s,id){const h=s.activities.history;switch(id){case 1:return s.dragons.filter(d=>SPECIES[d.species].quality>=4).length;case 2:return s.gemInventory.filter(g=>(gemDefinition(g.type)?.quality??0)>=5).length;case 3:return Object.keys(s.adventure.cleared).length;case 4:return h.discovered.length;case 5:return s.equipment.some(e=>equipmentDefinition(e.type)?.quality===3&&(equipmentDefinition(e.type)?.grade??0)>=60)?1:0;case 6:return s.dragons.some(d=>(d.training?.stage??0)>=2)?1:0;case 7:return s.equipment.some(e=>equipmentDefinition(e.type)?.quality===5)?1:0;default:return 0;}}
export function trainingMissionProgress(s,r){const k=r.id<=3?'training-pills':r.id<=5?'training-perfect':r.id<=7?'training-failures':'training-purchased-pills';return s.activities.history.counts[k]??0;}
export function trainingMissionPoints(s){return activityDefinition('training-missions').items.reduce((total,r)=>total+(trainingMissionProgress(s,r)>=r.goal?r.points:0),0);}
export function activityRows(s,key,now=Date.now()){const d=activityDefinition(key);if(!d)throw Error('活动不存在。');const h=s.activities.history,day=activityDay(now),month=new Date(now+28800000).getUTCMonth()+1,claims=h.claims[key]??[],count=h.counts[key]??0;return d.items.filter(r=>(r.rewards.length||['trainingMission','springTask','eggs','cashback'].includes(d.kind))&&(d.kind!=='sign'||r.month===month)).map(r=>{let current=0,goal=r.goal??1,claimed=claims.includes(r.id),label='领取',ready=true,note='';
 switch(d.kind){
 case 'first':current=Math.min(1,s.recharge.count);note=current?'已完成首次充值':'首次充值后可领取一次';break;
 case 'cdkey':current=1;label='输入档案码';ready=false;note='本地档案码 YULONG-CDK-'+r.id;break;
 case 'springTask':current=r.id===9?(h.spentDays[day]??0):(h.counts[`spring-${day}-${r.id}`]??0);claimed=h.counts[`spring-claimed-${day}-${r.id}`]>=r.limit;ready=false;label=claimed?'已完成':'未完成';note=r.description+`；完成自动获得 ${r.coupons} 活动红包`+(r.id===4?'（对应挑战玩法尚未接通）':'');break;
 case 'trainingRank':current=h.counts['training-attempts']??0;ready=r.rankMin===1;note=`第${r.rankMin}${r.rankMax===r.rankMin?'':'～'+r.rankMax}名原奖励；当前本地单人榜，至少完成一次培养`;break;
 case 'eggEvent':current=r.mode===1?(h.counts['egg-points']??0):r.dragons.filter(id=>(h.bred[id]??0)>0).length;note=r.mode===1?`培育积分 ${current}/${goal}`:'培育记录：'+r.dragons.map(id=>activityPrizeInfo({type:5,itemId:id,amount:1}).name).join('、');break;
 case 'cashback':{const date=activityDay(h.startedAt)+r.id-1;current=h.spentDays[date]??0;ready=day>=activityDay(h.startedAt)+4&&day>=date+4;note=`第${r.id}日消费 ${current}，可返 ${Math.floor(current/10)} 魔晶；消费四日后可领`;r={...r,rewards:current>=10?[{type:3,itemId:-1,amount:Math.floor(current/10)}]:[]};break;}
 case 'growth':current=SOURCE_LEVEL(s);ready=h.growth;note=h.growth?'成长计划已购买':'需购买成长计划（488魔晶）';break;
 case 'login':current=visits(s);break;
 case 'sign':{const k=`sign-${new Date(now+28800000).getUTCFullYear()}-${month}`,n=h.counts[k]??0;current=n+1;ready=current===r.goal&&h.counts['signed-day']!==day;claimed=n>=r.goal;note=`本月已签 ${n} 天`;break;}
 case 'sevenTask':current=taskProgress(s,r.id);note=['','拥有紫色及以上的龙','拥有S级宝石','累计通关节点','收集龙种','拥有强化至60级的蓝装','任意一条龙培养至2阶','拥有橙色装备'][r.id];break;
 case 'paid':current=h.paid;note='本轮累计测试充值（元）';break;
 case 'spent':current=h.spent;note='本轮累计消费魔晶';break;
 case 'rechargeDays':{const ds=Object.values(h.paidDays).filter(n=>n>=50).length;current=r.super?ds:(h.paidDays[day]??0);ready=r.super?ds>=goal&&h.paid>=(r.paidGoal??0):ds>=r.day;note=r.super?`达标充值天数 ${ds}/${goal}${r.paidGoal?`；累计测试充值 ${h.paid}/${r.paidGoal} 元`:''}`:`第${r.day}个充值达标日；当日充值魔晶 ${current}/${goal}`;break;}
 case 'rechargeShop':current=h.paid;label='购买';ready=(h.paidDays[day]??0)>=goal&&h.counts[`${key}:${r.id}`]!==day;goal=1;current=1;note=`当日充值需达 ${r.goal} 魔晶，每项每日限购一次`;break;
 case 'purchase':current=1;label='购买';ready=(h.counts[`${key}:${r.id}`]??0)<(r.limit??1e9)&&visits(s)>=(r.day??1);note=r.limit?`剩余 ${Math.max(0,r.limit-(h.counts[`${key}:${r.id}`]??0))} 次`:'';break;
 case 'exchange':current=held(s,r.cost.type,r.cost.itemId);goal=r.cost.amount;label='兑换';claimed=false;break;
 case 'pointShop':current=Math.floor(h.paid)-(h.pointsUsed[key]??0);label='兑换';claimed=false;break;
 case 'chestShop':current=s.loot.boxesOpened*10-(h.pointsUsed[key]??0);label='兑换';claimed=false;break;
 case 'trainShop':current=(h.counts['source-training-points']??0)-(h.pointsUsed[key]??0);label='兑换';note=`累计培养积分 ${h.counts['source-training-points']??0}`;break;
 case 'trainTask':current=trainingMissionPoints(s);label='领取';note=`任务积分 ${current}/${goal}，达标奖励各领一次，不扣除积分`;break;
 case 'collection':current=r.conditionType===2?s.equipment.filter(e=>e.type===r.dragon).length:s.dragons.filter(d=>SPECIES[d.species]?.originalId===r.dragon).length;note='拥有'+activityPrizeInfo({type:r.conditionType===2?8:5,itemId:r.dragon,amount:1}).name;break;
 case 'trainingMission':current=trainingMissionProgress(s,r);claimed=current>=goal;ready=false;label=claimed?'已完成':'未完成';note=r.description??'培养任务';break;
 case 'purple':current=r.fragments.reduce((sum,id)=>sum+(s.equipmentFragments[id]??0),0);note='消耗对应装备碎片';label='兑换';claimed=false;break;
 case 'cat':current=1;ready=r.id===count+1;label='招财';note=`返还 ${r.rewards[0].amount}～${r.max} 魔晶`;break;
 case 'card':{const c=h.cards[r.id];current=1;claimed=false;ready=true;label=c&&c.end>day?'领取':'测试购买';if(c&&c.end>day){ready=c.claimed!==day;note=`剩余 ${c.end-day} 天，每日 ${r.rewards[0].amount} 魔晶`;}else note=`测试购买 ${r.priceYuan} 元，30天；不扣真实费用`;break;}
 case 'packet':current=1;claimed=false;label=h.packets[r.id]?.left?'拆红包':'包红包';note=h.packets[r.id]?.left?`剩余 ${h.packets[r.id].left} 魔晶`:`封入 ${r.cost.amount} 魔晶`;break;
 case 'dailySale':current=r.category===1?1:(h.paidDays[day]??0);goal=r.category===1?1:50;claimed=h.counts[`${key}:${r.id}`]===day;note=r.category===1?'每日登录奖励':'当日测试充值50魔晶可领；离线资格';break;
 default:current=1;claimed=false;label='查看';
 }
 if(['pointShop','chestShop','trainShop'].includes(d.kind)&&r.limit>0&&(h.counts[`${key}:${r.id}`]??0)>=r.limit){ready=false;note='已达到兑换上限';}
 return {...r,current,goal,claimed,label,ready:ready&&current>=goal&&!claimed,note};});}
// Kept separate to avoid importing game.mjs back into its own rule module.
const SOURCE_LEVEL=s=>ORIGINAL_LEVELS.findLast(r=>r.xp_required<=s.playerXp)?.level??1;
export function historyAction(s,p,now,random=Math.random){const d=activityDefinition(p.key),h=s.activities.history;if(!d)throw Error('活动不存在。');if(p.token!==activityToken(s))throw Error('活动状态已变化，请重新操作。');observeActivityDay(s,now);const day=activityDay(now),count=h.counts[d.key]??0;let rewards=[],message='';
 if(d.kind==='springTask')throw Error('任务完成后红包自动到账；HARD任务需对应挑战玩法。');
 if(d.kind==='trainingMission')throw Error('任务达标后积分自动累计，请到领取奖励页领取。');
 if(d.kind==='cdkey'){const match=String(p.code??'').trim().toUpperCase().match(/^YULONG-CDK-([1-9][0-9]?)$/),r=match&&d.items.find(r=>r.id===Number(match[1]));if(!r)throw Error('本地档案码无效。');if((h.claims[d.key]??[]).includes(r.id))throw Error('该档案码已经使用。');rewards=r.rewards;(h.claims[d.key]??=[]).push(r.id);message='本地档案码兑换成功。';}
 else if(p.op==='rankClaim'){if(d.kind!=='limited'||count*10<200)throw Error('至少200积分才可领取本地排名奖励。');if((h.claims[d.key]??[]).includes(1))throw Error('本轮排名奖励已领取。');rewards=d.items.find(r=>r.id===1).rewards;(h.claims[d.key]??=[]).push(1);message='领取本地第一名奖励；无真人排名。';}
 else if(p.op==='growthBuy'){if(d.kind!=='growth'||h.growth)throw Error('成长计划已购买或操作无效。');activityPay(s,{type:3,itemId:-1,amount:d.unlockCost});h.growth=true;message='成长计划已购买。';}
 else if(['draw','rechargeDraw','springDraw','limited','board'].includes(d.kind)){
  if(![1,10,50].includes(p.count??1))throw Error('抽取次数无效。');const n=p.count??1;
  if(d.kind==='board'){
   if(n!==1)throw Error('每次只能掷一枚骰子。');const ticket={type:d.entryType,itemId:-1,amount:1};if(held(s,ticket.type,-1))activityPay(s,ticket);else activityPay(s,{type:3,itemId:-1,amount:d.entryGems});const b=h.boards[d.key]??={position:0,rolls:0,dice:0};b.dice=1+Math.floor(unit(random)*6);b.position=(b.position+b.dice)%d.points.length;b.rolls++;const tile=d.tiles[b.position%d.tiles.length],index=d.entryType-31,pool=tile[2+index*2],items=d.items.filter(r=>r.pool===pool);const r=pick(items.length?items:d.items,random),prize={...r.rewards[0]};if(r.max>prize.amount)prize.amount+=Math.floor(unit(random)*(r.max-prize.amount+1));rewards=[prize];message=`掷出 ${b.dice} 点，到达第 ${b.position+1} 格。`;
  }else if(d.kind==='limited'){
   activityPay(s,{type:3,itemId:-1,amount:n===10?d.tenPrice:d.price*n});for(let i=0;i<n;i++)rewards.push(...pick(d.simulation,random).rewards);message=`神龙召唤 ${n} 次。`;
  }else{
   if(d.kind==='rechargeDraw'){const used=h.counts[d.key]??0;if(n!==1||Math.floor(h.paid/d.goal)<=used)throw Error(`本轮每充值 ${d.goal} 元增加一次抽取机会。`);}
   else if(d.kind==='springDraw'&&p.op==='couponDraw'){const cost=d.couponCosts[n];if(!cost)throw Error('请选择红包单抽或十抽。');if((h.counts['spring-coupons']??0)<cost)throw Error('活动红包不足，请完成春节任务。');h.counts['spring-coupons']-=cost;}
   else{const free=d.freeDaily&&n===1&&h.counts['free-'+d.key]!==day;const price=free?0:n===10&&d.tenPrice?d.tenPrice:n===50&&d.fiftyPrice?d.fiftyPrice:d.price*n;if(price)activityPay(s,{type:3,itemId:-1,amount:price});if(free)h.counts['free-'+d.key]=day;}
   for(let i=0;i<n;i++)rewards.push(...pick(d.items,random).rewards);message=`抽取 ${n} 次。`;
  }h.counts[d.key]=count+n;
 }else if(d.kind==='eggs'&&p.op==='buyEgg'){const r=d.items.find(r=>r.id===p.id);if(!r)throw Error('金蛋不存在。');activityPay(s,{type:3,itemId:-1,amount:r.price});rewards=[{type:4,itemId:r.prop,amount:1}];message='已购买一枚砸蛋道具。';}
 else if(d.kind==='eggs'){
  const r=d.items.find(r=>r.id===p.id);if(!r)throw Error('金蛋不存在。');const e=h.eggs[r.id]??={hits:0};activityPay(s,{type:4,itemId:r.prop,amount:1});e.hits++;if(e.hits>=r.health){const prize=pick(r.pools,random);rewards=[{type:prize.type,itemId:prize.itemId,amount:prize.min+Math.floor(unit(random)*(prize.max-prize.min+1))}];e.hits=0;}message=`击打金蛋，进度 ${e.hits}/${r.health}${rewards.length?'，已获得奖励':''}。`;
 }else{
  const r=activityRows(s,d.key,now).find(r=>r.id===p.id);if(!r)throw Error('活动条目不存在。');if(!r.ready)throw Error(r.claimed?'该奖励已领取。':r.note||'尚未达成活动条件。');rewards=r.rewards.map(p=>({...p}));
  if(r.cost&&!(d.kind==='packet'&&h.packets[r.id]?.left))activityPay(s,r.cost);
  if(d.kind==='cat'){rewards[0].amount+=Math.floor(unit(random)*(r.max-rewards[0].amount+1));h.counts[d.key]=r.id;}
  else if(d.kind==='card'){const c=h.cards[r.id];if(c&&c.end>day){c.claimed=day;if(r.id===116)recordSpringTask(s,8,1,now);}else{h.cards[r.id]={end:day+r.days,claimed:day-1};rewards=[];message='测试购买成功，可领取今日奖励；未扣真实费用。';}}
  else if(d.kind==='packet'){const packet=h.packets[r.id];if(packet?.left){const amount=Math.min(packet.left,r.min+Math.floor(unit(random)*(r.max-r.min+1)));packet.left-=amount;packet.opens++;rewards=[{type:3,itemId:-1,amount}];message=`拆出 ${amount} 魔晶，红包余款 ${packet.left}。`;}else{h.packets[r.id]={left:r.cost.amount,opens:0};rewards=[];message='已将魔晶封入本地红包。';}}
  else if(d.kind==='sign'){const month=new Date(now+28800000).getUTCMonth()+1;h.counts[`sign-${new Date(now+28800000).getUTCFullYear()}-${month}`]=r.goal;h.counts['signed-day']=day;if(r.double&&vipInfo(s).level>=r.vip)rewards.forEach(p=>p.amount*=2);}
  else if(d.kind==='dailySale')h.counts[`${d.key}:${r.id}`]=day;
  else if(['purchase','exchange','pointShop','chestShop','trainShop','purple','rechargeShop'].includes(d.kind)){
   if(['pointShop','chestShop','trainShop'].includes(d.kind)){h.pointsUsed[d.key]=(h.pointsUsed[d.key]??0)+r.goal;if(r.limit>0&&(h.counts[`${d.key}:${r.id}`]??0)>=r.limit)throw Error('该条目已达到兑换上限。');}
   if(d.kind==='purple'){let left=r.goal;for(const id of r.fragments){const n=Math.min(left,s.equipmentFragments[id]??0);s.equipmentFragments[id]=(s.equipmentFragments[id]??0)-n;left-=n;}}
   h.counts[`${d.key}:${r.id}`]=d.kind==='rechargeShop'?day:(h.counts[`${d.key}:${r.id}`]??0)+1;
  }else{(h.claims[d.key]??=[]).push(r.id);}
 }
 activityDeliver(s,rewards);const merged=new Map();for(const prize of rewards){const k=`${prize.type}:${prize.itemId}`,old=merged.get(k);if(old)old.amount+=prize.amount;else merged.set(k,{...prize});}h.last=[...merged.values()].slice(-50);h.revision++;return message||'奖励已领取，已保存到本地存档。';
}

export function settleSpringTaskCoupons(s,now){const h=s.activities.history,day=activityDay(now);for(const r of activityDefinition('spring-tasks').items){if(r.id===4)continue;const n=r.id===9?(h.spentDays[day]??0):(h.counts[`spring-${day}-${r.id}`]??0),earned=Math.min(r.limit,Math.floor(n/r.goal)),k=`spring-claimed-${day}-${r.id}`,already=h.counts[k]??0;if(earned>already){h.counts['spring-coupons']=(h.counts['spring-coupons']??0)+(earned-already)*r.coupons;h.counts[k]=earned;}}}
export function recordActivityBreed(s,id){const h=s.activities.history;h.bred[id]=(h.bred[id]??0)+1;const r=SOURCE.eggPoints.find(r=>r[1]===id);if(r)h.counts['egg-points']=(h.counts['egg-points']??0)+r[3];}
export function recordSpringTask(s,id,count=1,now=s.updatedAt){const h=s.activities.history,k=`spring-${activityDay(now)}-${id}`;h.counts[k]=(h.counts[k]??0)+count;}
export function openActivityGift(s,id,random=Math.random){const pack=activityGiftPack(id);if(!pack)throw Error(activityGiftBlock(id)??'该礼包尚无确定的固定内容。');activityPay(s,{type:4,itemId:id,amount:1});const rewards=pack.rewards??pack.groups.map(group=>{const row=pick(group,random);return {type:row.type,itemId:row.itemId,amount:row.amount+Math.floor(unit(random)*(row.max-row.amount+1))};});activityDeliver(s,rewards);s.activities.history.last=structuredClone(rewards);s.activities.history.revision++;return '礼包已打开，奖励已发放到对应库存。';}
