const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
exports.run=async(window,store)=>{
 const js=code=>window.webContents.executeJavaScript(code),state=async()=>(await store.load()).state;
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(300)};
 assert(await js("!document.querySelector('[data-tab=roadmap]')&&!document.body.textContent.includes('复刻进度')"));for(const name of ['首充','福利中心','限时活动','大富翁'])assert(await js(`!!document.querySelector('.original-hud [aria-label="${name}"]')`));
 assert(await js("Array.from(document.querySelectorAll('.original-hud img')).every(i=>i.complete&&i.naturalWidth>0)"));
 await wait(350);await fs.writeFile(path.join(__dirname,'..','work','main-activities-qa.png'),(await window.webContents.capturePage()).toPNG());
 const before=await state();await click('[data-place-id="1"] [data-action=openDragon][data-id="2"]');await click('#modal [data-action=openEvolution]');await wait(700);
 assert(await js("document.querySelector('#modal').dataset.mode==='sourceEvolution'"));
 assert(await js("Array.from(document.querySelectorAll('#modal img')).every(i=>i.complete&&i.naturalWidth>0)"),'Original evolution image missing');
 assert(await js("document.querySelector('#modal canvas').dataset.modelReady==='true'"));
 assert(await js("document.querySelector('#modal').textContent.includes('15')&&document.querySelector('#modal').textContent.includes('500')"));
 assert(await js("(()=>{const a=document.querySelector('[data-action=returnFromEvolution]'),b=document.querySelector('[data-action=evolutionHelp]');return a.getBoundingClientRect().x>innerWidth/2&&b.getBoundingClientRect().x>innerWidth/2})()"),'Header edge anchors overlap title');
 assert(await js("!Array.from(document.querySelectorAll('#modal .source-label')).some(e=>e.textContent.startsWith('ev.'))"),'Untranslated source labels');
 assert(await js("Array.from(document.querySelectorAll('#modal .source-button')).some(e=>e.disabled)"));
 await fs.writeFile(path.join(__dirname,'..','work','evolution-preview-qa.png'),(await window.webContents.capturePage()).toPNG());
 window.setSize(1000,700);await wait(300);assert(await js("(()=>{const r=document.querySelector('#modal').getBoundingClientRect();return r.width<=innerWidth&&r.height<=innerHeight})()"));
 await click('#modal [data-action=returnFromEvolution]');assert(await js("document.querySelector('#modal').dataset.mode==='sourceDragon'"));await click('#modal [data-action=close]');
 await click('[data-action=showMore]');assert(await js("!document.querySelector('#modal').open&&document.querySelector('.original-hud [data-action=lotteryOptions]')&&document.querySelector('.original-hud [data-action=openMyDragons]')"),'More must be the native icon dock');await fs.writeFile(path.join(__dirname,'..','work','main-menu-qa.png'),(await window.webContents.capturePage()).toPNG());await click('[data-action=openOriginal]');assert.equal(await js("document.querySelectorAll('[data-action=acquisition]').length"),90);await click('[data-action=acquisition][data-id="1000"]');
 assert(await js("document.querySelector('#modal').textContent.includes('繁殖候选')&&document.querySelector('#modal').textContent.includes('待核实')"));
 await fs.writeFile(path.join(__dirname,'..','work','acquisition-qa.png'),(await window.webContents.capturePage()).toPNG());
 assert.deepEqual(await state(),before,'Preview must not consume resources or write progression');
 console.log('PASS evolution source preview/art/model/translation/return/resize and 90 acquisition entries; no gameplay/save mutation');
};
