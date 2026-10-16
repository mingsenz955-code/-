import {landFootprintAllowed} from './land-geometry.mjs';
import {ORIGINAL_HABITATS,HABITATS_PER_LEVEL} from '../assets/original/data/habitats.mjs';
import {SPECIES,RULES} from './data.mjs';
export {ORIGINAL_HABITATS};
export const habitatDefinition=id=>ORIGINAL_HABITATS.find(h=>h.id===id);
// Existing generic habitats retain their capacity, inhabitants and accumulated gold.
export function habitatInfo(h){return habitatDefinition(h.buildingId)??{nameCN:h.name,capacity:RULES.habitatCapacity,maxGold:7500,image:'assets/original/world/0024_habitat_plant_1_g_bg.png',legacy:true}}
// DragonElement.isLegen comes from config.legen == 1. getFullType adds 'l',
// and Base's placement branch requires these dragons to live in an 'l' habitat.
export function acceptsDragon(h,species){if(h.job?.kind==='build')return false;const info=habitatInfo(h),dragon=SPECIES[species];if(info.legacy)return true;if(dragon?.isLegendHabitat)return info.element_type==='l';return dragon?.attributes?.includes(info.element_type)??false}
// Earlier versions allowed holy dragons into their combat-element habitats. Preserve
// those already-saved residents; all new placement/move/hatch uses the source rule.
export function acceptsSavedResident(h,species){return acceptsDragon(h,species)||(h.job?.kind!=='build'&&SPECIES[species]?.isLegendHabitat&&SPECIES[species]?.attributes?.includes(habitatInfo(h).element_type))}

export function habitatLimit(level){return HABITATS_PER_LEVEL[Math.min(level,HABITATS_PER_LEVEL.length)-1]}
export function habitatBuildStatus(state,level){
 const owned=state.habitats.length,plots=state.expansion?.plots??0,limit=habitatLimit(level)+plots;
 const nextIndex=HABITATS_PER_LEVEL.findIndex((count,index)=>index+1>level&&count+plots>owned);
 const blocked=owned>=limit,next=nextIndex<0?null:{level:nextIndex+1,limit:HABITATS_PER_LEVEL[nextIndex]+plots};
 return {owned,limit,blocked,next,message:blocked?`龙巢数量上限：当前 ${owned}/${limit} 座。${next?`升至牧场 ${next.level} 级可拥有 ${next.limit} 座；也可在满足等级后购买扩建。`:'可查看商店扩建以增加上限。'}`:''};
}
export function habitatPosition(h,index){return h.position??[[41,50],[59,51],[48,66],[67,65],[31,65],[56,39]][index]??[25+(index%7)*8,36+Math.floor(index/7)*9]}
// A fixed world plane: pixels never change when the window or camera changes.
// Tile pitch comes from BuildingBaseDelegate.showTiles. Island unlock geometry
// is an offline mapping until the server's plot coordinates can be recovered.
export const PLACEMENT_GRID={columns:24,rows:24,width:1300,height:768,originX:650,originY:50,tileX:27,tileY:13.5};
export function placementGrid(plots=0){const extra=Math.max(0,Math.min(96,plots))*2;return {...PLACEMENT_GRID,columns:24+extra,rows:24+extra}}
export function gridPosition(column,row){const g=PLACEMENT_GRID;return [(g.originX+(column-row)*g.tileX)/g.width*100,(g.originY+(column+row)*g.tileY)/g.height*100]}
export function gridCoordinates(position){const g=PLACEMENT_GRID,x=(position[0]*g.width/100-g.originX)/g.tileX,y=(position[1]*g.height/100-g.originY)/g.tileY;return {column:Math.round((x+y)/2),row:Math.round((y-x)/2)}}
export function snapHabitatPosition(position){const {column,row}=gridCoordinates(position);return gridPosition(column,row)}
export function placementGridRect(info,position){return {...gridCoordinates(position),width:info.width??5,height:info.height??5}}
export function habitatGridRect(h,index,position=habitatPosition(h,index)){return placementGridRect(habitatInfo(h),position)}
export function canPlaceObject(objects,movingKey,info,position,plots=0,state=null,island=0){
 if(state&&!landFootprintAllowed(state,island,placementGridRect(info,position)))return false;
 const g=placementGrid(plots),bounds=r=>({left:r.column-Math.floor(r.width/2),right:r.column+Math.ceil(r.width/2),top:r.row-Math.floor(r.height/2),bottom:r.row+Math.ceil(r.height/2)}),a=bounds(placementGridRect(info,position));
 if(a.left<0||a.top<0||a.right>g.columns||a.bottom>g.rows)return false;
 // Conservative grass envelope prevents a newly bought building spawning in the
 // clouds or behind the rocky rim. Existing saves are never repositioned.
 const scale=1+plots/12,px=position[0]*13,py=position[1]*7.68;
 if(Math.abs(px-650)>400*scale||py<210||py>240+310*scale)return false;
 return objects.every(o=>{if(o.key===movingKey)return true;const b=bounds(placementGridRect(o.info,o.position));return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom});
}
export function canPlaceHabitat(habitats,id,position,plots=0){const h=habitats.find(h=>h.id===id);return !!h&&canPlaceObject(habitats.map((v,i)=>({key:`h:${v.id}`,info:habitatInfo(v),position:habitatPosition(v,i)})),`h:${id}`,habitatInfo(h),position,plots)}
export function findBuildingPosition(objects,info,plots=0,state=null,island=0){const g=placementGrid(plots);for(let row=0;row<g.rows;row++)for(let column=0;column<g.columns;column++){const p=gridPosition(column,row);if(canPlaceObject(objects,'new',info,p,plots,state,island))return p}return null}
export const FIXED_BUILDINGS=[{key:'fixed:breed',info:{width:6,height:6},position:[66,31]},{key:'fixed:incubator',info:{width:5,height:5},position:[75,48]},{key:'fixed:farm',info:{width:4,height:4},position:[26,39]}];
export function fixedBuildings(state){return FIXED_BUILDINGS.map((b,i)=>({...b,id:i+1,inactive:!!state.tutorial?.sourceOpening&&i!==1,position:state.fixedPositions?.[b.key]??b.position}))}
