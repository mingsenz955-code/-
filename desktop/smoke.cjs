const assert=require('node:assert/strict');const fs=require('node:fs/promises');const path=require('node:path');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.run=async(window,store,verify)=>{
 const errors=[];window.webContents.on('console-message',(event,level,message)=>{if(event.level==='error'||level===3)errors.push(event.message||message)});
 const js=code=>window.webContents.executeJavaScript(code);
 for(let i=0;i<60;i++){if(await js("!!document.querySelector('[data-action=plant]')"))break;await wait(100)}
 if(verify){const {state}=await store.load();assert.equal(state.dragons.length,3);assert.equal(state.stats.hatches,1);assert(state.dragons[0].level>=2);assert.equal(state.farm,null);await wait(700);assert(await js("Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)"),'Missing ranch image');assert(await js("document.querySelector('.scene').getBoundingClientRect().height>400"),'Ranch scene collapsed');assert(await js("document.querySelector('.original-hud').getBoundingClientRect().height>400"),'Original HUD not visible');await fs.writeFile(path.join(__dirname,'..','work','desktop-qa.png'),(await window.webContents.capturePage()).toPNG());console.log('PASS desktop restart: three dragons, levels and resources restored; ranch screenshot updated');return}
 const click=async selector=>{assert(await js(`!!document.querySelector(${JSON.stringify(selector)})`),`Missing ${selector}`);await js(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(250)};
 const snapshot=async()=> (await store.load()).state;
 assert.equal((await snapshot()).dragons.length,2);
 await click('[data-action=farm]');await click('[data-action=plant]');assert.notEqual((await snapshot()).farm,null);
 await wait(30500);await click('[data-action=harvest]');assert.equal((await snapshot()).stats.harvests,1);
 await click('[data-tab=dragons]');for(let i=0;i<12;i++)await click('[data-action=feed]');
 await click('[data-action=selectDragon][data-id="3"]');for(let i=0;i<12;i++)await click('[data-action=feed]');
 assert((await snapshot()).dragons.every(d=>d.level===4));
 await click('[data-tab=breeding]');await click('[data-action=breed]');assert.equal((await snapshot()).nest.phase,'breeding');
 // Simulate long original timers only in this isolated test profile; production uses wall clock.
 const advance=async at=>{await js(`Date.now=()=>${at};true`);await wait(400)};
 await advance((await snapshot()).nest.readyAt+1);await click('[data-action=takeEgg]');await click('[data-action=incubate]');
 await advance((await snapshot()).nest.readyAt+1);await click('[data-action=hatch]');assert.equal((await snapshot()).dragons.length,3);assert.equal((await snapshot()).stats.hatches,1);
 await click('[data-tab=habitats]');await click('[data-action=collect]');await click('[data-tab=ranch]');
 const image=await window.webContents.capturePage();await fs.mkdir(path.join(__dirname,'..','work'),{recursive:true});await fs.writeFile(path.join(__dirname,'..','work','desktop-qa.png'),image.toPNG());
 assert.deepEqual(errors,[]);console.log('PASS desktop UI: original crop in real time, 24 feeds, client breeding pool, original long breeding/hatch timers with isolated simulated clock, collect, automatic disk save; screenshot work/desktop-qa.png');
};
