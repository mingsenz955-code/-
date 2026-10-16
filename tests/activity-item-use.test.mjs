import test from 'node:test';
import assert from 'node:assert/strict';
import ITEMS from '../assets/original/data/item-use.mjs';
import {createGame,action,validate} from '../src/game.mjs';
import {activityDeliver,activityGiftBlock} from '../src/historical-activities.mjs';
const now=1800000000000;
test('every exported source gift pool opens at both RNG boundaries and survives restart',()=>{
 for(const id of Object.keys(ITEMS.packs))for(const roll of [0,.999999]){
  const s=createGame(now);s.items[id]=1;if(activityGiftBlock(id)){assert.throws(()=>action(s,'activityGift',{id:Number(id)},now),/旧版/);assert.equal(s.items[id],1);continue;}
  const n=action(s,'activityGift',{id:Number(id)},now,()=>roll);
  assert.equal(n.items[id],0,`pack ${id}`);assert(n.activities.history.last.length>0,`rewards ${id}`);
  assert.deepEqual(validate(JSON.parse(JSON.stringify(n))),n,`restart ${id}`);
 }
});
test('random equipment fragment packs use each configured pool and batch quantities',()=>{
 const s=createGame(now);s.items[7024]=3;
 const n=action(s,'activityGift',{id:7024,count:3},now,()=>0);
 const row=ITEMS.pools[ITEMS.packs[7024].pools[0]][0];
 assert.equal(row.type,9);assert.equal(n.equipmentFragments[row.itemId],3*row.min);assert.equal(n.items[7024],0);
 assert.throws(()=>action(n,'activityGift',{id:7024},now),/不足/);
});
test('invalid random and oversized batch retain original inventory atomically',()=>{
 const s=createGame(now);s.items[7024]=3;const before=structuredClone(s);
 for(const count of [0,4,100,1.5])assert.throws(()=>action(s,'activityGift',{id:7024,count},now),/数量|99|不足/);
 assert.throws(()=>action(s,'activityGift',{id:7024},now,()=>1),/随机/);assert.deepEqual(s,before);
});
test('all supported dragon fragment recipes consume their documented count and preserve remainder',()=>{
 for(const [id,r] of Object.entries(ITEMS.fragments)){
  const s=createGame(now);s.items[id]=r.cost*2+3;
  const n=action(s,'composeActivityFragment',{id:Number(id),count:2},now);
  assert.equal(n.items[id],3);assert.equal(n.giftEggs.length,2);assert(n.giftEggs.every(e=>e.dragonId===r.dragonId));
  assert.throws(()=>action(n,'composeActivityFragment',{id:Number(id)},now),/不足/);validate(JSON.parse(JSON.stringify(n)));
 }
});
test('activity-delivered ancient fragments and alternate skeleton name compose into hatchable eggs',()=>{
 for(const id of [7015,7026,7060,7070,7071,7166,7171]){
  const r=ITEMS.fragments[id];assert(r,`missing ${id}`);
  const s=createGame(now);activityDeliver(s,[{type:4,itemId:id,amount:r.cost-1}]);s.activities.history.inventory[`4:${id}`]=2;
  const n=action(s,'composeActivityFragment',{id,count:1},now);
  assert.equal(n.items[id],0);assert.equal(n.activities.history.inventory[`4:${id}`],1);
  assert.equal(n.giftEggs[0].dragonId,r.dragonId);
  const hatch=action(n,'raffleEggHatch',{id:n.giftEggs[0].id},now);
  assert(hatch.incubator.readyAt>now);validate(JSON.parse(JSON.stringify(hatch)));
 }
});
