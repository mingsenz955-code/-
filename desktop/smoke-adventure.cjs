const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null,'Use a fresh isolated profile');const {createGame}=await import('../src/game.mjs');const state=createGame();state.dragons.forEach(dragon=>dragon.level=20);await store.save(state)};
exports.run=async(window,store,verify=false)=>{
 const js=async code=>{try{return await window.webContents.executeJavaScript(code)}catch(e){console.error('Failed renderer check:',code);throw e}};
 window.webContents.on('console-message',(_e,...args)=>console.log('Renderer:',...args));
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(420)};
 const shot=async name=>fs.writeFile(path.join(__dirname,'..','work',name),(await window.webContents.capturePage()).toPNG());
 const before=(await store.load()).state;
 await click('.original-hud [data-action=openAdventure]');await wait(900);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourcePve');
 assert.equal(await js("document.querySelector('#modal').dataset.pveMap"),'101');
 assert.equal(await js("document.querySelectorAll('#modal .source-pve-node').length"),20);
 assert(await js("Array.from(document.querySelectorAll('#modal .source-pve-node img')).every(i=>i.complete&&i.naturalWidth>0)"));
 assert(await js("!!document.querySelector('#modal img[src*=\"map_1.jpg\"]')"));
 assert(await js("document.querySelector('#modal').textContent.includes('神秘的背影')"));
 if(verify){
  assert.equal(before.adventure.cleared['100101'],1);
  assert.equal(before.adventure.energy,9);
  assert.equal(await js("document.querySelectorAll('#modal .pve-stars').length"),1);
  assert.equal(await js("document.querySelectorAll('#modal .source-pve-node:not(:disabled)').length"),2);
  console.log('PASS persisted adventure result: first node, one star and spent energy');return;
 }
 assert.equal(await js("document.querySelectorAll('#modal .source-pve-node:not(:disabled)').length"),1);
 assert.equal(await js("document.querySelectorAll('#modal .source-pve-node:disabled').length"),19);
 await shot('adventure-map-qa.png');
 await click('#modal [data-action=pveMap][data-value="102"]');await wait(700);
 assert.equal(await js("document.querySelector('#modal').dataset.pveMap"),'102');
 assert(await js("!!document.querySelector('#modal img[src*=\"map_2.jpg\"]')"));
 await shot('adventure-map-102-qa.png');
 await click('#modal [data-action=pveMap][data-value="101"]');await wait(700);
 await click('#modal .source-pve-node:not(:disabled)');await wait(800);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceBattle');
 assert.equal(await js("document.querySelectorAll('#modal .source-battle-portrait[data-portrait^=ally]').length"),before.formation.length);
 assert.equal(await js("document.querySelectorAll('#modal .source-battle-panel, #modal .battle-projectile, #modal [data-action=battleStart]').length"),0);
 assert.equal(await js("document.querySelectorAll('#modal .source-battle-portrait[data-portrait^=enemy]').length"),6);
 assert.equal(await js("document.querySelector('#modal .source-artboard').getBoundingClientRect().width/document.querySelector('#modal .source-artboard').getBoundingClientRect().height"),1024/576);
 await shot('battle-qa.png');
 await wait(2200);
 assert(await js("!!document.querySelector('#modal .battle-source-effect[data-model]')"));
 await shot('battle-source-fx-qa.png');
 for(let i=0;i<180;i++){if((await store.load()).state.adventure.lastBattle)break;await wait(100)}
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourcePve');
 const after=(await store.load()).state;
 assert.equal(after.adventure.cleared['100101'],1);
 assert.equal(after.adventure.energy,9);
 assert.equal(after.coins,before.coins+150);
 assert.equal(after.food,before.food+10);
 await click('#modal .source-pve-node:not(:disabled)');
 await click('#modal [data-action=close]');await wait(1500);
 assert.deepEqual((await store.load()).state,after,'Exiting combat must cancel playback without a second charge or reward');
 console.log('PASS playable adventure: lock chain, formation battle, reward, energy and save write');
};




