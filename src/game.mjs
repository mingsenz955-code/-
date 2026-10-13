import {SPECIES, RULES, RECIPES, ORIGINAL_CROPS, ORIGINAL_LEVELS, ORIGINAL_FARMS, breedingOptions} from './data.mjs';
const fail = message => {throw new Error(message)};
const number = (v,min=0,max=Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(v)&&v>=min&&v<=max;
export function createGame(now=Date.now()) {
 return {version:2,coins:1200,food:400,gems:0,playerXp:0,nextId:4,updatedAt:now,habitats:[{id:1,name:'晨曦栖息地',lastCollected:now}],dragons:[{id:2,species:'ember',level:1,habitatId:1},{id:3,species:'leaf',level:1,habitatId:1}],farm:null,nest:null,stats:{harvests:0,hatches:0,feeds:0},log:['欢迎来到云上牧场。种下第一份龙粮吧。']};
}
export function validate(s) {
 if(!s||![1,2].includes(s.version)) fail('存档版本不受支持，请保留原文件。');
 if(!number(s.coins)||!number(s.food)||!number(s.nextId,1)||!number(s.updatedAt)) fail('存档资源或时间无效。');
 if(s.gems!==undefined&&!number(s.gems)||s.playerXp!==undefined&&!number(s.playerXp))fail('牧场经验或魔晶无效。');
 if(!Array.isArray(s.dragons)||s.dragons.length<2||s.dragons.length>1000||!Array.isArray(s.habitats)||s.habitats.length<1||s.habitats.length>RULES.maxHabitats) fail('存档牧场无效。');
 const ids=new Set();
 for(const h of s.habitats){if(!number(h.id,1)||ids.has(h.id)||typeof h.name!=='string'||h.name.length>40||!number(h.lastCollected)||(h.storedCoins!==undefined&&(!Number.isFinite(h.storedCoins)||h.storedCoins<0||h.storedCoins>Number.MAX_SAFE_INTEGER))) fail('栖息地数据无效。');ids.add(h.id);}
 for(const d of s.dragons){if(!number(d.id,1)||ids.has(d.id)||!Object.hasOwn(SPECIES,d.species)||!number(d.level,1,RULES.maxLevel)||!s.habitats.some(h=>h.id===d.habitatId)) fail('龙数据无效。');ids.add(d.id);}
 if(s.nextId<=Math.max(...ids)) fail('存档编号冲突。');
 for(const h of s.habitats)if(s.dragons.filter(d=>d.habitatId===h.id).length>RULES.habitatCapacity)fail('栖息地超过容量。');
 if(s.dragons.some(d=>d.feedsInLevel!==undefined&&!number(d.feedsInLevel,0,3)))fail('喂养进度无效。');
 if(s.farmBuildingId!==undefined&&![16,17,18].includes(s.farmBuildingId))fail('农场等级无效。');
 if(s.farmUpgrade!==undefined&&s.farmUpgrade!==null&&(![17,18].includes(s.farmUpgrade.targetId)||s.farmUpgrade.targetId!==(s.farmBuildingId??16)+1||!number(s.farmUpgrade.readyAt)||s.farm!==null))fail('农场升级数据无效。');
 if(s.farm!==null&&(!s.farm||!number(s.farm.readyAt)||(s.farm.cropId!==undefined&&!unlockedCrops(s).some(c=>c.id===s.farm.cropId))))fail('农场计时无效。');
 if(s.nest!==null){const n=s.nest;if(n?.startedAt!==undefined&&(!number(n.startedAt)||n.startedAt>n.readyAt))fail('繁殖起始时间无效。');if(n?.hatchMs!==undefined&&!number(n.hatchMs,0,365*86400000))fail('孵化时间无效。');if(!n||!['breeding','egg','hatching'].includes(n.phase)||!Object.hasOwn(SPECIES,n.species)||!number(n.readyAt)||!Array.isArray(n.parents)||n.parents.length!==2||n.parents[0]===n.parents[1]||!n.parents.every(id=>s.dragons.some(d=>d.id===id)))fail('繁殖数据无效。');}
 if(!s.stats||!['harvests','hatches','feeds'].every(k=>number(s.stats[k]))) fail('统计数据无效。');
 if(!Array.isArray(s.log)||s.log.length>12||!s.log.every(x=>typeof x==='string'&&x.length<=200))fail('日志数据无效。');
 return {...structuredClone(s),version:2};
}
export function dragonRate(d){const species=SPECIES[d.species];if(!species.originalId)return species.income*d.level*60;return d.level<=10?species.coinStart+species.coinAdded*(d.level-1):species.coinStart+species.coinAdded*9+Math.floor(species.coinAdded*(d.level-10)/2)}
function rawIncome(s,h,now){const cap=7500*60000;let units=Math.round((h.storedCoins??0)*60000);const start=Math.min(now,h.lastCollected);for(const d of s.dragons.filter(d=>d.habitatId===h.id)){let elapsed=Math.max(0,now-start);const n=s.nest;if(n?.phase==='breeding'&&n.parents.includes(d.id)){const breedStart=n.startedAt??n.readyAt-(SPECIES[n.species].breedingMs??RULES.breedMs);elapsed-=Math.max(0,Math.min(now,n.readyAt)-Math.max(start,breedStart));}units=Math.min(cap,units+Math.min(cap,Math.max(0,elapsed)*dragonRate(d)));}return Math.min(cap,units)/60000}
export function income(s,h,now=Date.now()){return Math.floor(rawIncome(s,h,now))}
export function feedCost(d){return d.level<10?5*2**(d.level-1):2000+500*(d.level-10)}
export function playerProgress(s){const xp=s.playerXp??0;const current=ORIGINAL_LEVELS.findLast(level=>level.xp_required<=xp)??ORIGINAL_LEVELS[0],next=ORIGINAL_LEVELS.find(level=>level.level===current.level+1);return {level:current.level,xp,percent:next?Math.floor((xp-current.xp_required)/(next.xp_required-current.xp_required)*100):100}}
export function farmInfo(s){return ORIGINAL_FARMS.find(f=>f.id===(s.farmBuildingId??16))}
export function unlockedCrops(s){return ORIGINAL_CROPS.slice(0,((s.farmBuildingId??16)-15)*3)}
function awardPlayerXp(s,xp){const before=playerProgress(s).level;s.playerXp=(s.playerXp??0)+xp;const after=playerProgress(s).level;for(const level of ORIGINAL_LEVELS.filter(level=>level.level>before&&level.level<=after)){const resource={c:'gems',g:'coins',f:'food'}[level.reward_type];if(resource)s[resource]=(s[resource]??0)+level.reward_amount}}
export function action(state,type,payload={},now=Date.now(),random=Math.random) {
 const s=validate(state); now=Math.max(now,s.updatedAt); let message='';
 const spend=(key,cost)=>{if(s[key]<cost)fail(key==='coins'?'金币不足。':'龙粮不足，请先种植并收获。');s[key]-=cost;};
 const dragon=id=>s.dragons.find(d=>d.id===id)||fail('找不到这只龙。');
 const settle=h=>{h.storedCoins=rawIncome(s,h,now);h.lastCollected=now;};
 switch(type){
 case 'plant': {if(s.farmUpgrade)fail('农场正在升级，请完成后种植。');if(s.farm)fail('已有作物在生长，请先收获。');const crop=unlockedCrops(s).find(c=>c.id===(payload.cropId??1))||fail('该作物需要升级农场。');spend('coins',crop.cost);s.farm={readyAt:now+crop.ms,cropId:crop.id};message=`已种下${crop.name}。`;break;}
 case 'upgradeFarm': {if(s.farm||s.farmUpgrade)fail('请先完成当前种植或升级。');const target=ORIGINAL_FARMS.find(f=>f.id===farmInfo(s).upgrades_to)||fail('当前农场已达到最高等级。');if(playerProgress(s).level<target.min_level)fail(`升级需要牧场等级 ${target.min_level}。`);spend('coins',target.costs.g);s.farmUpgrade={targetId:target.id,readyAt:now+target.build_time*1000};message='农场升级开始。';break;}
 case 'completeFarmUpgrade': {if(!s.farmUpgrade||now<s.farmUpgrade.readyAt)fail('农场升级尚未完成。');const target=ORIGINAL_FARMS.find(f=>f.id===s.farmUpgrade.targetId);s.farmBuildingId=target.id;s.farmUpgrade=null;awardPlayerXp(s,target.xp);message=`${target.nameCN}升级完成，新作物已解锁。`;break;}
 case 'harvest': {if(!s.farm||now<s.farm.readyAt)fail('龙粮还未成熟。');const yieldValue=s.farm.cropId?ORIGINAL_CROPS.find(c=>c.id===s.farm.cropId).yield:90;s.food+=yieldValue;if(s.farm.cropId)awardPlayerXp(s,ORIGINAL_CROPS.find(c=>c.id===s.farm.cropId).xp);s.farm=null;s.stats.harvests++;message=`收获 ${yieldValue} 份龙粮。`;break;}
 case 'feed': {const d=dragon(payload.id);if(d.level>=RULES.maxLevel)fail('已达到原型等级上限。');spend('food',feedCost(d));settle(s.habitats.find(h=>h.id===d.habitatId));d.feedsInLevel=(d.feedsInLevel??0)+1;s.stats.feeds++;if(d.feedsInLevel>=RULES.feedsPerLevel){d.level++;d.feedsInLevel=0;message=`${SPECIES[d.species].name} 升至 ${d.level} 级。`;}else message=`${SPECIES[d.species].name} 喂养进度 ${d.feedsInLevel}/${RULES.feedsPerLevel}。`;break;}
 case 'collect': {const h=s.habitats.find(h=>h.id===payload.id)||fail('栖息地不存在。');const v=income(s,h,now);if(!v)fail('金币仍在积累。');const raw=rawIncome(s,h,now);s.coins+=v;h.storedCoins=raw-v;h.lastCollected=now;message=`收取 ${v} 枚金币。`;break;}
 case 'collectAll': {const total=s.habitats.reduce((sum,h)=>sum+income(s,h,now),0);if(!total)fail('金币仍在积累。');s.habitats.forEach(h=>{const raw=rawIncome(s,h,now);h.storedCoins=raw-Math.floor(raw);h.lastCollected=now;});s.coins+=total;message=`共收取 ${total} 枚金币。`;break;}
 case 'build': if(s.habitats.length>=RULES.maxHabitats)fail('已达到原型栖息地上限。');spend('coins',RULES.habitatCost);s.habitats.push({id:s.nextId++,name:`云岛栖息地 ${s.habitats.length+1}`,lastCollected:now});message='新栖息地已建成。';break;
 case 'move': {const d=dragon(payload.id),h=s.habitats.find(h=>h.id===payload.habitatId)||fail('目标栖息地不存在。');if(d.habitatId===h.id)fail('已经住在这里。');if(s.dragons.filter(x=>x.habitatId===h.id).length>=RULES.habitatCapacity)fail('目标栖息地已满。');settle(s.habitats.find(x=>x.id===d.habitatId));settle(h);d.habitatId=h.id;message='已迁入新栖息地。';break;}
 case 'breed': {if(s.nest)fail('繁殖巢正在使用。');const a=dragon(payload.a),b=dragon(payload.b);if(a.id===b.id)fail('请选择两只不同的龙。');if(a.level<RULES.breedMinLevel||b.level<RULES.breedMinLevel)fail('两只亲代都需要达到 4 级。');const options=breedingOptions(a.species,b.species);let offspring,breedMs=RULES.breedMs,hatchMs=RULES.hatchMs;
 if(options){if(!options.length)fail('客户端配方表中，这组龙无法繁殖。');const value=random();if(!Number.isFinite(value)||value<0||value>=1)fail('随机值无效。');let roll=value*options.reduce((sum,o)=>sum+o.weight,0);offspring=options.at(-1).species;for(const option of options){roll-=option.weight;if(roll<0){offspring=option.species;break}}breedMs=SPECIES[offspring].breedingMs;hatchMs=SPECIES[offspring].hatchingMs;}
 else{spend('coins',RULES.breedCost);const key=[a.species,b.species].sort().join('+');offspring=RECIPES[key]||a.species;}
 s.habitats.filter(h=>[a.habitatId,b.habitatId].includes(h.id)).forEach(settle);s.nest={phase:'breeding',species:offspring,parents:[a.id,b.id],startedAt:now,readyAt:now+breedMs,hatchMs,source:options?'client-base-pool':'legacy-prototype'};message='繁殖开始。亲代不会消失。';break;}
 case 'takeEgg': if(!s.nest||s.nest.phase!=='breeding'||now<s.nest.readyAt)fail('繁殖尚未完成。');s.habitats.filter(h=>s.dragons.some(d=>s.nest.parents.includes(d.id)&&d.habitatId===h.id)).forEach(settle);s.nest.phase='egg';message='获得一枚龙蛋，准备孵化吧。';break;
 case 'incubate': if(!s.nest||s.nest.phase!=='egg')fail('没有待孵化龙蛋。');s.nest.phase='hatching';s.nest.readyAt=now+(s.nest.hatchMs??RULES.hatchMs);message='龙蛋开始孵化。';break;
 case 'hatch': {if(!s.nest||s.nest.phase!=='hatching'||now<s.nest.readyAt)fail('龙蛋尚未孵化。');const h=s.habitats.find(h=>h.id===payload.habitatId)||fail('请选择栖息地。');if(s.dragons.filter(d=>d.habitatId===h.id).length>=RULES.habitatCapacity)fail('栖息地已满，请先建造新栖息地。');settle(h);s.dragons.push({id:s.nextId++,species:s.nest.species,level:1,habitatId:h.id});s.nest=null;s.stats.hatches++;message='新生幼龙加入牧场！';break;}
 default: fail('未知操作。');
 }
 s.updatedAt=now;s.log.unshift(message);s.log=s.log.slice(0,12);return validate(s);
}
