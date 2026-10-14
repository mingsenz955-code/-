import {ORIGINAL_HABITATS,HABITATS_PER_LEVEL} from '../assets/original/data/habitats.mjs';
import {SPECIES,RULES} from './data.mjs';
export {ORIGINAL_HABITATS};
export const habitatDefinition=id=>ORIGINAL_HABITATS.find(h=>h.id===id);
// Existing generic habitats retain their capacity, inhabitants and accumulated gold.
export function habitatInfo(h){return habitatDefinition(h.buildingId)??{nameCN:h.name,capacity:RULES.habitatCapacity,maxGold:7500,image:'assets/original/world/0024_habitat_plant_1_g_bg.png',legacy:true}}
export function acceptsDragon(h,species){if(h.job?.kind==='build')return false;const info=habitatInfo(h);return info.legacy||SPECIES[species]?.attributes?.includes(info.element_type)}
export function habitatLimit(level){return HABITATS_PER_LEVEL[Math.min(level,HABITATS_PER_LEVEL.length)-1]}
export function habitatPosition(h,index){return h.position??[[41,50],[59,51],[48,66],[67,65],[31,65],[56,39]][index]??[25+(index%7)*8,36+Math.floor(index/7)*9]}
export const PLACEMENT_GRID={columns:24,rows:14,left:12,right:88,top:18,bottom:82};
export function snapHabitatPosition(position){
 const g=PLACEMENT_GRID,stepX=(g.right-g.left)/(g.columns-1),stepY=(g.bottom-g.top)/(g.rows-1);
 const column=Math.max(0,Math.min(g.columns-1,Math.round((position[0]-g.left)/stepX))),row=Math.max(0,Math.min(g.rows-1,Math.round((position[1]-g.top)/stepY)));
 return [Math.round((g.left+column*stepX)*100)/100,Math.round((g.top+row*stepY)*100)/100];
}
export function habitatGridRect(h,index,position=habitatPosition(h,index)){
 const g=PLACEMENT_GRID,info=habitatInfo(h),stepX=(g.right-g.left)/(g.columns-1),stepY=(g.bottom-g.top)/(g.rows-1),p=snapHabitatPosition(position);
 const column=Math.round((p[0]-g.left)/stepX),row=Math.round((p[1]-g.top)/stepY),width=info.width??5,height=info.height??5;
 return {column,row,width,height};
}
export function placementGridRect(info,position){
 const g=PLACEMENT_GRID,stepX=(g.right-g.left)/(g.columns-1),stepY=(g.bottom-g.top)/(g.rows-1),p=snapHabitatPosition(position);
 return {column:Math.round((p[0]-g.left)/stepX),row:Math.round((p[1]-g.top)/stepY),width:info.width??1,height:info.height??1};
}
export function canPlaceObject(objects,movingKey,info,position){
 const moving=placementGridRect(info,position),g=PLACEMENT_GRID,bounds=r=>({left:r.column-Math.floor(r.width/2),right:r.column+Math.ceil(r.width/2),top:r.row-Math.floor(r.height/2),bottom:r.row+Math.ceil(r.height/2)}),a=bounds(moving);
 if(a.left<0||a.top<0||a.right>g.columns||a.bottom>g.rows)return false;
 return objects.every(o=>{if(o.key===movingKey)return true;const b=bounds(placementGridRect(o.info,o.position));return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom});
}
export function canPlaceHabitat(habitats,id,position){
 const index=habitats.findIndex(h=>h.id===id);if(index<0)return false;const moving=habitatGridRect(habitats[index],index,position),g=PLACEMENT_GRID;
 if(moving.column-Math.floor(moving.width/2)<0||moving.row-Math.floor(moving.height/2)<0||moving.column+Math.ceil(moving.width/2)>g.columns||moving.row+Math.ceil(moving.height/2)>g.rows)return false;
 const bounds=r=>({left:r.column-Math.floor(r.width/2),right:r.column+Math.ceil(r.width/2),top:r.row-Math.floor(r.height/2),bottom:r.row+Math.ceil(r.height/2)}),a=bounds(moving);
 return habitats.every((other,i)=>{if(other.id===id)return true;const b=bounds(habitatGridRect(other,i));return a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom});
}
