import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,action,validate,unlockedCrops,incubatorSpeedCost} from '../src/game.mjs';
import {ORIGINAL_CROPS,ORIGINAL_LEVELS} from '../src/data.mjs';
const now=1800000000000;
function fixture(){const s=createGame(now);s.coins=10000000;s.gems=10000;s.playerXp=ORIGINAL_LEVELS.find(r=>r.level===99).xp_required;s.structures=[{id:4,itemId:17,position:[40,60]},{id:5,itemId:108,position:[60,60]},{id:6,itemId:18,position:[50,40]}];s.nextId=7;return validate(s)}
test('placed farms independently plant, speed, harvest and retain legacy fixed crops',()=>{
 let s=action(fixture(),'plant',{cropId:1},now);
 s=action(s,'plant',{farmId:4,cropId:6},now);
 s=action(s,'plant',{farmId:6,cropId:9},now);
 const coins=s.coins,food=s.food,gems=s.gems;
 s=action(s,'speedCrop',{farmId:4},now+1000);
 assert.equal(s.gems,gems-incubatorSpeedCost(now+ORIGINAL_CROPS[5].ms,now+1000));
 assert.equal(s.coins,coins);assert.equal(s.food,food);
 assert.equal(s.farm.readyAt,now+30000);
 assert.equal(s.structures[2].farm.readyAt,now+ORIGINAL_CROPS[8].ms);
 s=validate(JSON.parse(JSON.stringify(s)));
 s=action(s,'harvest',{farmId:4},now+1000);assert.equal(s.food,food+2000);
 assert.throws(()=>action(s,'harvest',{farmId:4},now+1000),/成熟/);
 assert.throws(()=>action(s,'speedCrop',{farmId:4},now+1000),/没有/);
 assert.equal(s.structures[2].farm.cropId,9);
});
test('evolution land uses source crops 10 to 12 and credits consumable fruit, not food',()=>{
 let s=fixture();assert.deepEqual(unlockedCrops(s,5).map(c=>c.id),[10,11,12]);
 assert.throws(()=>action(s,'plant',{farmId:5,cropId:1},now),/作物/);
 assert.throws(()=>action(s,'plant',{farmId:4,cropId:9},now),/作物/);
 s=action(s,'plant',{farmId:5,cropId:12},now);const food=s.food;
 s=action(s,'harvest',{farmId:5},now+3600000);assert.equal(s.items[7027],300);assert.equal(s.food,food);
});
test('insufficient gems, unfinished buildings and corrupt jobs cannot mutate saves',()=>{
 let s=fixture();s.structures[0].readyAt=now+1000;
 assert.throws(()=>action(s,'plant',{farmId:4,cropId:1},now),/施工/);
 s=action(s,'completeStructure',{id:4},now+1000);s=action(s,'plant',{farmId:4,cropId:6},now+1000);
 s.gems=0;const before=structuredClone(s);assert.throws(()=>action(s,'speedCrop',{farmId:4},now+1000),/不足/);assert.deepEqual(s,before);
 assert.throws(()=>action(s,'sellStructure',{id:4},now+1000),/收获/);
 s.structures[0].farm.cropId=12;assert.throws(()=>validate(s),/作物/);
});
test('placed farm upgrade and speed completion target only that farm',()=>{
 let s=action(fixture(),'upgradeFarm',{farmId:4},now);
 s=action(s,'speedBuilding',{kind:'farm',id:4},now+1000);
 assert.equal(s.structures[0].itemId,18);assert.equal(s.farmBuildingId,undefined);
 assert.equal(s.structures[0].farmUpgrade,null);assert.equal(unlockedCrops(s,4).length,9);
 s=action(s,'upgradeFarm',{},now+2000);s=action(s,'speedBuilding',{kind:'farm',id:0},now+3000);
 assert.equal(s.farmBuildingId,17);
});
