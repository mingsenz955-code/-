const {app,BrowserWindow,ipcMain,dialog,screen}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const warehouseSmoke=process.argv.includes('--smoke-warehouse'),warehouseVerify=process.argv.includes('--verify-warehouse');
const nativeRanchSmoke=process.argv.includes('--smoke-native-ranch');
const raffleSmoke=process.argv.includes('--smoke-raffle'),raffleVerify=process.argv.includes('--verify-raffle');
const huntSmoke=process.argv.includes('--smoke-rune-hunt'),huntVerify=process.argv.includes('--verify-rune-hunt');
const runeSmoke=process.argv.includes('--smoke-runes'),runeVerify=process.argv.includes('--verify-runes');
const motionSmoke=process.argv.includes('--smoke-habitat-motion');
const worldSmoke=process.argv.includes('--smoke-building-world'),worldVerify=process.argv.includes('--verify-building-world');
const progressionSmoke=process.argv.includes('--smoke-progression'),progressionVerify=process.argv.includes('--verify-progression');
const holySmoke=process.argv.includes('--smoke-holy'),holyVerify=process.argv.includes('--verify-holy');
const formationSmoke=process.argv.includes('--smoke-formation'),formationVerify=process.argv.includes('--verify-formation');
const adventureSmoke=process.argv.includes('--smoke-adventure'),adventureVerify=process.argv.includes('--verify-adventure');
const expansionSmoke=process.argv.includes('--smoke-expansion'),expansionVerify=process.argv.includes('--verify-expansion');
const rechargeSmoke=process.argv.includes('--smoke-recharge'),rechargeVerify=process.argv.includes('--verify-recharge');
const lotteryDemo=process.argv.includes('--lottery-demo');
const lotterySmoke=process.argv.includes('--smoke-lottery'),lotteryVerify=process.argv.includes('--verify-lottery');
const evolutionSmoke=process.argv.includes('--smoke-evolution');
const equipSmoke=process.argv.includes('--smoke-equip'),equipVerify=process.argv.includes('--verify-equip');
const collectionSmoke=process.argv.includes('--smoke-collection'),collectionVerify=process.argv.includes('--verify-collection');
const dragonSmoke=process.argv.includes('--smoke-dragon-dialog'),dragonVerify=process.argv.includes('--verify-dragon-dialog');
const modelSmoke=process.argv.includes('--smoke-models');
const dualSmoke=process.argv.includes('--smoke-dual'),dualVerify=process.argv.includes('--verify-dual');
const habitatSmoke=process.argv.includes('--smoke-habitats'),habitatVerify=process.argv.includes('--verify-habitats');
const structureSmoke=process.argv.includes('--smoke-structures'),structureVerify=process.argv.includes('--verify-structures');
const farmSmoke=process.argv.includes('--smoke-farm-upgrade');
const smoke=huntSmoke||runeSmoke||motionSmoke||worldSmoke||progressionSmoke||holySmoke||formationSmoke||process.argv.includes('--smoke-test')||farmSmoke||habitatSmoke||structureSmoke||dualSmoke||modelSmoke||dragonSmoke||collectionSmoke||evolutionSmoke||equipSmoke||adventureSmoke||expansionSmoke||rechargeSmoke||lotterySmoke||raffleSmoke||nativeRanchSmoke||warehouseSmoke,verify=huntVerify||runeVerify||worldVerify||progressionVerify||holyVerify||formationVerify||structureVerify||warehouseVerify||lotteryVerify||collectionVerify||dragonVerify||dualVerify||habitatVerify||equipVerify||raffleVerify||expansionVerify||rechargeVerify||adventureVerify||process.argv.includes('--smoke-verify');
const testProfile=process.argv.find(a=>a.startsWith('--test-profile='))?.split('=')[1]||'smoke-profile';
if(!/^[a-z0-9-]+$/.test(testProfile))throw new Error('Invalid test profile name');
if(smoke||verify)app.setPath('userData',path.join(__dirname,'..','work',testProfile));
else app.setPath('userData',path.join(app.getPath('appData'),lotteryDemo?'YulongRanchLotteryDemo':'YulongRanch'));
const locked=app.requestSingleInstanceLock();if(!locked)app.quit();
let window;
app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus()}});
if(locked)app.whenReady().then(async()=>{
 const {SaveStore}=await import('./save-store.mjs');const {validate}=await import('../src/game.mjs');
 const store=new SaveStore(path.join(app.getPath('userData'),'saves'));
 if(lotteryDemo&&!(await store.load()).state){const {createGame}=await import('../src/game.mjs');const demo=createGame();demo.gems=1000;demo.lottery.normalTokens=300;demo.lottery.advancedTokens=800;demo.log=['独立抽奖演示存档，测试资源仅供试玩，不影响正式牧场。'];await store.save(demo);}
 if(warehouseSmoke)await require('./smoke-warehouse.cjs').prepare(store);
 if(nativeRanchSmoke)await require('./smoke-native-ranch.cjs').prepare(store);
 if(lotterySmoke)await require('./smoke-lottery.cjs').prepare(store);
 if(collectionSmoke)await require('./smoke-collection.cjs').prepare(store);
 if(dualSmoke)await require('./smoke-dual.cjs').prepare(store);
 if(habitatSmoke)await require('./smoke-habitats.cjs').prepare(store);
 if(structureSmoke)await require('./smoke-structures.cjs').prepare(store);
 if(equipSmoke)await require('./smoke-equip.cjs').prepare(store);
 if(raffleSmoke)await require('./smoke-raffle.cjs').prepare(store);
 if(expansionSmoke)await require('./smoke-expansion.cjs').prepare(store);
 if(rechargeSmoke)await require('./smoke-recharge.cjs').prepare(store);
 if(huntSmoke)await require('./smoke-rune-hunt.cjs').prepare(store);
 if(runeSmoke)await require('./smoke-runes.cjs').prepare(store);
 if(motionSmoke)await require('./smoke-habitat-motion.cjs').prepare(store);
 if(worldSmoke)await require('./smoke-building-world.cjs').prepare(store);
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
 window=new BrowserWindow({title:'御龙高手 · 云上牧场',width:Math.min(1440,area.width-24),height:Math.min(940,area.height-24),minWidth:Math.min(1000,area.width-24),minHeight:Math.min(650,area.height-24),backgroundColor:'#e7ecd7',autoHideMenuBar:true,show:!smoke&&!verify,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false,offscreen:smoke||verify}});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',e=>e.preventDefault());
 window.once('ready-to-show',()=>{if(!smoke&&!verify)window.show()});
 await window.loadFile(path.join(__dirname,'..','index.html'),lotterySmoke||lotteryVerify?{query:{legacyLottery:'1'}}:{});
 if(process.argv.includes('--verify-live')){
  for(let i=0;i<60;i++){if(await window.webContents.executeJavaScript("!!document.querySelector('.original-hud')"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  if(!await window.webContents.executeJavaScript("!!document.querySelector('.original-hud')"))throw new Error('Live game did not reach the ranch UI; existing save was not overwritten.');
  await new Promise(resolve=>setTimeout(resolve,700));const destination=path.join(__dirname,'..','work','live-preview.png');await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,(await window.webContents.capturePage()).toPNG());console.log('LIVE_PREVIEW_READY '+destination);
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
 if(smoke||verify){try{const tests=require('./smoke.cjs');  if(huntSmoke||huntVerify)await require('./smoke-rune-hunt.cjs').run(window,store,huntVerify);else if(runeSmoke||runeVerify)await require('./smoke-runes.cjs').run(window,store,runeVerify);else if(motionSmoke)await require('./smoke-habitat-motion.cjs').run(window,store);else if(worldSmoke||worldVerify)await require('./smoke-building-world.cjs').run(window,store,worldVerify);else if(progressionSmoke||progressionVerify)await require('./smoke-progression.cjs').run(window,store,progressionVerify);else if(holySmoke||holyVerify)await require('./smoke-holy.cjs').run(window,store,holyVerify);else if(formationSmoke||formationVerify)await require('./smoke-formation.cjs').run(window,store,formationVerify);else if(structureSmoke||structureVerify)await require('./smoke-structures.cjs').run(window,store,structureVerify);else if(warehouseSmoke||warehouseVerify)await require('./smoke-warehouse.cjs').run(window,store,warehouseVerify);else if(nativeRanchSmoke)await require('./smoke-native-ranch.cjs').run(window,store);else if(rechargeSmoke||rechargeVerify)await require('./smoke-recharge.cjs').run(window,store,rechargeVerify);else if(expansionSmoke||expansionVerify)await require('./smoke-expansion.cjs').run(window,store,expansionVerify);else if(adventureSmoke||adventureVerify)await require('./smoke-adventure.cjs').run(window,store,adventureVerify);else if(raffleSmoke||raffleVerify)await require('./smoke-raffle.cjs').run(window,store,raffleVerify);else if(lotterySmoke||lotteryVerify)await require('./smoke-lottery.cjs').run(window,store,lotteryVerify);else if(evolutionSmoke)await require('./smoke-evolution.cjs').run(window,store);else if(collectionSmoke||collectionVerify)await require('./smoke-collection.cjs').run(window,store,collectionVerify);else if(dragonSmoke||dragonVerify)await require('./smoke-dragon-dialog.cjs').run(window,store,dragonVerify);else if(modelSmoke)await require('./smoke-models.cjs').run(window);else if(dualSmoke||dualVerify)await require('./smoke-dual.cjs').run(window,store,dualVerify);else if(equipSmoke||equipVerify)await require('./smoke-equip.cjs').run(window,store,equipVerify);else if(habitatSmoke||habitatVerify)await require('./smoke-habitats.cjs').run(window,store,habitatVerify);else if(farmSmoke)await tests.runFarmUpgrade(window,store);else await tests.run(window,store,verify);app.exit(0)}catch(error){console.error(error);app.exit(1)}}
}).catch(e=>{console.error(e);app.exit(1)});
app.on('window-all-closed',()=>app.quit());
