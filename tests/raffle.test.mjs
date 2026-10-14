import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,validate,action} from '../src/game.mjs';
import {RAFFLE_POLICY,RAFFLE_GUARANTEE_DRAWS,raffleMachine,raffleCost,rafflePool,sampleRaffle,advanceRaffleCounter} from '../src/raffle.mjs';
const T=1800000000000;

test('three machines keep the client prices, ticket ids and guarantees',()=>{
 assert.equal(raffleMachine('junior').single,0);
 assert.equal(raffleMachine('junior').ten,10);
 assert.equal(raffleMachine('mid').single,100);
 assert.equal(raffleMachine('mid').ten,900);
 assert.equal(raffleMachine('senior').single,280);
 assert.equal(raffleMachine('senior').ten,2500);
 assert.deepEqual(['junior','mid','senior'].map(key=>raffleMachine(key).ticket),[6047,6048,6049]);
 assert.equal(raffleMachine('mid').guarantee,4);
 assert.equal(raffleMachine('senior').guarantee,5);
 assert.equal(raffleMachine('junior').guarantee,null);
 assert.equal(raffleMachine('nope'),null);
 for(const key of ['junior','mid','senior'])assert(rafflePool(key).length>0);
});

test('the guaranteed draw lands on 紫 or 橙 and the counter follows the on-screen rule',()=>{
 const mid=sampleRaffle('mid',()=>0,{guarantee:true});
 assert.equal(mid.quality,4);
 assert.equal(mid.policy,RAFFLE_POLICY);
 assert.equal(sampleRaffle('senior',()=>0,{guarantee:true}).quality,5);
 assert.equal(advanceRaffleCounter(0,{machine:'mid',quality:3}),1);
 assert.equal(advanceRaffleCounter(5,{machine:'mid',quality:4}),0,'drawing the guaranteed tier resets it');
 assert.equal(advanceRaffleCounter(4,{machine:'mid',quality:3},{free:true}),4,'a free single draw does not advance it');
 assert.equal(advanceRaffleCounter(9,{machine:'junior',quality:2}),9,'the junior machine has no counter');
 assert.throws(()=>sampleRaffle('mid',()=>1),/随机值无效/);
});

test('cost spends tickets first and tops up with gems',()=>{
 assert.deepEqual(raffleCost({tickets:{6048:30}},'mid',1),{tickets:30,gems:70,total:100,ticketKey:'6048',free:false});
 assert.deepEqual(raffleCost({tickets:{}},'junior',1),{tickets:0,gems:0,total:0,ticketKey:'6047',free:true});
 assert.deepEqual(raffleCost({tickets:{6049:3000}},'senior',10),{tickets:2500,gems:0,total:2500,ticketKey:'6049',free:false});
 assert.throws(()=>raffleCost({tickets:{}},'mid',5),/单抽或十连/);
});

test('drawing debits gems, stores eggs and advances only the tracked machines',()=>{
 let s=createGame(T);s.gems=5000;
 s=action(s,'raffleDraw',{mode:'mid',count:1},T,()=>0);
 assert.equal(s.gems,4900);
 assert.equal(s.raffle.pending.length,1);
 assert.equal(s.raffle.pending[0].policy,RAFFLE_POLICY);
 assert.equal(s.raffle.counters.mid,s.raffle.pending[0].quality===4?0:1,'the counter advances unless the 紫 tier dropped');
 s=action(s,'raffleDraw',{mode:'junior',count:1},T,()=>0);
 assert.equal(s.gems,4900,'the junior single draw costs nothing');
 assert.equal(s.raffle.counters.junior,0);
 assert.throws(()=>action(s,'raffleDraw',{mode:'mid',count:3},T),/单抽或十连/);
});

test('reaching the guarantee threshold forces the 紫 tier and resets the counter',()=>{
 let s=createGame(T);s.gems=100000;s.raffle.counters.mid=RAFFLE_GUARANTEE_DRAWS-1;
 s=action(s,'raffleDraw',{mode:'mid',count:1},T,()=>0.5);
 assert.equal(s.raffle.pending.at(-1).quality,4,'the draw at the threshold is the guaranteed 紫');
 assert.equal(s.raffle.counters.mid,0,'the guaranteed tier resets the counter');
});

test('raffle eggs hatch through the incubator and malformed rows are rejected',()=>{
 let s=createGame(T);s.gems=1000;
 s=action(s,'raffleDraw',{mode:'junior',count:1},T,()=>0);
 const egg=s.raffle.pending[0];
 s=action(s,'raffleEggHatch',{id:egg.id},T);
 assert.equal(s.raffle.pending.length,0);
 assert.equal(s.incubator.source,'raffle');
 assert.deepEqual(s.incubator.parents,[]);
 assert(s.incubator.readyAt>T);
 const badPolicy=createGame(T);badPolicy.raffle.pending=[{id:99,policy:'wrong',machine:'mid',dragonId:1008,quality:4,previewIndex:1}];badPolicy.nextId=100;
 assert.throws(()=>validate(badPolicy));
 const wrongPool=createGame(T);wrongPool.raffle.pending=[{id:99,policy:RAFFLE_POLICY,machine:'junior',dragonId:1008,quality:5,previewIndex:1}];wrongPool.nextId=100;
 assert.throws(()=>validate(wrongPool),/奖池不符/);
});
