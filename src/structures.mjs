import {ORIGINAL_SHOP_ITEMS} from '../assets/original/data/shop.mjs';
import {ORIGINAL_FARMS} from '../assets/original/data/rules.mjs';
export const structureDefinition=id=>{const row=ORIGINAL_SHOP_ITEMS.find(row=>row.id===id&&['buildings','decorations'].includes(row.category));return row?{...row,...ORIGINAL_FARMS.find(f=>f.id===id)}:undefined};
export const structureInfo=structure=>structureDefinition(structure.itemId);
export function structurePosition(structure,index){return structure.position??[22+(index%8)*8,28+Math.floor(index/8)*8]}
export function structureArt(info){return info.thumbnail}
export function farmWorldArt(itemId,job,now=Date.now()){
 const prefix=itemId===108?'0108_farm2_EvolutionLand':itemId===16?'0016_farm_1':'0017_farm_2';
 return `assets/original/world/${prefix}_g_s${job?(now>=job.readyAt?3:2):1}.png`;
}
