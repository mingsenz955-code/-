const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// QA-only resources. Tickets and gems are injected into the isolated profile so the three
// machines can actually be drawn; a player save is never touched and the payment system
// does not exist yet.
exports.prepare=async store=>{
 const loaded=await store.load();if(loaded.state)return;
 const {createGame}=await import('../src/game.mjs');
 const s=createGame();s.gems=20000;s.raffle.tickets={6047:20,6048:5,6049:2};
 s.log=['扭蛋机验收隔离档：抽奖券与魔晶由测试注入，不代表正常获取途径。'];
 await store.save(s);
};
exports.run=async(window,store,verify)=>{
 const js=code=>window.webContents.executeJavaScript(code);
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(320)};
 const state=async()=>(await store.load()).state;
 const shot=async name=>fs.writeFile(path.join(__dirname,'..','work',name),(await window.webContents.capturePage()).toPNG());

 if(verify){
  const restored=await state();
  assert(restored.raffle.pending.length>0,'raffle eggs must survive a restart');
  assert.equal(restored.raffle.tickets['6048'],4,'ticket spending must persist');
  assert.equal(restored.incubator?.source,'raffle','the hatched raffle egg must stay in the tower');
  console.log('PASS later mobile raffle draw, ticket spend and hatched egg survive an independent restart');
  return;
 }

 await js("window.confirm=()=>true;true");
 const before=await state();
 await click('[data-action=showMore]');await click('[data-action=lotteryOptions]');
 for(let i=0;i<60;i++){if(await js("document.querySelectorAll('#modal canvas[data-model-ready=true]').length===3"))break;await wait(100)}
 assert.equal(await js("document.querySelectorAll('#modal canvas[data-model-ready=true]').length"),3);
 assert(await js("Array.from(document.querySelectorAll('#modal img')).every(i=>i.complete&&i.naturalWidth>0)"));
 assert.equal(await js("document.querySelectorAll('#modal img[src$=\"ui_lotterydragon_daijuan2.png\"]').length"),3,'middle buttons and balance use the original ticket icon while tickets remain');
 assert.equal(await js("document.querySelectorAll('#modal img[src$=\"ui_lotterydragon_daijuan3.png\"]').length"),3,'senior buttons and balance use the original ticket icon while tickets remain');
 assert.equal(await js("document.querySelectorAll('#modal [data-action=lotteryDraw]').length"),0,'Never apply the legacy pool to modern machine prices');
 assert.equal(await js("document.querySelectorAll('#modal [data-action=raffleDraw]').length"),6,'every machine offers single and ten draws');
 assert(await js("document.querySelector('#modal').textContent.includes('20')"),'ticket counts come from the save');
 await shot('raffle-native-qa.png');

 await click('#modal [data-action=raffleDraw][data-value="mid:1"]');
 await wait(1200);
 const afterMid=await state();
 assert.equal(afterMid.raffle.pending.length,1,'the middle draw stores one egg');
 assert.equal(afterMid.gems,before.gems,'one card pays for one draw');
 assert.equal(afterMid.raffle.tickets['6048'],4);
 assert.equal(afterMid.raffle.counters.mid,afterMid.raffle.pending[0].quality===4?0:1,'the 必得 counter advances unless 紫 dropped');
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceRaffleResult','the original result panel opens after the machine animation');
 assert.equal(await js("document.querySelectorAll('#modal .raffle-result-egg').length"),1,'the result panel shows the won egg');
 assert(await js("document.querySelector('#modal').textContent.includes('获得的龙蛋，可在仓库中查看')"));
 await shot('raffle-result-qa.png');
 await click('#modal [data-action=returnRaffle]');

 const gemsBeforeJunior=afterMid.gems;
 await click('#modal [data-action=raffleDraw][data-value="junior:1"]');
 await wait(1200);
 const afterJunior=await state();
 assert.equal(afterJunior.gems,gemsBeforeJunior,'the junior single draw is free');
 assert.equal(afterJunior.raffle.pending.length,2);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceRaffleResult');
 await click('#modal [data-action=returnRaffle]');

 await click('#modal [data-action=close]');
 // 更多 is a toggle: it is already expanded from opening the raffle, so only click it
 // when the warehouse entry is not on screen.
 if(!await js("!!document.querySelector('.original-hud [data-action=openWarehouse]')"))await click('[data-action=showMore]');
 await click('.original-hud [data-action=openWarehouse]');
 await wait(800);
 assert.equal(await js("document.querySelectorAll('[data-raffle-egg]').length"),2,'the warehouse lists the raffle eggs');
 await shot('raffle-warehouse-qa.png');
 await click('#modal [data-raffle-egg] [data-action=raffleEggUse]');
 await wait(900);
 const hatched=await state();
 assert.equal(hatched.raffle.pending.length,1,'one egg moved into the tower');
 assert.equal(hatched.incubator?.source,'raffle');
 assert.deepEqual(hatched.incubator.parents,[]);
 assert.deepEqual(hatched.dragons,before.dragons,'drawing must not touch the ranch dragons');
 console.log('PASS three machines draw, charge tickets before gems, honour the free junior single, store eggs in the warehouse and hatch them in the tower');
};
