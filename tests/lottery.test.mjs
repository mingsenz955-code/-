import {test} from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {createHash} from 'node:crypto';
import {createGame,validate,action} from '../src/game.mjs';
import {lotteryCost,lotteryPool,sampleLottery,LOTTERY_POLICY} from '../src/lottery.mjs';
import {SaveStore} from '../desktop/save-store.mjs';
const T=1800000000000;
function fixture(){const s=createGame(T);s.gems=3000;return s;}

test('draw export preserves original rows while offline probability interpretation remains explicit',async()=>{
 const bytes=await fs.readFile(new URL('../assets/original/data/tables.json',import.meta.url));const report=JSON.parse(await fs.readFile(new URL('../assets/original/data/lottery-provenance.json',import.meta.url),'utf8'));assert.equal(createHash('sha256').update(bytes).digest('hex'),report.tablesSha256);
 const source=JSON.parse(bytes).Dragonrand;assert.equal(source.length,43);
 for(const mode of [1,2]){const pool=lotteryPool(mode);assert.equal(pool.length,mode===1?15:28);let prior=0;for(const row of pool){const original=source.find(r=>r[0]===row.id);assert.deepEqual([row.id,row.mode,row.type,row.itemId,row.min,row.max,row.offlineCumulative],original.slice(0,7));assert(row.offlineCumulative>prior);prior=row.offlineCumulative;assert(row.min<=row.max);}assert.equal(prior,100000);}
 assert.equal(report.offlinePolicy,LOTTERY_POLICY);assert(report.unverified.length>0);
});

test('single/ten costs spend matching tokens first then exact gem shortage; failed batches are transactional',()=>{
 let s=fixture();s.lottery.normalTokens=20;s.lottery.advancedTokens=100;
 assert.deepEqual(lotteryCost(s.lottery,1,1),{tokens:20,gems:10,total:30,tokenKey:'normalTokens'});
 let next=action(s,'lotteryDraw',{mode:1,count:1},T,()=>0);assert.equal(next.gems,2990);assert.equal(next.lottery.normalTokens,0);assert.equal(next.lottery.advancedTokens,100);assert.equal(next.lottery.pending.length,1);assert.equal(s.lottery.pending.length,0);
 next=action(next,'lotteryDraw',{mode:2,count:10},T,()=>0);assert.equal(next.gems,2290);assert.equal(next.lottery.advancedTokens,0);assert.equal(next.lottery.draws,11);
 for(const payload of [{mode:1,count:2},{mode:3,count:1},{mode:1,count:'10'}])assert.throws(()=>action(s,'lotteryDraw',payload,T));
 s.gems=0;s.lottery.advancedTokens=0;const before=JSON.stringify(s);assert.throws(()=>action(s,'lotteryDraw',{mode:2,count:1},T),/不足/);assert.equal(JSON.stringify(s),before);
 s=fixture();const original=JSON.stringify(s);let n=0;assert.throws(()=>action(s,'lotteryDraw',{mode:1,count:10},T,()=>++n===4?NaN:0),/随机值/);assert.equal(JSON.stringify(s),original);
});

test('offline sampler respects cumulative boundaries and inclusive quantity bounds without a fake pity',()=>{
 assert.equal(sampleLottery(1,()=>0).amount,1000);
 let i=0;assert.equal(sampleLottery(1,()=>[0,0.999999][i++]).amount,5000);
 assert.equal(sampleLottery(1,()=>0.29999).type,1);assert.equal(sampleLottery(1,()=>0.3).type,2);
 assert.equal(sampleLottery(1,()=>0.50002).itemId,1001);assert.equal(sampleLottery(1,()=>0.999999).itemId,1045);
 for(const value of [-1,1,Infinity,NaN])assert.throws(()=>sampleLottery(1,()=>value));
});

test('30 pending slots block draws before debit or random generation; claiming resources cannot duplicate',()=>{
 let s=fixture();for(let i=0;i<3;i++)s=action(s,'lotteryDraw',{mode:1,count:10},T,()=>0);
 const before=JSON.stringify(s);assert.throws(()=>action(s,'lotteryDraw',{mode:1,count:1},T,()=>{throw Error('RNG must not be called')}),/30格/);assert.equal(JSON.stringify(s),before);
 const claimed=action(s,'lotteryClaimResources',{},T);assert.equal(claimed.coins,s.coins+30000);assert.equal(claimed.lottery.pending.length,0);assert.equal(claimed.lottery.draws,30);assert.throws(()=>action(claimed,'lotteryClaimResources',{},T),/没有待领取/);
});

