const assert=require('node:assert/strict'),wait=ms=>new Promise(r=>setTimeout(r,ms));
const {nativeClick}=require('./smoke-input.cjs');
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame}=await import('../src/game.mjs');const s=createGame();s.dragons.forEach(d=>d.level=20);s.items={7024:3,7037:2,7007:25,6022:100,6015:1,6062:2};s.food=1e6;await store.save(s)};
exports.run=async(w,store,verify=false)=>{
 const js=c=>w.webContents.executeJavaScript(c),state=async()=>(await store.load()).state,click=q=>nativeClick(w,q);
 for(let i=0;i<80&&!await js("!!document.querySelector('.ranch-world')");i++)await wait(100);
 if(verify){const s=await state();assert.equal(s.items[7024],0);assert.equal(s.items[7007],5);assert.equal(s.giftEggs.filter(e=>e.dragonId===1040).length,2);assert(s.items[6022]<100);console.log('PASS item restart: random pack rewards, two fragment eggs, remainder and consumed cultivation pills retained');return}
 const open=async()=>{await js("(()=>{const b=document.createElement('button');b.dataset.action='openWarehouse';document.body.append(b);b.click();b.remove()})()");await wait(350)};
 for(const id of [7024,7037,7007]){await open();await click(`[data-loot-prop="${id}"] [data-action=historyGift]`);assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceGiftUse');await click('[data-action=giftUseCount][data-value=max]');await click('[data-action=confirmGiftUse]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceHistoryGiftResult');await click('#modal [data-action=openWarehouse]');}
 const s=await state();assert.equal(s.items[7024],0);assert.equal(s.items[7037],0);assert.equal(s.items[7007],5);assert.equal(s.giftEggs.filter(e=>e.dragonId===1040).length,2);
 await click('[data-loot-prop="6022"] [data-action=historyTraining]');await click('[data-action=historyTrain][data-count="1"]');assert((await state()).items[6022]<100);
 await open();await click('[data-loot-prop="6015"] [data-action=lootBoxUse]');assert(await js("document.querySelector('[data-action=openLootBox]').disabled"));assert.equal((await state()).items[6015],1);
 console.log('PASS real mouse: random gift quantity/max/open, source fragment crafting, cultivation material routing, keyed chest still protected');
};
