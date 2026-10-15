import assert from 'node:assert/strict';
import {test} from 'node:test';
import {clampWorldCamera} from '../src/ranch-camera.mjs';
import {WORLD_ISLANDS,WORLD_BOUNDS,nearestWorldIsland} from '../src/islands.mjs';
test('continuous island source coordinates preserve saved IDs and Lua Y direction',()=>{assert.deepEqual(WORLD_ISLANDS.map(i=>[i.id,i.x,i.y,i.z]),[[0,0,0,2],[1,1055,100,3],[2,600,-182.5,1],[3,540,400,4]]);for(const i of WORLD_ISLANDS)assert.equal(nearestWorldIsland(i.x,i.y),i.id)});
test('extreme pan and all zoom levels stay inside finite world',()=>{for(const zoom of [.45,1,2.5])for(const n of [-1e9,1e9]){const c=clampWorldCamera({x:n,y:n,zoom},1300,768,1,WORLD_BOUNDS);for(const [axis,min,max,half] of [['x',WORLD_BOUNDS.left,WORLD_BOUNDS.right,650/zoom],['y',WORLD_BOUNDS.top,WORLD_BOUNDS.bottom,384/zoom]]){const center=-c[axis]/zoom;if(max-min<half*2)assert.equal(center,(min+max)/2);else assert(center>=min+half-1e-8&&center<=max-half+1e-8)}}});
