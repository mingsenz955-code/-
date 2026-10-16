import {test} from 'node:test';import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {activityRows,activityToken,trainingMissionPoints} from '../src/historical-activities.mjs';
const now=Date.parse('2026-10-16T08:00:00+08:00');
const act=(s,key,id)=>action(s,'historyActivity',{key,id,token:activityToken(s)},now);
test('source cultivation tasks award points automatically from purchased pills, not random gains or gifts',()=>{
 let s=createGame(now);s.gems=10000;s.activities.history.counts['training-gains']=100000;s.items[6022]=10000;assert.equal(trainingMissionPoints(s),0);
 s=action(s,'buyResource',{id:113},now);assert.equal(s.activities.history.counts['training-purchased-pills'],300);assert.equal(trainingMissionPoints(s),0);
 s=action(s,'buyResource',{id:113},now);assert.equal(trainingMissionPoints(s),60);assert.equal(activityRows(s,'training-missions',now).find(r=>r.id===8).claimed,true);assert.equal(activityRows(s,'training-missions',now).find(r=>r.id===8).ready,false);
 assert.throws(()=>act(s,'training-missions',8),/自动累计/);
 for(let i=0;i<4;i++)s=action(s,'buyResource',{id:114},now);assert.equal(trainingMissionPoints(s),210);const before=s.items[6022];s=act(s,'train-tasks',1);assert.equal(s.items[6022],before+500);assert.equal(trainingMissionPoints(s),210);s=act(s,'train-tasks',2);assert.equal(s.items[6022],before+1500);assert.throws(()=>act(s,'train-tasks',1),/已领取/);s=validate(JSON.parse(JSON.stringify(s)));assert.equal(trainingMissionPoints(s),210);
});
test('all source mission categories use actual consumed pills, perfects, failures and shop quantities only',()=>{
 const s=createGame(now),h=s.activities.history;h.counts['training-pills']=10000;assert.equal(trainingMissionPoints(s),120);h.counts['training-perfect']=15;assert.equal(trainingMissionPoints(s),180);h.counts['training-failures']=15;assert.equal(trainingMissionPoints(s),240);h.counts['training-purchased-pills']=83300;assert.equal(trainingMissionPoints(s),870);h.claims['training-missions']=[1,2,3];assert.equal(trainingMissionPoints(s),870);assert.equal(activityRows(s,'training-missions',now).length,14);
});
test('source cultivation purchase with insufficient gems leaves all resources and task counters unchanged',()=>{const s=createGame(now);s.gems=0;const copy=structuredClone(s);assert.throws(()=>action(s,'buyResource',{id:114},now),/不足/);assert.deepEqual(s,copy);});
test('spring tasks automatically credit each daily reward once and do not regrant after restart',()=>{
 let s=createGame(now);s=action(s,'recharge',{tierId:95},now);assert.equal(s.activities.history.counts['spring-coupons'],10);s=action(s,'recharge',{tierId:95},now);assert.equal(s.activities.history.counts['spring-coupons'],10);s=validate(JSON.parse(JSON.stringify(s)));s=action(s,'activityVisit',{},now);assert.equal(s.activities.history.counts['spring-coupons'],10);s=action(s,'recharge',{tierId:95},now+86400000);assert.equal(s.activities.history.counts['spring-coupons'],20);
});
