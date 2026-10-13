const {app,BrowserWindow,ipcMain,dialog}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const smoke=process.argv.includes('--smoke-test'),verify=process.argv.includes('--smoke-verify');
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
 ipcMain.handle('save:load',()=>store.load());
 ipcMain.handle('save:write',(_e,s)=>store.save(s));
 ipcMain.handle('save:export',async(_e,s)=>{validate(s);const result=await dialog.showSaveDialog(window,{title:'导出牧场存档',defaultPath:'御龙高手存档.json',filters:[{name:'JSON 存档',extensions:['json']}]});if(result.canceled)return false;await fs.writeFile(result.filePath,JSON.stringify(s,null,2));return true});
 ipcMain.handle('save:import',async()=>{const result=await dialog.showOpenDialog(window,{title:'导入牧场存档',properties:['openFile'],filters:[{name:'JSON 存档',extensions:['json']}]});if(result.canceled)return null;const file=result.filePaths[0];if((await fs.stat(file)).size>2e6)throw new Error('存档文件过大。');return validate(JSON.parse(await fs.readFile(file,'utf8')))});
 window=new BrowserWindow({title:'御龙高手 · 云上牧场',width:1440,height:940,minWidth:1000,minHeight:780,backgroundColor:'#e7ecd7',autoHideMenuBar:true,show:!smoke&&!verify,webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true,backgroundThrottling:false,offscreen:smoke||verify}});
 window.webContents.setWindowOpenHandler(()=>({action:'deny'}));window.webContents.on('will-navigate',e=>e.preventDefault());
 window.once('ready-to-show',()=>{if(!smoke&&!verify)window.show()});
 await window.loadFile(path.join(__dirname,'..','index.html'));
 if(smoke||verify){try{await require('./smoke.cjs').run(window,store,verify);app.exit(0)}catch(error){console.error(error);app.exit(1)}}
}).catch(e=>{console.error(e);app.exit(1)});
app.on('window-all-closed',()=>app.quit());
