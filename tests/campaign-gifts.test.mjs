import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {BOSS_CELEBRATION as mail} from '../src/campaign-gifts.mjs';
import {equipmentDefinition,createEquipmentInstance} from '../src/equipment.mjs';
import {runeDefinition} from '../src/runes.mjs';
import {mailbox} from '../src/mail.mjs';
const T=1800000000000;
test('celebration is available to every save and delivers exact original-max equipment and red runes once',()=>{
 let s=createGame(T);assert(mailbox(s).some(m=>m.id===mail.id));const untouched=structuredClone(s);
 s=action(s,'claimMail',{id:mail.id},T);assert.equal(s.giftEggs.length,1);assert.equal(s.giftEggs[0].dragonId,1201);assert.equal(s.giftEggs[0].quantity,15);
 assert.equal(s.equipment.length,6);assert.deepEqual(s.equipment.map(e=>equipmentDefinition(e.type).part),[0,1,2,3,4,5]);
 assert(s.equipment.every(e=>equipmentDefinition(e.type).grade===100&&equipmentDefinition(e.type).quality===5&&e.star===5));
 assert.equal(s.runes.length,4);assert.deepEqual(s.runes.map(r=>runeDefinition(r.type).equipType),[1,2,3,4]);assert(s.runes.every(r=>runeDefinition(r.type).quality===6&&runeDefinition(r.type).level===10));
 for(const key of ['coins','food','gems','dragons','habitats','arena','encounters'])assert.deepEqual(s[key],untouched[key]);
 assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);assert.throws(()=>action(s,'claimMail',{id:mail.id},T),/已经领取/);
 s=action(s,'deleteReadMail',{},T);assert(!mailbox(s).some(m=>m.id===mail.id));assert.throws(()=>action(s,'claimMail',{id:mail.id},T),/领取/);
});
test('celebration refuses any full inventory atomically and can stack eggs in a full warehouse',()=>{
 for(const kind of ['eggs','equipment','runes']){
  const s=createGame(T);if(kind==='eggs'){s.giftEggs=Array.from({length:200},(_,i)=>({id:i+4,dragonId:1001,source:'activity'}));s.nextId=204;}
  if(kind==='equipment'){s.equipment=Array.from({length:1995},(_,i)=>createEquipmentInstance(`eq-${i+1}`,501200));s.nextEquipId=1996;}
  if(kind==='runes'){s.runes=Array.from({length:497},(_,i)=>({id:`fw-${i+1}`,type:60101,exp:0,dragonid:0}));s.nextRuneId=498;}
  const before=structuredClone(s);assert.throws(()=>action(s,'claimMail',{id:mail.id},T),/已满|空间不足/);assert.deepEqual(s,before);
 }
 let s=createGame(T);s.giftEggs=Array.from({length:200},(_,i)=>({id:i+4,dragonId:i===0?1201:1001,quantity:1,source:'activity'}));s.nextId=204;
 s=action(s,'claimMail',{id:mail.id},T);assert.equal(s.giftEggs.length,200);assert.equal(s.giftEggs[0].quantity,16);
});
