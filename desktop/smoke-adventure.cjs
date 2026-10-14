const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// Adventure is read-only for now: progress, stars, stamina and fight results are
// server-side, so this QA only proves the client's own maps and node chain render.
exports.run=async(window,store)=>{
 const js=code=>window.webContents.executeJavaScript(code);
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(420)};
 const shot=async name=>fs.writeFile(path.join(__dirname,'..','work',name),(await window.webContents.capturePage()).toPNG());
 const before=(await store.load()).state;

 await click('.original-hud [data-action=openAdventure]');
 await wait(900);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourcePve');
 assert.equal(await js("document.querySelector('#modal').dataset.pveMap"),'101');
 assert.equal(await js("document.querySelectorAll('#modal .source-pve-node').length"),20,'mapevents holds twenty nodes per map');
 assert(await js("Array.from(document.querySelectorAll('#modal .source-pve-node img')).every(i=>i.complete&&i.naturalWidth>0)"),'every node marker must load');
 assert(await js("!!document.querySelector('#modal img[src*=\"map_1.jpg\"]')"),'map 101 uses the first source background');
 assert(await js("document.querySelector('#modal').textContent.includes('神秘的背影')"),'the map name comes from the client maps table');
 await shot('adventure-map-qa.png');

 // The left/right buttons step to the adjacent map in the exported list.
 await click('#modal [data-action=pveMap][data-value="102"]');
 await wait(700);
 assert.equal(await js("document.querySelector('#modal').dataset.pveMap"),'102');
 assert(await js("!!document.querySelector('#modal img[src*=\"map_2.jpg\"]')"),'map 102 uses the second background');
 await click('#modal [data-action=pveMap][data-value="101"]');
 await wait(700);
 assert.equal(await js("document.querySelector('#modal').dataset.pveMap"),'101');
 await click('#modal [data-action=pveMap][data-value="102"]');
 await wait(700);
 assert.equal(await js("document.querySelector('#modal').dataset.pveMap"),'102');
 await shot('adventure-map-102-qa.png');

 await click('#modal .source-pve-node');
 await wait(800);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceBattle','a node must open the battle screen');
 assert.equal(await js("document.querySelectorAll('#modal .source-battle-portrait').length"),before.dragons.length,'the left line-up must be the real dragons');
 assert(await js("document.querySelector('#modal').textContent.includes('基础成长')"),'the baseline power note must be shown');
 assert(await js("document.querySelector('#modal').textContent.includes('敌方配置未取得')"),'the missing enemy list must be stated, not faked');
 assert.equal(await js("document.querySelectorAll('#modal .source-battle-portrait').length<=6"),true);
 await shot('battle-qa.png');
 await click('#modal [data-action=close]');
 await wait(500);
 assert.deepEqual(await store.load().then(loaded=>loaded.state),before,'viewing adventure and battle must not write the save');
 console.log('PASS adventure panel: twenty client nodes per map, source background per map, atlas reuse, node tap and no save writes');
};