test('won dragon goes to chosen compatible habitat once; full or incompatible habitats retain the reward',()=>{
 let s=fixture();s=action(s,'lotteryDraw',{mode:1,count:1},T,()=>0.52);const prize=s.lottery.pending[0];assert.equal(prize.itemId,1001);
 const placed=action(s,'lotteryPlace',{id:prize.id,habitatId:1},T);assert.equal(placed.dragons.length,3);assert.equal(placed.dragons.at(-1).id,prize.id);assert.equal(placed.dragons.at(-1).level,1);assert.equal(placed.lottery.pending.length,0);assert.equal(placed.stats.hatches,0);assert.throws(()=>action(placed,'lotteryPlace',{id:prize.id,habitatId:1},T));
 const full=action(placed,'lotteryDraw',{mode:1,count:1},T,()=>0.52),snapshot=JSON.stringify(full);assert.throws(()=>action(full,'lotteryPlace',{id:full.lottery.pending[0].id,habitatId:1},T),/已满/);assert.equal(JSON.stringify(full),snapshot);
 const water=s.nextId++;s.habitats.push({id:water,name:'水巢',buildingId:30,lastCollected:T});assert.throws(()=>action(s,'lotteryPlace',{id:prize.id,habitatId:water},T),/元素/);
});

test('v1-v4 saves migrate without granting draw currency and reject malformed/newer lottery records',()=>{
 for(const version of [1,2,3,4]){const s=createGame(T);s.version=version;delete s.lottery;const before=JSON.stringify(s),next=validate(s);assert.equal(next.version,6);assert.deepEqual(next.lottery,{normalTokens:0,advancedTokens:0,draws:0,pending:[]});assert.equal(JSON.stringify(s),before);assert.deepEqual(next.dragons,s.dragons);}
 const s=action(fixture(),'lotteryDraw',{mode:1,count:1},T,()=>0.52);
 for(const mutate of [s=>delete s.lottery,s=>s.lottery.normalTokens=-1,s=>s.lottery.pending[0].id=2,s=>s.lottery.pending[0].sourceRow=-1,s=>s.lottery.pending[0].amount=2,s=>s.lottery.pending[0].policy='server-verified',s=>s.lottery.pending[0].mode=2]){const bad=structuredClone(s);mutate(bad);assert.throws(()=>validate(bad));}
});

test('actual disk reload preserves draw outcomes and costs; resource claim and dragon placement survive restart',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'yulong-lottery-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const store=new SaveStore(dir);
 let s=action(fixture(),'lotteryDraw',{mode:1,count:1},T,()=>0);s=action(s,'lotteryDraw',{mode:1,count:1},T,()=>0.52);await store.save(s);
 let resumed=(await new SaveStore(dir).load()).state;assert.deepEqual(resumed,s);resumed=action(resumed,'lotteryClaimResources',{},T);const id=resumed.lottery.pending[0].id;resumed=action(resumed,'lotteryPlace',{id,habitatId:1},T);await store.save(resumed);assert.deepEqual((await new SaveStore(dir).load()).state,resumed);assert.equal(resumed.gems,2940);
});

test('v4 disk migration preserves ranch and keeps original save as backup before first v5 draw',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'yulong-lottery-migrate-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const store=new SaveStore(dir),old=fixture();old.version=4;delete old.lottery;
 await fs.writeFile(store.file,JSON.stringify(old));const migrated=(await store.load()).state;assert.equal(migrated.version,6);assert.deepEqual(migrated.dragons,old.dragons);assert.equal(JSON.parse(await fs.readFile(store.file,'utf8')).version,4);
 const drawn=action(migrated,'lotteryDraw',{mode:1,count:1},T,()=>0.52);await store.save(drawn);assert.deepEqual(JSON.parse(await fs.readFile(store.backup,'utf8')),old);assert.deepEqual((await new SaveStore(dir).load()).state,drawn);
});
