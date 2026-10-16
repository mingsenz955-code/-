import {currentIsland} from './expansion.mjs';
// One continuous scene. Centers and z-order from MainScene:initIslands.
// Saved island IDs remain unchanged; paid unlock mapping is still offline policy.
import {findBuildingPosition,gridPosition,placementGrid,canPlaceObject} from './habitats.mjs';
export const ISLANDS=[{id:0,name:'草地龙岛',art:'islandleft_g_bg.png'},{id:1,name:'荒漠龙岛',art:'islandright_g_bg.png'},{id:2,name:'火山龙岛',art:'islandtop_g_bg.png'},{id:3,name:'下方龙岛',art:'islandbottom_g_bg.png'}];
export const islandOf=o=>o?.islandId??0;
export const unlockedIslands=s=>currentIsland(s);
export function validateIsland(s,id){if(!Number.isInteger(id)||id<0||id>=unlockedIslands(s))throw Error('龙岛尚未解锁。');return id;}
export function findIslandPosition(island,objects,info,plots=0){
 if(!island)return findBuildingPosition(objects,info,plots);
 const g=placementGrid(plots),candidates=[];
 for(let r=0;r<g.rows;r++)for(let c=0;c<g.columns;c++){const p=gridPosition(c,r);if(p[0]<22||p[0]>72||p[1]<38||p[1]>69)continue;candidates.push(p);}
 candidates.sort((a,b)=>(a[0]-47)**2+(a[1]-48)**2-((b[0]-47)**2+(b[1]-48)**2));
 return candidates.find(p=>canPlaceObject(objects,'new',info,p,plots))??null;
}

// Lua uses bottom-up Y. Use one uniform source-to-PC scale for every island.
export const WORLD_ISLANDS=[
 {id:0,x:0,y:0,z:2,width:1929,height:1408},
 {id:1,x:1055,y:100,z:3,width:1659,height:1162},
 {id:2,x:600,y:-182.5,z:1,width:1656,height:1219},
 {id:3,x:540,y:400,z:4,width:1057,height:794}
];
export const WORLD_BOUNDS={left:-700,right:1600,top:-600,bottom:750};
export function nearestWorldIsland(x,y,count=4){return WORLD_ISLANDS.filter(i=>i.id<count).reduce((a,b)=>(a.x-x)**2+(a.y-y)**2<(b.x-x)**2+(b.y-y)**2?a:b).id;}
