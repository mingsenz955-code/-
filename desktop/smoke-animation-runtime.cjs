const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),{nativeClick}=require('./smoke-input.cjs');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame}=await import('../src/game.mjs');await store.save(createGame())};
exports.run=async(w,store)=>{
 const js=c=>w.webContents.executeJavaScript(c),click=q=>nativeClick(w,q);
 for(let i=0;i<100&&!await js("document.querySelectorAll('.world-resident canvas[data-model-ready]').length===2");i++)await wait(100);
 const before=await js("[...document.querySelectorAll('.world-resident canvas')].map(c=>c.toDataURL())");await wait(350);
 const after=await js("[...document.querySelectorAll('.world-resident canvas')].map(c=>c.toDataURL())");assert.equal(before.length,2);assert(before.every((v,i)=>v!==after[i]),'both resident breath animations must advance even with reduced motion');
 await click('[data-action=openAdventure]');await click('#modal .source-pve-node:not(:disabled)');
 const models=await js("[...document.querySelectorAll('.battle-fighter canvas')].map(c=>c.dataset.model)");assert(models.length>2);assert(models.every(v=>v.endsWith('_3')),'even level 1 combatants use original adult combat art');
 assert(await js("Math.abs(document.querySelector('#modal .source-artboard').getBoundingClientRect().width/document.querySelector('#modal .source-artboard').getBoundingClientRect().height-4/3)<.001"),'Source battlefield must retain 1024x768 aspect');
 await js("window.battleQA={effects:[],deaths:[]};document.querySelector('#modal').addEventListener('battle-source-effect',e=>battleQA.effects.push(e.detail));true");
 const seen=new Set(),moving=new Set(),last={};let captured=false,deadCompleted=false;
 for(let i=0;i<500&&await js("document.querySelector('#modal').dataset.mode==='sourceBattle'");i++){
  const frames=await js("[...document.querySelectorAll('.battle-fighter canvas')].map(c=>({id:c.closest('[data-unit]').dataset.unit,clip:c.dataset.clip,image:c.toDataURL()}))");
  for(const f of frames){seen.add(f.clip);if(last[f.id]&&last[f.id]!==f.image)moving.add(f.id);last[f.id]=f.image}
  deadCompleted||=await js("!!document.querySelector('.battle-fighter[hidden][data-death-complete=true]')");
  if(!captured&&await js("!!document.querySelector('.battle-source-effect')")){captured=true;await fs.writeFile(path.join(__dirname,'..','work','battle-runtime-qa.png'),(await w.webContents.capturePage()).toPNG())}
  await wait(40);
 }
 assert(seen.has('movein'));assert(seen.has('dead'));assert(deadCompleted,'Native death clip must complete before hiding the actor');assert(captured,'Actual source skill effects must render');assert(seen.has('breathinbattle'));assert([...seen].some(c=>c==='landattack'||c==='airattack'));assert([...seen].some(c=>c==='landattackend'||c==='airattackend'));assert(seen.has('magic'));assert(seen.has('hurt'));assert(moving.size>=3);assert((await store.load()).state.adventure.lastBattle);
 console.log('PASS live breath, adult combat model selection, windup/recovery, magic, hurt and settlement',JSON.stringify({reduced:await js("matchMedia('(prefers-reduced-motion: reduce)').matches"),motions:[...seen],moving:moving.size}));
};
