import {sourceLayout,showSource} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {SPECIES} from './data.mjs';
import {dragonSellGold} from './game.mjs';
import {dragonRemovalError} from './dragon-stars.mjs';
export async function confirmDragonSale(state,id){
 const error=dragonRemovalError(state,id);if(error)throw Error(error);
 const dragon=state.dragons.find(d=>d.id===id),previous=document.querySelector('#modal .source-artboard')?.innerHTML??'',collection=document.querySelector('#modal').dataset.returnToCollection;
 const layout=await sourceLayout('panel_apply_or_cancel'),dialog=showSource('sourceDragonSale',`<div class="source-equipment-confirm-bg">${previous}</div><div class="source-equipment-confirm-shade"></div><div class="source-equipment-confirm-panel">${renderSourceLayout(layout,{values:{txt_name:'出售龙',txt_miaoshu:`确定出售${SPECIES[dragon.species].name}，获得 ${dragonSellGold(dragon.species)} 金币吗？`,'btn_QueDing/txt_name':'出售','btn_quxiao/txt_name':'取消'},actions:{'btn_QueDing/btn':{type:'sellDragon',id,label:'确认出售龙'},'btn_quxiao/btn':{type:'cancelDragonSale',id,label:'取消出售'},btn_close:{type:'cancelDragonSale',id,label:'取消出售'}}})}</div>`,'native-fullscreen');
 dialog.classList.add('source-equipment-confirm');dialog.dataset.returnToCollection=collection??'false';
}
