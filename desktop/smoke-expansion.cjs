const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{if(process.argv.includes('--smoke-blood-front'))return require('./smoke-blood-front.cjs').prepare(store);assert.equal((await store.load()).state,null);const {createTutorialGame,createGame}=await import('../src/game.mjs');let s=process.argv.includes('--smoke-expansion-legacy')?createGame():createTutorialGame();if(s.tutorial)s.tutorial.paused=true;if(process.argv.includes('--smoke-land-entrances')){delete s.tutorial;s.playerXp=2060310572;s.expansion={plots:11,lands:[12,13,15,16,22,31,42,11,14,17,18,21,23,33,24]};await (await import('../src/user-eggs.mjs')).grantRareEggStock(s);}s.coins=1e7;s.gems=10000;await store.save(s)};
exports.run=async(w,store,verify=false)=>{
 if(process.argv.includes('--smoke-blood-front')||process.argv.includes('--verify-blood-front'))return require('./smoke-blood-front.cjs').run(w,store,verify);
 const js=c=>w.webContents.executeJavaScript(c),click=q=>require('./smoke-input.cjs').nativeClick(w,q),state=async()=>(await store.load()).state;
 for(let i=0;i<80&&!await js("!!document.querySelector('.ranch-world')");i++)await wait(100);
 if(process.argv.includes('--smoke-land-entrances')){
 await js("document.querySelector('.ranch-world').style.transform='translate(-850px,-200px) scale(1)';true");await wait(1000);

 const rects=await js("(()=>{const box=e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}};return {boards:[...document.querySelectorAll('.original-land-board')].map(box),blood:box(document.querySelector('[data-action=openBloodFront] canvas'))}})()");
 for(const r of rects.boards)assert(r.right<=rects.blood.left||r.left>=rects.blood.right||r.bottom<=rects.blood.top||r.top>=rects.blood.bottom,'land sign overlaps blood-front canvas');
 await click('[data-action=selectExpansionLand][data-id="34"]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeExpansion');await click('#modal [data-action=close]');
 await click('[data-action=openBloodFront] canvas');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceBloodFront');await click('#modal [data-action=close]');
 await fs.writeFile(path.join(__dirname,'..','work','land-entrances-v59.png'),(await w.webContents.capturePage()).toPNG());console.log('PASS land signs and blood-front have separate bounds and real mouse opens both entries');
 await click('[data-action=showMore]');await click('.original-hud [data-action=openWarehouse]');
 assert.equal(await js("document.querySelectorAll('#modal [data-raffle-egg]').length"),16);
 assert.equal(await js("[...document.querySelectorAll('#modal [data-raffle-egg] [data-source=txt_ShuLiang]')].filter(e=>e.innerText==='99').length"),16);
 const egg=(await state()).giftEggs[0];await click(`#modal [data-raffle-egg="${egg.id}"] [data-action=raffleEggUse]`);
 assert.equal((await state()).giftEggs.find(e=>e.id===egg.id).quantity,98);assert((await state()).incubator);
 console.log('PASS warehouse shows 16 sacred/ancient egg stocks of 99; native hatch consumes exactly one');return;
 }
 if(verify){const s=await state();assert.deepEqual(s.expansion.lands,[12,13,15,16,11,14,17,18,22]);assert.equal(s.expansion.plots,5);assert.equal(s.coins,10000000-4000-16500-25000-100000);assert.equal(s.gems,9996);console.log('PASS named expansion payments and original first-island land survive independent restart');return}
 if(process.argv.includes('--smoke-expansion-legacy')){const before=await state();await click('[data-action=showMore]');await click('.original-hud [data-action=openHabitats]');await click('#modal [data-action=expansionShop]');await click('[data-expansion-currency="g"][data-expansion-offer="chooseExpansion"] [data-action=chooseExpansion]');await click('[data-action=selectExpansionLand][data-id="11"]');const after=await state();assert.equal(after.coins,before.coins-4000);assert.deepEqual(after.dragons,before.dragons);assert.deepEqual(after.habitats,before.habitats);assert(after.expansion.lands.includes(11));console.log('PASS legacy fixed buildings remain usable; explicit land selection raises original purchase boards and buys land');return;}
 // Original map sign opens the original shop on that parcel.
 await click('[data-action=selectExpansionLand][data-id="11"]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeExpansion');assert.equal(await js("document.querySelectorAll('[data-expansion-offer]').length"),3);
 await fs.writeFile(path.join(__dirname,'..','work','expansion-original-v57.png'),(await w.webContents.capturePage()).toPNG());
 const before=await state();await click('[data-expansion-currency="g"][data-expansion-offer="chooseExpansion"] [data-action=chooseExpansion]');assert.equal((await state()).coins,before.coins-4000);assert.equal((await state()).gems,before.gems);
 // Shop flow first chooses currency, then asks for a land sign. Cancelling charges nothing.
 await click('[data-expansion-currency="c"][data-expansion-offer="chooseExpansion"] [data-action=chooseExpansion]');await click('[data-action=cancelExpansion]');assert.equal((await state()).gems,10000);
 await click('[data-action=selectExpansionLand][data-id="14"]');await click('[data-expansion-currency="c"][data-expansion-offer="chooseExpansion"] [data-action=chooseExpansion]');assert.equal((await state()).gems,9996);
 await click('#modal [data-action=close]');
 for(const id of [17,18]){await click(`[data-action=selectExpansionLand][data-id="${id}"]`);await click('[data-expansion-currency="g"][data-expansion-offer="chooseExpansion"] [data-action=chooseExpansion]');await click('#modal [data-action=close]')}
 await click('[data-action=showMore]');await click('.original-hud [data-action=openHabitats]');await click('#modal [data-action=expansionShop]');await click('[data-action=chooseIsland]');await click('[data-action=selectExpansionLand][data-id="22"]');assert((await state()).expansion.lands.includes(22));assert.equal((await state()).coins,10000000-4000-16500-25000-100000);console.log('PASS original wood signs, source currency alternatives/cancel, complete main island and separate 100000 gold island unlock');
};
