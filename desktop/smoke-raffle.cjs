const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
exports.run=async(window,store)=>{
 const js=code=>window.webContents.executeJavaScript(code);
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(250)};
 const before=(await store.load()).state;await click('[data-action=showMore]');await click('[data-action=lotteryOptions]');
 for(let i=0;i<60;i++){if(await js("document.querySelectorAll('#modal canvas[data-model-ready=true]').length===3"))break;await wait(100)}
 assert.equal(await js("document.querySelectorAll('#modal canvas[data-model-ready=true]').length"),3);
 assert(await js("Array.from(document.querySelectorAll('#modal img')).every(i=>i.complete&&i.naturalWidth>0)"));
 assert(await js("document.querySelector('#modal').textContent.includes('900')&&document.querySelector('#modal').textContent.includes('2500')"));
 assert.equal(await js("document.querySelectorAll('#modal [data-action=lotteryDraw]').length"),0,'Never apply legacy pool to modern machine prices');
 const draws=await js(`(async()=>{const {renderDragonFrame}=await import('./src/dragon-models.mjs');const out=[];for(const c of document.querySelectorAll('#modal canvas'))for(const clip of ['1','2']){await renderDragonFrame(c,c.dataset.model,clip,0);const p=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let count=0;for(let i=3;i<p.length;i+=4)if(p[i])count++;out.push(count);await renderDragonFrame(c,c.dataset.model,'1',0)}return out})()`);
 assert(draws.every(count=>count>1000),'Source idle/draw machine clips must not be blank');
 await fs.writeFile(path.join(__dirname,'..','work','raffle-native-qa.png'),(await window.webContents.capturePage()).toPNG());await click('#modal [data-action=raffleUnverified]');assert.deepEqual((await store.load()).state,before,'Unverified modern draw must not charge or use the old table');
 await click('#modal [data-action=rafflePreview]');
 assert.equal(await js("document.querySelectorAll('[data-raffle-preview-id]').length"),53);
 await wait(500);assert(await js("Array.from(document.querySelectorAll('.raffle-preview-layer img')).every(i=>i.complete&&i.naturalWidth>0)"));
 assert(await js("(()=>{const e=document.querySelector('.raffle-preview-list');return e.scrollHeight>e.clientHeight})()"));
 await fs.writeFile(path.join(__dirname,'..','work','raffle-preview-qa.png'),(await window.webContents.capturePage()).toPNG());
 await click('[data-action=closeRafflePreview]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceRaffle');
 await click('#modal [data-action=rafflePreview]');await js("document.querySelector('#modal').dispatchEvent(new Event('cancel',{cancelable:true}));true");
 assert.equal(await js("document.querySelectorAll('.raffle-preview-layer').length"),0);assert.deepEqual((await store.load()).state,before);
 window.setSize(1000,700);await wait(350);assert(await js("(()=>{const r=document.querySelector('#modal').getBoundingClientRect();return r.width<=innerWidth&&r.height<=innerHeight})()"));
 console.log('PASS later mobile raffle: three original machine skeletons/six clips, source page/images/prices, no legacy pool or debit, resize');
};
