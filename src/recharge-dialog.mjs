import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc,openNativePaper} from './ranch-dialogs.mjs';
import {RECHARGE_PRODUCTS,RECHARGE_NOTICE,vipProgress,VIP_LEVELS} from './recharge.mjs';

// The client's own recharge panel (panel_recharge) with its own tier card (item_recharge_data),
// filled exactly the way ui/vip/VipStoreRender.lua fills it:
//   num = data.amount .. " 魔晶"   price = "¥" .. data.price / 10   give = "再送" .. gift .. "魔晶"
// and the 首充 badge disappears once that tier has been doubled. The bar counts 累计充值魔晶
// (VipInfo needExp: 50 魔晶 => VIP1), which is what layout/panel_recharge's hint1/hint2 say.
// No payment happens: the panel says so on screen instead of pretending to charge.
export async function openRechargeDialog(state){
 const [layout,card]=await Promise.all([sourceLayout('panel_recharge'),sourceLayout('item_recharge_data')]);
 const doubled=state.recharge?.doubled??[],total=state.recharge?.totalGems??0,vip=vipProgress(total);
 const cards=RECHARGE_PRODUCTS.map(product=>{
  const first=!doubled.includes(product.id),gift=first?product.firstGift:product.rebate;
  const hidden=first?new Set(['image_3']):new Set(['hint']);
  return `<button class="source-recharge-card" data-action="recharge" data-id="${product.id}" aria-label="${product.gems} 魔晶 ${product.priceYuan} 元">`
   +renderSourceLayout(card,{values:{num:`${product.gems} 魔晶`,give:`再送${gift}魔晶`,price:`¥${product.priceYuan}`},hidden,slots:{icon:`<img class="source-recharge-icon" src="assets/original/ui/${esc(product.img.replace(/^#/,''))}" alt="">`}})
   +'</button>';
 }).join('');
 const vipText=vip.next?`累计充值 ${vip.total} 魔晶，距 VIP${vip.next.level} 还差 ${vip.remaining}`:`累计充值 ${vip.total} 魔晶，已是最高 VIP${vip.level}`;
 const status=`<span class="source-recharge-status">${esc(RECHARGE_NOTICE)}　已充值 ${state.recharge?.count??0} 次　${esc(vipText)}</span>`;
 const values={title:'充值',hint1:'再充值',hint2:'魔晶，即可成为',vip_lv:`VIP${vip.level}`,vip_lv_next:'',mojing:String(vip.remaining),vip_lv_target:vip.next?`VIP${vip.next.level}`:'—',exp_num:`${vip.total}/${vip.next?vip.next.needExp:'—'}`};
 const d=showSource('sourceRecharge',renderSourceLayout(layout,{values,hidden:new Set(['ui_recharge_bg9']),actions:{close:{type:'close',label:'关闭充值'},'btn_privilege/btn':{type:'rechargeVip',label:'VIP特权'}},progress:{exp:vip.percent},slots:{'data/hadong':`<div class="source-recharge-list">${cards}</div>`,'data/status':status}}));
 d.dataset.mode='sourceRecharge';
}
// The thresholds are the client's own VipInfo needExp column. The privilege effects themselves
// are not implemented in this offline build, so they are not claimed here.
export async function openVipThresholds(state){
 const total=state.recharge?.totalGems??0,vip=vipProgress(total);
 await openNativePaper('VIP 门槛',`<p>原版按累计充值魔晶提升 VIP，当前累计 ${total} 魔晶，VIP${vip.level}。</p><p>${VIP_LEVELS.filter(entry=>entry.level>0).map(entry=>`VIP${entry.level}：累计充值 ${entry.needExp} 魔晶`).join('<br>')}</p><p>VIP 特权效果尚未接入。</p>`,'nativeVipThresholds');
}
