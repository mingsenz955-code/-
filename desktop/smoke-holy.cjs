const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame,action}=await import('../src/game.mjs');const {ORIGINAL_LEVELS}=await import('../src/data.mjs');let s=createGame(Date.now()-7200001);s.playerXp=ORIGINAL_LEVELS.find(v=>v.level===99).xp_required;s.gems=100;s.dragons.push({id:4,species:'original1072',level:7,habitatId:1});s.nextId=5;s=action(s,'build',{buildingId:40},s.updatedAt);s=action(s,'completeHabitat',{id:5});s.incubator={phase:'hatching',species:'original1206',parents:[],source:'raffle',readyAt:Date.now()-1000};await store.save(s)};
exports.run=async(w,store,verify=false)=>{
 const js=c=>w.webContents.executeJavaScript(c),click=async s=>{assert(await js(`!!document.querySelector(${JSON.stringify(s)})`),s);await js(`document.querySelector(${JSON.stringify(s)}).click();true`);await wait(350)};
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 if(verify){const s=(await store.load()).state;assert.equal(s.dragons.find(d=>d.species==='original1206').habitatId,5);assert.equal(s.incubator,null);console.log('PASS holy habitat save restart');return}
 await click('.world-object [data-action=openDragon][data-id="4"]');await click('#modal [data-action=dragonMove]');
 assert(await js("!!document.querySelector('[data-habitat-offer=\"5\"] [data-action=moveNative]')"));
 await fs.writeFile(path.join(__dirname,'..','work','holy-habitat-placement-qa.png'),(await w.webContents.capturePage()).toPNG());
 await click('[data-habitat-offer="5"] [data-action=moveNative]');assert.equal((await store.load()).state.dragons.find(d=>d.id===4).habitatId,5);
 await click('[data-action=openIncubator]');await click('#modal [data-action=chooseHatchHabitat]');assert.equal(await js("!!document.querySelector('[data-habitat-offer=\"5\"] [data-action=hatchNative]')"),false,'Full capacity must still block hatch');
 await click('#modal [data-action=close]');await click('.world-object [data-action=openDragon][data-id="4"]');await click('#modal [data-action=dragonMove]');await click('[data-habitat-offer="1"] [data-action=moveNative]');
 await click('[data-action=openIncubator]');await click('#modal [data-action=chooseHatchHabitat]');await click('[data-habitat-offer="5"] [data-action=hatchNative]');assert.equal((await store.load()).state.dragons.find(d=>d.species==='original1206').habitatId,5);
 console.log('PASS actual holy move, full-habitat guard, ancient hatch and save');
};
