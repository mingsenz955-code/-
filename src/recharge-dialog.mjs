import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {RECHARGE_TIERS,RECHARGE_NOTICE} from './recharge.mjs';

// The client's own recharge panel (panel_recharge) with its own tier card
// (item_recharge_data). Prices and awards are the client's; the payment path is not
// implemented and the panel says so on screen instead of pretending to charge.
export async function openRechargeDialog(state){
 const [layout,card]=await Promise.all([sourceLayout('panel_recharge'),sourceLayout('item_recharge_data')]);
 const cards=RECHARGE_TIERS.map(tier=>{
  const values={num:`${tier.costYuan} 元`,give:tier.awards.map(award=>`${award.name}×${award.num}`).join('、'),price:'点击到账'};
  const art='assets/original/ui/ui_recharge_mojing.png';
  return `<button class="source-recharge-card" data-action="recharge" data-id="${tier.id}" aria-label="${tier.costYuan} 元档">`
   +renderSourceLayout(card,{values,hidden:new Set(['hint']),slots:{icon:`<img class="source-recharge-icon" src="${art}" alt="">`}})
   +'</button>';
 }).join('');
 const d=showSource('sourceRecharge',renderSourceLayout(layout,{values:{title:'充值'},hidden:new Set(['ui_recharge_bg9']),actions:{close:{type:'close',label:'关闭充值'}},slots:{'data/hadong':`<div class="source-recharge-list">${cards}</div>`,'data/status':`<span class="source-recharge-status">${esc(RECHARGE_NOTICE)}　充值记录 ${state.recharge?.count??0} 次</span>`}}));
 d.dataset.mode='sourceRecharge';
}
