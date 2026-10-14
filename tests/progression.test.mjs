import {test} from 'node:test';
import assert from 'node:assert/strict';
import CATALOG from '../assets/original/catalog.mjs';
import {ORIGINAL_BREEDING} from '../assets/original/data/rules.mjs';
import {dragonAcquisition} from '../src/acquisition.mjs';
import {evolutionRequirements} from '../src/evolution.mjs';

test('all 90 dragons retain original shop fields and every positive source breeding row',()=>{
 for(const dragon of CATALOG){
  const info=dragonAcquisition(dragon.id),original=dragon.original;
  assert.equal(info.shop.listed,original.in_store===1||original.in_store===true);
  assert.deepEqual(info.shop.costs,original.costs??{});
  assert.equal(info.shop.minLevel,original.min_level??null);
  const expected=ORIGINAL_BREEDING.filter(row=>row[3]===1&&row.some((value,index)=>index>=4&&index%2===0&&value===dragon.id&&row[index+1]>0));
  assert.deepEqual(info.breeding.map(pair=>pair.sourceRow),expected.map(row=>row[0]));
  assert.equal(info.otherSources,'unverified');
  const snapshot=JSON.stringify(info);info.breeding.pop();info.shop.costs.g=-1;
  assert.equal(JSON.stringify(dragonAcquisition(dragon.id)),snapshot,'A browser cannot rewrite source evidence');
 }
 assert.equal(dragonAcquisition(-1),null);
});

test('evolution preview has source quality costs and separate 15/25 gates without rolling success',()=>{
 const first=evolutionRequirements(1000);assert.equal(first.minLevel,15);assert.equal(first.cap,20);
 assert.deepEqual(first.costs,{coins:20000,food:1500,evolutionFruit:500,holyFruit:0});
 const second=evolutionRequirements(1000,1);assert.equal(second.minLevel,25);assert.equal(second.cap,50);
 assert.deepEqual(second.costs,{coins:40000,food:3000,evolutionFruit:1000,holyFruit:0});
 assert.equal(evolutionRequirements(1000,2).max,true);
 assert.equal(evolutionRequirements(-1),null);
 assert.throws(()=>evolutionRequirements(1000,3),/阶段无效/);
 for(const dragon of CATALOG){assert(evolutionRequirements(dragon.id));assert(!Object.hasOwn(evolutionRequirements(dragon.id),'successProbability'));}
});
