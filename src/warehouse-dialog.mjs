import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc,openHabitatShop} from './ranch-dialogs.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {SPECIES} from './data.mjs';
const labels={all:'全部',dragon:'龙',prop:'道具',habitat:'龙巢',building:'建筑',deco:'装饰'};
// This compatibility view exposes already-saved legacy prizes. It does not
// fabricate a modern inventory or reinterpret old draws as modern raffle eggs.
export async function openWarehouse(state,group='all'){
 const [layout,item]=await Promise.all([sourceLayout('ui_warehouse'),sourceLayout('item_warehouse')]);
 const pending=state.lottery.pending.filter(p=>group==='all'||(group==='dragon'?p.type===16:group==='prop'?p.type!==16:false));
 const cards=pending.map(prize=>{const dragon=CATALOG.find(d=>d.id===prize.itemId),name=prize.type===16?dragon?.name??'龙':{1:'金币',2:'龙粮',3:'魔晶'}[prize.type],src=prize.type===16?dragon?.images[1]:`assets/original/ui/${{1:'ui_main_06.png',2:'ui_main_07.png',3:'ui_main_08.png'}[prize.type]}`;
  return `<article class="native-shop-card" data-warehouse-prize="${prize.id}">${renderSourceLayout(item,{values:{txt_name:name,txt_ShuLiang:prize.amount,shuoming:prize.type===16?'待安置幼龙':'待领取资源','btn_ShiYong/txt_name':prize.type===16?'安置':'领取','btn_ChuShou/txt_name':'出售'},actions:{'btn_ShiYong/btn':{type:prize.type===16?'warehouseChooseDragon':'lotteryClaimResources',id:prize.id,label:prize.type===16?'安置幼龙':'领取资源'}},slots:{con_img:src?`<img class="native-item-art" src="${esc(src)}" alt="${esc(name)}">`:'<span>图像待补</span>'}})}</article>`
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
