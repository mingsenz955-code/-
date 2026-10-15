import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createGame,validate,action} from '../src/game.mjs';
import {RESOURCE_SHOP_OFFERS,RESOURCE_SHOP_POLICY,RESOURCE_SHOP_TYPES,EVOLUTION_FRUIT_ITEM_ID,resourceShopRow,resourceShopOffersOfType} from '../src/resource-shop.mjs';
import {ORIGINAL_RESOURCE_SHOP} from '../assets/original/data/resource-shop.mjs';
const T=1800000000000;
const TREASURE_COLUMNS=['id','name','amount','costtype','price','rebate','rebateMultiple','type','display_order','badge','abtest_a','abtest_b','abtest_c','abtest_d','xid','enable','des','shoptype','platform','img','iszhekou','zhekouIcon'];

test('the resource shop export is the client treasure table, paid in 魔晶',async()=>{
 const bytes=await fs.readFile(new URL('../assets/original/data/tables.json',import.meta.url));
 const tables=JSON.parse(bytes),report=JSON.parse(await fs.readFile(new URL('../assets/original/data/resource-shop-provenance.json',import.meta.url),'utf8'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),report.tablesSha256);
 assert.equal(RESOURCE_SHOP_POLICY,report.policy);
 assert.equal(ORIGINAL_RESOURCE_SHOP.length,report.rows);
 assert.equal(report.resourceRows,16);
 const rows=new Map(tables.treasure_items.map(row=>[row[0],Object.fromEntries(TREASURE_COLUMNS.map((key,index)=>[key,row[index]]))]));
 for(const row of ORIGINAL_RESOURCE_SHOP){
  const source=rows.get(row.id);
  assert(source,'row '+row.id+' must exist in the client table');
  assert.equal(source.costtype,'c','every row here is paid in 魔晶');
  assert.equal(Boolean(source.enable),row.sourceEnabled,'retain original enable evidence although user unlocked all rows');
  assert.equal(source.amount,row.amount);
  assert.equal(source.price,row.priceGems);
  assert.equal(source.type,row.type);
 }
 assert.equal(RESOURCE_SHOP_OFFERS.length,110,'all source gem-priced rows are open per user request');
 assert(RESOURCE_SHOP_TYPES.i&&RESOURCE_SHOP_TYPES.d);
 assert.equal(resourceShopOffersOfType('g').length,5);
 assert.equal(resourceShopOffersOfType('f').length,5);
 assert.equal(resourceShopOffersOfType('ef').length,4);
 assert.deepEqual(RESOURCE_SHOP_OFFERS.filter(row=>[1,2,3,4,5,6,7,8,107,108,109,110,111,112].includes(row.id)).map(row=>[row.name,row.amount,row.priceGems]),[
  ['少量金币',150000,75],['中量金币',400000,150],['大量金币',1000000,300],['超量金币',2000000,500],
  ['少量食物',10000,75],['中量食物',30000,150],['大量食物',80000,300],['超量食物',150000,500],
  ['少量进化果实',800,75],['中量进化果实',2200,150],['大量进化果实',5000,300],['超量进化果实',10000,500],
  ['中级龙珠',5,120],['高级龙珠',5,300],
 ]);
 assert.equal(resourceShopRow(86).type,'es','user unlocked the old material row');
});

test('buying a resource spends 魔晶 and delivers gold, food or 进化果实',()=>{
 let s=createGame(T);
 s.gems=1000;
 const coins=s.coins,food=s.food;
 s=action(s,'buyResource',{id:4},T);
 assert.equal(s.coins,coins+2000000,'超量金币 pays out the client amount');
 assert.equal(s.gems,500,'and costs the client price');
 s=action(s,'buyResource',{id:5},T);
 assert.equal(s.food,food+10000);
 assert.equal(s.gems,425);
 s=action(s,'buyResource',{id:109},T);
 assert.equal(s.items[EVOLUTION_FRUIT_ITEM_ID],5000,'进化果实 lands in the item bag under the client item id');
 assert.equal(s.gems,125);
 assert.equal(s.items['7027'],5000,'the bag key is the plain item id, which validation accepts');
 assert.deepEqual(validate(JSON.parse(JSON.stringify(s))).items,s.items);
});

test('an unaffordable or unknown purchase is refused instead of inventing resources',()=>{
 const poor=createGame(T);poor.gems=10;
 assert.throws(()=>action(poor,'buyResource',{id:1},T),/魔晶不足/);
 const rich=createGame(T);rich.gems=1000;
 assert(action(rich,'buyResource',{id:86},T).equipmentMaterials.stone>0);
 assert.throws(()=>action(rich,'buyResource',{id:99999},T),/这个商品尚未开放/);
 assert.equal(rich.items[EVOLUTION_FRUIT_ITEM_ID],undefined,'a refused purchase must not deliver anything');
});
