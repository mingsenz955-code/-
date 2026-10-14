import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {EXPANSION_FREE_STEPS,EXPANSION_PAID_STEPS,EXPANSION_LAST,expansionStep,nextExpansion,EXPANSION_POLICY} from '../src/expansion.mjs';
import {ORIGINAL_EXPANSION_PRICES} from '../assets/original/data/expansion.mjs';
import {createGame,validate,action,playerProgress} from '../src/game.mjs';
import {habitatLimit} from '../src/habitats.mjs';
import {ORIGINAL_LEVELS} from '../src/data.mjs';
const T=1800000000000;

test('buying a plot charges the client ladder and actually raises the habitat cap',()=>{
 let s=createGame(T);s.coins=10000000;s.gems=500;
 assert.throws(()=>action(s,'expandIsland',{},T),/等级 2/,'level 1 is below the first paid step');
 s.playerXp=ORIGINAL_LEVELS.find(level=>level.level===8).xp_required;
 const base=habitatLimit(playerProgress(s).level);
 while(s.habitats.length<base)s=action(s,'build',{buildingId:28},T);
 assert.throws(()=>action(s,'build',{buildingId:28},T),/上限/,'the level cap alone blocks one more');
 const coinsBefore=s.coins;
 s=action(s,'expandIsland',{},T);
 assert.equal(s.expansion.plots,1);
 assert.equal(s.coins,coinsBefore-4000,'the first paid step costs 4000 gold');
 s=action(s,'build',{buildingId:28},T);
 assert.equal(s.habitats.length,base+1,'the bought plot allows one more habitat');
 assert.deepEqual(validate(JSON.parse(JSON.stringify(s))).expansion,s.expansion);
});

test('a bought plot cannot be bought twice and the save rejects absurd plot counts',()=>{
 let s=createGame(T);s.coins=10000000;s.gems=500;
 s.playerXp=ORIGINAL_LEVELS.find(level=>level.level===8).xp_required;
 s=action(s,'expandIsland',{},T);
 const after=s.coins;
 assert.throws(()=>action({...s,coins:0},'expandIsland',{},T),/金币不足/,'the second step costs 8000');
 s=action(s,'expandIsland',{},T);
 assert.equal(s.expansion.plots,2);
 assert.equal(after-s.coins,8000,'the second step costs 8000, more than the first');
 const broken=createGame(T);broken.expansion={plots:100000};
 assert.throws(()=>validate(broken),/扩建存档无效/);
});

test('expansion export keeps every source row and records the inferred columns',async()=>{
 const bytes=await fs.readFile(new URL('../assets/original/data/tables.json',import.meta.url));
 const tables=JSON.parse(bytes),report=JSON.parse(await fs.readFile(new URL('../assets/original/data/expansion-provenance.json',import.meta.url),'utf8'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),report.tablesSha256);
 assert.equal(report.rows,tables.expansion_prices.length);
 assert.equal(ORIGINAL_EXPANSION_PRICES.length,tables.expansion_prices.length);
 assert.equal(EXPANSION_POLICY,'offline-expansion-inferred-v1');
 assert.match(report.unverified.join(' '),/column meanings/i);
});

test('the ladder starts with four free plots and then rises in gold and level',()=>{
 assert.equal(EXPANSION_FREE_STEPS,4,'the client ships four cost-free starting plots');
 assert(EXPANSION_PAID_STEPS>90);
 assert.deepEqual(expansionStep(EXPANSION_FREE_STEPS),{index:4,minLevel:2,coins:4000,gems:0});
 for(let index=EXPANSION_FREE_STEPS+1;index<ORIGINAL_EXPANSION_PRICES.length;index++){
  const previous=expansionStep(index-1),current=expansionStep(index);
  assert(current.coins>=previous.coins,`gold at step ${index} must not drop`);
  assert(current.minLevel>=previous.minLevel,`level gate at step ${index} must not drop`);
  // The gem column uses -1 for "no gems needed", so it is checked as a number, not a ladder.
  assert(Number.isSafeInteger(current.gems),`gems at step ${index} must be a number`);
 }
 assert.equal(EXPANSION_LAST.coins,940000,'the last row of the client ladder');
 assert.equal(EXPANSION_LAST.minLevel,100);
});

test('nextExpansion walks only the paid steps and rejects invalid counts',()=>{
 assert.deepEqual(nextExpansion(0),{index:4,minLevel:2,coins:4000,gems:0});
 assert.deepEqual(nextExpansion(1),expansionStep(EXPANSION_FREE_STEPS+1));
 assert.equal(nextExpansion(EXPANSION_PAID_STEPS-1),EXPANSION_LAST);
 assert.equal(nextExpansion(EXPANSION_PAID_STEPS),null,'the client ladder runs out');
 assert.equal(expansionStep(-1),null);
 assert.equal(expansionStep(9999),null);
 assert.throws(()=>nextExpansion(-1),/无效/);
 assert.throws(()=>nextExpansion(1.5),/无效/);
});
