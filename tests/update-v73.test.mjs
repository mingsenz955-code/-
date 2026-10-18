import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {ORIGINAL_LEVELS} from '../src/data.mjs';
import {structureDefinition} from '../src/structures.mjs';
import {bossInfo} from '../src/world-encounters.mjs';
const T=1800000000000;
const fixture=()=>{const s=createGame(T);s.coins=1e7;s.gems=1000;s.playerXp=ORIGINAL_LEVELS.at(-1).xp_required;return s;};
test('large farm five-minute construction starts on placement and expired speed action completes free once',()=>{
 let s=action(fixture(),'buyStructure',{itemId:17,deferConstruction:true},T);const o=s.structures.at(-1);assert.equal(structureDefinition(17).build_time,300);
 s=action(s,'placeStructure',{id:o.id,position:o.position,islandId:o.islandId},T+50000);const at=s.structures.at(-1).readyAt;assert.equal(at,T+350000);
 const gems=s.gems;s=action(s,'speedBuilding',{kind:'structure',id:o.id},at);assert.equal(s.gems,gems);assert(!s.structures.at(-1).readyAt);const xp=s.playerXp;
 assert.throws(()=>action(s,'speedBuilding',{kind:'structure',id:o.id},at),/没有正在施工/);assert.equal(s.playerXp,xp);
 s=action(s,'plant',{farmId:o.id,cropId:1},at);assert(s.structures.at(-1).farm);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);
});
test('20M and 5M boss progress normalizes to 10M once without changing historical damage',()=>{
 for(const [policy,cap]of [['fixed-20m-v1',20000000],['fixed-5m-v1',5000000]]){const s=fixture();s.encounters.boss.hpPolicy=policy;s.encounters.boss.damage=cap/2;s.encounters.boss.totalDamage=30000000;const n=validate(s);assert.equal(bossInfo(n).life,10000000);assert.equal(n.encounters.boss.damage,5000000);assert.equal(n.encounters.boss.totalDamage,30000000);assert.deepEqual(validate(n),n);}
});
