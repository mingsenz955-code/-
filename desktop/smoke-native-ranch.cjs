const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
exports.prepare=async store=>{
 assert.equal((await store.load()).state,null,'Fresh isolated profile required');
 const {createGame}=await import('../src/game.mjs'),{ORIGINAL_LEVELS,SPECIES}=await import('../src/data.mjs');const s=createGame();s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===8).xp_required;s.coins=50000;s.food=5000;s.habitats[0].storedCoins=777;s.dragons.forEach(d=>d.level=4);
 s.dragons.push({id:s.nextId++,species:Object.keys(SPECIES).find(k=>SPECIES[k].attributes?.length===1&&SPECIES[k].attributes[0]==='e'),level:4,feedsInLevel:0,habitatId:1});await store.save(s);
};
exports.run=async(window,store)=>{
 const js=code=>window.webContents.executeJavaScript(code),state=async()=>(await store.load()).state,errors=[];window.webContents.on('console-message',event=>{if(event.level==='error')errors.push(event.message)});
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(300)};
 const art=async()=>{await wait(300);assert(await js("Array.from(document.querySelectorAll('#modal img')).every(i=>i.complete&&i.naturalWidth>0)"),await js("Array.from(document.querySelectorAll('#modal img')).filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')).join(',')"));assert(await js("!document.querySelector('.topbar,.left,.right,.stage-content,.card,.footer')"),'Legacy website UI must not exist');};
 const shot=async name=>{await art();await fs.writeFile(path.join(__dirname,'..','work',name+'.png'),(await window.webContents.capturePage()).toPNG())};
 const advance=async at=>{await js(`Date.now=()=>${at};true`);await wait(400)};
 // gold/food/gem each carry a ＋ button in the client layout; all three must be real buttons now.
 assert.equal(await js("document.querySelectorAll('.original-hud [data-action=resourceShopGold],.original-hud [data-action=resourceShopFood]').length"),2,'获取金币 and 获取食物 must each reach their own 资源 section');
 await click('.original-hud [data-action=openRecharge][aria-label="获取魔晶"]');
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceRecharge','the 魔晶 ＋ must open the recharge panel');
 await click('#modal [data-action=close]');
 await click('[data-place-id="1"]');await shot('native-habitat-info');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeHabitatInfo');await click('#modal [data-action=collect]');assert((await state()).coins>=50777);await click('#modal [data-action=close]');
 await click('[data-action=showMore]');await click('[data-action=openHabitats]');await shot('native-shop');
 // 资源: the three kinds live in their own sections, and a currency ＋ opens only its own kind.
 await click('#modal [data-action=resourceShop]');
 // 商店是模态，但主 HUD 的资源栏仍在后面透出来：三个 ＋ 必须都还在、图也都得加载好。
 assert.equal(await js("document.querySelectorAll('.original-hud [data-action=resourceShopGold]').length"),1,'金币 ＋ must still exist behind the shop');
 assert.equal(await js("document.querySelectorAll('.original-hud [data-action=resourceShopFood]').length"),1,'食物 ＋ must still exist behind the shop');
 assert.equal(await js("document.querySelectorAll('.original-hud [data-action=openRecharge]').length"),2,'魔晶 ＋ must still exist behind the shop');
 assert.equal(await js("[...document.querySelectorAll('.original-hud img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')).join(',')"),'','HUD images must load while the shop is open');
 assert.equal(await js("document.querySelectorAll('.original-hud .hud-text').length"),6,'every HUD number must still be rendered behind the shop (power is intentionally skipped)');
 assert.equal(await js("document.querySelectorAll('#modal [data-resource-section]').length"),3,'the 资源 category must not mix 金币, 食物 and 进化果实');
 assert.equal(await js("document.querySelector('#modal [data-resource-section]').dataset.resourceSection"),'g','金币 comes first');
 await shot('native-resource-shop');
 await click('#modal [data-action=close]');
 await click('.original-hud [data-action=resourceShopGold]');
 assert.equal(await js("document.querySelectorAll('#modal [data-resource-section]').length"),1,'the 金币 ＋ must open 金币 only');
 assert.equal(await js("document.querySelector('#modal [data-resource-section]').dataset.resourceSection"),'g');
 await shot('native-resource-shop-gold');
 await click('#modal [data-action=close]');
 await click('[data-action=openHabitats]');await click('#modal [data-action=habitatShop]');assert.equal(await js("document.querySelectorAll('[data-habitat-offer]').length"),17);await shot('native-habitat-shop');
 await click('[data-action=habitatPurchase][data-id="26"]');await art();const before=(await state()).coins;await click('[data-action=buyHabitat]');const habitat=(await state()).habitats.at(-1);assert.equal(habitat.buildingId,26);assert.equal((await state()).coins,before-100);assert.equal(habitat.job.kind,'build');assert(await js("document.querySelector('[data-action=completeHabitat]').disabled"));
 await advance(habitat.job.readyAt+1);await click('[data-action=completeHabitat]');await click('[data-action=upgradeHabitat]');assert.equal((await state()).habitats.at(-1).job.kind,'upgrade');await advance((await state()).habitats.at(-1).job.readyAt+1);await click('[data-action=completeHabitat]');assert.equal((await state()).habitats.at(-1).buildingId,27);await click('#modal [data-action=close]');
 await click('[data-action=openMyDragons]');await click('.source-dragon-card[data-id="4"]');await click('[data-action=dragonMove]');await art();await click(`[data-action=moveNative][data-id="${habitat.id}"]`);assert.equal((await state()).dragons.find(d=>d.id===4).habitatId,habitat.id);await click('#modal [data-action=close]');
 await click('[data-action=openBreed]');await shot('native-breed');await click('[data-action=chooseParent][data-id="2"][data-value="1"]');assert(await js("document.querySelector('[data-action=breed]').disabled"));await click('[data-action=chooseParent][data-id="3"][data-value="1"]');await click('[data-action=breed]');assert.equal((await state()).breeding.phase,'breeding');await shot('native-breeding-job');
 await advance((await state()).breeding.readyAt+1);await click('[data-action=takeEgg]');await click('[data-action=incubate]');await art();await advance((await state()).incubator.readyAt+1);await click('#modal [data-action=openIncubator]');await art();await click('[data-action=chooseHatchHabitat]');await art();await click('[data-action=hatchNative][data-id="1"]');assert.equal((await state()).stats.hatches,1);assert.equal((await state()).dragons.length,4);assert.equal(await js("document.querySelector('#modal').open"),false);
 await click('[data-action=openOriginal]');await art();assert.equal(await js("document.querySelectorAll('[data-action=acquisition]').length"),90);await click('[data-action=acquisition][data-id="1000"]');await art();await click('#modal [data-action=close]');await click('[data-action=settings]');await art();assert(await js("!!document.querySelector('[data-action=export]')"));await click('#modal [data-action=close]');
 // 三个货币格（金币/食物/魔晶）在任何窗口尺寸下都要完整渲染：图标、数字、＋ 一个都不能少。
 for(const [w,h] of [[1000,700],[1440,900],[1707,1019],[2560,800]]){
  window.setSize(w,h);await wait(600);
  const broken=await js("[...document.querySelectorAll('.original-hud img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')).join(',')");
  assert.equal(broken,'',`every HUD image must load at ${w}x${h}`);
  assert.equal(await js("document.querySelectorAll('.original-hud [data-action=resourceShopGold]').length"),1,`金币 ＋ missing at ${w}x${h}`);
  assert.equal(await js("document.querySelectorAll('.original-hud [data-action=resourceShopFood]').length"),1,`食物 ＋ missing at ${w}x${h}`);
  assert.equal(await js("document.querySelectorAll('.original-hud [data-action=openRecharge]').length"),2,`魔晶 ＋ or 充值 missing at ${w}x${h}`);
  if(w===1707){
   await shot('native-hud-1707');
   // 玩家的窗口比例 + 商店开着：这才是他看到残缺格子的场景。
   await click('.original-hud [data-action=resourceShopFood]');
   await wait(800);
   assert.equal(await js("document.querySelectorAll('#modal').length && document.querySelector('#modal').dataset.mode"),'nativeResourceShop','the 食物 ＋ must open the shop');
   assert.equal(await js("[...document.querySelectorAll('.original-hud img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')).join(',')"),'','HUD images must survive the shop at 1707x1019');
   assert.equal(await js("document.querySelectorAll('.original-hud [data-action=resourceShopFood]').length"),1,'食物 ＋ must survive the shop at 1707x1019');
   assert.equal(await js("document.querySelectorAll('.original-hud .hud-text').length"),6,'HUD numbers must survive the shop at 1707x1019');
   await shot('native-hud-1707-shop');
   await click('#modal [data-action=close]');
  }
 }
 await shot('native-hud-widths');
 window.setSize(1000,700);await click('[data-place-id="1"]');assert(await js("(()=>{const r=document.querySelector('#modal').getBoundingClientRect();return r.width<=innerWidth&&r.height<=innerHeight})()"));assert.deepEqual(errors,[]);
 console.log('PASS native ranch routes: no website chrome/cards; source shop/17 habitats/detail/build/upgrade/move, two source parent lists and breed/egg/incubate/hatch, 90 catalog entries, save UI and resize; isolated clock only');
};
