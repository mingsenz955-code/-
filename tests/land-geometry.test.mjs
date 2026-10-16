import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {createHash} from 'node:crypto';
import MASKS from '../assets/original/data/land-masks.mjs';
import {createGame,createTutorialGame,action,validate} from '../src/game.mjs';
import {landFootprintAllowed,unownedLandAt,landMasksHtml} from '../src/land-geometry.mjs';
import {canPlaceObject,gridPosition} from '../src/habitats.mjs';
const T=1800000000000;
test('all 20 original alpha masks retain their exact source hashes and bounded scanlines',async()=>{assert.equal(Object.keys(MASKS).length,20);for(const [id,m] of Object.entries(MASKS)){const bytes=await fs.readFile(new URL('../assets/original/ui/ui_mapland_land'+id+'.png',import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),m.sha256);assert.equal(m.rows.length,m.height);for(const row of m.rows){assert.equal(row.length%2,0);for(let i=0;i<row.length;i+=2)assert(row[i]>=0&&row[i]<row[i+1]&&row[i+1]<=m.width);}}});
test('buying a specific land removes only that source mask and unlocks its footprint; other land stays blocked',()=>{
 let s=createTutorialGame(T);s.coins=1e7;const after=action(s,'expandLand',{landId:11},T);const info={width:2,height:2};let p;
 for(let r=0;r<24;r++)for(let c=0;c<24;c++){const pos=gridPosition(c,r);if(!canPlaceObject([],'x',info,pos,0,s,0)&&canPlaceObject([],'x',info,pos,1,after,0))p=pos;}
 assert(p,'a genuine cell in the purchased mask becomes legal');assert.equal(landMasksHtml(s,0).match(/data-unowned-land=/g).length,4);assert.equal(landMasksHtml(after,0).match(/data-unowned-land=/g).length,3);assert(!landMasksHtml(after,0).includes('data-unowned-land="11"'));assert(landMasksHtml(after,0).includes('data-unowned-land="14"'));
 const beforeJson=JSON.stringify(s);assert.equal(JSON.stringify(validate(s)),JSON.stringify(s));assert.equal(JSON.stringify(s),beforeJson);assert.deepEqual(validate(JSON.parse(JSON.stringify(after))).expansion,after.expansion);
});
test('a whole footprint crossing a locked boundary is rejected even if its center is clear',()=>{const s=createGame(T);let found=false;for(let r=1;r<23;r++)for(let c=1;c<23;c++){const x=650+(c-r)*27,y=50+(c+r)*13.5;if(!unownedLandAt(s,0,x,y)&&!landFootprintAllowed(s,0,{column:c,row:r,width:5,height:5}))found=true;}assert(found);});
