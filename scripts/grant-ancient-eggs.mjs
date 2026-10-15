import fs from 'node:fs/promises';
import path from 'node:path';
import {SaveStore} from '../desktop/save-store.mjs';
import {grantAncientEggs} from '../src/user-eggs.mjs';
// Run only with the player's game closed. Never calls the lottery or changes currencies.
const directory=path.join(process.env.APPDATA,'YulongRanch','saves'),store=new SaveStore(directory),loaded=await store.load();
if(!loaded.state)throw Error('No existing player save; refusing to create a replacement.');
const backup=path.join(directory,`ranch-v1-before-ancient-gift-${Date.now()}.json`);await fs.copyFile(store.file,backup);
const eggs=grantAncientEggs(loaded.state);if(eggs.length){loaded.state.log.unshift('已收到赠送的五种远古龙蛋，每种一枚。');loaded.state.log=loaded.state.log.slice(0,12);await store.save(loaded.state)}
const restored=(await store.load()).state;console.log(JSON.stringify({backup,added:eggs.map(e=>e.dragonId),giftEggs:restored.giftEggs.length,otherRaffleEggs:restored.raffle.pending.length}));

