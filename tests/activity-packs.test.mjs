import SOURCE from '../assets/original/data/activities.mjs';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';
import {activityRows,activityToken} from '../src/historical-activities.mjs';
const now=Date.parse('2026-10-15T00:00:00Z');
test('every generic pack outcome reaches a persistable real inventory, including all pool boundaries',()=>{
 for(const [id,pack] of Object.entries(SOURCE.randomPacks))for(let g=0;g<pack.groups.length;g++){
  const group=pack.groups[g],total=group.reduce((n,r)=>n+r.weight,0);let before=0;
  for(const row of group){const roll=(before+row.weight/2)/total;before+=row.weight;
   for(const amountRoll of [0,.999999]){const s=createGame(now);s.items[id]=1;let call=0;
    const n=action(s,'activityGift',{id:Number(id)},now,()=>{const index=call++;return Math.floor(index/2)===g?(index%2?amountRoll:roll):0;});
    assert.equal(n.items[id],0,`pack ${id}`);const expected={type:row.type,itemId:row.itemId,amount:amountRoll?row.max:row.amount};
    assert.deepEqual(n.activities.history.last[g],expected,`pack ${id} row ${row.sourceRow}`);validate(JSON.parse(JSON.stringify(n)));
   }
  }
 }
});
test('box rewards are actual training pills and equipment fragments; failures preserve chest and save',()=>{
 let s=createGame(now);s.items[7079]=1;s=action(s,'activityGift',{id:7079},now,()=>0);assert(s.items[6022]>0);
 s.items[7167]=1;s=action(s,'activityGift',{id:7167},now,()=>0);assert(Object.values(s.equipmentFragments).some(n=>n>0));
 s.items[7077]=1;s.giftEggs=Array.from({length:200},()=>({id:s.nextId++,dragonId:1001,quality:1,source:'activity'}));const copy=structuredClone(s);
 assert.throws(()=>action(s,'activityGift',{id:7077},now,()=>0),/已满/);assert.deepEqual(s,copy);
 const old=createGame(now);old.items[6025]=1;assert.throws(()=>action(old,'activityGift',{id:6025},now),/旧版宝石/);assert.equal(old.items[6025],1);
});
test('source chests earn ten exchange points each and exchange limit stays unavailable after reload',()=>{
 let s=createGame(now);s.items[6013]=16;s.items[6014]=16;s=action(s,'openLootBox',{id:6013,count:16},now,()=>0);
 const row=activityRows(s,'chest-exchange',now).find(r=>r.goal===160);assert.equal(row.current,160);assert.equal(row.ready,true);
 s=action(s,'historyActivity',{key:'chest-exchange',id:row.id,token:activityToken(s)},now,()=>0);
 assert.equal(activityRows(s,'chest-exchange',now).find(r=>r.id===row.id).current,0);
 s.loot.boxesOpened=100000;s.activities.history.counts[`chest-exchange:${row.id}`]=row.limit;
 assert.equal(activityRows(validate(JSON.parse(JSON.stringify(s))),'chest-exchange',now).find(r=>r.id===row.id).ready,false);
});
