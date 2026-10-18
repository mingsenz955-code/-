const assert=require('node:assert/strict'),wait=ms=>new Promise(r=>setTimeout(r,ms)),fs=require('node:fs/promises'),path=require('node:path');
const mail='celebration-linhaoran-boss-20261018';
exports.prepare=async store=>{const{createGame}=await import('../src/game.mjs');const s=createGame();s.mail.claimed=['update-0.16.67','update-0.16.68','update-0.16.69','update-0.16.71'];await store.save(s);};
exports.run=async(w,store,verify)=>{
 const js=c=>w.webContents.executeJavaScript(c),click=s=>require('./smoke-input.cjs').nativeClick(w,s),check=async()=>{const s=(await store.load()).state;assert(s.mail.claimed.includes(mail));assert.equal(s.giftEggs[0].dragonId,1201);assert.equal(s.giftEggs[0].quantity,15);assert.equal(s.equipment.length,6);assert(s.equipment.every(e=>e.star===5));assert.equal(s.runes.length,4);return s;};
 if(verify){await check();console.log('PASS v72 restart: 15 ice emperor eggs, max orange set, max red runes and once-only ledger');return;}
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.ranch-world')"))break;await wait(100);}
 await js("(()=>{const b=document.createElement('button');b.dataset.action='openMail';document.body.append(b);b.click();b.remove();})()");await wait(200);await click(`[data-action=readMail][data-value="${mail}"]`);
 assert(await js("document.querySelector('#modal').textContent.includes('林皓然')"));assert(await js("document.querySelector('#modal').textContent.includes('×15')"));assert.equal(await js("document.querySelectorAll('.mail-equipment-preview img').length"),10);
 await fs.mkdir(path.join(__dirname,'..','work'),{recursive:true});await fs.writeFile(path.join(__dirname,'..','work','celebration-v72.png'),(await w.webContents.capturePage()).toPNG());await click('[data-action=claimMail]');await wait(200);await check();
 const{equipmentDefinition}=await import('../src/equipment.mjs'),{runeDefinition}=await import('../src/runes.mjs');const s=await check();assert(s.equipment.every(e=>equipmentDefinition(e.type).grade===100));assert(s.runes.every(r=>runeDefinition(r.type).level===10&&runeDefinition(r.type).quality===6));console.log('PASS v72 native celebration: correct sender/title/15 eggs/ten gear and rune previews, actual claim into inventory');
};
