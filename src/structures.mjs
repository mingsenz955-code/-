import {ORIGINAL_SHOP_ITEMS} from '../assets/original/data/shop.mjs';
export const structureDefinition=id=>ORIGINAL_SHOP_ITEMS.find(row=>row.id===id&&['buildings','decorations'].includes(row.category));
export const structureInfo=structure=>structureDefinition(structure.itemId);
export function structurePosition(structure,index){return structure.position??[22+(index%8)*8,28+Math.floor(index/8)*8]}
export function structureArt(info){return info.thumbnail}
