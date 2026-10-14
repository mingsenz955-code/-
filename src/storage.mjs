import {validate} from './game.mjs';
const KEY='yulong-ranch-v1';
export const storage={
 async load(){
  if(window.ranch) return window.ranch.load();
  const raw=localStorage.getItem(KEY);if(!raw)return {state:null,location:'浏览器本地存储（独立于桌面存档）'};
  try{const parsed=JSON.parse(raw);if(parsed.version>5){const e=new Error('存档来自更新版本，请升级游戏。');e.code='FUTURE_VERSION';throw e}return {state:validate(parsed),location:'浏览器本地存储（独立于桌面存档）'}}catch(e){
   if(e.code==='FUTURE_VERSION')throw e;
   const backup=localStorage.getItem(KEY+'-backup');if(!backup)throw e;
   return {state:validate(JSON.parse(backup)),location:'浏览器备份已恢复',recovered:true};
  }
 },
 async save(state){const snapshot=validate(state);if(window.ranch)return window.ranch.save(snapshot);const raw=localStorage.getItem(KEY);if(raw){let previous;try{previous=JSON.parse(raw)}catch{}if(previous?.version>5)throw new Error('现有存档来自更新版本，已阻止覆盖。');try{validate(previous);localStorage.setItem(KEY+'-backup',raw)}catch{}}localStorage.setItem(KEY,JSON.stringify(snapshot));return true},
 async export(state){validate(state);if(window.ranch)return window.ranch.export(state);const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='御龙高手存档.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true},
 async import(){if(window.ranch)return window.ranch.import();return new Promise(resolve=>{const input=document.createElement('input');input.type='file';input.accept='.json';input.oncancel=()=>resolve(null);input.onchange=async()=>{try{const file=input.files[0];if(file.size>2e6)throw new Error('存档文件过大。');resolve(validate(JSON.parse(await file.text())))}catch(e){resolve({error:e.message})}};input.click()})}
};
