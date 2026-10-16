import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,action,validate,incubatorSpeedCost} from '../src/game.mjs';
import {profileOf,nicknameError,profileAvatars} from '../src/player-profile.mjs';
import {dragonLevelCap} from '../src/dragon-levels.mjs';
import {MISSIONS,createMissions,missionRewards} from '../src/missions.mjs';
import {speciesKey} from '../src/data.mjs';
const T=1800000000000;
test('original rename length, first free then 100 gems, invalid and unaffordable edits atomic',()=>{
 let s=createGame(T);const old=structuredClone(s);assert.equal(profileOf(s).name,'御龙高手');assert.deepEqual(s,old);
 s=action(s,'renamePlayer',{name:'小龙牧场'},T);assert.equal(s.gems,0);assert.equal(s.profile.renameCount,1);
 const before=structuredClone(s);assert.throws(()=>action(s,'renamePlayer',{name:'明森牧场'},T),/魔晶不足/);assert.deepEqual(s,before);
 s.gems=200;s=action(s,'renamePlayer',{name:'明森牧场'},T);assert.equal(s.gems,100);assert.equal(s.profile.renameCount,2);
 for(const name of ['', '1234567','小 龙','龙!','🐉'])assert(nicknameError(name));
 const copy=structuredClone(s);assert.throws(()=>action(s,'renamePlayer',{name:'龙!'},T),/符号/);assert.deepEqual(s,copy);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);
});
test('heads only include owned/discovered dragons and survive selling the owner and restarting',()=>{
 let s=createGame(T);assert(profileAvatars(s).some(p=>p.id===1000));assert(!profileAvatars(s).some(p=>p.id===1200));
 assert.throws(()=>action(s,'changePlayerAvatar',{avatar:1200},T),/已拥有/);
 s=action(s,'changePlayerAvatar',{avatar:1000},T);assert.equal(s.profile.avatar,1000);s=action(s,'sellDragon',{id:3},T);assert.equal(s.profile.avatar,1000);assert(profileAvatars(s).some(p=>p.id===1000));
 const loaded=validate(JSON.parse(JSON.stringify(s)));assert.equal(loaded.profile.avatar,1000);assert.equal(loaded.profile.id,s.profile.id);
 const bad=structuredClone(s);bad.profile.avatar=99999;assert.throws(()=>validate(bad),/资料/);
});
test('all five original SpeedBreed tasks are completed by actual paid breed acceleration, once',()=>{
 for(const g of MISSIONS.filter(m=>m.kind==='SpeedBreed')){
  let s=createGame(T);s.gems=10000;s.playerXp=2060309900;
  s.dragons.forEach((d,i)=>{d.species=speciesKey(g.args[0][i%g.args[0].length]);d.level=4;});
  s.breeding={phase:'breeding',parents:[2,3],species:s.dragons[0].species,startedAt:T,readyAt:T+3600000,hatchMs:1000};
  s.missions={...createMissions(),done:MISSIONS.filter(m=>m.id!==g.id).map(m=>m.id)};
  const cost=incubatorSpeedCost(s.breeding.readyAt,T),gemReward=missionRewards(g).filter(r=>r.type===3).reduce((a,r)=>a+r.amount,0);
  const n=action(s,'speedBreed',{},T);assert(n.missions.done.includes(g.id));assert.equal(n.gems,s.gems-cost+gemReward);assert.equal(n.breeding.readyAt,T);
  assert.throws(()=>action(n,'speedBreed',{},T),/结束/);validate(JSON.parse(JSON.stringify(n)));
 }
});
test('base cap 10; completed source altars unlock 15/20/25/30, construction grants no early cap',()=>{
 const s=createGame(T);assert.equal(dragonLevelCap(s),10);s.dragons[0].level=10;s.food=100000;
 assert.throws(()=>action(s,'feed',{id:2},T),/上限10/);
 for(const [id,cap] of [[9,15],[10,20],[11,25],[12,30]]){
  s.structures=[{id:100,itemId:id,position:[50,50],readyAt:T+10000}];assert.equal(dragonLevelCap(s),10);
  delete s.structures[0].readyAt;assert.equal(dragonLevelCap(s),cap);
 }
});
test('original 25 and 30 level tasks can be achieved through actual four-feed level-up',()=>{
 for(const [id,level,altar] of [[146,25,11],[159,30,12]]){
  let s=createGame(T);s.food=100000;s.playerXp=2060309900;s.dragons.forEach(d=>d.level=level-1);s.structures=[{id:100,itemId:altar,position:[50,50]}];s.nextId=101;
  s.missions={...createMissions(),done:MISSIONS.filter(g=>g.id!==id).map(g=>g.id)};
  s=action(s,'feedAll',{id:2},T);assert.equal(s.dragons[0].level,level);assert(!s.missions.done.includes(id),'original task needs two dragons');s=action(s,'feedAll',{id:3},T);assert(s.missions.done.includes(id));assert.equal(s.stats.feeds,8);validate(JSON.parse(JSON.stringify(s)));
  if(level===30)assert.throws(()=>action(s,'feed',{id:2},T),/上限30/);
 }
});
