import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,validate,action} from '../src/game.mjs';
import {BLOOD_SOURCE,bloodWaves,bloodPlan,bloodToken,bloodEnemies,bloodTeamPower} from '../src/blood-front.mjs';
const now=1792126320000;
const ready=()=>{const s=createGame(now);s.playerXp=2060310572;s.gems=1000;for(const d of s.dragons){d.species='original1200';d.level=20;}return validate(s);};
test('all 50 blood stages have complete source chains and three real enemy packs per wave',()=>{
 assert.equal(BLOOD_SOURCE.waves.length,485);assert.equal(BLOOD_SOURCE.levels.length,50);
 for(const l of BLOOD_SOURCE.levels){const waves=bloodWaves(l.id);assert.equal(waves.filter(w=>w.isFirst).length,1);assert.equal(waves[0].isFirst,1);assert.equal(l.autoPassNeed,waves.length*3);
  for(let i=0;i<waves.length;i++){assert.equal(waves[i].nextMissionId,waves[i+1]?.id??-1);for(const d of [1,2,3]){const es=bloodEnemies(waves[i],d);assert.equal(es.length,3);assert(es.every(e=>e.life>0&&e.attack>0&&e.species));}}
 }
});
test('winning waves settle once, preserve mid-stage progress, grant source pills and unlock sweep after reset',()=>{
 let s=ready();const gems=s.gems,food=s.food;for(let i=0;i<5;i++){const token=bloodToken(s),old=structuredClone(s);assert(bloodPlan(s,3).won);s=action(s,'bloodFight',{difficulty:3,token},now+i);assert.throws(()=>action(s,'bloodFight',{difficulty:3,token},now+i));assert.deepEqual(old.dragons,s.dragons);s=validate(JSON.parse(JSON.stringify(s)));}
 assert.equal(s.bloodFront.stage,2);assert.equal(s.bloodFront.best[1],15);assert.equal(s.bloodFront.totalScore,15);assert.equal(s.items[6022],75);assert.equal(s.gems,gems);assert.equal(s.food,food);
 s=action(s,'bloodReset',{},now+10);assert.equal(s.bloodFront.stage,1);assert.equal(s.bloodFront.resets,0);assert.equal(s.items[6022],75);
 s=action(s,'bloodSweep',{token:bloodToken(s)},now+11);assert.equal(s.bloodFront.stage,2);assert.equal(s.items[6022],150);assert.equal(s.bloodFront.totalScore,15);assert.throws(()=>action(s,'bloodReset',{},now+12));
 s=action(s,'bloodReset',{},now+86400000);assert.equal(s.bloodFront.resets,0);
});
test('failure, unavailable sweep, duplicate buffs and low level never grant rewards or charge twice',()=>{
 const s=ready(),power=bloodTeamPower(s);assert.throws(()=>action(s,'bloodSweep',{token:bloodToken(s)},now));
 const paid=action(s,'bloodBuff',{id:1,currency:'gems'},now);assert.equal(paid.gems,s.gems-1);assert(bloodTeamPower(paid)>power);assert.throws(()=>action(paid,'bloodBuff',{id:1,currency:'gems'},now));assert.equal(paid.gems,999);assert.throws(()=>action(s,'bloodBuff',{id:2,currency:'score'},now));
 const weak=createGame(now);weak.playerXp=s.playerXp;const lost=action(weak,'bloodFight',{difficulty:3,token:bloodToken(weak)},now);assert.equal(lost.bloodFront.wave,0);assert.equal(lost.bloodFront.totalScore,0);assert.equal(lost.items[6022],undefined);assert.equal(lost.bloodFront.last.won,false);
 assert.throws(()=>action(createGame(now),'bloodFight',{difficulty:1,token:bloodToken(createGame(now))},now));
});

test('score buffs spend run currency without reducing stage records; failure clears run points',()=>{
 let s=ready();s=action(s,'bloodFight',{difficulty:3,token:bloodToken(s)},now);s=action(s,'bloodFight',{difficulty:3,token:bloodToken(s)},now+1);const paid=action(s,'bloodBuff',{id:2,currency:'score'},now+2);assert.equal(paid.bloodFront.score,6);assert.equal(paid.bloodFront.totalScore,1);assert.equal(paid.gems,s.gems);assert(paid.bloodFront.buffs.includes(2));
 paid.dragons.forEach(d=>{d.species='ember';d.level=1;});const lost=action(paid,'bloodFight',{difficulty:3,token:bloodToken(paid)},now+3);assert.equal(lost.bloodFront.wave,0);assert.equal(lost.bloodFront.score,0);assert.deepEqual(lost.bloodFront.buffs,[]);assert.equal(lost.items[6022],undefined);
});

test('final stage ends the run, clears temporary points and preserves pills and best score',()=>{
 const s=ready();s.bloodFront.stage=50;s.bloodFront.best[50]=30;s.bloodFront.totalScore=50;const end=action(s,'bloodSweep',{token:bloodToken(s)},now);assert(end.bloodFront.finished);assert.equal(end.bloodFront.totalScore,0);assert.equal(end.bloodFront.best[50],30);assert.equal(end.items[6022],150);assert.throws(()=>action(end,'bloodSweep',{token:bloodToken(end)},now));validate(end);
});

test('daily blood resets honor the original VIP bloodTime allowances',()=>{
 const s=ready();s.recharge.totalGems=100000;const next=action(s,'bloodReset',{},now+86400000);assert.equal(next.bloodFront.resets,2);const again=action(next,'bloodReset',{},now+86400001);assert.equal(again.bloodFront.resets,1);
});
