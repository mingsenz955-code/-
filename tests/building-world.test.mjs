import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,action,validate,incubatorSpeedCost} from '../src/game.mjs';
import {ORIGINAL_LEVELS} from '../src/data.mjs';
import {canPlaceObject,gridPosition,placementGrid,findBuildingPosition} from '../src/habitats.mjs';
import {zoomCameraAt} from '../src/ranch-camera.mjs';
const T=1800000000000;
function fixture(){const s=createGame(T);s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===20).xp_required;s.coins=1e8;s.gems=1000;return s}
test('source building speedup is transactional, charges remaining time, awards completion once',()=>{
 let s=action(fixture(),'build',{buildingId:40},T),id=s.habitats.at(-1).id,at=T+3600000,cost=incubatorSpeedCost(s.habitats.at(-1).job.readyAt,at),xp=s.playerXp;
 const poor=structuredClone(s);poor.gems=cost-1;assert.throws(()=>action(poor,'speedBuilding',{kind:'habitat',id},at),/魔晶不足/);assert.equal(poor.habitats.at(-1).job.readyAt,T+7200000);
 s=action(s,'speedBuilding',{kind:'habitat',id},at);assert.equal(s.gems,1000-100-cost);assert.equal(s.habitats.at(-1).job,null);assert(s.playerXp>xp);assert.throws(()=>action(s,'speedBuilding',{kind:'habitat',id},at),/没有正在施工/);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);
 s=action(fixture(),'buyStructure',{itemId:90},T);const st=s.structures.at(-1);s=action(s,'speedBuilding',{kind:'structure',id:st.id},T);assert.equal(s.structures.at(-1).readyAt,undefined);
 s=action(fixture(),'upgradeFarm',{},T);s=action(s,'speedBuilding',{kind:'farm'},T);assert.equal(s.farmBuildingId,17);assert.equal(s.farmUpgrade,null);
});
test('isometric collision and expansion use the same grid, new space survives saves',()=>{
 const info={width:5,height:5},p=gridPosition(20,20);assert(!canPlaceObject([],'x',info,p));assert(canPlaceObject([],'x',info,p,3));
 assert(!canPlaceObject([{key:'a',info,position:p}],'x',info,p,3));assert(canPlaceObject([{key:'a',info,position:p}],'x',info,gridPosition(25,15),5));
 let s=fixture();for(let i=0;i<3;i++)s=action(s,'expandIsland',{},T);s=action(s,'build',{buildingId:40},T);s=action(s,'placeHabitat',{id:s.habitats.at(-1).id,position:p},T);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))).habitats.at(-1).position,p);
 assert.equal(placementGrid(3).columns,30);assert(findBuildingPosition([],info,0));
});
test('wheel zoom keeps the world point under the cursor and respects bounds',()=>{
 const c={zoom:1,x:30,y:-20},n=zoomCameraAt(c,-100,240,120);assert(n.zoom>1);assert(Math.abs((240-c.x)/c.zoom-(240-n.x)/n.zoom)<1e-9);assert(Math.abs((120-c.y)/c.zoom-(120-n.y)/n.zoom)<1e-9);
 let q=c;for(let i=0;i<100;i++)q=zoomCameraAt(q,300,0,0);assert.equal(q.zoom,.45);for(let i=0;i<100;i++)q=zoomCameraAt(q,-300,0,0);assert.equal(q.zoom,2.5);
});
