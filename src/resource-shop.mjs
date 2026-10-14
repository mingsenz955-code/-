import {ORIGINAL_RESOURCE_SHOP} from '../assets/original/data/resource-shop.mjs';

// ui/ResourceShopPanel.lua (商店的「资源」分类) reads LibraryManager.lib_treasure, prints
// info.costtype and refuses the sale with "not enough gems", so this category is paid in 魔晶.
// Rows below are pcf/treasure_items entries with costtype "c" and a deliverable type:
//   g  金币      f  食物      ef  进化果实
// Enable only source rows whose delivered resource has a working consumer.
// l1/l2 are the middle/high dragon balls consumed by the original gem exploration.
// Disabled legacy materials remain excluded; they are not revived to invent a source.
export const RESOURCE_SHOP_POLICY='original-treasure-items-resource-v1';
export const RESOURCE_SHOP_TYPES=Object.freeze({g:'金币',f:'食物',ef:'进化果实',l1:'中级龙珠',l2:'高级龙珠'});
// items table row 7027 resolves to 进化果实 (and 7028 to 神圣果实); the evolution costs count
// 进化果实, so the bag key is the client's own item id.
export const EVOLUTION_FRUIT_ITEM_ID=7027;
export const RESOURCE_SHOP_OFFERS=Object.freeze(ORIGINAL_RESOURCE_SHOP
 .filter(row=>Object.hasOwn(RESOURCE_SHOP_TYPES,row.type))
 .sort((a,b)=>a.displayOrder-b.displayOrder)
 .map(row=>Object.freeze({id:row.id,name:row.name,type:row.type,amount:row.amount,priceGems:row.priceGems,zhekouIcon:row.zhekouIcon,xid:row.xid})));
export function resourceShopRow(id){return RESOURCE_SHOP_OFFERS.find(row=>row.id===id)??null}
export function resourceShopOffersOfType(type){return RESOURCE_SHOP_OFFERS.filter(row=>row.type===type)}
