const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame}=await import('../src/game.mjs');const s=createGame();s.dragons.forEach(d=>d.level=20);s.equipment=[{id:'eq-1',type:101101,exp:0,star:0,randinfo:[],dragonid:2}];s.nextEquipId=2;s.equipmentMaterials.stone=1000;s.gemInventory=[{id:'gm-1',type:810101,exp:0},{id:'gm-2',type:810201,exp:0},{id:'gm-3',type:810301,exp:0}];s.nextGemId=4;await store.save(s)};
exports.run=async(w,store,verify=false)=>{
 const js=async c=>{try{return await w.webContents.executeJavaScript(c)}catch(e){console.error(c);throw e}},click=async s=>{assert(await js(`!!document.querySelector(${JSON.stringify(s)})`),s);await js(`document.querySelector(${JSON.stringify(s)}).click();true`);await wait(350)};
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 if(verify){const s=(await store.load()).state;assert.equal(s.equipment[0].type,101112);assert.equal(s.equipmentMaterials.stone,989);assert.equal(s.gemSockets[0],'gm-1');assert.equal(s.gemInventory[0].type,810102);assert.equal(s.gemInventory.length,2);console.log('PASS progression restart: gear, material, gem socket and upgrade');return}
 await click('[data-action=showMore]');await click('[data-action=openEquip]');await click('[data-action=openEquipInfo][data-id="eq-1"]');await click('[data-action=openEquipEnhance]');
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceEquipEnhance');await fs.writeFile(path.join(__dirname,'..','work','equipment-enhance-qa.png'),(await w.webContents.capturePage()).toPNG());
 await click('[data-action=enhanceEquipment][data-value="1"]');await click('[data-action=enhanceEquipment][data-value="10"]');assert.equal((await store.load()).state.equipment[0].type,101112);
 await click('#modal [data-action=openEquipInfo]');await click('#modal [data-action=openEquip]');await click('#modal [data-action=close]');await click('[data-action=openGems]');
 assert.equal(await js("document.querySelectorAll('.source-gem-cell').length"),3);await fs.writeFile(path.join(__dirname,'..','work','gem-altar-qa.png'),(await w.webContents.capturePage()).toPNG());
 await click('[data-action=gemInfo][data-id="gm-1"]');await click('[data-action=insertGem]');assert.equal((await store.load()).state.gemSockets[0],'gm-1');
 await click('[data-action=gemInfo][data-id="gm-1"]');await click('[data-action=gemUpgrade]');await click('[data-action=gemFeedSelect][data-id="gm-2"]');await click('[data-action=fuseGem]');assert.equal((await store.load()).state.gemInventory[0].type,810102);
 await fs.writeFile(path.join(__dirname,'..','work','gem-upgraded-qa.png'),(await w.webContents.capturePage()).toPNG());console.log('PASS source strengthen, material charges, altar insertion, gem fusion and save');
};
