const {app,BrowserWindow,ipcMain,dialog,screen}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const warehouseSmoke=process.argv.includes('--smoke-warehouse'),warehouseVerify=process.argv.includes('--verify-warehouse');
const nativeRanchSmoke=process.argv.includes('--smoke-native-ranch');
const raffleSmoke=process.argv.includes('--smoke-raffle'),raffleVerify=process.argv.includes('--verify-raffle');
const lootSmoke=process.argv.includes('--smoke-loot'),lootVerify=process.argv.includes('--verify-loot');
const equipmentBagSmoke=process.argv.includes('--smoke-equipment-bag'),equipmentBagVerify=process.argv.includes('--verify-equipment-bag');
const gemExploreSmoke=process.argv.includes('--smoke-gem-explore'),gemExploreVerify=process.argv.includes('--verify-gem-explore');
const huntSmoke=process.argv.includes('--smoke-rune-hunt'),huntVerify=process.argv.includes('--verify-rune-hunt');
const runeSmoke=process.argv.includes('--smoke-runes'),runeVerify=process.argv.includes('--verify-runes');
const animationSmoke=process.argv.includes('--smoke-animations');
const motionSmoke=process.argv.includes('--smoke-habitat-motion');
const worldSmoke=process.argv.includes('--smoke-world-encounters')||process.argv.includes('--smoke-world-map')||process.argv.includes('--smoke-building-world'),worldVerify=process.argv.includes('--verify-world-encounters')||process.argv.includes('--verify-building-world');
const starSmoke=process.argv.includes('--smoke-equipment-stars'),starVerify=process.argv.includes('--verify-equipment-stars');
const progressionSmoke=process.argv.includes('--smoke-progression'),progressionVerify=process.argv.includes('--verify-progression');
const holySmoke=process.argv.includes('--smoke-holy'),holyVerify=process.argv.includes('--verify-holy');
const formationSmoke=process.argv.includes('--smoke-formation'),formationVerify=process.argv.includes('--verify-formation');
const adventureSmoke=process.argv.includes('--smoke-adventure'),adventureVerify=process.argv.includes('--verify-adventure');
const expansionSmoke=process.argv.includes('--smoke-expansion')||process.argv.includes('--smoke-expansion-legacy'),expansionVerify=process.argv.includes('--verify-expansion');
const rechargeSmoke=process.argv.includes('--smoke-recharge'),rechargeVerify=process.argv.includes('--verify-recharge');
const lotteryDemo=process.argv.includes('--lottery-demo');
const lotterySmoke=process.argv.includes('--smoke-lottery'),lotteryVerify=process.argv.includes('--verify-lottery');
const evolutionSmoke=process.argv.includes('--smoke-evolution');
const equipSmoke=process.argv.includes('--smoke-equip'),equipVerify=process.argv.includes('--verify-equip');
const shopIslandsSmoke=process.argv.includes('--smoke-shop-islands'),shopIslandsVerify=process.argv.includes('--verify-shop-islands');
const dragonGrowthSmoke=process.argv.includes('--smoke-dragon-growth'),dragonGrowthVerify=process.argv.includes('--verify-dragon-growth');
const refinementSmoke=process.argv.includes('--smoke-refinements'),refinementVerify=process.argv.includes('--verify-refinements');
const stagingSmoke=process.argv.includes('--smoke-battle-staging');
const catalogSmoke=process.argv.includes('--smoke-catalog');
const collectionSmoke=process.argv.includes('--smoke-collection'),collectionVerify=process.argv.includes('--verify-collection');
const dragonSmoke=process.argv.includes('--smoke-dragon-dialog'),dragonVerify=process.argv.includes('--verify-dragon-dialog');
const historySmoke=process.argv.includes('--smoke-history'),historyVerify=process.argv.includes('--verify-history');
const arenaSmoke=process.argv.includes('--smoke-arena'),arenaVerify=process.argv.includes('--verify-arena');
const tutorialSmoke=process.argv.includes('--smoke-tutorial')||process.argv.includes('--smoke-tutorial-resume'),tutorialVerify=process.argv.includes('--verify-tutorial')||process.argv.includes('--verify-tutorial-resume');
const profileSmoke=process.argv.includes('--smoke-profile'),profileVerify=process.argv.includes('--verify-profile');
const missionsSmoke=tutorialSmoke||profileSmoke||process.argv.includes('--smoke-missions'),missionsVerify=tutorialVerify||profileVerify||process.argv.includes('--verify-missions');
const itemUseSmoke=process.argv.includes('--smoke-item-use'),itemUseVerify=process.argv.includes('--verify-item-use');
const farmInstancesSmoke=process.argv.includes('--smoke-farm-instances'),farmInstancesVerify=process.argv.includes('--verify-farm-instances');
const modelSmoke=process.argv.includes('--smoke-models');
const dualSmoke=process.argv.includes('--smoke-dual'),dualVerify=process.argv.includes('--verify-dual');
const habitatSmoke=process.argv.includes('--smoke-habitats'),habitatVerify=process.argv.includes('--verify-habitats');
const structureSmoke=process.argv.includes('--smoke-structures'),structureVerify=process.argv.includes('--verify-structures');
const farmSmoke=process.argv.includes('--smoke-farm-upgrade');
const smoke=missionsSmoke||itemUseSmoke||farmInstancesSmoke||historySmoke||arenaSmoke||animationSmoke||shopIslandsSmoke||dragonGrowthSmoke||refinementSmoke||stagingSmoke||catalogSmoke||starSmoke||lootSmoke||equipmentBagSmoke||gemExploreSmoke||huntSmoke||runeSmoke||motionSmoke||worldSmoke||progressionSmoke||holySmoke||formationSmoke||process.argv.includes('--smoke-test')||farmSmoke||habitatSmoke||structureSmoke||dualSmoke||modelSmoke||dragonSmoke||collectionSmoke||evolutionSmoke||equipSmoke||adventureSmoke||expansionSmoke||rechargeSmoke||lotterySmoke||raffleSmoke||nativeRanchSmoke||warehouseSmoke,verify=missionsVerify||itemUseVerify||farmInstancesVerify||historyVerify||arenaVerify||shopIslandsVerify||dragonGrowthVerify||refinementVerify||starVerify||lootVerify||equipmentBagVerify||gemExploreVerify||huntVerify||runeVerify||worldVerify||progressionVerify||holyVerify||formationVerify||structureVerify||warehouseVerify||lotteryVerify||collectionVerify||dragonVerify||dualVerify||habitatVerify||equipVerify||raffleVerify||expansionVerify||rechargeVerify||adventureVerify||process.argv.includes('--smoke-verify');
const testProfile=process.argv.find(a=>a.startsWith('--test-profile='))?.split('=')[1]||'smoke-profile';
if(!/^[a-z0-9-]+$/.test(testProfile))throw new Error('Invalid test profile name');
if(smoke||verify)app.setPath('userData',path.join(__dirname,'..','work',testProfile));
else if(lotteryDemo)app.setPath('userData',path.join(app.getPath('appData'),'YulongRanchLotteryDemo'));
else {const appRoot=path.resolve(__dirname,'..'),parent=path.dirname(appRoot),release=path.dirname(parent),dist=path.dirname(release);const project=path.basename(parent)==='resources'&&path.basename(dist)==='dist'?path.dirname(dist):appRoot;app.setPath('userData',path.join(project,'player-data','runtime'));}
const locked=app.requestSingleInstanceLock();if(!locked)app.quit();
let window;
app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus()}});
if(locked)app.whenReady().then(async()=>{
 const {SaveStore}=await import('./save-store.mjs');const {validate}=await import('../src/game.mjs');
 const {playerRoot,openPlayerStore}=await import('./player-store.mjs');
 const store=smoke||verify||lotteryDemo?new SaveStore(path.join(app.getPath('userData'),'saves')):await openPlayerStore(playerRoot(path.resolve(__dirname,'..')),path.join(app.getPath('appData'),'YulongRanch','saves'));
 if(process.argv.includes('--require-player-save')&&!smoke&&!verify&&!lotteryDemo){const current=await store.load();if(!current.state)throw Error('未找到已有正式存档，已阻止创建空白牧场。请检查启动路径。');}

 if(lotteryDemo&&!(await store.load()).state){const {createGame}=await import('../src/game.mjs');const demo=createGame();demo.gems=1000;demo.lottery.normalTokens=300;demo.lottery.advancedTokens=800;demo.log=['独立抽奖演示存档，测试资源仅供试玩，不影响正式牧场。'];await store.save(demo);}
 if(missionsSmoke)await require(tutorialSmoke?'./smoke-tutorial.cjs':profileSmoke?'./smoke-profile.cjs':'./smoke-missions.cjs').prepare(store);
 if(itemUseSmoke)await require('./smoke-item-use.cjs').prepare(store);
 if(farmInstancesSmoke)await require('./smoke-farm-instances.cjs').prepare(store);
 if(historySmoke)await require('./smoke-history.cjs').prepare(store);
 if(arenaSmoke)await require('./smoke-arena.cjs').prepare(store);
 if(warehouseSmoke)await require('./smoke-warehouse.cjs').prepare(store);
 if(nativeRanchSmoke)await require('./smoke-native-ranch.cjs').prepare(store);
 if(lotterySmoke)await require('./smoke-lottery.cjs').prepare(store);
 if(shopIslandsSmoke)await require('./smoke-shop-islands.cjs').prepare(store);
 if(dragonGrowthSmoke)await require('./smoke-dragon-growth.cjs').prepare(store);
 if(refinementSmoke)await require('./smoke-refinements.cjs').prepare(store);
 if(stagingSmoke)await require('./smoke-battle-staging.cjs').prepare(store);
 if(catalogSmoke)await require('./smoke-catalog.cjs').prepare(store);
 if(collectionSmoke)await require('./smoke-collection.cjs').prepare(store);
 if(dualSmoke)await require('./smoke-dual.cjs').prepare(store);
 if(habitatSmoke)await require('./smoke-habitats.cjs').prepare(store);
 if(structureSmoke)await require('./smoke-structures.cjs').prepare(store);
 if(equipSmoke)await require('./smoke-equip.cjs').prepare(store);
 if(raffleSmoke)await require('./smoke-raffle.cjs').prepare(store);
 if(expansionSmoke)await require('./smoke-expansion.cjs').prepare(store);
 if(rechargeSmoke)await require('./smoke-recharge.cjs').prepare(store);
 if(lootSmoke)await require('./smoke-loot.cjs').prepare(store);
 if(equipmentBagSmoke)await require('./smoke-equipment-bag.cjs').prepare(store);
 if(gemExploreSmoke)await require('./smoke-gem-explore.cjs').prepare(store);
 if(animationSmoke)await require('./smoke-animation-runtime.cjs').prepare(store);
 if(huntSmoke)await require('./smoke-rune-hunt.cjs').prepare(store);
 if(runeSmoke)await require('./smoke-runes.cjs').prepare(store);
 if(motionSmoke)await require('./smoke-habitat-motion.cjs').prepare(store);
 if(process.argv.includes('--smoke-world-encounters'))await require('./smoke-world-encounters.cjs').prepare(store);else if(worldSmoke)await require('./smoke-building-world.cjs').prepare(store);
 if(starSmoke)await require('./smoke-equipment-stars.cjs').prepare(store);
 if(progressionSmoke)await require('./smoke-progression.cjs').prepare(store);
 if(holySmoke)await require('./smoke-holy.cjs').prepare(store);
 if(formationSmoke)await require('./smoke-formation.cjs').prepare(store);
 if(adventureSmoke)await require('./smoke-adventure.cjs').prepare(store);
 if(farmSmoke)await require('./smoke.cjs').prepareFarmProfile(store);
 ipcMain.handle('app:version',()=>app.getVersion());
 ipcMain.handle('save:load',()=>store.load());
 ipcMain.handle('save:write',(_e,s)=>store.save(s));
 ipcMain.handle('save:export',async(_e,s)=>{validate(s);const result=await dialog.showSaveDialog(window,{title:'导出牧场存档',defaultPath:'御龙高手存档.json',filters:[{name:'JSON 存档',extensions:['json']}]});if(result.canceled)return false;await fs.writeFile(result.filePath,JSON.stringify(s,null,2));return true});
 ipcMain.handle('save:import',async()=>{const result=await dialog.showOpenDialog(window,{title:'导入牧场存档',properties:['openFile'],filters:[{name:'JSON 存档',extensions:['json']}]});if(result.canceled)return null;const file=result.filePaths[0];if((await fs.stat(file)).size>2e6)throw new Error('存档文件过大。');return validate(JSON.parse(await fs.readFile(file,'utf8')))});
 const area=screen.getPrimaryDisplay().workAreaSize;
 window=new BrowserWindow({title:`御龙高手 v${app.getVersion()} · ${lotteryDemo?'抽奖试玩':'正式牧场'}`,width:Math.min(1440,area.width-24),height:Math.min(940,area.height-24),minWidth:Math.min(1000,area.width-24),minHeight:Math.min(650,area.height-24),backgroundColor:'#e7ecd7',autoHideMenuBar:true,show:!smoke&&!verify,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false,offscreen:smoke||verify}});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',e=>e.preventDefault());
 window.once('ready-to-show',()=>{if(!smoke&&!verify)window.show()});
 await window.loadFile(path.join(__dirname,'..','index.html'),lotterySmoke||lotteryVerify?{query:{legacyLottery:'1'}}:{});
 if(smoke&&process.argv.includes('--qa-reduced-motion')){window.webContents.debugger.attach('1.3');await window.webContents.debugger.sendCommand('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});const reloaded=new Promise(resolve=>window.webContents.once('did-finish-load',resolve));window.webContents.reload();await reloaded;}
 window.setTitle(`御龙高手 v${app.getVersion()} · ${lotteryDemo?'抽奖试玩':'正式牧场'}`);
 if(process.argv.includes('--verify-live')){
  for(let i=0;i<60;i++){if(await window.webContents.executeJavaScript("!!document.querySelector('.original-hud')"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  if(!await window.webContents.executeJavaScript("!!document.querySelector('.original-hud')"))throw new Error('Live game did not reach the ranch UI; existing save was not overwritten.');
  await new Promise(resolve=>setTimeout(resolve,700));const destination=path.join(__dirname,'..','work','live-preview.png');await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,(await window.webContents.capturePage()).toPNG());console.log('LIVE_PREVIEW_READY '+destination);
  const renderer=await window.webContents.executeJavaScript("({desktopBridge:!!window.ranch,habitatCount:document.querySelectorAll('[data-place-kind=habitat]').length,islands:Array.from(document.querySelectorAll('[data-world-island]')).map(b=>b.getAttribute('aria-label')),hud:document.querySelector('.original-hud')?.innerText})");if(!renderer.desktopBridge)throw Error('Desktop save bridge missing; refused independent preview.');const loaded=await store.load(),s=loaded.state;await fs.writeFile(path.join(path.dirname(store.directory),'last-launch.json'),JSON.stringify({version:app.getVersion(),executable:process.execPath,save:loaded.location,mode:lotteryDemo?'demo':'player',renderer,dragons:s?.dragons.length,habitats:s?.habitats.length,playerXp:s?.playerXp,coins:s?.coins,at:new Date().toISOString()},null,2));
 }
 if(process.argv.includes('--show-warehouse')&&!smoke&&!verify){
  await window.webContents.executeJavaScript("document.querySelector('[data-action=showMore]').click();true");await new Promise(r=>setTimeout(r,200));await window.webContents.executeJavaScript("document.querySelector('[data-action=openWarehouse]').click();true");await new Promise(r=>setTimeout(r,700));
  const count=await window.webContents.executeJavaScript("document.querySelectorAll('[data-raffle-egg]').length");if(count<5)throw Error('Gift eggs missing from live warehouse');
  await fs.writeFile(path.join(__dirname,'..','work','live-warehouse-preview.png'),(await window.webContents.capturePage()).toPNG());console.log('LIVE_WAREHOUSE_READY eggs='+count);
 }
 if(process.argv.includes('--show-formation')&&!smoke&&!verify){
  for(let i=0;i<80;i++){if(await window.webContents.executeJavaScript("!!document.querySelector('[data-action=showMore]')"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  await window.webContents.executeJavaScript("document.querySelector('[data-action=showMore]').click();true");
  await new Promise(resolve=>setTimeout(resolve,150));await window.webContents.executeJavaScript("document.querySelector('[data-action=openFormation]').click();true");
  for(let i=0;i<80;i++){if(await window.webContents.executeJavaScript("document.querySelector('#modal').dataset.mode==='sourceFormation'"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  if(!await window.webContents.executeJavaScript("document.querySelector('#modal').dataset.mode==='sourceFormation'"))throw Error('Source formation did not open');
  await new Promise(resolve=>setTimeout(resolve,700));const shot=path.join(__dirname,'..','work','live-formation-preview.png');await fs.mkdir(path.dirname(shot),{recursive:true});await fs.writeFile(shot,(await window.webContents.capturePage()).toPNG());
 }
 if(process.argv.includes('--show-adventure')&&!smoke&&!verify){
  for(let i=0;i<80;i++){if(await window.webContents.executeJavaScript("!!document.querySelector('[data-action=openAdventure]')"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  await window.webContents.executeJavaScript("document.querySelector('[data-action=openAdventure]').click();true");
  for(let i=0;i<80;i++){if(await window.webContents.executeJavaScript("document.querySelector('#modal').dataset.mode==='sourcePve'"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  if(!await window.webContents.executeJavaScript("document.querySelector('#modal').dataset.mode==='sourcePve'"))throw Error('Adventure page did not open');
  await new Promise(resolve=>setTimeout(resolve,700));const shot=path.join(__dirname,'..','work','live-adventure-preview.png');await fs.mkdir(path.dirname(shot),{recursive:true});await fs.writeFile(shot,(await window.webContents.capturePage()).toPNG());
 }
 if(process.argv.includes('--show-habitat')&&!smoke&&!verify){
  for(let i=0;i<80;i++){if(await window.webContents.executeJavaScript("!!document.querySelector('[data-place-id]')"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  await window.webContents.executeJavaScript("document.querySelector('[data-place-id]').click();true");
  for(let i=0;i<80;i++){if(await window.webContents.executeJavaScript("document.querySelector('#modal').dataset.mode==='nativeHabitatInfo'"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  if(!await window.webContents.executeJavaScript("document.querySelector('#modal').dataset.mode==='nativeHabitatInfo'"))throw Error('Native habitat page did not open');
  await new Promise(resolve=>setTimeout(resolve,500));const habitatShot=path.join(__dirname,'..','work','live-habitat-preview.png');await fs.mkdir(path.dirname(habitatShot),{recursive:true});await fs.writeFile(habitatShot,(await window.webContents.capturePage()).toPNG());console.log('LIVE_HABITAT_READY '+habitatShot);

 }
 if(lotteryDemo){
  for(let i=0;i<80;i++){if(await window.webContents.executeJavaScript("!!document.querySelector('.original-hud')"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  await window.webContents.executeJavaScript("document.querySelector('[data-action=showMore]').click();true");await new Promise(resolve=>setTimeout(resolve,200));await window.webContents.executeJavaScript("document.querySelector('[data-action=lotteryOptions]').click();true");await new Promise(resolve=>setTimeout(resolve,800));
  window.setTitle('御龙高手 · 抽奖试玩（独立演示存档）');const shot=path.join(__dirname,'..','work','lottery-demo-live.png');await fs.mkdir(path.dirname(shot),{recursive:true});await fs.writeFile(shot,(await window.webContents.capturePage()).toPNG());console.log('LOTTERY_DEMO_READY '+shot);
 }
 if(smoke||verify){try{const tests=require('./smoke.cjs');  if(missionsSmoke||missionsVerify)await require(tutorialSmoke||tutorialVerify?'./smoke-tutorial.cjs':profileSmoke||profileVerify?'./smoke-profile.cjs':'./smoke-missions.cjs').run(window,store,missionsVerify);else if(itemUseSmoke||itemUseVerify)await require('./smoke-item-use.cjs').run(window,store,itemUseVerify);else if(farmInstancesSmoke||farmInstancesVerify)await require('./smoke-farm-instances.cjs').run(window,store,farmInstancesVerify);else if(historySmoke||historyVerify)await require('./smoke-history.cjs').run(window,store,historyVerify);else if(arenaSmoke||arenaVerify)await require('./smoke-arena.cjs').run(window,store,arenaVerify);else if(process.argv.includes('--smoke-world-encounters')||process.argv.includes('--verify-world-encounters'))await require('./smoke-world-encounters.cjs').run(window,store,process.argv.includes('--verify-world-encounters'));else if(process.argv.includes('--smoke-world-map'))await require('./smoke-world-map.cjs').run(window,store);else if(animationSmoke)await require('./smoke-animation-runtime.cjs').run(window,store);else if(shopIslandsSmoke||shopIslandsVerify)await require('./smoke-shop-islands.cjs').run(window,store,shopIslandsVerify);else if(dragonGrowthSmoke||dragonGrowthVerify)await require('./smoke-dragon-growth.cjs').run(window,store,dragonGrowthVerify);else if(refinementSmoke||refinementVerify)await require('./smoke-refinements.cjs').run(window,store,refinementVerify);else if(stagingSmoke)await require('./smoke-battle-staging.cjs').run(window,store);else if(catalogSmoke)await require('./smoke-catalog.cjs').run(window,store);else if(starSmoke||starVerify)await require('./smoke-equipment-stars.cjs').run(window,store,starVerify);else if(lootSmoke||lootVerify)await require('./smoke-loot.cjs').run(window,store,lootVerify);else if(equipmentBagSmoke||equipmentBagVerify)await require('./smoke-equipment-bag.cjs').run(window,store,equipmentBagVerify);else if(gemExploreSmoke||gemExploreVerify)await require('./smoke-gem-explore.cjs').run(window,store,gemExploreVerify);else if(huntSmoke||huntVerify)await require('./smoke-rune-hunt.cjs').run(window,store,huntVerify);else if(runeSmoke||runeVerify)await require('./smoke-runes.cjs').run(window,store,runeVerify);else if(motionSmoke)await require('./smoke-habitat-motion.cjs').run(window,store);else if(worldSmoke||worldVerify)await require('./smoke-building-world.cjs').run(window,store,worldVerify);else if(progressionSmoke||progressionVerify)await require('./smoke-progression.cjs').run(window,store,progressionVerify);else if(holySmoke||holyVerify)await require('./smoke-holy.cjs').run(window,store,holyVerify);else if(formationSmoke||formationVerify)await require('./smoke-formation.cjs').run(window,store,formationVerify);else if(structureSmoke||structureVerify)await require('./smoke-structures.cjs').run(window,store,structureVerify);else if(warehouseSmoke||warehouseVerify)await require('./smoke-warehouse.cjs').run(window,store,warehouseVerify);else if(nativeRanchSmoke)await require('./smoke-native-ranch.cjs').run(window,store);else if(rechargeSmoke||rechargeVerify)await require('./smoke-recharge.cjs').run(window,store,rechargeVerify);else if(expansionSmoke||expansionVerify)await require('./smoke-expansion.cjs').run(window,store,expansionVerify);else if(adventureSmoke||adventureVerify)await require('./smoke-adventure.cjs').run(window,store,adventureVerify);else if(raffleSmoke||raffleVerify)await require('./smoke-raffle.cjs').run(window,store,raffleVerify);else if(lotterySmoke||lotteryVerify)await require('./smoke-lottery.cjs').run(window,store,lotteryVerify);else if(evolutionSmoke)await require('./smoke-evolution.cjs').run(window,store);else if(collectionSmoke||collectionVerify)await require('./smoke-collection.cjs').run(window,store,collectionVerify);else if(dragonSmoke||dragonVerify)await require('./smoke-dragon-dialog.cjs').run(window,store,dragonVerify);else if(modelSmoke)await require('./smoke-models.cjs').run(window);else if(dualSmoke||dualVerify)await require('./smoke-dual.cjs').run(window,store,dualVerify);else if(equipSmoke||equipVerify)await require('./smoke-equip.cjs').run(window,store,equipVerify);else if(habitatSmoke||habitatVerify)await require('./smoke-habitats.cjs').run(window,store,habitatVerify);else if(farmSmoke)await tests.runFarmUpgrade(window,store);else await tests.run(window,store,verify);app.exit(0)}catch(error){console.error(error);app.exit(1)}}
}).catch(e=>{console.error(e);app.exit(1)});
app.on('window-all-closed',()=>app.quit());
