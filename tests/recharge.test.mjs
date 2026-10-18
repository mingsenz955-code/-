import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createGame,validate,action} from '../src/game.mjs';
import {RECHARGE_PRODUCTS,RECHARGE_POLICY,RECHARGE_TEST_MODE,RECHARGE_NOTICE,RECHARGE_DAILY_LIMIT_YUAN,rechargeProduct,rechargeProductIds,rechargeDelivery,rechargeDailyUsage,vipProgress,SINGLE_RECHARGE_TIERS} from '../src/recharge.mjs';
import {ORIGINAL_RECHARGE_PRODUCTS,ORIGINAL_SINGLE_RECHARGE_TIERS,ORIGINAL_VIP_LEVELS} from '../assets/original/data/recharge.mjs';
const T=1800000000000;
const TREASURE_COLUMNS=['id','name','amount','costtype','price','rebate','rebateMultiple','type','display_order','badge','abtest_a','abtest_b','abtest_c','abtest_d','xid','enable','des','shoptype','platform','img','iszhekou','zhekouIcon'];

test('the recharge export keeps the six client 魔晶 products with their own prices and rebates',async()=>{
 const bytes=await fs.readFile(new URL('../assets/original/data/tables.json',import.meta.url));
 const tables=JSON.parse(bytes),report=JSON.parse(await fs.readFile(new URL('../assets/original/data/recharge-provenance.json',import.meta.url),'utf8'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),report.tablesSha256);
 assert.equal(report.productCount,6);
 assert.equal(ORIGINAL_RECHARGE_PRODUCTS.length,6);
 assert.deepEqual(RECHARGE_PRODUCTS.map(product=>product.gems),[50,300,500,1000,2000,5000]);
 assert.deepEqual(RECHARGE_PRODUCTS.map(product=>product.priceYuan),[5,30,50,100,200,500]);
 assert.deepEqual(RECHARGE_PRODUCTS.map(product=>product.rebate),[0,15,40,120,360,1250]);
 // Every product must be the client's own row: shoptype 2, android platform 1, paid in 元.
 const rows=new Map(tables.treasure_items.map(row=>[row[0],Object.fromEntries(TREASURE_COLUMNS.map((key,index)=>[key,row[index]]))]));
 for(const product of RECHARGE_PRODUCTS){
  const row=rows.get(product.id);
  assert(row,'product '+product.id+' must exist in the client table');
  assert.equal(row.amount,product.gems);
  assert.equal(row.price,product.priceJiao);
  assert.equal(row.rebate,product.rebate);
  assert.equal(row.costtype,'r','recharge products are paid in 元');
  assert.equal(row.shoptype,2);
  assert.equal(row.platform,1,'the panel shows the android list');
  assert.equal(row.name,product.name);
 }
 assert.equal(rechargeProduct(999),null,'an unknown tier has no product');
 assert.equal(rechargeProduct(11),null,'the ios duplicate row is not part of the android list');
 assert.deepEqual(rechargeProductIds(),[95,96,97,98,99,100]);
 assert.equal(RECHARGE_POLICY,'original-recharge-products-v1');
 assert.equal(RECHARGE_TEST_MODE,true);
 assert.equal(RECHARGE_DAILY_LIMIT_YUAN,2000);
 assert.match(RECHARGE_NOTICE,/不进行任何真实扣款/);
});

test('the 单笔充值 activity tiers stay separate from the recharge panel',()=>{
 // pcf/danchong hands out its own gift on top of the 魔晶 the account received; conflating the two
 // is what made the earlier build hand out fruit instead of 魔晶.
 assert.equal(ORIGINAL_SINGLE_RECHARGE_TIERS.length,6);
 assert.deepEqual(SINGLE_RECHARGE_TIERS.map(tier=>tier.costYuan),[5,30,50,100,200,500]);
 assert.deepEqual(SINGLE_RECHARGE_TIERS.map(tier=>tier.gems),[50,300,500,1000,2000,5000]);
 assert.deepEqual(SINGLE_RECHARGE_TIERS[0].awards.map(award=>award.name),['1074suipian','神圣果实','培养丹']);
 assert.equal(SINGLE_RECHARGE_TIERS[0].awards[2].num,100);
 assert(RECHARGE_PRODUCTS.every(product=>product.awards===undefined),'recharge products carry no awards of their own');
});

