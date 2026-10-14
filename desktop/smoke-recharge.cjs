const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// 充值 must credit 魔晶 (the client's own product list), and 魔晶 must buy the client's own
// resource-shop rows. The QA also proves the earlier mistake is gone: no fruit or 培养丹 is handed
// out by the recharge panel, and no currency moves without a purchase.
exports.prepare=async store=>{const {createGame}=await import('../src/game.mjs');const fresh=createGame();fresh.log=['充值/资源商店隔离检查档。'];await store.save(fresh)};
exports.run=async(window,store,verify)=>{
 const js=code=>window.webContents.executeJavaScript(code);
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(420)};
 const state=async()=>(await store.load()).state;

 if(verify){
  const restored=await state();
  assert.equal(restored.gems,450,'450 魔晶 must survive: 600 recharged minus 75 gold and 75 fruit');
  assert.equal(restored.recharge.count,1);
  assert.equal(restored.recharge.lastTier,96);
  assert.equal(restored.recharge.totalGems,600);
  assert.deepEqual(restored.recharge.doubled,[96]);
  assert.equal(restored.coins,151200,'the bought gold must survive a restart');
  assert.equal(restored.items[7027],800,'the bought 进化果实 must survive a restart');
  assert.equal(restored.items[7015],undefined,'the recharge panel must not hand out 单笔充值 gifts');
  console.log('PASS recharge 魔晶 and the bought resources survive an independent restart');
  return;
 }

 const before=await state();
 await click('.original-hud [data-action=openRecharge]');
 await wait(900);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceRecharge');
 assert.equal(await js("document.querySelectorAll('#modal .source-recharge-card').length"),6,'the client ships six tiers');
 const text=await js("document.querySelector('#modal').textContent");
 for(const expected of ['50 魔晶','300 魔晶','5000 魔晶','¥5','¥500','再送','VIP'])assert(text.includes(expected),'the panel must show '+expected);
 assert(text.includes('不进行任何真实扣款'),'the test-mode notice must be visible');
 for(const wrong of ['培养丹','神圣果实','召唤卡'])assert(!text.includes(wrong),'a recharge tier must not hand out the 单笔充值 gift: '+wrong);
 assert(await js("Array.from(document.querySelectorAll('#modal img')).every(i=>i.complete&&i.naturalWidth>0)"),'panel and card art must load');
 await fs.writeFile(path.join(__dirname,'..','work','recharge-qa.png'),(await window.webContents.capturePage()).toPNG());

 await click('#modal [data-action=recharge][data-id="96"]');
 await wait(800);
 const afterRecharge=await state();
 assert.equal(afterRecharge.gems,before.gems+600,'the 30 元 tier arrives doubled on the first purchase');
 assert.equal(afterRecharge.recharge.totalGems,600);
 assert.deepEqual(afterRecharge.recharge.doubled,[96]);
 assert.equal(afterRecharge.coins,before.coins);
 assert.equal(afterRecharge.food,before.food);
 assert.equal(await js("document.querySelector('#modal').textContent.includes('再送15魔晶')"),true,'the doubled tier must fall back to the client rebate');
 assert.equal(await js("document.querySelector('#modal').textContent.includes('再送300魔晶')"),false,'the doubled tier must not show its first-purchase double again');

 await js("document.querySelector('#modal [data-action=close]').click();true");
 await wait(300);
 await click('.original-hud [data-action=showMore]');
 await click('.original-hud [data-action=openHabitats]');
 await wait(700);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeShop');
 await click('#modal [data-action=resourceShop]');
 await wait(700);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeResourceShop');
 assert.equal(await js("document.querySelectorAll('#modal [data-resource-offer]').length"),12,'the client ships four gold, four food and four 进化果实 rows');
 const shopText=await js("document.querySelector('#modal').textContent");
 assert(shopText.includes('150,000')&&shopText.includes('进化果实'),'amounts and names come from the client table');
 await fs.writeFile(path.join(__dirname,'..','work','resource-shop-qa.png'),(await window.webContents.capturePage()).toPNG());

 await click('#modal [data-action=buyResource][data-id="1"]');
 await wait(700);
 const afterGold=await state();
 assert.equal(afterGold.coins,before.coins+150000,'少量金币 pays the client amount');
 assert.equal(afterGold.gems,afterRecharge.gems-75,'and costs the client 75 魔晶');
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeResourceShop','the shop stays open after a purchase');

 await click('#modal [data-action=buyResource][data-id="107"]');
 await wait(700);
 const afterFruit=await state();
 assert.equal(afterFruit.items[7027],800,'少量进化果实 lands in the item bag');
 assert.equal(afterFruit.gems,afterGold.gems-75);
 assert.deepEqual(afterFruit.dragons,before.dragons);
 console.log('PASS recharge credits 魔晶 and the resource shop spends it on gold and 进化果实');
};
