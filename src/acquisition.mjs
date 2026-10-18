import {RESOURCE_SHOP_OFFERS} from './resource-shop.mjs';
import {ORIGINAL_SHOP_ITEMS} from '../assets/original/data/shop.mjs';
import {lotteryPool} from './lottery.mjs';
import {ACTIVITY_CATALOG,activityFamilyEntries} from './activity-catalog.mjs';
import ITEM_USE from '../assets/original/data/item-use.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {ORIGINAL_BREEDING} from '../assets/original/data/rules.mjs';
const records=new Map(CATALOG.map(record=>[record.id,record]));
export function dragonActivitySources(id){return ACTIVITY_CATALOG.flatMap(d=>d.family?activityFamilyEntries(d.family):[d]).flatMap(d=>{const rewards=d.items.flatMap(r=>r.rewards??[]),direct=rewards.some(p=>p.type===5&&p.itemId===id),fragments=[...new Set(rewards.filter(p=>p.type===4&&ITEM_USE.fragments[p.itemId]?.dragonId===id).map(p=>p.itemId))];return direct||fragments.length?[{key:d.key,title:d.title,direct,fragments:fragments.map(itemId=>({itemId,...ITEM_USE.fragments[itemId]}))}]:[];});}
const pools=new Map(CATALOG.map(record=>[record.id,[]]));
for(const row of ORIGINAL_BREEDING){
 if(row[3]!==1)continue;
 const seen=new Set();
 for(let column=4;column<row.length;column+=2){
  const child=row[column];
  if(!pools.has(child)||!(row[column+1]>0)||seen.has(child))continue;
  seen.add(child);pools.get(child).push(Object.freeze({sourceRow:row[0],parentIds:Object.freeze([row[1],row[2]])}));
 }
}
export function dragonAcquisition(id){
 const record=records.get(id);if(!record)return null;
 return {id,name:record.name,resourceShop:RESOURCE_SHOP_OFFERS.filter(r=>r.type==='d'&&r.xid===id),shop:{listed:ORIGINAL_SHOP_ITEMS.some(r=>r.id===id&&r.category==='eggs'),costs:{...record.original.costs},minLevel:record.original.min_level??record.original.lvl??null},breeding:[...pools.get(id)],baseLottery:[...lotteryPool(1),...lotteryPool(2)].filter(row=>row.type===16&&row.itemId===id).map(row=>({mode:row.mode,sourceRow:row.id,probability:'unverified'})),otherSources:'unverified'};
}
export function sourceDragonName(id){return records.get(id)?.name??`原ID ${id}（目录未收录）`;}
