import {test} from 'node:test';import assert from 'node:assert/strict';
import {HISTORICAL_ACTIVITIES,visibleActivities,activityRows,activityToken} from '../src/historical-activities.mjs';
import {activityIntroduction} from '../src/activity-introduction.mjs';
import {createGame,action,validate} from '../src/game.mjs';
test('each activity has specific participation rules and retired rewards are no longer offered',()=>{
 for(const d of HISTORICAL_ACTIVITIES){const r=activityIntroduction(d);assert(r.title&&r.text.length>20,d.key);for(const row of d.items)assert(!row.rewards.some(p=>[12,13,30].includes(p.type)),d.key);}
 assert(!visibleActivities().some(d=>d.key==='legacy-sign'));
 const s=createGame();for(const key of ['tycoon-1','tycoon-3','tycoon-4'])assert(activityRows(s,key).every(r=>r.rewards.length));
});
test('first recharge shows a single completion and never deletes saved retired rewards or grants new ones',()=>{
 let s=createGame();s.recharge.count=68;s.activities.history.inventory['30:40']=2;
 const rows=activityRows(s,'first');assert.equal(rows[0].current,1);assert.equal(rows[0].goal,1);
 s=action(s,'historyActivity',{key:'first',id:1,token:activityToken(s)});assert.equal(s.activities.history.inventory['30:40'],2);assert(!s.activities.history.last.some(p=>p.type===30));
 assert.equal(s.giftEggs.at(-1).dragonId,1075);const n=validate(JSON.parse(JSON.stringify(s)));assert.equal(n.activities.history.inventory['30:40'],2);assert(n.activities.history.claims.first.includes(1));
});
