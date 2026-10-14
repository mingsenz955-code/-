const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// QA-only resources: the expansion ladder starts at 4000 gold and a level-2 ranch, so the
// isolated profile is given gold and level 8. A player save is never touched.
exports.prepare=async store=>{
 const loaded=await store.load();if(loaded.state)return;
 const {createGame}=await import('../src/game.mjs');
 const {ORIGINAL_LEVELS}=await import('../src/data.mjs');
 const s=createGame();s.coins=500000;s.gems=500;s.playerXp=ORIGINAL_LEVELS.find(level=>level.level===8).xp_required;
 s.log=['扩建验收隔离档：金币与等级由测试注入，不代表正常进度。'];
 await store.save(s);
};
exports.run=async(window,store,verify)=>{
 const js=code=>window.webContents.executeJavaScript(code);
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(420)};
 const state=async()=>(await store.load()).state;

 if(verify){
  const restored=await state();
  assert.equal(restored.expansion.plots,1,'a bought plot must survive a restart');
  assert.equal(restored.version,8);
  console.log('PASS island expansion survives an independent restart');
  return;
 }

 const before=await state();
 assert.equal(before.expansion.plots,0);
 await click('[data-action=showMore]');
 if(!await js("!!document.querySelector('.original-hud [data-action=openHabitats]')"))await click('[data-action=showMore]');
 await click('.original-hud [data-action=openHabitats]');
 await wait(700);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeShop');
 await click("#modal [data-action=expansionShop]");
 await wait(700);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeExpansion');
 assert(await js("!!document.querySelector('#modal [data-expansion-plot]')"),'the next plot must be offered');
 assert(await js("document.querySelector('#modal').textContent.includes('4,000')||document.querySelector('#modal').textContent.includes('4000')"),'the client price must be shown');
 assert(await js("!!document.querySelector('#modal img[src*=\"thumbs_store_expansion_island_\"]')"),'the shop expansion art must load');
 await fs.writeFile(path.join(__dirname,'..','work','expansion-qa.png'),(await window.webContents.capturePage()).toPNG());

 await click('#modal [data-action=expandIsland]');
 await wait(700);
 const after=await state();
 assert.equal(after.expansion.plots,1,'buying must advance the plot count');
 assert.equal(after.coins,before.coins-4000,'the first paid step costs 4000 gold');
 assert.equal(after.habitats.length,before.habitats.length,'buying land must not add buildings by itself');
 assert.deepEqual(after.dragons,before.dragons);
 console.log('PASS island expansion: shop entry, client ladder price, gold debit and plot count');
};
