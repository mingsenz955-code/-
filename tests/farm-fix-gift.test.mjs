import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {FARM_FIX_GIFT as mail} from '../src/campaign-gifts.mjs';
import {RULES} from '../src/data.mjs';
import {equipmentDefinition} from '../src/equipment.mjs';
import {runeDefinition} from '../src/runes.mjs';
test('farm fix gift delivers a maxed adult with six equipped orange pieces and four red runes once',()=>{
 let s=createGame();s=action(s,'claimMail',{id:mail.id});const d=s.dragons.at(-1);
 assert.equal(d.species,'original1204');assert.equal(d.level,RULES.maxLevel);assert.equal(d.star,5);
 assert.equal(s.equipment.length,6);assert(s.equipment.every(e=>e.dragonid===d.id&&e.star===5&&equipmentDefinition(e.type).grade===100&&equipmentDefinition(e.type).quality===5));
 assert.equal(s.runes.length,4);assert(s.runes.every(r=>r.dragonid===d.id&&runeDefinition(r.type).level===10&&runeDefinition(r.type).quality===6));
 assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);assert.throws(()=>action(s,'claimMail',{id:mail.id}),/已经领取/);
});
test('full rune bag retains the entire gift for retry',()=>{
 for(const bag of ['runes']){const s=createGame();s.runes=Array.from({length:497},(_,i)=>({id:`fw-${i+1}`,type:60101,exp:0,dragonid:0}));s.nextRuneId=498;
 const before=structuredClone(s);assert.throws(()=>action(s,'claimMail',{id:mail.id}),/空位|已满/);assert.deepEqual(s,before);}
});
test('full nests receive a max adult in warehouse, restart and later place without losing levels or gear',()=>{
 let s=createGame();s.dragons.push({id:s.nextId++,species:'leaf',level:1,habitatId:1});s=action(s,'claimMail',{id:mail.id});const p=s.giftDragons[0];assert(p);assert.equal(s.dragons.length,3);assert(s.equipment.every(e=>e.dragonid===0));s=validate(JSON.parse(JSON.stringify(s)));
 assert.throws(()=>action(s,'lotteryPlace',{id:p.id,habitatId:1}),/已满/);assert.throws(()=>action(s,'claimMail',{id:mail.id}),/已经领取/);
 s.dragons.pop();s=action(s,'lotteryPlace',{id:p.id,habitatId:1});assert.equal(s.giftDragons.length,0);assert.equal(s.dragons.at(-1).level,RULES.maxLevel);assert.equal(s.dragons.at(-1).star,5);assert(s.equipment.every(e=>e.dragonid===p.id));assert(s.runes.every(e=>e.dragonid===p.id));assert.deepEqual(validate(s),s);
});
