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
