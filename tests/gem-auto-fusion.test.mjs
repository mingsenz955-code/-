import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,validate,action} from '../src/game.mjs';
import {gemDefinition,gemAutoFusionMaterials,gemFusionPlan} from '../src/gems.mjs';
import {ORIGINAL_GEMS} from '../assets/original/data/progression.mjs';
test('one-click fusion protects sockets and higher quality; matches manual XP and persists',()=>{
 const s=createGame();s.gemInventory=[{id:'gm-1',type:810101,exp:0},{id:'gm-2',type:810201,exp:3},{id:'gm-3',type:820101,exp:0},{id:'gm-4',type:810301,exp:0}];s.nextGemId=5;s.gemSockets[0]='gm-4';const ids=gemAutoFusionMaterials(s,'gm-1');assert.deepEqual(ids,['gm-2']);const plan=gemFusionPlan(s,'gm-1',ids),next=action(s,'autoFuseGem',{gemId:'gm-1'});assert.equal(next.gemInventory[0].type,plan.type);assert.equal(next.gemInventory[0].exp,plan.exp);assert.deepEqual(next.gemInventory.slice(1).map(v=>v.id),['gm-3','gm-4']);assert.equal(validate(JSON.parse(JSON.stringify(next))).gemSockets[0],'gm-4');assert.equal(s.gemInventory.length,4);assert.throws(()=>action(next,'autoFuseGem',{gemId:'gm-1'}),/没有可吞噬/);
});
test('one-click fusion stops at maximum and does not consume surplus materials',()=>{
 const s=createGame(),penultimate=ORIGINAL_GEMS.find(v=>gemDefinition(v.nextlevel)&&!gemDefinition(gemDefinition(v.nextlevel).nextlevel));s.gemInventory=[{id:'gm-1',type:penultimate.id,exp:penultimate.levelupexp-1},{id:'gm-2',type:810101,exp:0},{id:'gm-3',type:810101,exp:0}];s.nextGemId=4;assert.deepEqual(gemAutoFusionMaterials(s,'gm-1'),['gm-2']);const next=action(s,'autoFuseGem',{gemId:'gm-1'});assert.equal(next.gemInventory[0].type,penultimate.nextlevel);assert.equal(next.gemInventory[1].id,'gm-3');assert.throws(()=>action(next,'autoFuseGem',{gemId:'gm-1'}),/最高等级/);assert.equal(next.gemInventory.length,2);
});
