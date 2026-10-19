import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {UPDATE_MAIL_V69,mailbox} from '../src/mail.mjs';
import {MUTANT_MAIL_POOL} from '../src/update-gifts.mjs';
import {equipmentDefinition,createEquipmentInstance} from '../src/equipment.mjs';
const T=1800000000000;
test('v69 only sends latest pending gift, gives exact two eggs 100k gems and six purple parts once',()=>{
 for(let index=0;index<MUTANT_MAIL_POOL.length;index++){
 let s=createGame(T);assert.deepEqual(mailbox(s).map(m=>m.id),['gift-five-star-shitdragon-20261019','update-0.16.73','celebration-linhaoran-boss-20261018','update-0.16.71']);
 s=action(s,'claimMail',{id:UPDATE_MAIL_V69.id},T,()=> (index+.5)/MUTANT_MAIL_POOL.length);
 assert.equal(s.gems,100000);assert.equal(s.giftEggs.length,2);assert.equal(s.mail.randomEggs[UPDATE_MAIL_V69.id],MUTANT_MAIL_POOL[index]);assert(s.giftEggs.some(e=>e.dragonId===1204));
 assert.equal(s.equipment.length,6);assert.deepEqual(s.equipment.map(e=>equipmentDefinition(e.type).part),[0,1,2,3,4,5]);
 for(const e of s.equipment){assert.equal(equipmentDefinition(e.type).quality,4);assert.equal(equipmentDefinition(e.type).grade,1);assert.equal(e.star,0);}
 assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);assert.throws(()=>action(s,'claimMail',{id:UPDATE_MAIL_V69.id},T),/已经领取/);
 s=action(s,'deleteReadMail',{},T);assert.equal(mailbox(s).length,4);assert.throws(()=>action(s,'claimMail',{id:UPDATE_MAIL_V69.id},T),/领取/);
 }
});
test('v69 two-egg capacity and six-equipment refusal are fully atomic, stacking can rescue full warehouse',()=>{
 for(const reason of ['eggs','equipment']){
 const s=createGame(T);if(reason==='eggs'){s.giftEggs=Array.from({length:199},(_,i)=>({id:4+i,dragonId:1001,quantity:1,source:'activity'}));s.nextId=203;}else{s.equipment=Array.from({length:1995},(_,i)=>createEquipmentInstance(`eq-${i+1}`,501200));s.nextEquipId=1996;}
 const before=structuredClone(s);assert.throws(()=>action(s,'claimMail',{id:UPDATE_MAIL_V69.id},T,()=>0),/已满|空间不足/);assert.deepEqual(s,before);
 }
 const s=createGame(T);s.giftEggs=Array.from({length:200},(_,i)=>({id:4+i,dragonId:i===0?2002:i===1?1204:1001,quantity:1,source:'activity'}));s.nextId=204;
 const result=action(s,'claimMail',{id:UPDATE_MAIL_V69.id},T,()=>0);assert.equal(result.giftEggs.length,200);assert.equal(result.giftEggs[0].quantity,2);assert.equal(result.giftEggs[1].quantity,2);
});
