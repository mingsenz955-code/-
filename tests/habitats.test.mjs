import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createGame,validate,action,income} from '../src/game.mjs';
import {SPECIES,ORIGINAL_LEVELS} from '../src/data.mjs';
import {ORIGINAL_HABITATS,habitatInfo,acceptsDragon,habitatLimit,habitatBuildStatus,snapHabitatPosition,canPlaceHabitat} from '../src/habitats.mjs';
const T=1800000000000;
const earth=Object.keys(SPECIES).find(k=>SPECIES[k].attributes?.length===1&&SPECIES[k].attributes[0]==='e');
function fixture(level=8){const s=createGame(T);s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===level).xp_required;s.coins=10000000;s.gems=500;return s}
function build(s,id){s=action(s,'build',{buildingId:id},T);return action(s,'completeHabitat',{id:s.habitats.at(-1).id},s.habitats.at(-1).job.readyAt)}

test('level-one habitat limit explains why purchase is blocked without charging; level two and expansion reopen capacity',()=>{
 const s=fixture(1),before=structuredClone(s),status=habitatBuildStatus(s,1);
 assert.equal(status.blocked,true);assert.equal(status.limit,1);assert.deepEqual(status.next,{level:2,limit:2});
 assert.throws(()=>action(s,'build',{buildingId:26},T),/当前 1\/1 座.*2 级/);assert.deepEqual(s,before);
 const two=fixture(2);assert.equal(habitatBuildStatus(two,2).blocked,false);
 const built=action(two,'build',{buildingId:26},T);assert.equal(built.habitats.length,2);assert.equal(habitatBuildStatus(built,2).blocked,true);
 const expanded=action(built,'expandIsland',{},T);assert.equal(habitatBuildStatus(expanded,2).blocked,false);
});
test('all 18 client habitat definitions have verified exported images and differing capacities/storage',async()=>{assert.equal(ORIGINAL_HABITATS.length,18);for(const h of ORIGINAL_HABITATS){assert(h.nameCN&&!h.nameCN.includes('Habitat'));await fs.access(new URL('../'+h.image,import.meta.url));}assert.equal(habitatInfo({buildingId:26}).maxGold,500);assert.equal(habitatInfo({buildingId:31}).maxGold,50000);assert.equal(habitatInfo({buildingId:40}).capacity,1)});
test('v2 generic habitat migration preserves three mixed dragons, stored coins and paused jobs',()=>{const s=fixture();s.version=2;s.dragons.push({id:4,species:'mist',level:1,habitatId:1});s.nextId=5;s.habitats[0].storedCoins=1234.5;s.nest={phase:'hatching',species:'steam',parents:[2,3],readyAt:T+9000};const restored=validate(JSON.parse(JSON.stringify(s)));assert.equal(restored.version,12);assert.deepEqual(restored.habitats,s.habitats);assert.deepEqual(restored.dragons,s.dragons);assert.deepEqual(restored.incubator,s.nest)});
test('construction gates, exact cost, real source timer and XP survive serialization',()=>{let s=fixture();s=action(s,'build',{buildingId:26},T);const h=s.habitats.at(-1);assert.equal(s.coins,9999900);assert.equal(h.job.readyAt,T+10000);assert(!acceptsDragon(h,earth));assert.throws(()=>action(s,'completeHabitat',{id:h.id},T+9999),/尚未完成/);const xp=s.playerXp;s=action(validate(JSON.parse(JSON.stringify(s))),'completeHabitat',{id:h.id},T+10000);assert.equal(s.playerXp,xp+100);assert(acceptsDragon(s.habitats.at(-1),earth));assert.throws(()=>action(s,'completeHabitat',{id:h.id},T+10001),/尚未完成/)});
test('element compatibility and capacity failure are transactional and retain eggs',()=>{let s=build(fixture(),28);const h=s.habitats.at(-1);assert.throws(()=>action(s,'move',{id:3,habitatId:h.id},s.updatedAt),/属性/);s=action(s,'move',{id:2,habitatId:h.id},s.updatedAt);s.incubator={phase:'hatching',species:'ember',parents:[2,3],readyAt:s.updatedAt};s=action(s,'hatch',{habitatId:h.id},s.updatedAt);s.incubator={phase:'hatching',species:'ember',parents:[2,3],readyAt:s.updatedAt};const before=structuredClone(s);assert.throws(()=>action(s,'hatch',{habitatId:h.id},s.updatedAt),/已满/);assert.deepEqual(s,before)});
test('per-element storage caps and upgrade retain residents and fractional stored gold',()=>{let s=build(fixture(),26);const h=s.habitats.at(-1);s.dragons.push({id:s.nextId++,species:earth,level:20,habitatId:h.id});assert.equal(income(s,h,s.updatedAt+86400000),500);s=action(s,'upgradeHabitat',{id:h.id},s.updatedAt+86400000);assert.equal(s.habitats.at(-1).storedCoins,500);assert.equal(s.habitats.at(-1).job.readyAt,s.updatedAt+30000);const end=s.habitats.at(-1).job.readyAt;s=action(s,'completeHabitat',{id:h.id},end);assert.equal(s.habitats.at(-1).buildingId,27);assert.equal(habitatInfo(s.habitats.at(-1)).capacity,4);assert.equal(s.dragons.at(-1).habitatId,h.id);assert(income(s,s.habitats.at(-1),end+60000)>500)});
test('source limits include construction sites; user explicitly unlocked source hidden offers',()=>{assert.equal(habitatLimit(1),1);assert.equal(habitatLimit(8),7);assert.throws(()=>action(createGame(T),'build',{buildingId:28},T),/数量上限/);const open=fixture();open.gems=100000;assert.equal(action(open,'build',{buildingId:41},T).habitats.at(-1).buildingId,41);assert.equal(action(open,'build',{buildingId:36},T).habitats.at(-1).buildingId,36);let s=fixture(2);s=action(s,'build',{buildingId:28},T);assert.throws(()=>action(s,'build',{buildingId:26},T),/数量上限/)});
test('legendary construction debits gems and rejects insufficient gems without mutation',()=>{let s=fixture();s.gems=99;const before=structuredClone(s);assert.throws(()=>action(s,'build',{buildingId:40},T),/魔晶不足/);assert.deepEqual(s,before);s.gems=100;s=action(s,'build',{buildingId:40},T);assert.equal(s.gems,0);assert.equal(s.habitats.at(-1).job.readyAt,T+7200000)});
test('placement snaps to source-style cells, rejects collisions and persists',()=>{let s=fixture(),position=snapHabitatPosition([35.25,61.5]);assert(canPlaceHabitat(s.habitats,1,position));s=action(s,'placeHabitat',{id:1,position:[35.25,61.5]},T);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))).habitats[0].position,position);s=build(s,26);const second=s.habitats.at(-1);assert.throws(()=>action(s,'placeHabitat',{id:second.id,position},s.updatedAt),/重叠/);for(const change of [h=>h.position=[NaN,55],h=>h.position=[55],h=>h.buildingId=999,h=>h.job={kind:'upgrade',targetId:27,startedAt:T,readyAt:T+1000}]){const bad=structuredClone(s);change(bad.habitats[0]);assert.throws(()=>validate(bad))}});
test('source legen flag allows every holy/ancient dragon into the 100-gem habitat',()=>{
 const marked=Object.entries(SPECIES).filter(([,d])=>d.isLegendHabitat);assert(marked.length>=16);
 for(const [species] of marked){assert(acceptsDragon({buildingId:40},species),species);assert(!acceptsDragon({buildingId:28},species),species);assert(!acceptsDragon({buildingId:40,job:{kind:'build'}},species))}
 assert(acceptsDragon({buildingId:40},'original1052'),'ordinary l-element crystal dragon remains supported');
 assert(!acceptsDragon({buildingId:40},'ember'),'basic fire dragon is not made legendary by this fix');
});
test('holy move and ancient hatch use source eligibility, capacity and restart-compatible save',()=>{
 let s=build(fixture(),40);const habitat=s.habitats.at(-1);
 s.dragons.push({id:s.nextId++,species:'original1072',level:7,habitatId:1});const holy=s.dragons.at(-1);
 s=action(s,'move',{id:holy.id,habitatId:habitat.id},s.updatedAt);
 s.incubator={phase:'hatching',species:'original1206',parents:[],source:'raffle',readyAt:s.updatedAt};
 assert.throws(()=>action(s,'hatch',{habitatId:habitat.id},s.updatedAt),/已满/);
 s=action(s,'move',{id:holy.id,habitatId:1},s.updatedAt);
 s=action(s,'hatch',{habitatId:habitat.id},s.updatedAt);
 const restored=validate(JSON.parse(JSON.stringify(s)));assert.equal(restored.dragons.at(-1).species,'original1206');assert.equal(restored.dragons.at(-1).habitatId,habitat.id);assert.equal(restored.incubator,null);
});
test('pre-fix holy residents in elemental habitats stay readable without reopening wrong placement',()=>{
 const s=fixture();s.habitats.push({id:4,buildingId:34,name:'电巢',lastCollected:T});s.dragons.push({id:5,species:'original1072',level:7,habitatId:4});s.nextId=6;
 assert.equal(validate(JSON.parse(JSON.stringify(s))).dragons.at(-1).habitatId,4);
 assert(!acceptsDragon(s.habitats[1],'original1072'));
});
