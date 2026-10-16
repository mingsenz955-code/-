import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createGame,validate,action} from '../src/game.mjs';
import {ownedLands,availableLands,landPrice,nextIslandOffer,islandOwnership,currentIsland,LANDS_IN_ISLAND,ORIGINAL_LANDS} from '../src/expansion.mjs';
import {unlockedIslands} from '../src/islands.mjs';
import {MISSIONS,createMissions} from '../src/missions.mjs';
const T=1800000000000;
const rich=()=>({...createGame(T),coins:1e7,gems:10000});
test('named client price is a choice between 4000 gold and 2 gems, not level 2 and both currencies',()=>{
 const base=rich(),g=action(base,'expandLand',{landId:11,currency:'g'},T),c=action(base,'expandLand',{landId:11,currency:'c'},T);
 assert.equal(g.coins,base.coins-4000);assert.equal(g.gems,base.gems);assert.equal(c.gems,9998);assert.equal(c.coins,base.coins);assert.equal(g.playerXp,0);assert.equal(unlockedIslands(g),1);assert.deepEqual(g.expansion.lands,[12,13,15,16,11]);assert.equal(landPrice(g).gems,4);
 assert.throws(()=>action(g,'expandLand',{landId:11},T),/已拥有/);assert.throws(()=>action(base,'expandLand',{landId:22},T),/尚未解锁/);assert.throws(()=>action(base,'expandLand',{currency:'x'},T),/货币/);
 assert.throws(()=>action({...base,gems:1},'expandLand',{currency:'c'},T),/魔晶不足/);assert.equal(base.expansion.lands,undefined);
});
test('original island cost requires finishing prior island, then grants only its original first land',()=>{
 let s=rich();assert.throws(()=>action(s,'unlockIsland',{island:2},T),/先扩建完/);
 for(const id of [11,14,17,18])s=action(s,'expandLand',{landId:id},T);
 assert.equal(islandOwnership(s,1),'full');assert.equal(nextIslandOffer(s).price,100000);const coins=s.coins;s=action(s,'unlockIsland',{island:2},T);assert.equal(s.coins,coins-100000);assert.equal(currentIsland(s),2);assert.equal(islandOwnership(s,2),'partial');assert(s.expansion.lands.includes(22));assert.throws(()=>action(s,'unlockIsland',{island:3},T),/先扩建完/);
 for(const id of [21,23,24])s=action(s,'expandLand',{landId:id,currency:'c'},T);
 let gems=s.gems;s=action(s,'unlockIsland',{island:3},T);assert.equal(s.gems,gems-125);
 for(const id of [32,33,34,35,36])s=action(s,'expandLand',{landId:id,currency:'c'},T);
 gems=s.gems;s=action(s,'unlockIsland',{island:4},T);assert.equal(s.gems,gems-500);s=action(s,'expandLand',{landId:41},T);
 assert.equal(ownedLands(s).length,20);assert.equal(availableLands(s).length,0);assert.equal(nextIslandOffer(s),null);assert.throws(()=>action(s,'expandLand',{},T),/下一座/);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))).expansion,s.expansion);
});
test('legacy island accesses, paid space and all residents survive reading and first new purchase',()=>{
 const s=rich();s.expansion={plots:9};const raw=JSON.stringify(s);assert.equal(unlockedIslands(s),4);assert.equal(ownedLands(s).length,13);assert.equal(JSON.stringify(s),raw);const n=action(s,'expandLand',{currency:'c'},T);assert.equal(unlockedIslands(n),4);assert.equal(n.expansion.plots,10);assert.deepEqual(n.dragons,s.dragons);assert.deepEqual(n.habitats,s.habitats);assert.equal(n.coins,s.coins);assert.deepEqual(validate(JSON.parse(raw)).expansion,{plots:9});assert.throws(()=>validate({...s,expansion:{plots:9,lands:[12,13,15,16,22,22]}}),/地块记录/);
});
test('island completion mission checks all parcels rather than numeric expansion count',()=>{
 let s=rich();s.expansion={plots:3};const goal=MISSIONS.find(g=>g.kind==='IslandComplete'&&g.args[0]===2);assert(goal);s.missions={...createMissions(),done:MISSIONS.filter(g=>g.id!==goal.id).map(g=>g.id)};s=action(s,'activateMissions',{},T);assert(!s.missions.done.includes(goal.id));
 for(const id of [21,23,24])s=action(s,'expandLand',{landId:id},T);assert(s.missions.done.includes(goal.id));
});
test('export includes the exact literal 8/4/6/2 island grouping and named data provenance',async()=>{assert.deepEqual(LANDS_IN_ISLAND.map(a=>a.length),[8,4,6,2]);assert.equal(ORIGINAL_LANDS.length,16);assert.deepEqual(ORIGINAL_LANDS.find(l=>l.id===11),{id:11,tx:5,ty:65,w:8,h:11,island:1,img_name:'island_1_new',x:-466,y:54});const report=JSON.parse(await fs.readFile(new URL('../assets/original/data/expansion-provenance.json',import.meta.url)));assert.match(report.columns[2],/cash/);assert.match(report.columns[4],/neighbors/);});
