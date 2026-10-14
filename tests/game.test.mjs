import {test} from 'node:test';import assert from 'node:assert/strict';
import {createGame,validate,action,income,playerProgress,unlockedCrops,incubatorSpeedCost,dragonSellGold} from '../src/game.mjs';import {RULES,SPECIES,ORIGINAL_LEVELS} from '../src/data.mjs';
const T=1800000000000;
test('complete ranch → feed → breed → hatch → serialized restore',()=>{
 let s=createGame(T);s=action(s,'plant',{},T);assert.throws(()=>action(s,'harvest',{},T+1),/未成熟/);
 s=action(s,'harvest',{},T+RULES.cropMs);assert.equal(s.food,410);
 for(let i=0;i<12;i++){s=action(s,'feed',{id:2},T+31000);s=action(s,'feed',{id:3},T+31000);}
 s=action(s,'breed',{a:2,b:3},T+32000,()=>0);assert.equal(s.breeding.species,'leaf');
 let ready=s.breeding.readyAt;s=action(s,'takeEgg',{},ready);s=action(s,'incubate',{},ready);s=action(s,'hatch',{habitatId:1},s.incubator.readyAt);
 assert.equal(s.dragons.length,3);assert.equal(s.incubator,null);assert.equal(s.stats.hatches,1);
 assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);
});
test('invalid commands are transactional; resource and parent restrictions',()=>{
 const s=createGame(T),before=structuredClone(s);assert.throws(()=>action(s,'breed',{a:2,b:2},T),/不同/);assert.deepEqual(s,before);
 assert.throws(()=>action(s,'breed',{a:2,b:3},T),/4 级/);
 s.food=0;assert.throws(()=>action(s,'feed',{id:2},T),/龙粮不足/);assert.equal(s.dragons[0].level,1);
 s.coins=0;s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===2).xp_required;assert.throws(()=>action(s,'build',{},T),/金币不足/);
});
test('original minute income, storage cap and feeding settle without auto-collection',()=>{
 let s=createGame(T);assert.equal(income(s,s.habitats[0],T-100),0);assert.equal(income(s,s.habitats[0],T+24*3600000),7500);assert.equal(income(s,s.habitats[0],T+60000),6);
 for(let i=0;i<4;i++)s=action(s,'feed',{id:2},T+10000);assert.equal(s.coins,1200);assert.equal(s.habitats[0].storedCoins,1);assert.equal(income(s,s.habitats[0],T+70000),10);
 s=action(s,'collect',{id:1},T+70000);assert.equal(s.coins,1210);assert.equal(income(s,s.habitats[0],T+70000),0);
});
test('capacity failure retains ready egg; new habitat allows hatching',()=>{
 let s=createGame(T);s.dragons.push({id:4,species:'tide',level:1,habitatId:1});s.nextId=5;s.incubator={phase:'hatching',species:'bloom',parents:[2,3],readyAt:T};
 assert.throws(()=>action(s,'hatch',{habitatId:1},T),/已满/);assert.equal(s.incubator.phase,'hatching');s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===2).xp_required;s=action(s,'build',{buildingId:28},T);s=action(s,'completeHabitat',{id:5},T+10000);s.incubator.species='ember';s=action(s,'hatch',{habitatId:5},T+10000);assert.equal(s.dragons.length,4);
});
test('source hatch acceleration formula and configured dragon sale are transactional',()=>{
 const ready=T+48*3600000,cost=Math.ceil((48**.7)*15);assert.equal(incubatorSpeedCost(ready,T),cost);assert.equal(incubatorSpeedCost(T,T),0);
 let s=createGame(T);s.gems=cost;s.incubator={phase:'hatching',species:'ember',parents:[],source:'raffle',startedAt:T,readyAt:ready,hatchMs:48*3600000};
 s=action(s,'speedIncubator',{},T);assert.equal(s.gems,0);assert.equal(s.incubator.readyAt,T);
 const gold=dragonSellGold('ember'),coins=s.coins;s=action(s,'sellIncubator',{},T);assert.equal(s.incubator,null);assert.equal(s.coins,coins+gold);assert.equal(s.stats.hatches,0);
 const poor=createGame(T);poor.incubator={phase:'hatching',species:'ember',parents:[],source:'raffle',startedAt:T,readyAt:ready,hatchMs:48*3600000};const before=structuredClone(poor);assert.throws(()=>action(poor,'speedIncubator',{},T),/魔晶不足/);assert.deepEqual(poor,before);
});
test('save rejects future version, duplicate ids, bad species, malformed jobs and overcapacity',()=>{
 for(const mutate of [s=>s.version=13,s=>s.coins=-1,s=>s.dragons[0].species='unknown',s=>s.dragons[0].id=1,s=>s.nextId=2,s=>s.farm={readyAt:'bad'},s=>s.breeding={phase:'oops'},s=>s.log=['x'.repeat(201)]]){const s=createGame(T);mutate(s);assert.throws(()=>validate(s))}
});
test('moving dragons settles old and new income at the correct time',()=>{
 let s=createGame(T);s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===2).xp_required;s=action(s,'build',{buildingId:28},T);s=action(s,'completeHabitat',{id:4},T+10000);s=action(s,'move',{id:2,habitatId:4},T+60000);assert.equal(s.coins,1050);assert.equal(income(s,s.habitats[1],T+120000),1);assert.equal(income(s,s.habitats[0],T+120000),11);
});
test('four feeds per level and original food price breakpoint',()=>{
 let s=createGame(T);for(let i=0;i<3;i++)s=action(s,'feed',{id:2},T);assert.equal(s.dragons[0].level,1);assert.equal(s.dragons[0].feedsInLevel,3);assert.equal(s.food,385);s=action(s,'feed',{id:2},T);assert.equal(s.dragons[0].level,2);assert.equal(s.dragons[0].feedsInLevel,0);assert.equal(s.food,380);
});
test('one-click feeding stops after one level or when food is insufficient',()=>{
 let s=createGame(T);s.food=100;s=action(s,'feedAll',{id:2},T);assert.equal(s.dragons[0].level,2);assert.equal(s.dragons[0].feedsInLevel,0);assert.equal(s.food,80);assert.equal(s.stats.feeds,4);
 s.food=10;s=action(s,'feedAll',{id:2},T);assert.equal(s.dragons[0].level,2);assert.equal(s.dragons[0].feedsInLevel,1);assert.equal(s.food,0);assert.equal(s.stats.feeds,5);assert.throws(()=>action(s,'feedAll',{id:2},T),/龙粮不足/);
});
test('shop decorations buy, place, collide, sell and persist',()=>{
 let s=createGame(T);s.coins=10000;s=action(s,'buyStructure',{itemId:150},T);assert.equal(s.structures.length,1);assert.equal(s.coins,9000);const id=s.structures[0].id;
 assert.throws(()=>action(s,'placeStructure',{id,position:[41,50]},T),/重叠/);s=action(s,'placeStructure',{id,position:[50,35]},T);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))).structures,s.structures);
 s=action(s,'sellStructure',{id},T);assert.equal(s.structures.length,0);assert.equal(s.coins,9500);
});
test('formation and offline adventure battle form a saved playable loop',()=>{
 let s=createGame(T);s.dragons.forEach(d=>d.level=20);s=action(s,'setFormation',{ids:[3,2]},T);assert.deepEqual(s.formation,[3,2]);assert.throws(()=>action(s,'battleResolve',{nodeId:100102},T),/前一关/);
 const before={coins:s.coins,food:s.food};s=action(s,'battleResolve',{nodeId:100101},T);assert.equal(s.adventure.energy,9);assert(s.adventure.cleared['100101']>=1);assert(s.coins>before.coins);assert(s.food>before.food);assert.equal(s.adventure.lastBattle.policy,'offline-adventure-balance-v1');
 s=validate(JSON.parse(JSON.stringify(s)));assert.deepEqual(s.formation,[3,2]);assert.equal(s.adventure.cleared['100101']>=1,true);
});
test('original crop prices, wait times and yields; legacy crop saves retain original promised yield',()=>{
 let s=action(createGame(T),'plant',{cropId:2},T);assert.equal(s.coins,950);assert.equal(s.farm.readyAt,T+300000);s=action(s,'harvest',{},T+300000);assert.equal(s.food,450);s.farm={readyAt:T+300000};s=action(s,'harvest',{},T+300000);assert.equal(s.food,540);
 assert.throws(()=>action(createGame(T),'plant',{cropId:4},T),/升级农场/);
});
test('client breeding pool chooses and persists offspring once, with original timers',()=>{
 let s=createGame(T);s.dragons.forEach(d=>d.level=4);const coins=s.coins;s=action(s,'breed',{a:2,b:3},T,()=>.999);assert.equal(s.breeding.species,'original1001');assert.equal(s.coins,coins);assert.equal(s.breeding.readyAt,T+SPECIES.original1001.breedingMs);assert.equal(s.breeding.hatchMs,SPECIES.original1001.hatchingMs);const saved=validate(JSON.parse(JSON.stringify(s)));assert.throws(()=>action(s,'takeEgg',{},T+1),/未完成/);assert.deepEqual(s,saved);const ready=s.breeding.readyAt;s=action(s,'takeEgg',{},ready);s=action(s,'incubate',{},ready);assert.equal(s.incubator.readyAt,ready+SPECIES.original1001.hatchingMs);
});
test('breeding pauses parents only during its actual interval, including late collection',()=>{
 let s=createGame(T);s.dragons.forEach(d=>d.level=4);s=action(s,'breed',{a:2,b:3},T,()=>0);const end=s.breeding.readyAt;assert.equal(income(s,s.habitats[0],end-1),0);assert.equal(income(s,s.habitats[0],end+60000),24);s=action(s,'takeEgg',{},end+60000);assert.equal(s.coins,1200);assert.equal(income(s,s.habitats[0],end+120000),48);
});
test('fractional coin accrual survives repeated feed and move boundaries',()=>{
 let s=createGame(T);s=action(s,'feed',{id:2},T+1000);assert.equal(s.coins,1200);assert.equal(income(s,s.habitats[0],T+10000),1);s=action(s,'collect',{id:1},T+10000);assert.equal(s.coins,1201);assert.equal(income(s,s.habitats[0],T+20000),1);
});
test('crop XP crosses original cumulative level thresholds and awards each level once',()=>{
 let s=action(createGame(T),'plant',{cropId:3},T);s=action(s,'harvest',{},s.farm.readyAt);assert.equal(s.playerXp,1000);assert.equal(s.gems,2);assert.deepEqual(playerProgress(s),{level:3,xp:1000,percent:55});const restored=validate(JSON.parse(JSON.stringify(s)));assert.equal(restored.gems,2);
});
test('v1 migration preserves resources, old dragons and in-progress legacy crops',()=>{
 const old=createGame(T);old.version=1;delete old.playerXp;delete old.gems;old.farm={readyAt:T+15000};const migrated=validate(old);assert.equal(migrated.version,12);assert.equal(migrated.coins,old.coins);assert.deepEqual(migrated.dragons,old.dragons);assert.equal(action(migrated,'harvest',{},T+15000).food,490);assert.equal(old.version,1);
});
test('original farm upgrade gates, timer and crop tier persist across saves',()=>{
 let s=createGame(T);assert.throws(()=>action(s,'upgradeFarm',{},T),/等级 8/);s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===8).xp_required;s.coins=50000;s=action(s,'upgradeFarm',{},T);assert.equal(s.coins,25000);assert.equal(s.farmUpgrade.readyAt,T+10000);assert.throws(()=>action(s,'plant',{},T),/正在升级/);assert.throws(()=>action(s,'completeFarmUpgrade',{},T+1),/尚未完成/);s=validate(JSON.parse(JSON.stringify(s)));s=action(s,'completeFarmUpgrade',{},T+10000);assert.equal(s.farmBuildingId,17);assert.equal(unlockedCrops(s).length,6);s=action(s,'plant',{cropId:4},T+10000);assert.equal(s.farm.cropId,4);
});

