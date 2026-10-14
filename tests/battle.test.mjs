import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createGame} from '../src/game.mjs';
import {SPECIES} from '../src/data.mjs';
import {BATTLE_POLICY,BATTLE_SLOTS,BATTLE_ROUND_LIMIT,dragonCombatRow,dragonAttributes,dragonPower,lineupPower} from '../src/battle.mjs';
import {ORIGINAL_DRAGON_ATK} from '../assets/original/data/battle.mjs';
const T=1800000000000;

test('the combat export keeps every source row and records the unmodelled terms',async()=>{
 const bytes=await fs.readFile(new URL('../assets/original/data/tables.json',import.meta.url));
 const tables=JSON.parse(bytes),report=JSON.parse(await fs.readFile(new URL('../assets/original/data/battle-provenance.json',import.meta.url),'utf8'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),report.tablesSha256);
 assert.equal(ORIGINAL_DRAGON_ATK.length,tables.Dragon_atks.length);
 assert.equal(report.rows,tables.Dragon_atks.length);
 assert.equal(BATTLE_POLICY,'offline-power-baseline-v1');
 assert.match(report.unverified.join(' '),/crit|Rune/i);
});

test('attributes follow the client growth formula exactly',()=>{
 const quality=SPECIES.leaf.quality;
 assert(Number.isSafeInteger(quality),'the catalog quality must be exported into SPECIES');
 const row=dragonCombatRow(1000,quality);
 assert(row,'the leaf dragon must have a combat row');
 const one=dragonAttributes({species:'leaf',level:1});
 const five=dragonAttributes({species:'leaf',level:5});
 assert.equal(one.attack,Math.floor(row.baseAttack));
 assert.equal(one.defend,Math.floor(row.baseDefence));
 assert.equal(one.life,Math.floor(row.baseLife));
 assert.equal(five.attack,row.baseAttack+4*row.attackQuality);
 assert.equal(five.defend,row.baseDefence+4*row.defenceQuality);
 assert.equal(five.life,row.baseLife+4*row.lifeQuality);
 assert.equal(dragonAttributes({species:'nope',level:1}),null);
 assert.equal(dragonAttributes({species:'bloom',level:1}),null,'legacy prototype dragons have no source row');
});

test('power is the baseline part of the client getPower expression',()=>{
 const stats=dragonAttributes({species:'leaf',level:7});
 const power=dragonPower({species:'leaf',level:7});
 assert.equal(power,Math.floor(stats.attack+stats.defend+stats.life/3));
 const state=createGame(T);
 assert.equal(lineupPower(state.dragons),state.dragons.reduce((total,dragon)=>total+dragonPower(dragon),0));
 assert.equal(BATTLE_SLOTS,6);
 assert.equal(BATTLE_ROUND_LIMIT,30);
});
