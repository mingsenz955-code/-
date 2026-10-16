import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {grantAncientEggs,ANCIENT_EGGS} from '../src/user-eggs.mjs';
test('explicit ancient gift is idempotent, source-separated, hatchable and save-compatible',()=>{
 const s=createGame();const old=structuredClone(s),eggs=grantAncientEggs(s);assert.equal(eggs.length,5);assert.deepEqual(eggs.map(e=>e.dragonId),ANCIENT_EGGS.map(e=>e.dragonId));assert.equal(s.coins,old.coins);assert.deepEqual(s.raffle,old.raffle);assert.deepEqual(grantAncientEggs(s),[]);validate(s);
 const loaded=validate(JSON.parse(JSON.stringify(s))),hatched=action(loaded,'raffleEggHatch',{id:eggs[0].id});assert.equal(hatched.giftEggs.length,4);assert.equal(hatched.incubator.species,'original1200');assert.equal(hatched.incubator.hatchMs,172800000);assert.equal(hatched.raffle.pending.length,0);
 const sold=action(loaded,'sellRaffleEgg',{id:eggs[0].id});assert.equal(sold.giftEggs.length,4);assert.equal(sold.coins,s.coins+100000);assert.equal(s.giftEggs.length,5);
 const invalid=structuredClone(s);invalid.giftEggs.push({...eggs[0]});assert.throws(()=>validate(invalid));
});

import {grantRareEggStock,RARE_EGGS,eggQuantity} from '../src/user-eggs.mjs';
test('all sacred and ancient stocks persist and consuming one stacked egg retains the rest',()=>{
 let s=createGame();grantAncientEggs(s);const original=structuredClone(s);assert.equal(RARE_EGGS.length,16);grantRareEggStock(s);s=validate(JSON.parse(JSON.stringify(s)));
 for(const d of RARE_EGGS)assert.equal(s.giftEggs.filter(e=>e.dragonId===d.dragonId).reduce((n,e)=>n+eggQuantity(e),0),99);
 assert.deepEqual(grantRareEggStock(s),[]);assert.equal(s.coins,original.coins);assert.deepEqual(s.dragons,original.dragons);assert.deepEqual(s.raffle,original.raffle);
 const egg=s.giftEggs.find(e=>e.quantity===99),hatched=action(s,'raffleEggHatch',{id:egg.id}),sold=action(s,'sellRaffleEgg',{id:egg.id});
 assert.equal(hatched.giftEggs.find(e=>e.id===egg.id).quantity,98);assert.equal(sold.giftEggs.find(e=>e.id===egg.id).quantity,98);assert.equal(s.giftEggs.find(e=>e.id===egg.id).quantity,99);validate(hatched);validate(sold);
 for(const quantity of [0,-1,1.5,1000000]){const bad=structuredClone(s);bad.giftEggs[0].quantity=quantity;assert.throws(()=>validate(bad));}
});
