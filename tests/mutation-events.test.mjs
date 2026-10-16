import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {mutationChance,mutationEvents,refreshMutations,triggerMutation,mutationNeedsRefresh} from '../src/mutation-events.mjs';
const at=8000000;
function fixture(species='original1002'){const s=createGame(1000);s.gems=10000;s.dragons.forEach(d=>d.level=7);s.breeding={phase:'breeding',species,parents:[2,3],startedAt:at-7200000,readyAt:at,durationMs:7200000,hatchMs:60000};return s;}
test('completion creates encounter before collection, persists once-only decision and cannot reroll on collection',()=>{
 let s=fixture();assert(mutationNeedsRefresh(s,at));s=action(s,'refreshMutations',{},at,()=>0);assert.equal(s.mutations.events[0].tableId,1);assert.equal(s.mutations.events[0].expiresAt,at+1800000);s=validate(JSON.parse(JSON.stringify(s)));assert.equal(s.breeding.mutationChecked,true);assert(!mutationNeedsRefresh(s,at));s=action(s,'takeEgg',{},at,()=>{throw Error('rerolled')});assert.equal(s.mutations.events.length,1);assert.equal(s.breeding.phase,'egg');
 let missed=action(fixture(),'refreshMutations',{},at,()=>.99);assert.equal(missed.mutations.events.length,0);missed=action(missed,'takeEgg',{},at,()=>{throw Error('rerolled')});assert.equal(missed.mutations.events.length,0);
});
test('speedup preserves long breeding eligibility; exact one hour remains ineligible',()=>{
 let s=fixture('ember');s.breeding.readyAt=at+7200000;s.breeding.startedAt=at;s=action(s,'speedBreed',{},at+1000);assert.equal(s.breeding.durationMs,7200000);s=action(s,'refreshMutations',{},at+1000,()=>0);assert.equal(s.mutations.events[0].tableId,11);
 s=fixture('ember');delete s.breeding.durationMs;s.breeding.startedAt=at;s.breeding.readyAt=at+7200000;s=action(s,'speedBreed',{},at+1000);assert.equal(s.breeding.durationMs,7200000);assert(refreshMutations(s,at+1000,()=>0));
 s=fixture('ember');s.breeding.durationMs=3600000;assert(!refreshMutations(s,at,()=>{throw Error('ineligible roll')}));
});
test('offline expired outcome neither evicts five live offers nor rerolls after restart; exact expiry cannot charge',()=>{
 let s=fixture();s.mutations={nextId:6,events:Array.from({length:5},(_,i)=>({id:i+1,tableId:11,expiresAt:at+9000000}))};assert(!refreshMutations(s,at+1800000,()=>0));assert.equal(s.mutations.nextId,6);assert.equal(s.mutations.events.length,5);s=validate(JSON.parse(JSON.stringify(s)));assert(!refreshMutations(s,at+1800000,()=>{throw Error('rerolled')}));
 s.mutations.events=[{id:1,tableId:1,expiresAt:at}];const before=structuredClone(s);assert.throws(()=>action(s,'claimMutation',{id:1},at),/结束/);assert.deepEqual(s,before);s=action(s,'refreshMutations',{},at);assert.equal(s.mutations.events.length,0);
});
test('all fourteen original outcomes settle their actual resource or egg with exact cost and prevent double claim',()=>{
 for(const r of mutationEvents){let s=createGame(at);s.gems=1000;s.mutations={nextId:2,events:[{id:1,tableId:r.id,expiresAt:at+1000}]};const food=s.food,gems=s.gems;s=action(s,'claimMutation',{id:1},at);assert.equal(s.mutations.events.length,0);assert.equal(s.gems,gems-(r.evType===1?r.price:0)+(r.type===3?r.amount:0));if(r.type===5)assert.equal(s.giftEggs.at(-1).dragonId,r.itemId);if(r.id===11)assert.equal(s.food,food+10000);if(r.id===13)assert.equal(s.items[6022],200);if(r.id===14)assert.equal(s.equipmentMaterials.stone,100);assert.throws(()=>action(s,'claimMutation',{id:1},at),/结束/);validate(JSON.parse(JSON.stringify(s)));}
 const s=fixture();s.gems=187;s.mutations={nextId:2,events:[{id:1,tableId:1,expiresAt:at+1000}]};const before=structuredClone(s);assert.throws(()=>action(s,'claimMutation',{id:1},at),/不足/);assert.deepEqual(s,before);
});
test('all ten matching mutant eggs survive purchase, warehouse use, accelerated incubation and habitat placement',()=>{
 for(const r of mutationEvents.filter(r=>r.type===5)){let s=fixture('original'+(r.itemId-1000));assert(triggerMutation(s,s.breeding,at,()=>0));assert.equal(s.mutations.events[0].tableId,r.id);s=action(s,'claimMutation',{id:1},at);const egg=s.giftEggs.at(-1);s=action(s,'raffleEggHatch',{id:egg.id},at);assert.equal(s.giftEggs.length,0);s=action(s,'speedIncubator',{},at);s=action(s,'hatch',{habitatId:1},at);assert.equal(s.dragons.at(-1).species,'original'+r.itemId);assert.equal(validate(JSON.parse(JSON.stringify(s))).dragons.at(-1).species,'original'+r.itemId);}
});
test('invalid completion marker and duration are rejected rather than silently rerolling saves',()=>{for(const field of [{mutationChecked:1},{durationMs:-1},{durationMs:Infinity}]){const s=fixture();Object.assign(s.breeding,field);assert.throws(()=>validate(s),/奇遇培育/);}});

test('user-selected encounter probability is exactly 50 percent at every VIP level',()=>{for(const recharge of [0,1000000]){const s=fixture();s.recharge.totalGems=recharge;assert.equal(mutationChance(s),.5);let calls=0;assert(triggerMutation(s,s.breeding,at,()=>calls++===0?.499999:0));assert(!triggerMutation(s,s.breeding,at,()=>.5));}});
