import test from 'node:test';
import assert from 'node:assert/strict';
import {battleTurnPlan} from '../src/battle-turns.mjs';
test('all slots act against every enemy count, including a single opponent',()=>{
 for(let w=1;w<=6;w++)for(let l=1;l<=6;l++){
  const plan=battleTurnPlan(w,l),dead=new Set();
  for(const t of plan){assert(t.actor<(t.winning?w:l));assert(t.target<(t.winning?l:w));assert(!dead.has(t.winning?t.target:t.actor));if(t.finishing)dead.add(t.target);}
  for(const winning of [true,false])assert.equal(new Set(plan.filter(t=>t.winning===winning&&t.round===1).map(t=>t.actor)).size,winning?w:l);
  assert.equal(dead.size,l);
  assert.equal(new Set(plan.filter(t=>t.winning&&t.round===2).map(t=>t.actor)).size,w);
 }
});
