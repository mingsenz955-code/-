const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame}=await import('../src/game.mjs');const s=createGame();s.playerXp=2060310572;s.gems=1000;s.expansion={plots:16,lands:[11,12,13,14,15,16,17,18,21,22,23,24,31,32,33,34,35,36,41,42]};for(const d of s.dragons){d.species='original1200';d.level=20;}s.bloodFront.wave=process.argv.includes('--blood-next-qa')?0:4;s.bloodFront.score=process.argv.includes('--blood-next-qa')?0:12;s.bloodFront.totalScore=s.bloodFront.score;await store.save(s);};
exports.run=async(w,store,verify=false)=>{
 const js=c=>w.webContents.executeJavaScript(c),click=q=>require('./smoke-input.cjs').nativeClick(w,q),state=async()=>(await store.load()).state;
 for(let i=0;i<100&&!await js("!!document.querySelector('.ranch-world')");i++)await wait(100);
 if(verify){const s=await state();if(process.argv.includes('--blood-next-qa')){assert.equal(s.bloodFront.stage,1);assert.equal(s.bloodFront.wave,1);assert.equal(s.bloodFront.score,3);console.log('PASS independent restart preserves next-wave progress');return;}assert.equal(s.bloodFront.stage,2);assert.equal(s.bloodFront.best[1],15);assert.equal(s.items[6022],150);assert.equal(s.gems,999);console.log('PASS independent blood-front restart preserves stage, full record, pills and paid resource');return;}
 await js("document.querySelector('.ranch-world').style.transform='translate(-850px,-200px) scale(1)';true");await wait(1000);await click('[data-action=openBloodFront] canvas');
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceBloodFront');assert.equal(await js("document.querySelectorAll('.blood-enemy').length"),9);
 await fs.writeFile(path.join(__dirname,'..','work','blood-front-original-v60.png'),(await w.webContents.capturePage()).toPNG());
 await click('[data-action=bloodFormation]');await click('#modal [data-action=close]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceBloodFront');
 await click('[data-action=bloodBuffInfo][data-id="1"]');await click('[data-action=bloodBuffCurrency][data-value=gems]');await click('[data-action=bloodBuff]');assert.equal((await state()).gems,999);
 await click('[data-action=bloodSelect][data-id="3"]');await click('[data-action=bloodFight]');await fs.writeFile(path.join(__dirname,'..','work','blood-front-battle-v60.png'),(await w.webContents.capturePage()).toPNG());
 for(let i=0;i<600&&await js("document.querySelector('#modal').dataset.mode==='sourceBattle'");i++)await wait(100);
 if(process.argv.includes('--blood-next-qa')){assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceBloodNext');assert.equal((await state()).bloodFront.wave,1);await click('[data-action=bloodSelect][data-id="2"]');assert.equal(await js("document.querySelector('#modal').dataset.bloodSelection"),'2');await fs.writeFile(path.join(__dirname,'..','work','blood-front-next-v60.png'),(await w.webContents.capturePage()).toPNG());console.log('PASS real battle advances to original next-wave selection, switching difficulty works and progress saved');return;}
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceBloodResult');assert.equal((await state()).bloodFront.stage,2);assert.equal((await state()).items[6022],75);
 await fs.writeFile(path.join(__dirname,'..','work','blood-front-result-v60.png'),(await w.webContents.capturePage()).toPNG());
 await click('#modal [data-action=openBloodFront]');await click('[data-action=bloodResetConfirm]');await click('[data-action=bloodReset]');assert.equal((await state()).bloodFront.stage,1);
 await click('[data-action=bloodSweep]');assert.equal((await state()).items[6022],150);await click('#modal [data-action=openBloodFront]');await click('[data-action=close]');
 await click('.original-hud [data-action=openActivities]');assert.equal(await js("document.querySelectorAll('.history-activity-card').length"),19);
 assert.equal(await js("document.querySelectorAll('[data-value^=fire-],[data-value^=recharge-wheel-]').length"),0);
 console.log('PASS source blood UI: 9 enemy previews, paid buff, selected 3-star battle, stage settlement, reset, sweep; curated 19 activity entries');
};
