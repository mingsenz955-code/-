const assert=require('node:assert/strict'),wait=ms=>new Promise(r=>setTimeout(r,ms));
const {nativeClick}=require('./smoke-input.cjs');
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame}=await import('../src/game.mjs');const s=createGame();s.dragons.forEach(d=>d.level=20);s.items={7024:3,7037:2,7007:25,6022:100,6015:1,6062:2,7026:11,7060:21,7070:20};s.food=1e6;s.gems=20000;await store.save(s)};
exports.run=async(w,store,verify=false)=>{
 const js=c=>w.webContents.executeJavaScript(c),state=async()=>(await store.load()).state,click=q=>nativeClick(w,q);
 for(let i=0;i<80&&!await js("!!document.querySelector('.ranch-world')");i++)await wait(100);
 if(verify){const s=await state();assert.equal(s.items[7024],0);assert.equal(s.items[7007],5);assert.equal(s.giftEggs.filter(e=>e.dragonId===1040).length,2);for(const id of [1076,1200,1202])assert(s.giftEggs.some(e=>e.dragonId===id));assert.equal(s.items[7060],1);assert(s.items[6022]<100);if(process.argv.includes('--exercise-ancient-raffle')){assert.equal(s.raffle.pending.length,10);assert(s.raffle.pending.some(e=>[1200,1202,1203,1205,1206].includes(e.dragonId)));}console.log('PASS item restart: random rewards, ancient/skeleton fragment eggs, remainder and consumed cultivation pills retained');return}
 const open=async()=>{await js("(()=>{const b=document.createElement('button');b.dataset.action='openWarehouse';document.body.append(b);b.click();b.remove()})()");await wait(350)};
 for(const id of [7024,7037,7007]){await open();await click(`[data-loot-prop="${id}"] [data-action=historyGift]`);assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceGiftUse');await click('[data-action=giftUseCount][data-value=max]');await click('[data-action=confirmGiftUse]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceHistoryGiftResult');await click('#modal [data-action=openWarehouse]');}
 const s=await state();assert.equal(s.items[7024],0);assert.equal(s.items[7037],0);assert.equal(s.items[7007],5);assert.equal(s.giftEggs.filter(e=>e.dragonId===1040).length,2);
 await click('[data-loot-prop="6022"] [data-action=historyTraining]');await click('[data-action=historyTrain][data-count="1"]');assert((await state()).items[6022]<100);
 await open();await click('[data-loot-prop="6015"] [data-action=lootBoxUse]');assert(await js("document.querySelector('[data-action=openLootBox]').disabled"));assert.equal((await state()).items[6015],1);
 for(const id of [7026,7060,7070]){await js("(()=>{const b=document.createElement('button');b.dataset.action='historyInventory';document.body.append(b);b.click();b.remove()})()");await wait(350);await click(`[data-history-fragment="${id}"] [data-action=historyGift]`);await click('[data-action=confirmGiftUse]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceHistoryGiftResult');}
 await open();await click('[data-loot-prop="7007"] [data-action=historyGift]');assert(await js("document.querySelector('[data-action=confirmGiftUse]').disabled"));assert(await js("document.querySelector('[data-source=txt_miaoshu]').textContent.includes('碎片不足')"));
 console.log('PASS real mouse: random gift quantity/max/open, source fragment crafting, cultivation material routing, keyed chest still protected');
 if(process.argv.includes('--exercise-ancient-raffle')){
  await js('window.confirm=()=>true;true');
  await js("(()=>{const b=document.createElement('button');b.dataset.action='lotteryOptions';document.body.append(b);b.click();b.remove()})()");await wait(350);
  await click('[data-action=rafflePreview]');
  for(const id of [1200,1202,1203,1205,1206])assert(await js(`(()=>{const e=document.querySelector('[data-raffle-preview-id="${id}"] .raffle-preview-icon');return e&&e.complete&&e.naturalWidth>0})()`));
  await click('[data-action=closeRafflePreview]');await click('[data-action=raffleDraw][data-value="senior:10"]');
  const s=await state();assert.equal(s.raffle.pending.length,10);assert.equal(s.gems,17500);assert(s.raffle.pending.some(e=>[1200,1202,1203,1205,1206].includes(e.dragonId)));
  assert.equal(await js("document.querySelectorAll('.raffle-result-egg').length"),10);
  console.log('PASS real mouse: all five ancient prizes preview, senior ten draws debit exactly 2500 and include ancient egg');
 }
 if(process.argv.includes('--exercise-combat-turns')){
  await js(`(async()=>{const {createGame}=await import('./src/game.mjs'),{battleEnemyGroup}=await import('./src/battle.mjs'),{openBattleDialog,playBattleAnimation}=await import('./src/battle-dialog.mjs');const s=createGame();s.dragons=['original1200','leaf','original1202','original1203','original1205','original1206'].map((species,i)=>({id:20+i,species,level:20,habitatId:1}));s.formation=s.dragons.map(d=>d.id);const enemyGroup=[battleEnemyGroup(100101).monsters[0]];await openBattleDialog(s,{nodeId:100101,enemyGroup});window.__combatQA={done:false,error:null};playBattleAnimation(s,100101,{won:true,enemyGroup}).then(ok=>window.__combatQA.done=ok).catch(e=>window.__combatQA.error=e.message);return true})()`);
  for(let i=0;i<600;i++){const status=await js('window.__combatQA');assert.equal(status.error,null);if(status.done)break;await wait(150);}
  assert(await js('window.__combatQA.done'),'single-enemy battle completes');
  assert(await js("[...document.querySelectorAll('.battle-fighter.ally')].every(e=>Number(e.dataset.resolvedAttacks)>=2)"),'all six dragons resolve normal and ultimate hits against one enemy');
  assert(await js("document.querySelector('.battle-fighter.enemy').dataset.deathComplete==='true'"));
  await click('#modal [data-action=close]');console.log('PASS native battle: all six mixed land/sky dragons resolve attacks and ultimates; one enemy dies and animation finishes');
 }
};
