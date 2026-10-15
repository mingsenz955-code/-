import {resourceShopRow} from './resource-shop.mjs';
import {LOOT_PROPS,lootBox} from './loot.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc,openHabitatShop} from './ranch-dialogs.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {SPECIES} from './data.mjs';
import {RAFFLE_MACHINES,RAFFLE_QUALITY_NAMES} from './raffle.mjs';
const labels={all:'全部',dragon:'龙',prop:'道具',habitat:'龙巢',building:'建筑',deco:'装饰'};
// This compatibility view exposes already-saved legacy prizes. It does not
// fabricate a modern inventory or reinterpret old draws as modern raffle eggs.
export async function openWarehouse(state,group='all'){
 const [layout,item]=await Promise.all([sourceLayout('ui_warehouse'),sourceLayout('item_warehouse')]);
 // Modern raffle eggs keep their own list: they hatch in the 育龙塔 and are never sent
 // through the legacy direct-placement path.
 const eggs=[...(state.raffle?.pending??[]),...(state.giftEggs??[])].filter(()=>group==='all'||group==='dragon');
 const eggCards=eggs.map(prize=>{const dragon=CATALOG.find(d=>d.id===prize.dragonId),name=dragon?.name??`原ID ${prize.dragonId}`,machine=prize.source==='shop'?'商店购买':prize.source==='user-request'?'赠送':(RAFFLE_MACHINES[prize.machine]?.name??'');return `<article class="native-shop-card" data-raffle-egg="${prize.id}">${renderSourceLayout(item,{values:{txt_name:name,txt_ShuLiang:1,shuoming:`${RAFFLE_QUALITY_NAMES[prize.quality]??''}龙蛋 · ${machine}${['user-request','shop'].includes(prize.source)?'':'扭蛋机'}`,'btn_ShiYong/txt_name':'孵化','btn_ChuShou/txt_name':'出售'},actions:{'btn_ShiYong/btn':{type:'raffleEggUse',id:prize.id,label:'送入育龙塔'},'btn_ChuShou/btn':{type:'sellRaffleEgg',id:prize.id,label:`出售${name}龙蛋`}},slots:{con_img:dragon?.images[1]?`<img class="native-item-art" src="${esc(dragon.images[1])}" alt="${esc(name)}">`:'<span>图像待补</span>'}})}</article>`}).join('');
 const pending=state.lottery.pending.filter(p=>group==='all'||(group==='dragon'?p.type===16:group==='prop'?p.type!==16:false));
 const propCards=(group==='all'||group==='prop'?LOOT_PROPS.filter(p=>(state.items[p.id]??0)>0):[]).map(p=>`<article class="native-shop-card" data-loot-prop="${p.id}">${renderSourceLayout(item,{values:{txt_name:p.name,txt_ShuLiang:state.items[p.id],shuoming:'','btn_ShiYong/txt_name':'使用','btn_ChuShou/txt_name':'出售'},actions:lootBox(p.id)?{'btn_ShiYong/btn':{type:'lootBoxUse',id:p.id,label:'使用'+p.name}}:{},slots:{con_img:`<img class="native-item-art" src="assets/original/ui/${p.image}" alt="${esc(p.name)}">`}})}</article>`).join('');
 const purchased=(group==='all'||group==='prop')?Object.entries(state.shopInventory??{}).filter(([,n])=>n>0).map(([id,n])=>{const row=resourceShopRow(Number(id));return `<article class="native-shop-card">${renderSourceLayout(item,{values:{txt_name:row.name,txt_ShuLiang:n,shuoming:'商店购买','btn_ShiYong/txt_name':'使用','btn_ChuShou/txt_name':'出售'},slots:{con_img:`<span class="native-unpictured-prop">${esc(row.name)}</span>`}})}</article>`}).join(''):'';
 const cards=eggCards+propCards+purchased+pending.map(prize=>{const dragon=CATALOG.find(d=>d.id===prize.itemId),name=prize.type===16?dragon?.name??'龙':{1:'金币',2:'龙粮',3:'魔晶'}[prize.type],src=prize.type===16?dragon?.images[1]:`assets/original/ui/${{1:'ui_main_06.png',2:'ui_main_07.png',3:'ui_main_08.png'}[prize.type]}`;
  return `<article class="native-shop-card" data-warehouse-prize="${prize.id}">${renderSourceLayout(item,{values:{txt_name:name,txt_ShuLiang:prize.amount,shuoming:prize.type===16?'待安置幼龙':'待领取资源','btn_ShiYong/txt_name':prize.type===16?'安置':'领取','btn_ChuShou/txt_name':'出售'},actions:{'btn_ShiYong/btn':{type:prize.type===16?'warehouseChooseDragon':'lotteryClaimResources',id:prize.id,label:prize.type===16?'安置幼龙':'领取资源'},...(prize.type===16?{'btn_ChuShou/btn':{type:'sellLotteryDragon',id:prize.id,label:`出售${name}`}}:{})},slots:{con_img:src?`<img class="native-item-art" src="${esc(src)}" alt="${esc(name)}">`:'<span>图像待补</span>'}})}</article>`
 }).join('');
 const actions={close:{type:'close',label:'关闭仓库'}},checked=new Set(),values={txt_name:'仓库'};
 for(const [key,label] of Object.entries(labels)){const base=`category_root/category_node_${key}`;values[`${base}/category_txt_${key}`]=label;actions[`${base}/category_btn_${key}`]={type:'warehouseFilter',value:key,label};if(group===key)checked.add(`${base}/category_btn_${key}`)}
 const d=showSource('nativeWarehouse',renderSourceLayout(layout,{values,actions,checked,hidden:new Set(['longzuleixing']),slots:{huadong:cards?`<div class="native-shop-list">${cards}</div>`:'<div class="native-warehouse-empty">仓库暂无物品</div>'}}),'native-fullscreen');d.dataset.warehouseGroup=group;
}
export async function chooseWarehouseDragon(state,id){
 const prize=state.lottery.pending.find(p=>p.id===id&&p.type===16);if(!prize)throw Error('找不到待安置幼龙');
 const species=Object.keys(SPECIES).find(key=>SPECIES[key].originalId===prize.itemId);if(!species)throw Error('幼龙资料尚未取得');
 await openHabitatShop(state,{moveDragon:{id:prize.id,species}});const d=document.querySelector('#modal');d.dataset.mode='nativeWarehousePlace';d.dataset.pendingPrize=id;
 const back=d.querySelector('[data-action=returnMoveDragon]');if(back){back.dataset.action='openWarehouse';back.setAttribute('aria-label','返回仓库')}
}
