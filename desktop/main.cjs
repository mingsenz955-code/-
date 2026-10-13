const {app,BrowserWindow,ipcMain,dialog,screen}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const dualSmoke=process.argv.includes('--smoke-dual'),dualVerify=process.argv.includes('--verify-dual');
const habitatSmoke=process.argv.includes('--smoke-habitats'),habitatVerify=process.argv.includes('--verify-habitats');
const farmSmoke=process.argv.includes('--smoke-farm-upgrade');
const smoke=process.argv.includes('--smoke-test')||farmSmoke||habitatSmoke||dualSmoke,verify=dualVerify||habitatVerify||process.argv.includes('--smoke-verify');
const testProfile=process.argv.find(a=>a.startsWith('--test-profile='))?.split('=')[1]||'smoke-profile';
if(!/^[a-z0-9-]+$/.test(testProfile))throw new Error('Invalid test profile name');
if(smoke||verify)app.setPath('userData',path.join(__dirname,'..','work',testProfile));
else app.setPath('userData',path.join(app.getPath('appData'),'YulongRanch'));
const locked=app.requestSingleInstanceLock();if(!locked)app.quit();
let window;
app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus()}});
if(locked)app.whenReady().then(async()=>{
 const {SaveStore}=await import('./save-store.mjs');const {validate}=await import('../src/game.mjs');
 const store=new SaveStore(path.join(app.getPath('userData'),'saves'));
 if(dualSmoke)await require('./smoke-dual.cjs').prepare(store);
 if(habitatSmoke)await require('./smoke-habitats.cjs').prepare(store);
 if(farmSmoke)await require('./smoke.cjs').prepareFarmProfile(store);
 ipcMain.handle('save:load',()=>store.load());
 ipcMain.handle('save:write',(_e,s)=>store.save(s));
 ipcMain.handle('save:export',async(_e,s)=>{validate(s);const result=await dialog.showSaveDialog(window,{title:'导出牧场存档',defaultPath:'御龙高手存档.json',filters:[{name:'JSON 存档',extensions:['json']}]});if(result.canceled)return false;await fs.writeFile(result.filePath,JSON.stringify(s,null,2));return true});
 ipcMain.handle('save:import',async()=>{const result=await dialog.showOpenDialog(window,{title:'导入牧场存档',properties:['openFile'],filters:[{name:'JSON 存档',extensions:['json']}]});if(result.canceled)return null;const file=result.filePaths[0];if((await fs.stat(file)).size>2e6)throw new Error('存档文件过大。');return validate(JSON.parse(await fs.readFile(file,'utf8')))});
 const area=screen.getPrimaryDisplay().workAreaSize;
 window=new BrowserWindow({title:'御龙高手 · 云上牧场',width:Math.min(1440,area.width-24),height:Math.min(940,area.height-24),minWidth:Math.min(1000,area.width-24),minHeight:Math.min(650,area.height-24),backgroundColor:'#e7ecd7',autoHideMenuBar:true,show:!smoke&&!verify,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false,offscreen:smoke||verify}});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',e=>e.preventDefault());
 window.once('ready-to-show',()=>{if(!smoke&&!verify)window.show()});
 await window.loadFile(path.join(__dirname,'..','index.html'));
 if(process.argv.includes('--verify-live')){
  for(let i=0;i<60;i++){if(await window.webContents.executeJavaScript("!!document.querySelector('.original-hud')"))break;await new Promise(resolve=>setTimeout(resolve,100))}
  if(!await window.webContents.executeJavaScript("!!document.querySelector('.original-hud')"))throw new Error('Live game did not reach the ranch UI; existing save was not overwritten.');
  await new Promise(resolve=>setTimeout(resolve,700));const destination=path.join(__dirname,'..','work','live-preview.png');await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,(await window.webContents.capturePage()).toPNG());console.log('LIVE_PREVIEW_READY '+destination);
 }
 if(smoke||verify){try{const tests=require('./smoke.cjs'); if(dualSmoke||dualVerify)await require('./smoke-dual.cjs').run(window,store,dualVerify);else if(habitatSmoke||habitatVerify)await require('./smoke-habitats.cjs').run(window,store,habitatVerify);else if(farmSmoke)await tests.runFarmUpgrade(window,store);else await tests.run(window,store,verify);app.exit(0)}catch(error){console.error(error);app.exit(1)}}
}).catch(e=>{console.error(e);app.exit(1)});
app.on('window-all-closed',()=>app.quit());
