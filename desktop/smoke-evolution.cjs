const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
exports.prepare=async store=>{const {createGame}=await import('../src/game.mjs');const s=createGame();s.coins=1e7;s.food=1e7;s.gems=100000;s.items[7027]=100000;s.items[7028]=1000;for(const id of [7111,7112,7113,7114])s.items[id]=100;s.dragons=[{id:2,species:'original1200',level:25,star:5,habitatId:1,evolution:{phase:0,value:20}},{id:4,species:'original1200',level:7,star:5,habitatId:1}];s.nextId=5;s.formation=[2];await store.save(s);};
exports.run=async(window,store,verify=false)=>{
 if(verify){const s=(await store.load()).state;assert.deepEqual(s.dragons[0].evolution,{phase:1,value:1});assert.equal(s.dragons[0].wake.star,1);assert.equal(s.dragons.length,1);console.log('PASS independent restart retains evolution, awakening and source material debits');return;}
 const native=selector=>require('./smoke-input.cjs').nativeClick(window,selector),js=code=>window.webContents.executeJavaScript(code);
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 await js("(()=>{const b=document.createElement('button');b.dataset.action='openDragon';b.dataset.id='2';document.body.append(b);b.click();b.remove()})()");await wait(450);
 await native('[data-action=openEvolution]');await wait(500);
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceEvolution');
 assert(await js("document.querySelector('#modal').textContent.includes('20 / 20')"));
 await native('[data-action=evolveDragon]');let s=(await store.load()).state;assert.deepEqual(s.dragons[0].evolution,{phase:1,value:0});assert.equal(s.items[7028],998);assert.equal(s.items[7027],99000);
 await native('[data-action=evolveDragon]');s=(await store.load()).state;assert.deepEqual(s.dragons[0].evolution,{phase:1,value:1});assert.equal(s.items[7028],995);
 assert(await js("Array.from(document.querySelectorAll('#modal img')).every(i=>i.complete&&i.naturalWidth>0)"));
 await fs.writeFile(path.join(__dirname,'..','work','evolution-playable-v66.png'),(await window.webContents.capturePage()).toPNG());
 await native('[data-action=returnFromEvolution]');await native('[data-action=openDragonStar]');assert(await js("document.querySelector('#modal').textContent.includes('五星后继续觉醒至十星')"));
 await native('[data-action=openAwakening]');await native('[data-action=dragonAwaken][data-value=start]');await native('[data-action=awakeningSelect]');await native('[data-action=awakeningMaterial][data-value="4"]');await native('[data-action=awakeningSelected][data-value=accept]');await native('[data-action=dragonAwaken][data-value=train]');await native('[data-action=dragonAwaken][data-value=upgrade]');s=(await store.load()).state;assert.equal(s.dragons[0].wake.star,1);assert.equal(s.dragons.length,1);assert.equal(s.items[7111],95);
 assert(await js("Array.from(document.querySelectorAll('#modal img')).every(i=>i.complete&&i.naturalWidth>0)"));
 await fs.writeFile(path.join(__dirname,'..','work','ancient-awakening-v66.png'),(await window.webContents.capturePage()).toPNG());
 await native('#modal [data-action=openDragonStar]');await native('[data-action=returnStarDragon]');await native('#modal [data-action=close]');await native('[data-action=openActivities]');await native('[data-action=historyFamily][data-value=limited]');
 assert.equal(await js("document.querySelectorAll('.history-activity-card').length"),4);
 await native('[data-action=historyOpen][data-value="limited-1"]');await native('[data-action=historyAct][data-count="1"]');await native('[data-action=historyResultClose]');await native('[data-action=historyRanks]');await native('[data-action=historyAct][data-op="rankClaim"]');
 assert((await store.load()).state.giftEggs.some(e=>e.dragonId===1200));
 await fs.writeFile(path.join(__dirname,'..','work','ancient-event-reward-v66.png'),(await window.webContents.capturePage()).toPNG());
 console.log('PASS real mouse evolution success/failure/costs/attribute UI and ancient five-to-six awakening; original source layouts');
};
exports.runLegacyPreview=async(window,store)=>{
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
 assert(await js("document.querySelector('#modal').textContent.includes('繁殖')&&document.querySelector('#modal').textContent.includes('待确认')"));
 await fs.writeFile(path.join(__dirname,'..','work','acquisition-qa.png'),(await window.webContents.capturePage()).toPNG());
 assert.deepEqual(await state(),before,'Preview must not consume resources or write progression');
 console.log('PASS evolution source preview/art/model/translation/return/resize and 90 acquisition entries; no gameplay/save mutation');
};
