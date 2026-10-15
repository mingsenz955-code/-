import {equipmentDefinition} from './equipment.mjs';

// StarBar's source ui_star images; blue equipment has three slots, purple/orange five.
export function equipmentStars(item){
 const quality=equipmentDefinition(item?.type)?.quality??0,cap=quality===3?3:quality>=4?5:0;
 return cap?`<span class="source-equip-stars source-equipment-starbar" aria-label="${item.star??0}星">${Array.from({length:cap},(_,i)=>`<img src="assets/original/ui/ui_star_x000${i<(item.star??0)?7:8}.png" alt="">`).join('')}</span>`:'';
}
