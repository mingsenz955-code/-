import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {EXPANSION_FREE_STEPS,EXPANSION_PAID_STEPS,EXPANSION_LAST,expansionStep,nextExpansion,EXPANSION_POLICY} from '../src/expansion.mjs';
import {ORIGINAL_EXPANSION_PRICES} from '../assets/original/data/expansion.mjs';

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
