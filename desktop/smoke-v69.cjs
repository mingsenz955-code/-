const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{const {createGame}=await import('../src/game.mjs');const s=createGame();s.mail.claimed=['update-0.16.67','update-0.16.68'];await store.save(s);};
exports.run=async(w,store,verify)=>{
 const js=c=>w.webContents.executeJavaScript(c),click=s=>require('./smoke-input.cjs').nativeClick(w,s);
 const check=async()=>{const s=(await store.load()).state;assert.equal(s.gems,100000);assert.equal(s.equipment.length,6);assert.equal(s.giftEggs.length,2);assert(s.giftEggs.some(e=>e.dragonId===1204));assert(s.mail.randomEggs['update-0.16.69']>=2000);assert.equal(s.mail.claimed.length,3);return s;};
 if(verify){await check();console.log('PASS v69 restart: random egg identity, candy egg, 100k gems, six purple parts and legacy ledger');return;}
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.ranch-world')"))break;await wait(100);}
 await js("(()=>{const b=document.createElement('button');b.dataset.action='openMail';document.body.append(b);b.click();b.remove();})()");await wait(300);
 await click('[data-action=readMail][data-value="update-0.16.69"]');await wait(300);
 assert(await js("document.querySelector('#modal').textContent.includes('100000')"));
 assert.equal(await js("document.querySelectorAll('#modal .mail-equipment-preview img').length"),6);
 await fs.mkdir(path.join(__dirname,'..','work'),{recursive:true});await fs.writeFile(path.join(__dirname,'..','work','mail-v69-before.png'),(await w.webContents.capturePage()).toPNG());
 await click('[data-action=claimMail]');await wait(500);const s=await check();
 await js("(()=>{const b=document.createElement('button');b.dataset.action='openMail';document.body.append(b);b.click();b.remove();})()");await wait(200);await click('[data-action=readMail][data-value="update-0.16.69"]');await wait(200);
 assert.equal(await js("document.querySelectorAll('[data-action=claimMail]').length"),0);
 await fs.writeFile(path.join(__dirname,'..','work','mail-v69-claimed.png'),(await w.webContents.capturePage()).toPNG());
 const {equipmentDefinition}=await import('../src/equipment.mjs');assert(s.equipment.every(e=>equipmentDefinition(e.type).quality===4&&equipmentDefinition(e.type).grade===1&&e.star===0));
 console.log('PASS v69 native mail: correct previews, actual claim, exact rewards, duplicate button absent');
};
