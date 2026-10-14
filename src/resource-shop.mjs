import {ORIGINAL_RESOURCE_SHOP} from '../assets/original/data/resource-shop.mjs';

// ui/ResourceShopPanel.lua (商店的「资源」分类) reads LibraryManager.lib_treasure, prints
// info.costtype and refuses the sale with "not enough gems", so this category is paid in 魔晶.
// Rows below are pcf/treasure_items entries with costtype "c" and a deliverable type:
//   g  金币      f  食物      ef  进化果实
// Amounts and prices are the client's own numbers (about 150000 金币 or 800 进化果实 for 75
// 魔晶). The client's remaining 魔晶 rows (强化石, 保护符, 培养丹, 龙珠, 龙魂, 觉醒石, 宝箱,
// 玫瑰花 ...) are exported as well but have no system to spend them in this offline build yet, so
// they are deliberately not on sale here.
export const RESOURCE_SHOP_POLICY='original-treasure-items-resource-v1';
export const RESOURCE_SHOP_TYPES=Object.freeze({g:'金币',f:'食物',ef:'进化果实'});
// items table row 7027 resolves to 进化果实 (and 7028 to 神圣果实); the evolution costs count
// 进化果实, so the bag key is the client's own item id.
export const EVOLUTION_FRUIT_ITEM_ID=7027;
export const RESOURCE_SHOP_OFFERS=Object.freeze(ORIGINAL_RESOURCE_SHOP
 .filter(row=>Object.hasOwn(RESOURCE_SHOP_TYPES,row.type))
 .sort((a,b)=>a.displayOrder-b.displayOrder)
 .map(row=>Object.freeze({id:row.id,name:row.name,type:row.type,amount:row.amount,priceGems:row.priceGems,zhekouIcon:row.zhekouIcon,xid:row.xid})));
export function resourceShopRow(id){return RESOURCE_SHOP_OFFERS.find(row=>row.id===id)??null}
export function resourceShopOffersOfType(type){return RESOURCE_SHOP_OFFERS.filter(row=>row.type===type)}
