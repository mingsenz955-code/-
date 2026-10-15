const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame}=await import('../src/game.mjs');const state=createGame();if(process.argv.includes('--exercise-ten-gems'))state.gems=10000;await store.save(state)};
exports.run=async(w,store,verify=false)=>{const js=c=>w.webContents.executeJavaScript(c),click=q=>require('./smoke-input.cjs').nativeClick(w,q);
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 if(verify){const s=(await store.load()).state;assert.equal(s.gemExplore.lowFree,4);assert.equal(s.gemExplore.draws,1);assert.equal(s.gemInventory[0].type,810101);assert.equal(s.gemSockets[0],'gm-1');assert.equal(s.gems,0);console.log('PASS source gem obtained free, altar and cooldown survive restart');return}
 await click('[data-action=showMore]');await click('[data-action=openGems]');await click('[data-action=openGemExplore]');assert.equal(await js("document.querySelectorAll('[data-action=exploreGem]').length"),6);
 assert(!await js("document.querySelector('#modal').textContent.includes('2515')"));await fs.writeFile(path.join(__dirname,'..','work','gem-explore-qa.png'),(await w.webContents.capturePage()).toPNG());await js('Math.random=()=>0;true');await click('[data-action=exploreGem][data-value="low:1"]');assert.equal((await store.load()).state.gemInventory[0].type,810101);assert.deepEqual(await js("[...document.querySelectorAll('#modal img')].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)"),[]);await fs.writeFile(path.join(__dirname,'..','work','gem-explore-result-qa.png'),(await w.webContents.capturePage()).toPNG());await click('[data-action=gemInfo][data-id="gm-1"]');await click('[data-action=insertGem]');assert.equal((await store.load()).state.gemSockets[0],'gm-1');assert.deepEqual(await js("[...document.querySelectorAll('#modal img')].filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src)"),[]);console.log('PASS empty stock free gem exploration, source results, actual altar insertion and save');
 if(process.argv.includes('--exercise-ten-gems')){
  await click('[data-action=openGemExplore]');await js('Math.random=()=>.999999;true');
  await click('[data-action=exploreGem][data-value="high:10"]');
  let state=(await store.load()).state;assert.equal(state.gemInventory.length,11);assert.equal(state.gems,8200);assert.equal(state.gemExplore.draws,11);
  assert.equal(await js("document.querySelectorAll('.source-gem-source-results button').length"),10);assert.equal(await js("document.querySelector('#modal').dataset.animating"),undefined);
  await fs.writeFile(path.join(__dirname,'..','work','gem-ten-reveal-qa.png'),(await w.webContents.capturePage()).toPNG());
  await require('./smoke-input.cjs').nativeClick(w,'[data-action=exploreGem][data-value="high:10"]',{settle:false});await wait(100);
  w.webContents.sendInputEvent({type:'keyDown',keyCode:'Escape'});w.webContents.sendInputEvent({type:'keyUp',keyCode:'Escape'});await wait(1400);
  assert.equal(await js("document.querySelector('#modal').open"),false);state=(await store.load()).state;assert.equal(state.gemInventory.length,21);assert.equal(state.gems,6400);assert.equal(state.gemExplore.draws,21);
  assert.equal(await js("document.querySelectorAll('.source-particles').length"),0);console.log('PASS high ten-reveal, correct single charge and all rewards saved even when closing mid-animation');
 }

};
