import test from 'node:test';
import assert from 'node:assert/strict';
import SOURCE from '../assets/original/data/activities.mjs';
import {ACTIVITY_CATALOG,ACTIVITY_FAMILIES,activityFamilyEntries} from '../src/activity-catalog.mjs';
test('compact catalog removes repeat cards without losing access to any reward version',()=>{
 assert.equal(ACTIVITY_CATALOG.length,43);
 const reachable=ACTIVITY_CATALOG.flatMap(d=>d.family?activityFamilyEntries(d.family):[d]);
 assert.equal(reachable.length,76);assert.equal(new Set(reachable.map(d=>d.key)).size,76);
 assert.deepEqual(reachable.map(d=>d.key).sort(),SOURCE.activities.map(d=>d.key).sort());
 for(const family of ACTIVITY_FAMILIES){const entry=ACTIVITY_CATALOG.find(d=>d.family===family.key);assert(entry);for(const d of activityFamilyEntries(family.key)){assert(entry.search.includes(d.title));assert.strictEqual(d,SOURCE.activities.find(v=>v.key===d.key));}}
 assert.equal(activityFamilyEntries('unknown').length,0);
});
