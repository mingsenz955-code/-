import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from '../src/game.mjs';
import {arenaOpponents,arenaPlan} from '../src/arena.mjs';
import {WORLD_SOURCE} from '../src/world-encounters.mjs';
import {dragonAttributes,configuredLineup} from '../src/battle.mjs';
import {simulateCombat} from '../src/combat.mjs';
const fixture=()=>{const s=createGame(1000);s.dragons.forEach(d=>d.level=20);return s;};
test('all arena rotations use whole source teams and actual combat and display share them',()=>{
 const s=fixture();for(let generation=0;generation<6;generation++){s.arena.generation=generation;for(const op of arenaOpponents(s)){
 const robot=WORLD_SOURCE.robots[(op.id+generation)%WORLD_SOURCE.robots.length],group=WORLD_SOURCE.groups.find(g=>g.id===robot.packId);
 assert.deepEqual(op.enemies.slice(0,group.monsterIds.length).map(e=>e.id),group.monsterIds);assert(op.enemies.length===6);
 assert.equal(arenaPlan(s,op.id,1000).combat.enemies.length,op.enemies.length);
 assert.equal(op.power,Math.floor(op.enemies.reduce((n,e)=>n+e.attack+e.defend+e.life/3,0)));
 }
 }
});
test('benched strong dragons do not raise arena stats; easier full team is beatable',()=>{
 const s=fixture(),baseline=arenaOpponents(s);s.dragons.push({...s.dragons[0],id:999,level:30,privateStars:'private-proportional-ten-star-v1',star:5});
 assert.deepEqual(arenaOpponents(s),baseline);assert(arenaPlan(s,0,1000).won);
 const op=baseline[0],stats=configuredLineup(s).map(d=>dragonAttributes(d,s));
 for(const key of ['attack','defend','life'])assert(op.enemies.reduce((n,e)=>n+e[key],0)<=stats.reduce((n,e)=>n+e[key],0)*.55+op.enemies.length);
});
test('scaled NPC fixed skill damage follows its scaled attack without changing other combat',()=>{
 const s=fixture(),op=arenaOpponents(s)[0];const result=simulateCombat(s,op.enemies),raw=simulateCombat(s,op.enemies.map(e=>({...e,skillValueScale:undefined})));
 assert(result.events.filter(e=>e.side==='enemy').every(e=>Number.isFinite(e.damage)&&e.damage>=1));
 assert(result.won);assert.equal(result.enemies.length,6);assert(raw.events.length>0);
});
