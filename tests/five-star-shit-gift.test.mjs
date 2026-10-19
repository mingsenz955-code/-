import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {FIVE_STAR_SHIT_GIFT as mail} from '../src/campaign-gifts.mjs';
import {mailbox} from '../src/mail.mjs';
import {dragonStarRow} from '../src/dragon-stars.mjs';
test('every save receives exactly one five-star Shit dragon and 20000 gems via mail',()=>{
 for(const old of [false,true]){let s=createGame();s.gems=79;if(old){delete s.giftDragons;s=validate(JSON.parse(JSON.stringify(s)));}assert(mailbox(s).some(m=>m.id===mail.id&&!m.claimed));const before=structuredClone(s);s=action(s,'claimMail',{id:mail.id});const d=s.dragons.at(-1);assert.equal(d.species,'original1044');assert.equal(d.star,5);assert.equal(d.level,1);assert.equal(dragonStarRow(d).dragonId,1044);assert.equal(s.gems,20079);assert.equal(s.dragons.length,before.dragons.length+1);for(const key of ['equipment','runes','coins','food','giftEggs'])assert.deepEqual(s[key],before[key]);s=validate(JSON.parse(JSON.stringify(s)));assert.throws(()=>action(s,'claimMail',{id:mail.id}),/已经领取/);s=action(s,'deleteReadMail');assert(!mailbox(s).some(m=>m.id===mail.id));assert.throws(()=>action(s,'claimMail',{id:mail.id}),/已经领取/);}
});
test('full habitats keep five-star dragon in warehouse through reload and placement',()=>{
 let s=createGame();s.dragons.push({id:s.nextId++,species:'leaf',level:1,habitatId:1});s=action(s,'claimMail',{id:mail.id});assert.equal(s.gems,20000);assert.equal(s.dragons.length,3);assert.equal(s.giftDragons.length,1);const p=s.giftDragons[0];assert.equal(p.itemId,1044);assert.equal(p.star,5);s=validate(JSON.parse(JSON.stringify(s)));assert.throws(()=>action(s,'lotteryPlace',{id:p.id,habitatId:1}),/已满/);s.dragons.pop();s=action(s,'lotteryPlace',{id:p.id,habitatId:1});assert.equal(s.giftDragons.length,0);assert.equal(s.dragons.at(-1).species,'original1044');assert.equal(s.dragons.at(-1).star,5);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);
});
test('full pending warehouse leaves mail and currency untouched for retry',()=>{
 const s=createGame();s.dragons.push({id:s.nextId++,species:'leaf',level:1,habitatId:1});s.giftDragons=Array.from({length:200},()=>({id:s.nextId++,itemId:1044,type:16,amount:1,gift:mail.id,level:1,star:5,equipmentIds:[],runeIds:[]}));validate(s);const before=structuredClone(s);assert.throws(()=>action(s,'claimMail',{id:mail.id}),/已满/);assert.deepEqual(s,before);
});
