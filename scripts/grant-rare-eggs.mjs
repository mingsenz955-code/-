import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {SaveStore} from '../desktop/save-store.mjs';
import {grantRareEggStock,RARE_EGGS,eggQuantity} from '../src/user-eggs.mjs';
// Close the formal game gracefully before running; never operate on a demo/AppData save.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),store=new SaveStore(path.join(root,'player-data','saves'));
const {state}=await store.load();if(!state)throw Error('No formal player save; refusing to create one.');
const backup=path.join(root,'player-data','recovery',`before-rare-eggs-${Date.now()}.json`);await fs.mkdir(path.dirname(backup),{recursive:true});await fs.copyFile(store.file,backup);
const before=structuredClone(state),added=grantRareEggStock(state,99);await store.save(state);const restored=(await store.load()).state;
for(const key of Object.keys(before))if(!['giftEggs','nextId'].includes(key))assert.deepEqual(restored[key],before[key],`unrelated player field changed: ${key}`);
const counts=RARE_EGGS.map(d=>({...d,count:[...restored.giftEggs,...restored.raffle.pending].filter(e=>e.dragonId===d.dragonId).reduce((n,e)=>n+eggQuantity(e),0)}));assert(counts.every(d=>d.count>=99));console.log(JSON.stringify({backup,added:added.length,counts},null,2));
