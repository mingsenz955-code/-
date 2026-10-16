import {EXPANSION_PRICES_NAMED,ORIGINAL_LANDS,LANDS_IN_ISLAND,FIRST_ISLAND_LANDS,ISLAND_COSTS} from '../assets/original/data/expansion.mjs';
export {ORIGINAL_LANDS,LANDS_IN_ISLAND};
export const EXPANSION_POLICY='client-named-expansion-v2';
export const EXPANSION_FREE_STEPS=4;
// Historical plots can exceed the current map. Preserve purchased legacy space.
export const EXPANSION_PAID_STEPS=EXPANSION_PRICES_NAMED.length-4;
export const expansionStep=index=>Number.isSafeInteger(index)&&index>=0&&EXPANSION_PRICES_NAMED[index]?{index,coins:EXPANSION_PRICES_NAMED[index].coins,gems:EXPANSION_PRICES_NAMED[index].cash}:null;
export const EXPANSION_LAST=expansionStep(EXPANSION_PRICES_NAMED.length-1);
export function nextExpansion(owned){if(!Number.isSafeInteger(owned)||owned<0)throw Error('已扩建数量无效。');return expansionStep(4+owned)}
export function ownedLands(s){
 if(s.expansion.lands)return [...s.expansion.lands];
 // Older versions unlocked one island per purchase; grandfather those accesses.
 const out=[12,13,15,16],n=s.expansion.plots??0;
 for(let island=2;island<=Math.min(4,n+1);island++)out.push(FIRST_ISLAND_LANDS[island]);
 for(const land of ORIGINAL_LANDS)if(out.length<Math.min(20,4+n)&&!out.includes(land.id))out.push(land.id);
 return out;
}
export function islandOwnership(s,island){const own=ownedLands(s),ids=LANDS_IN_ISLAND[island-1];if(!ids)return 'none';const count=ids.filter(id=>own.includes(id)).length;return count===ids.length?'full':count?'partial':'none'}
export function currentIsland(s){return Math.max(1,...LANDS_IN_ISLAND.map((_,i)=>islandOwnership(s,i+1)!=='none'?i+1:1))}
export function availableLands(s){const own=ownedLands(s);return ORIGINAL_LANDS.filter(l=>!own.includes(l.id)&&islandOwnership(s,l.island)!=='none')}
export function nextIslandOffer(s){const island=currentIsland(s)+1;if(island>4)return null;const cost=ISLAND_COSTS[island-1],unit=Object.keys(cost)[0];return {island,landId:FIRST_ISLAND_LANDS[island],unit,price:cost[unit],ready:LANDS_IN_ISLAND.slice(0,island-1).every((_,i)=>islandOwnership(s,i+1)==='full')}}
export function landPrice(s){return expansionStep(ownedLands(s).length)}
export function validateLands(s){const a=s.expansion.lands;if(a===undefined)return;const all=LANDS_IN_ISLAND.flat();if(!Array.isArray(a)||a.length<4||new Set(a).size!==a.length||a.some(id=>!all.includes(id))||[12,13,15,16].some(id=>!a.includes(id)))throw Error('扩建地块记录无效。')}
