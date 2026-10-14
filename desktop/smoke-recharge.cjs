const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// Recharge is deliberately free in this build: the QA proves awards arrive and that no
// currency ever moves. Tickets must land in the raffle save so they can actually be spent.
exports.run=async(window,store,verify)=>{
 const js=code=>window.webContents.executeJavaScript(code);
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(420)};
 const state=async()=>(await store.load()).state;

 if(verify){
  const restored=await state();
  assert.equal(restored.recharge.count,1,'the recharge record must survive a restart');
  assert.equal(restored.raffle.tickets['6049'],1,'the granted ticket must survive a restart');
  assert.equal(restored.items[7015],10);
  console.log('PASS recharge awards survive an independent restart');
  return;
 }

 const before=await state();
 await click('.original-hud [data-action=openRecharge]');
 await wait(900);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceRecharge');
 assert.equal(await js("document.querySelectorAll('#modal .source-recharge-card').length"),6,'the client ships six tiers');
 assert(await js("document.querySelector('#modal').textContent.includes('5 元')"),'tier prices come from the client table');
 assert(await js("document.querySelector('#modal').textContent.includes('500 元')"));
 assert(await js("document.querySelector('#modal').textContent.includes('高级召唤卡')"),'award names are resolved, not raw keys');
 assert(await js("document.querySelector('#modal').textContent.includes('不进行任何真实扣款')"),'the test-mode notice must be visible');
 assert(await js("Array.from(document.querySelectorAll('#modal img')).every(i=>i.complete&&i.naturalWidth>0)"),'panel and card art must load');
 await fs.writeFile(path.join(__dirname,'..','work','recharge-qa.png'),(await window.webContents.capturePage()).toPNG());

 await click('#modal [data-action=recharge][data-id="6"]');
 await wait(800);
 const after=await state();
 assert.equal(after.coins,before.coins,'a test recharge must not move gold');
 assert.equal(after.gems,before.gems,'a test recharge must not move gems');
 assert.equal(after.food,before.food);
 assert.equal(after.raffle.tickets['6049'],1,'the 500 元 tier grants one senior raffle ticket');
 assert.equal(after.items[7015],10);
 assert.equal(after.items[50002],2);
 assert.equal(after.recharge.count,1);
 assert.equal(after.recharge.lastTier,6);
 assert.deepEqual(after.dragons,before.dragons);
 console.log('PASS recharge panel: six client tiers, real award names, free grants and ticket handoff to the raffle');
};
