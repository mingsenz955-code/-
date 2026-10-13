import {test} from 'node:test';import assert from 'node:assert/strict';
import {createGame,validate,action,income} from '../src/game.mjs';import {RULES,SPECIES} from '../src/data.mjs';
const T=1800000000000;
test('complete ranch → feed → breed → hatch → serialized restore',()=>{
 let s=createGame(T);s=action(s,'plant',{},T);assert.throws(()=>action(s,'harvest',{},T+1),/未成熟/);
 s=action(s,'harvest',{},T+RULES.cropMs);assert.equal(s.food,410);
 for(let i=0;i<12;i++){s=action(s,'feed',{id:2},T+31000);s=action(s,'feed',{id:3},T+31000);}
 s=action(s,'breed',{a:2,b:3},T+32000,()=>0);assert.equal(s.nest.species,'leaf');
 let ready=s.nest.readyAt;s=action(s,'takeEgg',{},ready);s=action(s,'incubate',{},ready);s=action(s,'hatch',{habitatId:1},s.nest.readyAt);
 assert.equal(s.dragons.length,3);assert.equal(s.nest,null);assert.equal(s.stats.hatches,1);
 assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);
});
test('invalid commands are transactional; resource and parent restrictions',()=>{
 const s=createGame(T),before=structuredClone(s);assert.throws(()=>action(s,'breed',{a:2,b:2},T),/不同/);assert.deepEqual(s,before);
 assert.throws(()=>action(s,'breed',{a:2,b:3},T),/4 级/);
 s.food=0;assert.throws(()=>action(s,'feed',{id:2},T),/龙粮不足/);assert.equal(s.dragons[0].level,1);
 s.coins=0;assert.throws(()=>action(s,'build',{},T),/金币不足/);
});
test('offline income capped; backward clock earns no negative currency; no retroactive level income',()=>{
 let s=createGame(T);assert.equal(income(s,s.habitats[0],T-100),0);assert.equal(income(s,s.habitats[0],T+24*3600000),8*3600*4);
 for(let i=0;i<4;i++)s=action(s,'feed',{id:2},T+10000);assert.equal(s.coins,1240);assert.equal(income(s,s.habitats[0],T+11000),6);
 s=action(s,'collect',{id:1},T+11000);assert.equal(s.coins,1246);assert.equal(income(s,s.habitats[0],T+11000),0);
});
test('capacity failure retains ready egg; new habitat allows hatching',()=>{
 let s=createGame(T);s.dragons.push({id:4,species:'tide',level:1,habitatId:1});s.nextId=5;s.nest={phase:'hatching',species:'bloom',parents:[2,3],readyAt:T};
 assert.throws(()=>action(s,'hatch',{habitatId:1},T),/已满/);assert.equal(s.nest.phase,'hatching');s=action(s,'build',{},T);s=action(s,'hatch',{habitatId:5},T);assert.equal(s.dragons.length,4);
});
test('save rejects future version, duplicate ids, bad species, malformed jobs and overcapacity',()=>{
 for(const mutate of [s=>s.version=2,s=>s.coins=-1,s=>s.dragons[0].species='unknown',s=>s.dragons[0].id=1,s=>s.nextId=2,s=>s.farm={readyAt:'bad'},s=>s.nest={phase:'oops'},s=>s.log=['x'.repeat(201)]]){const s=createGame(T);mutate(s);assert.throws(()=>validate(s))}
});
test('moving dragons settles old and new income at the correct time',()=>{
 let s=action(createGame(T),'build',{},T);s=action(s,'move',{id:2,habitatId:4},T+10000);assert.equal(s.coins,940);assert.equal(income(s,s.habitats[1],T+11000),2);assert.equal(income(s,s.habitats[0],T+11000),2);
});
test('four feeds per level and original food price breakpoint',()=>{
 let s=createGame(T);for(let i=0;i<3;i++)s=action(s,'feed',{id:2},T);assert.equal(s.dragons[0].level,1);assert.equal(s.dragons[0].feedsInLevel,3);assert.equal(s.food,385);s=action(s,'feed',{id:2},T);assert.equal(s.dragons[0].level,2);assert.equal(s.dragons[0].feedsInLevel,0);assert.equal(s.food,380);
});
test('original crop prices, wait times and yields; legacy crop saves retain original promised yield',()=>{
 let s=action(createGame(T),'plant',{cropId:2},T);assert.equal(s.coins,950);assert.equal(s.farm.readyAt,T+300000);s=action(s,'harvest',{},T+300000);assert.equal(s.food,450);s.farm={readyAt:T+300000};s=action(s,'harvest',{},T+300000);assert.equal(s.food,540);
 assert.throws(()=>action(createGame(T),'plant',{cropId:4},T),/升级农场/);
});
test('client breeding pool chooses and persists offspring once, with original timers',()=>{
 let s=createGame(T);s.dragons.forEach(d=>d.level=4);const coins=s.coins;s=action(s,'breed',{a:2,b:3},T,()=>.999);assert.equal(s.nest.species,'original1001');assert.equal(s.coins,coins);assert.equal(s.nest.readyAt,T+SPECIES.original1001.breedingMs);assert.equal(s.nest.hatchMs,SPECIES.original1001.hatchingMs);const saved=validate(JSON.parse(JSON.stringify(s)));assert.throws(()=>action(s,'takeEgg',{},T+1),/未完成/);assert.deepEqual(s,saved);const ready=s.nest.readyAt;s=action(s,'takeEgg',{},ready);s=action(s,'incubate',{},ready);assert.equal(s.nest.readyAt,ready+SPECIES.original1001.hatchingMs);
});
