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
 const click=selector=>require('./smoke-input.cjs').nativeClick(window,selector);
 const state=async()=>(await store.load()).state;
 const shot=async name=>fs.writeFile(path.join(__dirname,'..','work',name),(await window.webContents.capturePage()).toPNG());

 if(verify){
  const restored=await state();
  assert.equal(restored.raffle.pending.length,process.argv.includes('--exercise-ten-raffle')?10:0,'saved raffle eggs must survive restart without restoring sold ones');
  assert.equal(restored.raffle.tickets['6048'],4,'ticket spending must persist');
  assert.equal(restored.incubator,null,'a sold hatched dragon must not return after restart');
  assert(restored.log.some(line=>line.includes('出售')),'sale record must survive restart');
  console.log('PASS raffle ticket spend, egg sale, hatch acceleration and hatched-dragon sale survive an independent restart');
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
 assert(await js("[...document.querySelectorAll('.raffle-result-egg')].every(e=>Number(getComputedStyle(e).opacity)>.99&&e.getBoundingClientRect().width>0&&e.querySelector('img').naturalWidth>0)"),'Won eggs must actually be visible, including with Windows reduced motion');
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
 const beforeSale=await state(),soldEgg=beforeSale.raffle.pending[0];
 const {dragonSellGold}=await import('../src/game.mjs');const {SPECIES}=await import('../src/data.mjs');
 const soldSpecies=Object.keys(SPECIES).find(key=>SPECIES[key].originalId===soldEgg.dragonId),eggGold=dragonSellGold(soldSpecies);
 await click(`#modal [data-raffle-egg="${soldEgg.id}"] [data-action=sellRaffleEgg]`);
 const afterEggSale=await state();assert.equal(afterEggSale.raffle.pending.length,1);assert.equal(afterEggSale.coins,beforeSale.coins+eggGold,'warehouse egg sale uses the source dragon price');
 await click('#modal [data-raffle-egg] [data-action=raffleEggUse]');
 await wait(500);
 const incubating=await state();assert.equal(incubating.raffle.pending.length,0,'the remaining egg moved into the tower');assert.equal(incubating.incubator?.source,'raffle');assert.deepEqual(incubating.incubator.parents,[]);
 const {incubatorSpeedCost}=await import('../src/game.mjs'),speedCost=incubatorSpeedCost(incubating.incubator.readyAt),gemsBeforeSpeed=incubating.gems;
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeIncubator');assert(await js("!!document.querySelector('#modal [data-action=speedIncubator]')"));
 await shot('incubator-speedup-qa.png');await click('#modal [data-action=speedIncubator]');
 const accelerated=await state();assert.equal(accelerated.gems,gemsBeforeSpeed-speedCost);assert(accelerated.incubator.readyAt<=Date.now());assert(await js("!!document.querySelector('#modal [data-action=sellIncubator]')"));
 const hatchGold=dragonSellGold(accelerated.incubator.species),coinsBeforeHatchSale=accelerated.coins;await shot('incubator-sell-qa.png');await click('#modal [data-action=sellIncubator]');
 const sold=await state();assert.equal(sold.incubator,null);assert.equal(sold.coins,coinsBeforeHatchSale+hatchGold);assert.deepEqual(sold.dragons,before.dragons,'selling eggs or the hatched dragon must not touch ranch dragons');
 if(process.argv.includes('--exercise-ten-raffle')){
  if(await js("document.querySelector('#modal').open"))await click('#modal [data-action=close]');
  await click('[data-action=lotteryOptions]');const beforeTen=await state();
  await click('[data-action=raffleDraw][data-value="junior:10"]');
  for(let i=0;i<100&&await js("document.querySelector('#modal').dataset.mode!=='sourceRaffleResult'");i++)await wait(50);
  await wait(1300);
  assert.equal(await js("document.querySelectorAll('.raffle-result-egg').length"),10);
  assert(await js("[...document.querySelectorAll('.raffle-result-egg')].every(e=>Number(getComputedStyle(e).opacity)>.99&&e.querySelector('img').complete&&e.querySelector('img').naturalWidth>0)"),'All ten won eggs must actually be visible');
  const afterTen=await state();assert.equal(afterTen.raffle.pending.length,10);assert.equal(afterTen.raffle.tickets['6047'],beforeTen.raffle.tickets['6047']-10);assert.equal(afterTen.gems,beforeTen.gems);
  await shot('raffle-ten-visible-qa.png');await click('[data-action=returnRaffle]');await click('#modal [data-action=close]');await click('[data-action=openWarehouse]');
  assert.equal(await js("document.querySelectorAll('[data-raffle-egg]').length"),10);assert.deepEqual((await state()).raffle.pending,afterTen.raffle.pending);
  console.log('PASS native ten draw: ten visible source egg images, exact single charge and ten warehouse prizes');
 }
 console.log('PASS three machines draw, exact ticket charging, warehouse egg sale, source-formula hatch acceleration and hatched-dragon sale');
};
