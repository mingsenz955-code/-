const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {nativeClick}=require('./smoke-input.cjs'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame,action}=await import('../src/game.mjs'),{ORIGINAL_LEVELS}=await import('../src/data.mjs');let s=createGame();s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===99).xp_required;s.coins=1e8;s.gems=10000;s=action(s,'buyStructure',{itemId:17});s=action(s,'buyStructure',{itemId:108});s.farm={cropId:1,readyAt:Date.now()+18000};await store.save(s)};
exports.run=async(w,store,verify=false)=>{
 const js=c=>w.webContents.executeJavaScript(c),state=async()=>(await store.load()).state,click=q=>nativeClick(w,q),mapClick=async q=>{await js(`document.querySelector(${JSON.stringify(q)}).click();true`);await wait(350)};
 for(let i=0;i<80&&!await js("!!document.querySelector('.ranch-world')");i++)await wait(100);
 if(verify){const s=await state();assert.equal(s.structures[0].itemId,18);assert.equal(s.structures[1].farm.cropId,10);assert(s.structures[1].farm.readyAt>Date.now());assert.equal(s.items[7027],300);console.log('PASS farm restart: upgrade, fruit rewards, independent active crop retained');return}
 const [farm,land]=(await state()).structures;
 await mapClick(`[data-action=structureInfo][data-id="${farm.id}"]`);await click('[data-action=openBuildingSpeed]');await click('[data-action=speedBuilding]');
 await mapClick(`[data-action=structureInfo][data-id="${farm.id}"]`);await click(`#modal [data-action=farm][data-id="${farm.id}"]`);
 assert.equal(await js("document.querySelectorAll('.native-crop-card').length"),6);
 await click('[data-action=plantNative][data-id="6"]');
 await mapClick(`[data-action=structureInfo][data-id="${farm.id}"]`);await click(`#modal [data-action=farm][data-id="${farm.id}"]`);
 await fs.writeFile(path.join(__dirname,'../work/farm-speed-native.png'),(await w.webContents.capturePage()).toPNG());
 const before=await state();await click('[data-action=speedCrop]');assert((await state()).gems<before.gems);assert.equal((await state()).food,before.food);
 await click('[data-action=harvest]');assert.equal((await state()).food,before.food+2000);
 await mapClick(`[data-action=structureInfo][data-id="${farm.id}"]`);await click(`#modal [data-action=farm][data-id="${farm.id}"]`);await click('[data-action=upgradeFarm]');await click('[data-action=openBuildingSpeed]');await click('[data-action=speedBuilding]');assert.equal((await state()).structures[0].itemId,18);
 await mapClick(`[data-action=structureInfo][data-id="${land.id}"]`);await click('[data-action=openBuildingSpeed]');await click('[data-action=speedBuilding]');
 await mapClick(`[data-action=structureInfo][data-id="${land.id}"]`);await click(`#modal [data-action=farm][data-id="${land.id}"]`);assert.equal(await js("document.querySelectorAll('.native-crop-card').length"),3);
 await click('[data-action=plantNative][data-id="12"]');await mapClick(`[data-action=structureInfo][data-id="${land.id}"]`);await click(`#modal [data-action=farm][data-id="${land.id}"]`);await click('[data-action=speedCrop]');await click('[data-action=harvest]');assert.equal((await state()).items[7027],300);
 await mapClick(`[data-action=structureInfo][data-id="${land.id}"]`);await click(`#modal [data-action=farm][data-id="${land.id}"]`);await click('[data-action=plantNative][data-id="10"]');
 await mapClick('.world-objects [data-action=farm]');const remaining=(await state()).farm.readyAt-Date.now();if(remaining>0)await wait(remaining+700);assert(await js("!!document.querySelector('#modal [data-action=harvest]')"),'natural maturity switches the open speed panel to harvest');await click('[data-action=harvest]');assert.equal((await state()).farm,null);
 console.log('PASS native mouse: bought farm construction, independent planting, source speed charge, harvest, upgrade and consumable evolution fruit');
};
