const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame}=await import('../src/game.mjs');const s=createGame();s.playerXp=2060310572;s.dragons[0].level=20;s.formation=[2];await store.save(s);};
exports.run=async(w,store)=>{
 const js=c=>w.webContents.executeJavaScript(c);for(let i=0;i<100&&!await js("!!document.querySelector('.ranch-world')");i++)await wait(100);
 const before=JSON.stringify((await store.load()).state);
 const report=await js(`(async()=>{
  const s=(await window.ranch.load()).state,{simulateCombat}=await import('./src/combat.mjs'),{openBattleDialog,playBattleAnimation}=await import('./src/battle-dialog.mjs');
  const enemy={species:'original1047',level:20,attack:1,defend:100,life:5000},combat=simulateCombat(s,[enemy],{roundLimit:3}),hits=[];
  await openBattleDialog(s,{enemyGroup:[enemy]});const listener=e=>{const t=e.detail,side=t.side==='ally'?'enemy':'ally',unit=document.querySelector('[data-unit="'+side+t.target+'"]'),top=document.querySelector('[data-source="'+(side==='ally'?'left':'right')+(t.target+1)+'/hp"]'),numbers=[...document.querySelectorAll('.battle-damage')];hits.push({...t,renderedHp:Number(unit.dataset.currentHp),topHp:Number(top.dataset.currentHp),topClip:top.style.clipPath,barPercent:Number(unit.querySelector('.battle-unit-hp').dataset.hp),number:Number(numbers.at(-1)?.getAttribute('aria-label'))});};document.addEventListener('battle-hp-applied',listener);
  let complete;try{complete=await playBattleAnimation(s,null,{won:combat.won,enemyGroup:[enemy],combat});}finally{document.removeEventListener('battle-hp-applied',listener)}
  return {complete,combat,hits,enemyDead:document.querySelector('[data-unit=enemy0]').classList.contains('is-dead'),enemyHp:Number(document.querySelector('[data-unit=enemy0]').dataset.currentHp)};
 })()`);
 assert(report.complete);assert.equal(report.combat.events.length,6);assert.equal(report.hits.length,6);assert(report.enemyHp>0);assert(!report.enemyDead);
 for(const h of report.hits){assert.equal(h.renderedHp,h.hpAfter);assert.equal(h.topHp,h.hpAfter);assert(Math.abs(h.barPercent-100*h.hpAfter/h.maxHp)<1e-8);assert(h.topClip.startsWith('inset('));assert.equal(h.number,h.damage);assert.equal(h.hpAfter,Math.max(0,h.hpBefore-h.damage));}
 const normals=report.hits.filter(h=>h.side==='ally'&&h.slot===1);assert.equal(normals[0].damage,normals[1].damage,'round three must not escalate damage or kill the target');
 await fs.writeFile(path.join(__dirname,'..','work','combat-real-hp-v61.png'),(await w.webContents.capturePage()).toPNG());
 await fs.writeFile(path.join(__dirname,'..','work','combat-real-hp-v61.json'),JSON.stringify(report,null,2));
 await require('./smoke-input.cjs').nativeClick(w,'#modal [data-action=close]');
 const boss=await js(`(async()=>{const s=(await window.ranch.load()).state,{openBattleDialog,playBossAnimation}=await import('./src/battle-dialog.mjs'),enemy={species:'original1047',level:20,attack:1,defend:100,life:5000};await openBattleDialog(s,{enemyGroup:[enemy]});const playing=playBossAnimation(s,{enemy,startHp:1000,hits:[{index:0,damage:100,round:1}],won:false}),initial=Number(document.querySelector('[data-unit=enemy0]').dataset.currentHp);await playing;return {initial,hp:Number(document.querySelector('[data-unit=enemy0]').dataset.currentHp),top:Number(document.querySelector('[data-source="right1/hp"]').dataset.currentHp)};})()`);assert.deepEqual(boss,{initial:1000,hp:900,top:900});await require('./smoke-input.cjs').nativeClick(w,'#modal [data-action=close]');
 assert.equal(JSON.stringify((await store.load()).state),before,'presentation-only QA must not change the saved player');
 console.log('PASS real HP replay: six hits, both bars and displayed damage match the solver, third-round normal damage stays constant; partial boss starts at remaining HP; no save mutation');
};
