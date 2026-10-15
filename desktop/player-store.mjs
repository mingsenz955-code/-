import path from 'node:path';
import fs from 'node:fs/promises';
import {SaveStore} from './save-store.mjs';
// AppData can be redirected for processes descended from the MSIX Codex app.
// Keep player state outside that redirected namespace, separate from cache/QA.
export function playerRoot(appRoot){
 const parent=path.dirname(appRoot),release=path.dirname(parent),dist=path.dirname(release);
 const root=path.basename(parent)==='resources'&&path.basename(dist)==='dist'?path.dirname(dist):appRoot;
 return path.join(root,'player-data');
}
export async function openPlayerStore(root,legacyDirectory){
 const store=new SaveStore(path.join(root,'saves'));
 // A corrupt/newer canonical save must report an error, never fall back to an
 // unrelated old profile and overwrite the established player data.
 const current=await store.load();if(current.state)return store;
 const legacy=new SaveStore(legacyDirectory),loaded=await legacy.load();
 if(loaded.state){await fs.mkdir(path.join(root,'recovery'),{recursive:true});await fs.copyFile(loaded.recovered?legacy.backup:legacy.file,path.join(root,'recovery','legacy-before-migration.json'));await store.save(loaded.state)}
 return store;
}
