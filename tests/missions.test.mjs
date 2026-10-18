import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {ORIGINAL_LEVELS} from '../src/data.mjs';
import {MISSIONS,createMissions,activeMissions,missionTarget} from '../src/missions.mjs';
const now=1800000000000;
function fixture(id=null){const s=createGame(now);s.coins=1e8;s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===99).xp_required;if(id!==null){s.missions=createMissions();s.missions.done=MISSIONS.slice(0,MISSIONS.findIndex(g=>g.id===id)).map(g=>g.id);}return s}
test('source registered chain has 147 missions, at most ten active and no commented tutorial rows',()=>{
 assert.equal(MISSIONS.length,147);assert.equal(new Set(MISSIONS.map(g=>g.id)).size,147);assert.equal(MISSIONS[0].id,6);assert(!MISSIONS.some(g=>g.id===183));assert(MISSIONS.every(g=>Number.isSafeInteger(missionTarget(g))&&missionTarget(g)>0));
 const old=fixture();old.stats.harvests=999;const copy=structuredClone(old),s=action(old,'activateMissions',{},now);assert.deepEqual(old,copy);assert.equal(activeMissions(s).length,10);assert.equal(s.missions.progress[6],0);
 assert(s.missions.done.includes(15),'source absence-of-obstacle completion rule');
});
test('only active future planting counts, original rewards issue once and dismiss never reissues',()=>{
 let s=action(fixture(),'activateMissions',{},now),before=structuredClone(s);
 s=action(s,'plant',{cropId:2},now);assert.equal(s.missions.progress[6],0);
 s=action(s,'harvest',{},now+300000);before=structuredClone(s);
 s=action(s,'plant',{cropId:1},now+300001);assert(s.missions.done.includes(6));assert.equal(s.food,before.food+250);assert.equal(s.playerXp,before.playerXp+350);
 const saved=validate(JSON.parse(JSON.stringify(s)));s=action(saved,'dismissMission',{id:6},now+300002);assert.equal(s.food,saved.food);assert.equal(s.playerXp,saved.playerXp);assert.throws(()=>action(s,'dismissMission',{id:6},now+300003),/没有/);
});
test('purchased farm must finish construction and unlocks the next original task',()=>{
 let s=action(fixture(),'activateMissions',{},now);s=action(s,'buyStructure',{itemId:17},now);assert(!s.missions.done.includes(9));assert.equal(s.missions.progress[9],1);
 const id=s.structures.at(-1).id,before=structuredClone(s);s=action(s,'completeStructure',{id},now+300000);assert(s.missions.done.includes(9));assert.equal(s.coins,before.coins+1000);assert.equal(s.missions.progress[9],2);assert.equal(activeMissions(s).length,10);
});
test('hatching respects prerequisite and suppresses linked speed mission without granting its reward',()=>{
 let s=fixture(21);s.missions.done=s.missions.done.filter(id=>id!==20);s.incubator={source:'raffle',parents:[],species:'tide',phase:'hatching',readyAt:now-1};s=action(s,'hatch',{habitatId:1},now);assert(s.missions.done.includes(21));assert(s.missions.linked.includes(20));assert(!s.missions.done.includes(20));assert(!s.missions.notices.includes(20));
});
test('task save rejects unknown, negative, duplicate or unearned notification records',()=>{
 for(const modify of [m=>m.progress[6]=-1,m=>m.progress[999999]=1,m=>m.done.push(6,6),m=>m.notices.push(6)]){const s=fixture(6);modify(s.missions);assert.throws(()=>validate(s),/任务/);}
});
