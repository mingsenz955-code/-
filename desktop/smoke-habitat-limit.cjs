const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{nativeClick}=require('./smoke-input.cjs');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.run=async(w,store)=>{
 const js=c=>w.webContents.executeJavaScript(c),click=q=>nativeClick(w,q);
 const ready=async()=>{for(let i=0;i<100&&!await js("!!document.querySelector('.original-hud')");i++)await wait(100)};
 const shop=async()=>{await click('[data-action=showMore]');await click('[data-action=openHabitats]');await click('[data-action=habitatShop]');await click('[data-action=habitatPurchase][data-id="26"]')};
 await ready();await shop();
 assert(await js("document.querySelector('[data-action=buyHabitat]').disabled"));
 assert(await js("document.querySelector('.native-habitat-description').textContent.includes('1/1 座')&&document.querySelector('.native-habitat-description').textContent.includes('2 级')"));
 await fs.writeFile(path.join(__dirname,'..','work','habitat-limit-explanation-qa.png'),(await w.webContents.capturePage()).toPNG());
 const before=(await store.load()).state;await click('[data-action=expansionShop]');
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeExpansion');assert.deepEqual((await store.load()).state,before);
 const {ORIGINAL_LEVELS}=await import('../src/data.mjs');before.playerXp=ORIGINAL_LEVELS.find(l=>l.level===2).xp_required;await store.save(before);
 await w.webContents.reload();await ready();await shop();
 assert(!await js("document.querySelector('[data-action=buyHabitat]').disabled"));
 await click('[data-action=buyHabitat]');await click('[data-action=confirmBuildingMove]');
 const after=(await store.load()).state;assert.equal(after.habitats.length,2);assert.equal(after.coins,before.coins-100);assert.equal(after.habitats[1].job.kind,'build');
 console.log('PASS native level-one limit explanation, expansion navigation without charge, level-two purchase and placement');
};
