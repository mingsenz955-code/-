import test from 'node:test';
import assert from 'node:assert/strict';
import SOURCE from '../assets/original/data/activities.mjs';
import {ACTIVITY_CATALOG,ACTIVE_ACTIVITY_KEYS,RETIRED_ACTIVITY_KEYS} from '../src/activity-catalog.mjs';
import {createGame,validate} from '../src/game.mjs';
test('curated activities remove repeated versions without dropping saved claims or inventory',()=>{
 assert.equal(ACTIVITY_CATALOG.length,19);assert.equal(new Set(ACTIVE_ACTIVITY_KEYS).size,19);assert.equal(RETIRED_ACTIVITY_KEYS.length,57);
 for(const d of ACTIVITY_CATALOG)assert.strictEqual(d,SOURCE.activities.find(v=>v.key===d.key));
 for(const prefix of ['wheel-','limited-','egg-event-','monopoly-'])assert.equal(ACTIVE_ACTIVITY_KEYS.filter(k=>k.startsWith(prefix)).length,1);
 assert(!ACTIVE_ACTIVITY_KEYS.some(k=>k.startsWith('fire-')||k.startsWith('recharge-wheel-')));
 const s=validate(createGame()),before=structuredClone(s.activities.history);validate(s);assert.deepEqual(s.activities.history,before);assert.equal(SOURCE.activities.length,76);
});
