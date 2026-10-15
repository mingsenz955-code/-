// Original island artwork; independent PC placement boards. Unlock order and the
// paid-step mapping below are offline policies, not recovered server geometry.
import {findBuildingPosition,gridPosition,placementGrid,canPlaceObject} from './habitats.mjs';
export const ISLANDS=[{id:0,name:'草地龙岛',art:'islandleft_g_bg.png'},{id:1,name:'荒漠龙岛',art:'islandright_g_bg.png'},{id:2,name:'火山龙岛',art:'islandtop_g_bg.png'},{id:3,name:'下方龙岛',art:'islandbottom_g_bg.png'}];
export const islandOf=o=>o?.islandId??0;
export const unlockedIslands=s=>Math.min(4,1+(s.expansion?.plots??0));
export function validateIsland(s,id){if(!Number.isInteger(id)||id<0||id>=unlockedIslands(s))throw Error('龙岛尚未解锁。');return id;}
export function findIslandPosition(island,objects,info,plots=0){
 if(!island)return findBuildingPosition(objects,info,plots);
 const g=placementGrid(plots),candidates=[];
 for(let r=0;r<g.rows;r++)for(let c=0;c<g.columns;c++){const p=gridPosition(c,r);if(p[0]<22||p[0]>72||p[1]<38||p[1]>69)continue;candidates.push(p);}
 candidates.sort((a,b)=>(a[0]-47)**2+(a[1]-48)**2-((b[0]-47)**2+(b[1]-48)**2));
 return candidates.find(p=>canPlaceObject(objects,'new',info,p,plots))??null;
}
