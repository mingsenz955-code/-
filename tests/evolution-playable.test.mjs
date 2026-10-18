import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {speciesKey} from '../src/data.mjs';
import {evolutionPlan,evolutionRate} from '../src/evolution.mjs';
import {dragonAttributes,dragonPower} from '../src/battle.mjs';
import {awakeningConfig,awakeningStatus} from '../src/dragon-awakening.mjs';
import {dragonActivitySources} from '../src/acquisition.mjs';
import {rechargeDailyUsage} from '../src/recharge.mjs';
import {activityDefinition,activityToken} from '../src/historical-activities.mjs';
const T=Date.parse('2026-10-18T04:00:00Z');
function fixture(species=speciesKey(1020)){const s=createGame(T);s.dragons[0]={id:2,species,level:15,star:5,habitatId:1};s.coins=1e8;s.food=1e8;s.items[7027]=1e6;s.items[7028]=10000;return s;}
test('evolution consumes exact original costs, failures accumulate and both phases change actual battle attributes and persist',()=>{
 let s=fixture(),d=s.dragons[0],base=dragonAttributes(d,s),power=dragonPower(d,s),p=evolutionPlan(s,2,1020),before=structuredClone(s);
 s=action(s,'evolveDragon',{id:2},T,()=>.99);assert.deepEqual(s.dragons[0].evolution,{phase:0,value:1});assert.equal(s.coins,before.coins-p.costs.find(c=>c.key==='coins').need);assert.equal(s.items[7027],before.items[7027]-p.costs.find(c=>c.key==='ef').need);
 s.dragons[0].evolution.value=20;s=action(s,'evolveDragon',{id:2},T,()=>.999);assert.deepEqual(s.dragons[0].evolution,{phase:1,value:0});assert.equal(dragonAttributes(s.dragons[0],s).attack,Math.floor(base.attack*1.15));assert(dragonPower(s.dragons[0],s)>power);
 const locked=structuredClone(s);assert.throws(()=>action(s,'evolveDragon',{id:2},T,()=>0),/25级/);assert.deepEqual(s,locked);
 s.dragons[0].level=25;s.dragons[0].evolution.value=50;s=action(s,'evolveDragon',{id:2},T,()=>.999);assert.equal(evolutionRate(s.dragons[0]),1.3224999999999998);assert.equal(validate(JSON.parse(JSON.stringify(s))).dragons[0].evolution.phase,2);assert.throws(()=>action(s,'evolveDragon',{id:2},T),/最高阶段/);
});
test('holy evolution uses both fruit inventories atomically and protects invalid or locked operations',()=>{
 let s=fixture('original1200'),p=evolutionPlan(s,2,1200);assert.equal(p.costs.find(c=>c.key==='lf').need,2);assert(!p.costs.some(c=>c.key==='coins'));
 s.items[7028]=1;const before=structuredClone(s);assert.throws(()=>action(s,'evolveDragon',{id:2},T),/不足/);assert.deepEqual(s,before);
 s.items[7028]=3;s.dragons[0].level=14;assert.throws(()=>action(s,'evolveDragon',{id:2},T),/15级/);s.dragons[0].level=15;
 s=action(s,'evolveDragon',{id:2},T,()=>.5);assert.equal(s.items[7028],1);assert.equal(s.dragons[0].evolution.value,1);
 const bad=structuredClone(s);bad.dragons[0].evolution={phase:3,value:0};assert.throws(()=>validate(bad),/进化/);
 assert.throws(()=>action(s,'evolveDragon',{id:2},T,()=>NaN),/不足/);
});
test('complete source awakening configurations of ancient species can advance beyond five with source costs',()=>{
 for(const id of [1092,1093,1200,1202,1203]){let s=fixture('original'+id);assert(awakeningConfig(s.dragons[0]));s=action(s,'dragonAwaken',{id:2,op:'start'},T);for(const item of [7111,7112,7113,7114])s.items[item]=100;for(let n=1;n<=5;n++){s.dragons[0].wake.exp=awakeningStatus(s.dragons[0]).row[4];s=action(s,'dragonAwaken',{id:2,op:'upgrade'},T);assert.equal(s.dragons[0].wake.star,n);}assert.equal(validate(s).dragons[0].wake.star,5);}
});
test('all five ancient species have accessible original activity rewards or composable fragments',()=>{
 for(const id of [1200,1202,1203,1205,1206]){const sources=dragonActivitySources(id);assert(sources.length,`missing ${id}`);for(const e of sources)assert(activityDefinition(e.key));}
 let s=fixture();s.gems=100000;for(const key of ['limited-1','limited-2','limited-3','limited-4']){s=action(s,'historyActivity',{key,count:1,token:activityToken(s)},T,()=>0);s=action(s,'historyActivity',{key,id:1,op:'rankClaim',token:activityToken(s)},T,()=>0);}assert([1200,1202,1203,1205].every(id=>s.giftEggs.some(e=>e.dragonId===id)));
 s.items[7171]=21;s=action(s,'composeActivityFragment',{id:7171,count:1},T);assert.equal(s.items[7171],1);assert(s.giftEggs.some(e=>e.dragonId===1206));
});
test('daily 2000 yuan cap preserves prior daily use, refuses excess atomically and resets at Beijing midnight',()=>{
 let s=fixture();for(let i=0;i<4;i++)s=action(s,'recharge',{tierId:100},T);assert.equal(s.recharge.dailyYuan,2000);const before=structuredClone(s);assert.throws(()=>action(s,'recharge',{tierId:95},T),/上限2000/);assert.deepEqual(s,before);
 assert.equal(rechargeDailyUsage(s.recharge,Date.parse('2026-10-18T15:59:59Z')).remaining,0);assert.equal(rechargeDailyUsage(s.recharge,Date.parse('2026-10-18T16:00:00Z')).remaining,2000);
 s=action(s,'recharge',{tierId:100},Date.parse('2026-10-18T16:00:00Z'));assert.equal(s.recharge.dailyYuan,500);
});
