import SOURCE from '../assets/original/data/arena-vip.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc,openNativePaper} from './ranch-dialogs.mjs';
import {RECHARGE_PRODUCTS,RECHARGE_NOTICE,rechargeDailyUsage,vipProgress,VIP_LEVELS} from './recharge.mjs';

// The client's own recharge panel (panel_recharge) with its own tier card (item_recharge_data),
// filled exactly the way ui/vip/VipStoreRender.lua fills it:
//   num = data.amount .. " 魔晶"   price = "¥" .. data.price / 10   give = "再送" .. gift .. "魔晶"
// and the 首充 badge disappears once that tier has been doubled. The bar counts 累计充值魔晶
// (VipInfo needExp: 50 魔晶 => VIP1), which is what layout/panel_recharge's hint1/hint2 say.
// No payment happens: the panel says so on screen instead of pretending to charge.
export async function openRechargeDialog(state){
 const [layout,card]=await Promise.all([sourceLayout('panel_recharge'),sourceLayout('item_recharge_data')]);
 const doubled=state.recharge?.doubled??[],total=state.recharge?.totalGems??0,vip=vipProgress(total),daily=rechargeDailyUsage(state.recharge);
 const cards=RECHARGE_PRODUCTS.map(product=>{
  const first=!doubled.includes(product.id),gift=first?product.firstGift:product.rebate;
  const hidden=first?new Set(['image_3']):new Set(['hint']);
  return `<button class="source-recharge-card" data-action="recharge" data-id="${product.id}" ${product.priceYuan>daily.remaining?'disabled':''} aria-label="${product.gems} 魔晶 ${product.priceYuan} 元">`
   +renderSourceLayout(card,{values:{num:`${product.gems} 魔晶`,give:`再送${gift}魔晶`,price:`¥${product.priceYuan}`},hidden,slots:{icon:`<img class="source-recharge-icon" src="assets/original/ui/${esc(product.img.replace(/^#/,''))}" alt="">`}})
   +'</button>';
 }).join('');
 const vipText=vip.next?`累计充值 ${vip.total} 魔晶，距 VIP${vip.next.level} 还差 ${vip.remaining}`:`累计充值 ${vip.total} 魔晶，已是最高 VIP${vip.level}`;
 const status=`<span class="source-recharge-status">${esc(RECHARGE_NOTICE)}　今日 ${daily.used}/500 元，剩余 ${daily.remaining} 元　已充值 ${state.recharge?.count??0} 次　${esc(vipText)}</span>`;
 const values={title:'充值',hint1:'再充值',hint2:'魔晶，即可成为',vip_lv:`VIP${vip.level}`,vip_lv_next:'',mojing:String(vip.remaining),vip_lv_target:vip.next?`VIP${vip.next.level}`:'—',exp_num:`${vip.total}/${vip.next?vip.next.needExp:'—'}`};
 const d=showSource('sourceRecharge',renderSourceLayout(layout,{values,hidden:new Set(['ui_recharge_bg9']),actions:{close:{type:'close',label:'关闭充值'},'btn_privilege/btn':{type:'rechargeVip',label:'VIP特权'}},progress:{exp:vip.percent},slots:{'data/hadong':`<div class="source-recharge-list">${cards}</div>`,'data/status':status}}));
 d.dataset.mode='sourceRecharge';
}
// The thresholds are the client's own VipInfo needExp column. The privilege effects themselves
// are not implemented in this offline build, so they are not claimed here.
export async function openVipThresholds(state){
 const total=state.recharge?.totalGems??0,vip=vipProgress(total);
 await openNativePaper('VIP 特权',`<p>累计充值 ${total} 魔晶，当前 VIP${vip.level}。测试充值不扣真实费用。</p><div class="vip-tier-list">${SOURCE.vip.map(v=>`<article class="${v.level===vip.level?'current-vip':''}"><h3>VIP${v.level} · ${v.needExp} 魔晶</h3><p>牧场经验 +${v.expExtro}%　产金 +${v.goldExtro}%　农场龙粮 +${v.foodExtro}%</p><p>繁殖 -${v.reducebreed}%　孵化 -${v.reducehatch}%　建造 -${v.reducebuilding}%</p><p>竞技每日可购买 ${v.pvpBuyTime} 次${v.pvpNoCD?'，挑战免冷却':''}</p></article>`).join('')}</div><p>以上特权已生效；培养成功率、VIP礼包及其它系统特权仍待接入。</p>`,'nativeVipThresholds');
}
