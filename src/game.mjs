import {LOTTERY_POLICY,LOTTERY_CAPACITY,lotteryRow,lotteryCost,sampleLottery} from './lottery.mjs';
import {SPECIES, RULES, RECIPES, ORIGINAL_CROPS, ORIGINAL_LEVELS, ORIGINAL_FARMS, breedingOptions, speciesKey} from './data.mjs';
import {habitatDefinition,habitatInfo,acceptsDragon,habitatLimit,habitatPosition,snapHabitatPosition,canPlaceHabitat,canPlaceObject} from './habitats.mjs';
import {structureDefinition,structureInfo,structurePosition} from './structures.mjs';
import {EQUIPMENT_INSTANCE_ID,equipmentDefinition,definitionPart,equipmentInstance,equipmentOfDragon,equipmentInPart,equipmentLabel} from './equipment.mjs';
import {RAFFLE_POLICY,RAFFLE_CAPACITY,RAFFLE_GUARANTEE_DRAWS,raffleMachine,raffleCost,sampleRaffle,advanceRaffleCounter} from './raffle.mjs';
import {EXPANSION_POLICY,EXPANSION_PAID_STEPS,nextExpansion} from './expansion.mjs';
import {rechargeProduct,rechargeDelivery,rechargeProductIds} from './recharge.mjs';
import {resourceShopRow,EVOLUTION_FRUIT_ITEM_ID} from './resource-shop.mjs';
const fail = message => {throw new Error(message)};
const number = (v,min=0,max=Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(v)&&v>=min&&v<=max;
export function createGame(now=Date.now()) {
 return {version:11,structures:[],lottery:{normalTokens:0,advancedTokens:0,draws:0,pending:[]},raffle:{tickets:{},counters:{junior:0,mid:0,senior:0},pending:[]},expansion:{plots:0},items:{},recharge:{count:0,lastTier:0,totalGems:0,doubled:[]},equipment:[],nextEquipId:1,coins:1200,food:400,gems:0,playerXp:0,nextId:4,updatedAt:now,habitats:[{id:1,name:'晨曦栖息地',lastCollected:now}],dragons:[{id:2,species:'ember',level:1,habitatId:1},{id:3,species:'leaf',level:1,habitatId:1}],farm:null,nest:null,breeding:null,incubator:null,stats:{harvests:0,hatches:0,feeds:0},log:['欢迎来到云上牧场。种下第一份龙粮吧。']};
}
export function validate(s) {
 if(!s||![1,2,3,4,5,6,7,8,9,10,11].includes(s.version)) fail('存档版本不受支持，请保留原文件。');
 s=structuredClone(s);if(s.gems===undefined)s.gems=0;if(s.playerXp===undefined)s.playerXp=0;
 if(s.version<4){if(s.nest){if(s.breeding||s.incubator)fail('旧存档繁殖任务冲突。');if(s.nest.phase==='hatching')s.incubator=s.nest;else s.breeding=s.nest;}s.nest=null;}
 if(s.nest!==null)fail('旧繁殖任务未迁移。');
 s.breeding??=null;s.incubator??=null;if(s.version<5)s.lottery??={normalTokens:0,advancedTokens:0,draws:0,pending:[]};
 if(s.version<6){s.equipment??=[];s.nextEquipId??=1;}
 s.equipment??=[];s.nextEquipId??=1;
 if(s.version<7)s.raffle??={tickets:{},counters:{junior:0,mid:0,senior:0},pending:[]};
 s.raffle??={tickets:{},counters:{junior:0,mid:0,senior:0},pending:[]};
 if(s.version<8)s.expansion??={plots:0};
 s.expansion??={plots:0};
 if(s.version<9){s.items??={};s.recharge??={count:0,lastTier:0};}
 s.items??={};s.recharge??={count:0,lastTier:0};
 if(s.version<10){s.recharge.totalGems??=0;s.recharge.doubled??=[];}
 if(s.version<11)s.structures??=[];
 s.structures??=[];
 s.recharge.totalGems??=0;s.recharge.doubled??=[];
 if(!number(s.coins)||!number(s.food)||!number(s.nextId,1)||!number(s.updatedAt)) fail('存档资源或时间无效。');
 if(s.gems!==undefined&&!number(s.gems)||s.playerXp!==undefined&&!number(s.playerXp))fail('牧场经验或魔晶无效。');
 if(!Array.isArray(s.dragons)||s.dragons.length<2||s.dragons.length>1000||!Array.isArray(s.habitats)||s.habitats.length<1||s.habitats.length>1000) fail('存档牧场无效。');
 const ids=new Set();
 for(const h of s.habitats){if(!number(h.id,1)||ids.has(h.id)||typeof h.name!=='string'||h.name.length>40||!number(h.lastCollected)||(h.storedCoins!==undefined&&(!Number.isFinite(h.storedCoins)||h.storedCoins<0||h.storedCoins>Number.MAX_SAFE_INTEGER))) fail('栖息地数据无效。');ids.add(h.id);
  if(h.buildingId!==undefined&&!habitatDefinition(h.buildingId))fail('栖息地类型无效。');
  if(h.position!==undefined&&(!Array.isArray(h.position)||h.position.length!==2||!h.position.every(v=>Number.isFinite(v)&&v>=10&&v<=90)))fail('栖息地位置无效。');
  if(h.job!==undefined&&h.job!==null){const j=h.job,target=habitatDefinition(j.targetId);if(!target||!['build','upgrade'].includes(j.kind)||!number(j.startedAt)||!number(j.readyAt)||j.readyAt<j.startedAt||j.kind==='build'&&j.targetId!==h.buildingId||j.kind==='upgrade'&&target.id!==habitatInfo(h).upgrades_to)fail('栖息地建造计时无效。');}
 }
 if(!Array.isArray(s.structures)||s.structures.length>1000)fail('建筑存档无效。');
 for(const structure of s.structures){const info=structureInfo(structure);if(!number(structure.id,1)||ids.has(structure.id)||!info)fail('建筑记录无效。');ids.add(structure.id);if(!Array.isArray(structure.position)||structure.position.length!==2||!structure.position.every(Number.isFinite))fail('建筑位置无效。');if(structure.readyAt!==undefined&&!number(structure.readyAt))fail('建筑计时无效。');}
 for(const d of s.dragons){if(!number(d.id,1)||ids.has(d.id)||!Object.hasOwn(SPECIES,d.species)||!number(d.level,1,RULES.maxLevel)||!s.habitats.some(h=>h.id===d.habitatId)) fail('龙数据无效。');ids.add(d.id);}
 for(const d of s.dragons)if(!acceptsDragon(s.habitats.find(h=>h.id===d.habitatId),d.species))fail('龙与栖息地属性不匹配。');
 const lottery=s.lottery;if(!lottery||!number(lottery.normalTokens)||!number(lottery.advancedTokens)||!number(lottery.draws)||!Array.isArray(lottery.pending)||lottery.pending.length>LOTTERY_CAPACITY||lottery.draws<lottery.pending.length)fail('抽奖存档无效。');
 for(const prize of lottery.pending){const row=lotteryRow(prize.sourceRow);if(!row||!number(prize.id,1)||ids.has(prize.id)||prize.mode!==row.mode||prize.type!==row.type||prize.itemId!==row.itemId||prize.policy!==LOTTERY_POLICY||!number(prize.amount,row.min,row.max)||prize.type===16&&!SPECIES[speciesKey(prize.itemId)])fail('抽奖奖励记录无效。');ids.add(prize.id);}
 const raffle=s.raffle;if(!raffle||!raffle.tickets||typeof raffle.tickets!=='object'||Array.isArray(raffle.tickets)||!raffle.counters||!Array.isArray(raffle.pending)||raffle.pending.length>RAFFLE_CAPACITY)fail('扭蛋机存档无效。');
 for(const key of ['junior','mid','senior'])if(!number(raffle.counters[key]??0,0,RAFFLE_GUARANTEE_DRAWS))fail('扭蛋机保底计数无效。');
 for(const [key,value] of Object.entries(raffle.tickets))if(!['6047','6048','6049'].includes(key)||!number(value,0,1e9))fail('扭蛋机票券无效。');
 for(const prize of raffle.pending){if(!number(prize.id,1)||ids.has(prize.id)||prize.policy!==RAFFLE_POLICY||!raffleMachine(prize.machine)||!number(prize.dragonId,1)||!number(prize.quality,1,5)||!number(prize.previewIndex,1))fail('扭蛋机奖励记录无效。');if(!raffleMachine(prize.machine).qualities.includes(prize.quality))fail('扭蛋机奖励与该机器奖池不符。');ids.add(prize.id)}
 if(s.nextId<=Math.max(...ids)) fail('存档编号冲突。');
 if(!s.expansion||!number(s.expansion.plots,0,EXPANSION_PAID_STEPS))fail('岛屿扩建存档无效。');
 if(!s.items||typeof s.items!=='object'||Array.isArray(s.items))fail('道具库存无效。');
 for(const [key,value] of Object.entries(s.items))if(!/^[0-9]+$/.test(key)||!number(value,0,1e9))fail('道具库存记录无效。');
 if(!s.recharge||!number(s.recharge.count,0,1e9)||!number(s.recharge.lastTier,0,1e9))fail('充值记录无效。');
 if(!number(s.recharge.totalGems,0,1e15))fail('累计充值魔晶无效。');
 if(!Array.isArray(s.recharge.doubled)||s.recharge.doubled.length>rechargeProductIds().length||new Set(s.recharge.doubled).size!==s.recharge.doubled.length)fail('首充双倍记录无效。');
 for(const id of s.recharge.doubled)if(!rechargeProduct(id))fail('首充双倍记录包含未知档位。');
 if(!Array.isArray(s.equipment)||s.equipment.length>2000||!number(s.nextEquipId,1,1e6))fail('装备库存无效。');
 const equipped=new Set(),equipmentIds=new Set();
 for(const item of s.equipment){
  if(!item||typeof item.id!=='string'||!EQUIPMENT_INSTANCE_ID.test(item.id)||equipmentIds.has(item.id))fail('装备实例编号无效或重复。');
  equipmentIds.add(item.id);
  const serial=Number(item.id.slice(3));
  if(serial>=s.nextEquipId)fail('装备实例编号与计数器不一致。');
  const definition=equipmentDefinition(item.type);if(!definition)fail('装备定义编号无效。');
  if(!number(item.exp,0,1e9)||!number(item.star,0,5)||!Array.isArray(item.randinfo)||item.randinfo.length>8)fail('装备实例数值无效。');
  for(const trait of item.randinfo)if(!trait||!number(trait.traitid,1))fail('装备随机属性无效。');
  if(!number(item.dragonid))fail('装备所属龙编号无效。');
  if(item.dragonid){if(!s.dragons.some(d=>d.id===item.dragonid))fail('装备所属的龙不存在。');const key=item.dragonid+':'+definitionPart(item);if(equipped.has(key))fail('同一部位不能同时装备两件装备。');equipped.add(key);}
 }
 for(const h of s.habitats)if(s.dragons.filter(d=>d.habitatId===h.id).length>habitatInfo(h).capacity)fail('栖息地超过容量。');
 if(s.dragons.some(d=>d.feedsInLevel!==undefined&&!number(d.feedsInLevel,0,3)))fail('喂养进度无效。');
 if(s.farmBuildingId!==undefined&&![16,17,18].includes(s.farmBuildingId))fail('农场等级无效。');
 if(s.farmUpgrade!==undefined&&s.farmUpgrade!==null&&(![17,18].includes(s.farmUpgrade.targetId)||s.farmUpgrade.targetId!==(s.farmBuildingId??16)+1||!number(s.farmUpgrade.readyAt)||s.farm!==null))fail('农场升级数据无效。');
 if(s.farm!==null&&(!s.farm||!number(s.farm.readyAt)||(s.farm.cropId!==undefined&&!unlockedCrops(s).some(c=>c.id===s.farm.cropId))))fail('农场计时无效。');
 for(const [job,phases] of [[s.breeding,['breeding','egg']],[s.incubator,['hatching']]]){if(job===null)continue;const n=job;if(n?.startedAt!==undefined&&(!number(n.startedAt)||n.startedAt>n.readyAt))fail('繁殖起始时间无效。');if(n?.hatchMs!==undefined&&!number(n.hatchMs,0,365*86400000))fail('孵化时间无效。');if(!n||!phases.includes(n.phase)||!Object.hasOwn(SPECIES,n.species)||!number(n.readyAt))fail('繁殖或孵化数据无效。');if(n.source==='raffle'){if(!Array.isArray(n.parents)||n.parents.length)fail('扭蛋龙蛋不应带亲代。')}else if(!Array.isArray(n.parents)||n.parents.length!==2||n.parents[0]===n.parents[1]||!n.parents.every(id=>s.dragons.some(d=>d.id===id)))fail('繁殖或孵化数据无效。');}
 if(!s.stats||!['harvests','hatches','feeds'].every(k=>number(s.stats[k]))) fail('统计数据无效。');
 if(!Array.isArray(s.log)||s.log.length>12||!s.log.every(x=>typeof x==='string'&&x.length<=200))fail('日志数据无效。');
 return {...structuredClone(s),version:11};
}
export function dragonRate(d){const species=SPECIES[d.species];if(!species.originalId)return species.income*d.level*60;return d.level<=10?species.coinStart+species.coinAdded*(d.level-1):species.coinStart+species.coinAdded*9+Math.floor(species.coinAdded*(d.level-10)/2)}
function rawIncome(s,h,now){const cap=habitatInfo(h).maxGold*60000;let units=Math.round((h.storedCoins??0)*60000);const start=Math.min(now,h.lastCollected);for(const d of s.dragons.filter(d=>d.habitatId===h.id)){let elapsed=Math.max(0,now-start);const n=s.breeding;if(n?.phase==='breeding'&&n.parents.includes(d.id)){const breedStart=n.startedAt??n.readyAt-(SPECIES[n.species].breedingMs??RULES.breedMs);elapsed-=Math.max(0,Math.min(now,n.readyAt)-Math.max(start,breedStart));}units=Math.min(cap,units+Math.min(cap,Math.max(0,elapsed)*dragonRate(d)));}return Math.min(cap,units)/60000}
export function income(s,h,now=Date.now()){return Math.floor(rawIncome(s,h,now))}
export function isBreedingParent(s,id,now=Date.now()){return !!(s.breeding?.phase==='breeding'&&s.breeding.parents.includes(id)&&now<s.breeding.readyAt)}
export function feedCost(d){return d.level<10?5*2**(d.level-1):2000+500*(d.level-10)}
export function incubatorSpeedCost(readyAt,now=Date.now()){const seconds=Math.max(0,Math.ceil((readyAt-now)/1000));return seconds?Math.ceil(((seconds/3600)**.7)*15):0}
export function dragonSellGold(species){const value=SPECIES[species]?.sellGold;if(!number(value))fail('该龙的原版出售价格尚未取得。');return value}
export function playerProgress(s){const xp=s.playerXp??0;const current=ORIGINAL_LEVELS.findLast(level=>level.xp_required<=xp)??ORIGINAL_LEVELS[0],next=ORIGINAL_LEVELS.find(level=>level.level===current.level+1);return {level:current.level,xp,percent:next?Math.floor((xp-current.xp_required)/(next.xp_required-current.xp_required)*100):100}}
export function farmInfo(s){return ORIGINAL_FARMS.find(f=>f.id===(s.farmBuildingId??16))}
export function unlockedCrops(s){return ORIGINAL_CROPS.slice(0,((s.farmBuildingId??16)-15)*3)}
function awardPlayerXp(s,xp){const before=playerProgress(s).level;s.playerXp=(s.playerXp??0)+xp;const after=playerProgress(s).level;for(const level of ORIGINAL_LEVELS.filter(level=>level.level>before&&level.level<=after)){const resource={c:'gems',g:'coins',f:'food'}[level.reward_type];if(resource)s[resource]=(s[resource]??0)+level.reward_amount}}
export function action(state,type,payload={},now=Date.now(),random=Math.random) {
 const s=validate(state); now=Math.max(now,s.updatedAt); let message='';
 const spend=(key,cost)=>{if(s[key]<cost)fail(key==='coins'?'金币不足。':key==='gems'?'魔晶不足。':'龙粮不足，请先种植并收获。');s[key]-=cost;};
 const payBuilding=target=>{for(const [unit,cost] of Object.entries(target.costs)){const key={g:'coins',c:'gems',f:'food'}[unit];if(!key)fail('该建筑资源类型尚未支持。');spend(key,cost);}};
 const placeables=()=>[...s.habitats.map((h,i)=>({key:`h:${h.id}`,info:habitatInfo(h),position:habitatPosition(h,i)})),...s.structures.map((o,i)=>({key:`s:${o.id}`,info:structureInfo(o),position:structurePosition(o,i)}))];
 const dragon=id=>s.dragons.find(d=>d.id===id)||fail('找不到这只龙。');
 const settle=h=>{h.storedCoins=rawIncome(s,h,now);h.lastCollected=now;};
 switch(type){
 case 'lotteryDraw': {const mode=payload.mode,count=payload.count;if(s.lottery.pending.length+count>LOTTERY_CAPACITY)fail('抽奖待领取栏最多30格，请先领取或安置。');const cost=lotteryCost(s.lottery,mode,count);spend('gems',cost.gems);s.lottery[cost.tokenKey]-=cost.tokens;for(let i=0;i<count;i++)s.lottery.pending.push({id:s.nextId++,...sampleLottery(mode,random)});s.lottery.draws+=count;message=`离线基础抽奖 ${count} 次，奖励已保存至待领取栏。`;break;}
 case 'lotteryClaimResources': {const prizes=s.lottery.pending.filter(prize=>prize.type!==16);if(!prizes.length)fail('没有待领取的资源奖励。');for(const prize of prizes){const key={1:'coins',2:'food',3:'gems'}[prize.type];if(!key)fail('该奖励类型尚未支持。');s[key]+=prize.amount;}s.lottery.pending=s.lottery.pending.filter(prize=>prize.type===16);message=`已领取 ${prizes.length} 份资源奖励，幼龙继续保留。`;break;}
 case 'lotteryPlace': {const prize=s.lottery.pending.find(prize=>prize.id===payload.id&&prize.type===16)||fail('找不到待安置幼龙。');const h=s.habitats.find(h=>h.id===payload.habitatId)||fail('请选择栖息地。'),species=speciesKey(prize.itemId);if(!acceptsDragon(h,species))fail('栖息地尚未完工或元素不适合。');if(s.dragons.filter(d=>d.habitatId===h.id).length>=habitatInfo(h).capacity)fail('栖息地已满，抽到的幼龙仍保留。');settle(h);s.dragons.push({id:prize.id,species,level:1,habitatId:h.id});s.lottery.pending=s.lottery.pending.filter(p=>p.id!==prize.id);message=`${SPECIES[species].name}已入住栖息地。`;break;}
 case 'plant': {if(s.farmUpgrade)fail('农场正在升级，请完成后种植。');if(s.farm)fail('已有作物在生长，请先收获。');const crop=unlockedCrops(s).find(c=>c.id===(payload.cropId??1))||fail('该作物需要升级农场。');spend('coins',crop.cost);s.farm={readyAt:now+crop.ms,cropId:crop.id};message=`已种下${crop.name}。`;break;}
 case 'upgradeFarm': {if(s.farm||s.farmUpgrade)fail('请先完成当前种植或升级。');const target=ORIGINAL_FARMS.find(f=>f.id===farmInfo(s).upgrades_to)||fail('当前农场已达到最高等级。');if(playerProgress(s).level<target.min_level)fail(`升级需要牧场等级 ${target.min_level}。`);spend('coins',target.costs.g);s.farmUpgrade={targetId:target.id,readyAt:now+target.build_time*1000};message='农场升级开始。';break;}
 case 'completeFarmUpgrade': {if(!s.farmUpgrade||now<s.farmUpgrade.readyAt)fail('农场升级尚未完成。');const target=ORIGINAL_FARMS.find(f=>f.id===s.farmUpgrade.targetId);s.farmBuildingId=target.id;s.farmUpgrade=null;awardPlayerXp(s,target.xp);message=`${target.nameCN}升级完成，新作物已解锁。`;break;}
 case 'harvest': {if(!s.farm||now<s.farm.readyAt)fail('龙粮还未成熟。');const yieldValue=s.farm.cropId?ORIGINAL_CROPS.find(c=>c.id===s.farm.cropId).yield:90;s.food+=yieldValue;if(s.farm.cropId)awardPlayerXp(s,ORIGINAL_CROPS.find(c=>c.id===s.farm.cropId).xp);s.farm=null;s.stats.harvests++;message=`收获 ${yieldValue} 份龙粮。`;break;}
 case 'feed': {const d=dragon(payload.id);if(isBreedingParent(s,d.id,now))fail('亲代正在培育山，请等待繁殖完成。');if(d.level>=RULES.maxLevel)fail('已达到原型等级上限。');spend('food',feedCost(d));settle(s.habitats.find(h=>h.id===d.habitatId));d.feedsInLevel=(d.feedsInLevel??0)+1;s.stats.feeds++;if(d.feedsInLevel>=RULES.feedsPerLevel){d.level++;d.feedsInLevel=0;message=`${SPECIES[d.species].name} 升至 ${d.level} 级。`;}else message=`${SPECIES[d.species].name} 喂养进度 ${d.feedsInLevel}/${RULES.feedsPerLevel}。`;break;}
 case 'feedAll': {const d=dragon(payload.id);if(isBreedingParent(s,d.id,now))fail('亲代正在培育山，请等待繁殖完成。');if(d.level>=RULES.maxLevel)fail('已达到原型等级上限。');settle(s.habitats.find(h=>h.id===d.habitatId));const start=d.level;let feeds=0;while(d.level<RULES.maxLevel&&s.food>=feedCost(d)){s.food-=feedCost(d);d.feedsInLevel=(d.feedsInLevel??0)+1;s.stats.feeds++;feeds++;if(d.feedsInLevel>=RULES.feedsPerLevel){d.level++;d.feedsInLevel=0;if(d.level>start)break;}}if(!feeds)fail('龙粮不足，请先种植并收获。');message=d.level>start?`${SPECIES[d.species].name} 一键喂养 ${feeds} 次，升至 ${d.level} 级。`:`${SPECIES[d.species].name} 一键喂养 ${feeds} 次，龙粮不足。`;break;}
 case 'collect': {const h=s.habitats.find(h=>h.id===payload.id)||fail('栖息地不存在。');const v=income(s,h,now);if(!v)fail('金币仍在积累。');const raw=rawIncome(s,h,now);s.coins+=v;h.storedCoins=raw-v;h.lastCollected=now;message=`收取 ${v} 枚金币。`;break;}
 case 'collectAll': {const total=s.habitats.reduce((sum,h)=>sum+income(s,h,now),0);if(!total)fail('金币仍在积累。');s.habitats.forEach(h=>{const raw=rawIncome(s,h,now);h.storedCoins=raw-Math.floor(raw);h.lastCollected=now;});s.coins+=total;message=`共收取 ${total} 枚金币。`;break;}
 case 'build': {const target=habitatDefinition(payload.buildingId??28)||fail('请选择栖息地类型。');if(!target.in_store)fail('该栖息地未在原版商店开放。');if(playerProgress(s).level<target.min_level)fail(`建造需要牧场等级 ${target.min_level}。`);if(s.habitats.length>=habitatLimit(playerProgress(s).level)+(s.expansion?.plots??0))fail('已达到当前牧场等级的栖息地数量上限，可在商店的扩建里买地。');payBuilding(target);s.habitats.push({id:s.nextId++,buildingId:target.id,name:target.nameCN,lastCollected:now,job:{kind:'build',targetId:target.id,startedAt:now,readyAt:now+target.build_time*1000}});message=`${target.nameCN}开始建造。`;break;}
 case 'upgradeHabitat': {const h=s.habitats.find(h=>h.id===payload.id)||fail('栖息地不存在。');if(h.job)fail('栖息地正在施工。');const target=habitatDefinition(habitatInfo(h).upgrades_to)||fail('该栖息地没有可用升级。');if(playerProgress(s).level<target.min_level)fail(`升级需要牧场等级 ${target.min_level}。`);payBuilding(target);settle(h);h.job={kind:'upgrade',targetId:target.id,startedAt:now,readyAt:now+target.build_time*1000};message=`${h.name}开始升级。`;break;}
 case 'completeHabitat': {const h=s.habitats.find(h=>h.id===payload.id)||fail('栖息地不存在。');if(!h.job||now<h.job.readyAt)fail('栖息地施工尚未完成。');settle(h);const target=habitatDefinition(h.job.targetId);h.buildingId=target.id;h.name=target.nameCN;h.job=null;h.lastCollected=now;awardPlayerXp(s,target.xp);message=`${h.name}施工完成。`;break;}
 case 'placeHabitat': {const h=s.habitats.find(h=>h.id===payload.id)||fail('栖息地不存在。');if(!Array.isArray(payload.position)||payload.position.length!==2||!payload.position.every(Number.isFinite))fail('请选择岛内位置。');const position=snapHabitatPosition(payload.position);if(!canPlaceObject(placeables(),`h:${h.id}`,habitatInfo(h),position))fail('这里与其他建筑重叠或超出可用地块。');h.position=position;message='建筑已按地块位置保存。';break;}
 case 'buyStructure': {const target=structureDefinition(payload.itemId)||fail('该商品不是可摆放建筑。');if(playerProgress(s).level<target.min_level)fail(`购买需要牧场等级 ${target.min_level}。`);payBuilding(target);const key=`s:${s.nextId}`,objects=placeables();let position=null;for(let row=1;row<14&&!position;row++)for(let column=1;column<24&&!position;column++){const candidate=snapHabitatPosition([12+column*3.31,18+row*4.92]);if(canPlaceObject(objects,key,target,candidate))position=candidate;}if(!position)fail('岛上没有足够的连续空格。');s.structures.push({id:s.nextId++,itemId:target.id,position,...(target.build_time?{readyAt:now+target.build_time*1000}:{})});message=`${target.nameCN}已购买，请确认摆放位置。`;break;}
 case 'placeStructure': {const structure=s.structures.find(o=>o.id===payload.id)||fail('建筑不存在。'),info=structureInfo(structure);if(!Array.isArray(payload.position)||payload.position.length!==2||!payload.position.every(Number.isFinite))fail('请选择岛内位置。');const position=snapHabitatPosition(payload.position);if(!canPlaceObject(placeables(),`s:${structure.id}`,info,position))fail('这里与其他建筑重叠或超出可用地块。');structure.position=position;message=`${info.nameCN}已按地块位置保存。`;break;}
 case 'completeStructure': {const structure=s.structures.find(o=>o.id===payload.id)||fail('建筑不存在。'),info=structureInfo(structure);if(!structure.readyAt||now<structure.readyAt)fail('建筑施工尚未完成。');delete structure.readyAt;awardPlayerXp(s,info.xp??0);message=`${info.nameCN}施工完成。`;break;}
 case 'sellStructure': {const index=s.structures.findIndex(o=>o.id===payload.id);if(index<0)fail('建筑不存在。');const structure=s.structures[index],info=structureInfo(structure),gold=info.sell_price?.g;if(!number(gold))fail('该建筑没有可核实的出售价格。');s.structures.splice(index,1);s.coins+=gold;message=`已出售${info.nameCN}，获得 ${gold} 金币。`;break;}
 case 'move': {const d=dragon(payload.id);if(isBreedingParent(s,d.id,now))fail('亲代正在培育山，请等待繁殖完成。');const h=s.habitats.find(h=>h.id===payload.habitatId)||fail('目标栖息地不存在。');if(d.habitatId===h.id)fail('已经住在这里。');if(!acceptsDragon(h,d.species))fail('该栖息地尚未完工或不适合这只龙的属性。');if(s.dragons.filter(x=>x.habitatId===h.id).length>=habitatInfo(h).capacity)fail('目标栖息地已满。');settle(s.habitats.find(x=>x.id===d.habitatId));settle(h);d.habitatId=h.id;message='已迁入新栖息地。';break;}
 case 'breed': {if(s.breeding)fail('培育山正在使用，请先将龙蛋转入育龙塔。');const a=dragon(payload.a),b=dragon(payload.b);if(a.id===b.id)fail('请选择两只不同的龙。');if(a.level<RULES.breedMinLevel||b.level<RULES.breedMinLevel)fail('两只亲代都需要达到 4 级。');const options=breedingOptions(a.species,b.species);let offspring,breedMs=RULES.breedMs,hatchMs=RULES.hatchMs;
 if(options){if(!options.length)fail('客户端配方表中，这组龙无法繁殖。');const value=random();if(!Number.isFinite(value)||value<0||value>=1)fail('随机值无效。');let roll=value*options.reduce((sum,o)=>sum+o.weight,0);offspring=options.at(-1).species;for(const option of options){roll-=option.weight;if(roll<0){offspring=option.species;break}}breedMs=SPECIES[offspring].breedingMs;hatchMs=SPECIES[offspring].hatchingMs;}
 else{spend('coins',RULES.breedCost);const key=[a.species,b.species].sort().join('+');offspring=RECIPES[key]||a.species;}
 s.habitats.filter(h=>[a.habitatId,b.habitatId].includes(h.id)).forEach(settle);s.breeding={phase:'breeding',species:offspring,parents:[a.id,b.id],startedAt:now,readyAt:now+breedMs,hatchMs,source:options?'client-base-pool':'legacy-prototype'};message='繁殖开始。亲代不会消失。';break;}
 case 'takeEgg': if(!s.breeding||s.breeding.phase!=='breeding'||now<s.breeding.readyAt)fail('繁殖尚未完成。');s.habitats.filter(h=>s.dragons.some(d=>s.breeding.parents.includes(d.id)&&d.habitatId===h.id)).forEach(settle);s.breeding.phase='egg';message='龙蛋已准备好，可转入育龙塔。';break;
 case 'incubate': if(!s.breeding||s.breeding.phase!=='egg')fail('没有待孵化龙蛋。');if(s.incubator)fail('育龙塔正在孵化，请先安置当前幼龙。');s.incubator={...s.breeding,phase:'hatching',startedAt:now,readyAt:now+(s.breeding.hatchMs??RULES.hatchMs)};s.breeding=null;message='龙蛋转入育龙塔开始孵化，培育山可以继续繁殖。';break;
 case 'speedIncubator': {if(!s.incubator||now>=s.incubator.readyAt)fail('龙蛋已经孵化完成。');const cost=incubatorSpeedCost(s.incubator.readyAt,now);spend('gems',cost);s.incubator.readyAt=now;message=`花费 ${cost} 魔晶，龙蛋立即孵化完成。`;break;}
 case 'hatch': {if(!s.incubator||now<s.incubator.readyAt)fail('龙蛋尚未孵化。');const h=s.habitats.find(h=>h.id===payload.habitatId)||fail('请选择栖息地。');if(!acceptsDragon(h,s.incubator.species))fail('该栖息地尚未完工或不适合幼龙的属性。');if(s.dragons.filter(d=>d.habitatId===h.id).length>=habitatInfo(h).capacity)fail('栖息地已满，请先建造新栖息地。');settle(h);s.dragons.push({id:s.nextId++,species:s.incubator.species,level:1,habitatId:h.id});s.incubator=null;s.stats.hatches++;message='新生幼龙加入牧场！';break;}
 case 'sellIncubator': {if(!s.incubator||now<s.incubator.readyAt)fail('龙蛋尚未孵化，不能出售幼龙。');const name=SPECIES[s.incubator.species].name,gold=dragonSellGold(s.incubator.species);s.coins+=gold;s.incubator=null;message=`出售${name}，获得 ${gold} 金币。`;break;}
 case 'wearEquipment': {const target=dragon(payload.id),item=equipmentInstance(s,payload.equipmentId)||fail('找不到这件装备。');if(item.dragonid)fail('这件装备已经穿在龙身上。');const definition=equipmentDefinition(item.type);const existing=equipmentInPart(equipmentOfDragon(s,target.id),definition.part);if(existing)fail(`该部位已装备${equipmentLabel(existing)}，请先卸下。`);item.dragonid=target.id;message=`${SPECIES[target.species].name} 装备了${equipmentLabel(item)}。`;break;}
 case 'unwearEquipment': {const item=equipmentInstance(s,payload.equipmentId)||fail('找不到这件装备。');if(!item.dragonid)fail('这件装备没有穿在龙身上。');const owner=s.dragons.find(d=>d.id===item.dragonid);item.dragonid=0;message=`已卸下${equipmentLabel(item)}${owner?`（${SPECIES[owner.species].name}）`:''}。`;break;}
 case 'raffleDraw': {const mode=payload.mode,count=payload.count,machine=raffleMachine(mode)||fail('请选择扭蛋机档位。');if(!Number.isSafeInteger(count)||![1,10].includes(count))fail('请选择单抽或十连。');if(s.raffle.pending.length+count>RAFFLE_CAPACITY)fail('仓库待领取栏已满，请先处理已有龙蛋。');const cost=raffleCost(s.raffle,mode,count);spend('gems',cost.gems);if(cost.tickets)s.raffle.tickets[cost.ticketKey]=(s.raffle.tickets[cost.ticketKey]??0)-cost.tickets;for(let i=0;i<count;i++){const counter=s.raffle.counters[mode]??0,guarantee=machine.guarantee!==null&&counter+1>=RAFFLE_GUARANTEE_DRAWS,result=sampleRaffle(mode,random,{guarantee});s.raffle.pending.push({id:s.nextId++,...result});s.raffle.counters[mode]=advanceRaffleCounter(counter,result,{free:cost.free})}message=`${machine.name}扭蛋机抽取 ${count} 次，龙蛋已放入仓库。`;break;}
 case 'raffleEggHatch': {if(s.incubator)fail('育龙塔正在孵化，请先安置当前幼龙。');const prize=s.raffle.pending.find(entry=>entry.id===payload.id)||fail('找不到这枚龙蛋。');const species=speciesKey(prize.dragonId),info=SPECIES[species];if(!info?.originalId||!info.hatchingMs)fail('该龙的原版孵化时长尚未取得。');s.incubator={phase:'hatching',species,parents:[],startedAt:now,readyAt:now+info.hatchingMs,hatchMs:info.hatchingMs,source:'raffle'};s.raffle.pending=s.raffle.pending.filter(entry=>entry.id!==prize.id);message=`${info.name}龙蛋已送入育龙塔。`;break;}
 case 'sellRaffleEgg': {const prize=s.raffle.pending.find(entry=>entry.id===payload.id)||fail('找不到这枚龙蛋。'),species=speciesKey(prize.dragonId),gold=dragonSellGold(species);s.coins+=gold;s.raffle.pending=s.raffle.pending.filter(entry=>entry.id!==prize.id);message=`出售${SPECIES[species].name}龙蛋，获得 ${gold} 金币。`;break;}
 case 'sellLotteryDragon': {const prize=s.lottery.pending.find(entry=>entry.id===payload.id&&entry.type===16)||fail('找不到这只待安置幼龙。'),species=speciesKey(prize.itemId),gold=dragonSellGold(species);s.coins+=gold;s.lottery.pending=s.lottery.pending.filter(entry=>entry.id!==prize.id);message=`出售${SPECIES[species].name}，获得 ${gold} 金币。`;break;}
 case 'expandIsland': {const step=nextExpansion(s.expansion.plots)||fail('原版扩建阶梯已到尽头，没有更多地块。');if(playerProgress(s).level<step.minLevel)fail(`扩建需要牧场等级 ${step.minLevel}。`);spend('coins',step.coins);if(step.gems>0)spend('gems',step.gems);s.expansion.plots++;message=`岛屿扩建完成，已有 ${s.expansion.plots} 块扩建地。`;break;}
 case 'recharge': {const product=rechargeProduct(payload.tierId)||fail('找不到这个充值档位。');const firstPurchase=!s.recharge.doubled.includes(product.id),delivery=rechargeDelivery(product,{firstPurchase});s.gems+=delivery.gems;if(firstPurchase)s.recharge.doubled.push(product.id);s.recharge.count++;s.recharge.lastTier=product.id;s.recharge.totalGems+=delivery.gems;message=`充值测试：${product.priceYuan} 元档到账 ${delivery.gems} 魔晶（含${firstPurchase?'首充双倍':'再送'} ${delivery.gift}，未实际扣款）。`;break;}
 case 'buyResource': {const row=resourceShopRow(payload.id)||fail('这个商品尚未开放。');spend('gems',row.priceGems);if(row.type==='g')s.coins+=row.amount;else if(row.type==='f')s.food+=row.amount;else if(row.type==='ef')s.items[EVOLUTION_FRUIT_ITEM_ID]=(s.items[EVOLUTION_FRUIT_ITEM_ID]??0)+row.amount;else fail('该商品的发放类型尚未支持。');message=`花 ${row.priceGems} 魔晶买到${row.name}。`;break;}
 default: fail('未知操作。');
 }
 s.updatedAt=now;s.log.unshift(message);s.log=s.log.slice(0,12);return validate(s);
}
