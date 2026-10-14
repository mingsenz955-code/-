const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame}=await import('../src/game.mjs');const s=createGame();s.dragons.forEach(d=>d.level=20);s.dragons.push({id:4,species:'tide',level:7,habitatId:1});s.nextId=5;await store.save(s)};
exports.run=async(w,store,verify=false)=>{
 const js=async c=>{try{return await w.webContents.executeJavaScript(c)}catch(e){console.error('Failed:',c);throw e}},click=async s=>{assert(await js(`!!document.querySelector(${JSON.stringify(s)})`),s);await js(`document.querySelector(${JSON.stringify(s)}).click();true`);await wait(350)};
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 await click('[data-action=showMore]');await click('[data-action=openFormation]');await wait(500);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceFormation');assert.equal(await js("document.querySelectorAll('.source-formation-slot').length"),6);
 if(verify){assert.deepEqual((await store.load()).state.formation,[4,3]);console.log('PASS formation restart: replaced dragon and six source slots');return}
 assert.equal(await js("document.querySelectorAll('#modal input[type=checkbox]').length"),0);
 await fs.writeFile(path.join(__dirname,'..','work','formation-source-qa.png'),(await w.webContents.capturePage()).toPNG());
 await click('#modal [data-source="right/change"] [data-action=formationPick]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceFormationPicker');
 assert.equal(await js("document.querySelectorAll('.formation-picker-card').length"),3);
 assert(await js("document.querySelector('[data-action=formationEnlist][data-id=\"3\"]').disabled"),'Another slot of same species must be refused');
 await fs.writeFile(path.join(__dirname,'..','work','formation-picker-qa.png'),(await w.webContents.capturePage()).toPNG());
 await click('[data-action=formationEnlist][data-id="4"]');assert.deepEqual((await store.load()).state.formation,[4,3]);
 await click('#modal [data-action=formationPreview]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceFormationPreview');assert.equal(await js("document.querySelectorAll('.formation-preview-model').length"),2);
 await fs.writeFile(path.join(__dirname,'..','work','formation-preview-qa.png'),(await w.webContents.capturePage()).toPNG());
 await click('#modal [data-action=formationSlot]');console.log('PASS formation source flow: six slots, original cards, replace, preview and save');
};
