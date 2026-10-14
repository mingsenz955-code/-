import fs from 'node:fs/promises';
import path from 'node:path';
import {validate} from '../src/game.mjs';
export class SaveStore {
 constructor(directory){this.directory=directory;this.file=path.join(directory,'ranch-v1.json');this.backup=this.file+'.bak';this.queue=Promise.resolve()}
 async read(file){const raw=await fs.readFile(file,'utf8');if(raw.length>2e6)throw new Error('存档过大。');const parsed=JSON.parse(raw);if(parsed.version>9){const e=new Error('存档来自更新版本，请升级游戏；未回退或覆盖存档。');e.code='FUTURE_VERSION';throw e}return validate(parsed)}
 async load(){
  try{return {state:await this.read(this.file),location:this.file}}catch(error){
   if(error.code==='FUTURE_VERSION')throw error;
   try{return {state:await this.read(this.backup),location:this.file,recovered:true}}catch(backupError){
    if(error.code==='ENOENT'&&backupError.code==='ENOENT')return {state:null,location:this.file};
    throw new Error(`主存档与备份无法载入。${error.message}`);
   }
  }
 }
 save(state){const snapshot=validate(state);const task=this.queue.then(async()=>{
  await fs.mkdir(this.directory,{recursive:true});
  const encoded=JSON.stringify(snapshot,null,2);if(Buffer.byteLength(encoded,'utf8')>2e6)throw new Error('存档过大，已阻止覆盖现有存档。');
  const tmp=this.file+'.tmp';const handle=await fs.open(tmp,'w');
  try{await handle.writeFile(encoded);await handle.sync()}finally{await handle.close()}
  // Preserve the previous valid state, never replace a good backup with corrupt data.
  let validOld=false;
  try{await this.read(this.file);validOld=true}catch(error){if(error.code&&error.code!=='ENOENT')throw error;}
  if(validOld){const backupTmp=this.backup+'.tmp';await fs.copyFile(this.file,backupTmp);await fs.rename(backupTmp,this.backup)}
  await fs.rename(tmp,this.file);return true;
 });this.queue=task.catch(()=>{});return task}
}
