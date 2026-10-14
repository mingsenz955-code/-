import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createGame,validate,action} from '../src/game.mjs';
import {RECHARGE_TIERS,RECHARGE_TEST_MODE,RECHARGE_NOTICE,rechargeTier,rechargeTierIds,isTicketAward} from '../src/recharge.mjs';
import {ORIGINAL_RECHARGE_TIERS} from '../assets/original/data/recharge.mjs';
const T=1800000000000;

test('the recharge export keeps all six client tiers and their prices',async()=>{
 const bytes=await fs.readFile(new URL('../assets/original/data/tables.json',import.meta.url));
 const tables=JSON.parse(bytes),report=JSON.parse(await fs.readFile(new URL('../assets/original/data/recharge-provenance.json',import.meta.url),'utf8'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),report.tablesSha256);
 assert.equal(ORIGINAL_RECHARGE_TIERS.length,tables.danchong.length);
 assert.deepEqual(rechargeTierIds(),[1,2,3,4,5,6]);
 assert.deepEqual(RECHARGE_TIERS.map(tier=>tier.costYuan),[5,30,50,100,200,500]);
 assert.equal(rechargeTier(1).costIOS,6,'the first tier costs six on iOS');
 assert.equal(rechargeTier(99),null);
 assert.equal(RECHARGE_TEST_MODE,true);
 assert.match(RECHARGE_NOTICE,/不进行任何真实扣款/);
});

test('every tier carries real award names resolved from the client tables',()=>{
 assert.deepEqual(rechargeTier(1).awards.map(award=>award.name),['1074suipian','神圣果实','培养丹']);
 assert.equal(rechargeTier(1).awards[2].num,100);
 assert.equal(rechargeTier(6).awards.at(-1).name,'高级召唤卡');
 assert(RECHARGE_TIERS.every(tier=>tier.awards.length>0));
 assert(isTicketAward({id:6049}));
 assert(!isTicketAward({id:7015}));
});

test('a test recharge grants the awards for free and tickets reach the raffle save',()=>{
 let s=createGame(T);
 const coinsBefore=s.coins,gemsBefore=s.gems,foodBefore=s.food;
 s=action(s,'recharge',{tierId:6},T);
 assert.equal(s.coins,coinsBefore,'a test recharge must not move gold');
 assert.equal(s.gems,gemsBefore,'a test recharge must not move gems');
 assert.equal(s.food,foodBefore);
 assert.equal(s.raffle.tickets['6049'],1,'the 高级召唤卡 is the senior raffle ticket');
 assert.equal(s.items[7015],10);
 assert.equal(s.items[50002],2);
 assert.equal(s.recharge.count,1);
 assert.equal(s.recharge.lastTier,6);
 s=action(s,'recharge',{tierId:6},T);
 assert.equal(s.raffle.tickets['6049'],2,'repeating a tier stacks its awards');
 assert.equal(s.items[7015],20);
 assert.equal(s.recharge.count,2);
 assert.throws(()=>action(s,'recharge',{tierId:99},T),/找不到这个充值档位/);
});

test('save validation rejects malformed item bags and recharge records',()=>{
 const badBag=createGame(T);badBag.items={abc:1};
 assert.throws(()=>validate(badBag),/道具库存/);
 const badCount=createGame(T);badCount.items={7015:-1};
 assert.throws(()=>validate(badCount),/道具库存记录无效/);
 const badRecharge=createGame(T);badRecharge.recharge={count:-1,lastTier:0};
 assert.throws(()=>validate(badRecharge),/充值记录无效/);
});