test('a first purchase doubles the tier and later purchases add the client rebate',()=>{
 const first=rechargeDelivery(rechargeProduct(95),{firstPurchase:true});
 assert.deepEqual(first,{gems:100,gift:50,firstPurchase:true});
 const later=rechargeDelivery(rechargeProduct(95),{firstPurchase:false});
 assert.deepEqual(later,{gems:50,gift:0,firstPurchase:false});
 assert.deepEqual(rechargeDelivery(rechargeProduct(96),{firstPurchase:false}),{gems:315,gift:15,firstPurchase:false});
});

test('a test recharge credits 魔晶, tracks the total and never touches gold or food',()=>{
 let s=createGame(T);
 const coinsBefore=s.coins,foodBefore=s.food;
 s=action(s,'recharge',{tierId:95},T);
 assert.equal(s.gems,100,'the first purchase of a tier arrives doubled');
 assert.equal(s.recharge.count,1);
 assert.equal(s.recharge.lastTier,95);
 assert.equal(s.recharge.totalGems,100);
 assert.deepEqual(s.recharge.doubled,[95]);
 s=action(s,'recharge',{tierId:95},T);
 assert.equal(s.gems,150,'a repeated purchase only adds the tier rebate');
 assert.equal(s.recharge.totalGems,150);
 assert.deepEqual(rechargeDailyUsage(s.recharge,T),{day:s.recharge.dailyDay,used:10,remaining:1990});
 const capTest=structuredClone(s);capTest.recharge.dailyYuan=1990;assert.throws(()=>action(capTest,'recharge',{tierId:100},T),/今日充值上限2000元/);
 assert.equal(s.gems,150,'a refused tier must not grant any 魔晶');
 s=action(s,'recharge',{tierId:100},T+86400000);
 assert.equal(s.gems,10150,'the 500 元 tier delivers 5000 魔晶 plus its first-purchase double on top of the 150 already credited');
 assert.equal(s.recharge.totalGems,10150);
 assert.equal(s.recharge.dailyYuan,500);
 for(let i=0;i<3;i++)s=action(s,'recharge',{tierId:100},T+86400000);assert.equal(s.recharge.dailyYuan,2000);assert.throws(()=>action(s,'recharge',{tierId:95},T+86400000),/今日充值上限2000元/);
 assert.equal(s.coins,coinsBefore);
 assert.equal(s.food,foodBefore);
 assert.throws(()=>action(s,'recharge',{tierId:11},T),/找不到这个充值档位/);
});

test('the vip bar counts 累计充值魔晶 from the client needExp column',()=>{
 assert.deepEqual(ORIGINAL_VIP_LEVELS.slice(0,4),[{level:0,needExp:0},{level:1,needExp:50},{level:2,needExp:300},{level:3,needExp:1000}]);
 assert.deepEqual(vipProgress(0),{level:0,total:0,next:{level:1,needExp:50},remaining:50,percent:0});
 assert.equal(vipProgress(49).level,0);
 assert.deepEqual({level:vipProgress(50).level,remaining:vipProgress(50).remaining},{level:1,remaining:250});
 assert.equal(vipProgress(300).level,2);
 assert.equal(vipProgress(100000).next,null);
 assert.equal(vipProgress(100000).percent,100);
});

test('save validation migrates v9 recharge records and rejects malformed ones',()=>{
 const old=createGame(T);
 old.version=9;old.recharge={count:2,lastTier:96};delete old.recharge.totalGems;delete old.recharge.doubled;
 const before=JSON.stringify(old),migrated=validate(old);
 assert.equal(JSON.stringify(old),before,'migration must not touch the loaded file');
 assert.equal(migrated.version,12);
 assert.deepEqual(migrated.recharge,{count:2,lastTier:96,totalGems:0,doubled:[],dailyDay:'',dailyYuan:0});
 const badCount=createGame(T);badCount.recharge={count:-1,lastTier:0,totalGems:0,doubled:[]};
 assert.throws(()=>validate(badCount),/充值记录无效/);
 const badTotal=createGame(T);badTotal.recharge={count:0,lastTier:0,totalGems:-5,doubled:[]};
 assert.throws(()=>validate(badTotal),/累计充值魔晶无效/);
 const badDoubled=createGame(T);badDoubled.recharge={count:0,lastTier:0,totalGems:0,doubled:[95,95]};
 assert.throws(()=>validate(badDoubled),/首充双倍记录无效/);
 const badId=createGame(T);badId.recharge={count:0,lastTier:0,totalGems:0,doubled:[11]};
 assert.throws(()=>validate(badId),/首充双倍记录包含未知档位/);
 const badDaily=createGame(T);badDaily.recharge.dailyDay='2026-99-99';badDaily.recharge.dailyYuan=2001;
 assert.throws(()=>validate(badDaily),/每日充值记录无效/);
});
