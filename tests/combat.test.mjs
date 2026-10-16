import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,action} from '../src/game.mjs';
import {simulateCombat,hitDamage,COMBAT_POLICY} from '../src/combat.mjs';
import {battleEnemyGroup} from '../src/battle.mjs';
const T=1792128840000;
test('same attack and skill never escalate damage with round or remaining HP; every death is actual damage',()=>{
 const s=createGame(T);s.formation=[2];const enemies=[{species:'original1202',level:20,attack:1,defend:50,life:50000}],allyStats={2:{attack:100,defend:10000,life:100000}};
 const r=simulateCombat(s,enemies,{allyStats});assert.equal(r.policy,COMBAT_POLICY);assert(r.draw);assert(r.enemies[0].hp>0);assert.equal(r.rounds,30);
 assert.deepEqual([...new Set(r.events.filter(t=>t.side==='ally'&&t.slot===1).map(t=>t.damage))],[66]);
 const hp={ally:[100000],enemy:[50000]};for(const e of r.events){const side=e.side==='ally'?'enemy':'ally';assert.equal(e.hpBefore,hp[side][e.target]);assert.equal(e.hpAfter,Math.max(0,e.hpBefore-e.damage));assert.equal(e.appliedDamage,e.hpBefore-e.hpAfter);assert(e.damage>=1);hp[side][e.target]=e.hpAfter;}
 assert.equal(r.enemies[0].hp,hp.enemy[0]);assert.equal(r.allies[0].hp,hp.ally[0]);
});
test('damage includes source coefficient and flat bonus, defence and overkill without a finishing multiplier',()=>{
 assert.equal(hitDamage(100,0,{damageVector:5000,damageValue:-1}),50);assert.equal(hitDamage(100,100,{damageVector:12000,damageValue:300}),210);assert.equal(hitDamage(100,0,{damageVector:10000,damageValue:0}),100);
 assert.throws(()=>hitDamage(NaN,10,null));const s=createGame(T);s.formation=[2];const r=simulateCombat(s,[{species:'original1011',level:7,attack:1,defend:0,life:10}],{allyStats:{2:{attack:100,defend:1,life:1000}}});assert(r.won);assert.equal(r.events.length,1);assert.equal(r.events[0].damage,100);assert.equal(r.events[0].appliedDamage,10);assert.equal(r.enemies[0].hp,0);
});
test('settlement uses the same real HP solver as presentation and retains the existing adventure balance',()=>{
 let s=createGame(T);s.dragons.forEach(d=>d.level=20);const enemies=battleEnemyGroup(100101).monsters,combat=simulateCombat(s,enemies);assert(combat.won);const next=action(s,'battleResolve',{nodeId:100101},T,()=>0);assert.equal(next.adventure.lastBattle.won,combat.won);assert.equal(next.adventure.lastBattle.rounds,combat.rounds);assert.equal(next.adventure.lastBattle.combatPolicy,COMBAT_POLICY);
 const weak=createGame(T),lost=simulateCombat(weak,enemies);assert(!lost.won);assert.equal(action(weak,'battleResolve',{nodeId:100101},T).adventure.lastBattle.won,lost.won);
});
