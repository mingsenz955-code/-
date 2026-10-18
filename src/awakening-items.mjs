import SOURCE from '../assets/original/data/activities.mjs';
// Original items 7111..7114 and treasure_items 119..122. All four source
// offers are enabled, cost 20 gems per stone, and use ordinary item inventory.
export const AWAKENING_STONES=Object.freeze([7111,7112,7113,7114].map((id,i)=>Object.freeze({id,shopId:119+i,...SOURCE.items[id]})));
export function migrateAwakeningPurchases(s){
 for(const stone of AWAKENING_STONES){const n=s.shopInventory[stone.shopId]??0;if(!n)continue;const total=(s.items[stone.id]??0)+n;if(!Number.isSafeInteger(total)||total>1e9)throw Error('觉醒石库存超出上限，请保留原存档。');s.items[stone.id]=total;delete s.shopInventory[stone.shopId];}
}
