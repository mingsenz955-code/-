import {mutationEvent,mutationChance,activeMutations} from './mutation-events.mjs';
import {sourceLayout,showSource,esc,nativeButton} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {activityPrizeInfo} from './historical-activities.mjs';
let revision=0;
export const mutationCountdown=(at,now=Date.now())=>{const n=Math.max(0,Math.ceil((at-now)/1000));return [Math.floor(n/3600),Math.floor(n/60)%60,n%60].map(v=>String(v).padStart(2,'0')).join(':');};
export function updateMutationTimers(s,now=Date.now()){
 for(const el of document.querySelectorAll('[data-mutation-expires]'))el.textContent=mutationCountdown(Number(el.dataset.mutationExpires),now);
 for(const button of document.querySelectorAll('[data-action=claimMutation]')){const e=s.mutations.events.find(e=>e.id===Number(button.dataset.id));button.disabled=!e||e.expiresAt<=now;}
 const entry=document.querySelector('.mutation-hud-entry'),count=activeMutations(s,now).length;if(entry){entry.hidden=!count;entry.setAttribute('aria-label',`奇遇 ${count}个`);}
}
export async function openMutations(s,id){
 const ticket=++revision,now=Date.now(),events=activeMutations(s,now),ev=events.find(e=>e.id===id)??events[0],[layout,button]=await Promise.all(['panel_random','item_random_btn'].map(sourceLayout));
 const slots={},actions={close:{type:'close',label:'关闭奇遇'},help:{type:'mutationHelp',id:ev?.id,label:'奇遇说明'}};
 if(ev){const info=mutationEvent(ev.tableId),item=await sourceLayout(info.evType===1?'item_random_buy':'item_random_gift'),p=activityPrizeInfo(info),op=info.evType===1?'buy':'receive';
 slots.event=renderSourceLayout(item,{values:{time:mutationCountdown(ev.expiresAt,now),item_name:info.name,'item/txt_num':'×'+info.amount,hint:info.description,price:info.price},slots:{'item/icon_long':`<img class="mutation-prize" src="${esc(p.image)}" alt="${esc(info.name)}">`},actions:{[op+'/btn']:{type:'claimMutation',id:ev.id,label:info.evType===1?'购买':'领取'}}});
 }else slots.event=`<div class="mutation-empty"><p>暂无进行中的奇遇</p><p>培育完成后有机会触发奇遇，龙蛋奖励在仓库使用。</p><div>${nativeButton('前往培育','openBreed')}${nativeButton('查看仓库','openWarehouse')}</div></div>`;
 slots.huadong=`<div class="mutation-event-list">${events.map(e=>{const info=mutationEvent(e.tableId);return `<button class="mutation-event-tab" data-action="openMutations" data-id="${e.id}" aria-label="${esc(info.name)}" aria-pressed="${e.id===ev?.id}">${renderSourceLayout(button,{values:{time:mutationCountdown(e.expiresAt,now)},hidden:new Set(e.id===ev?.id?[]:['hint']),slots:{icon:`<img class="mutation-tab-icon" src="assets/original/ui/ui_randombtn_btn_${info.evType===1?'batch':'package'}.png" alt="${info.evType===1?'购买':'领取'}奇遇">`}})}</button>`;}).join('')}</div>`;
 if(ticket!==revision)return;const dialog=showSource('sourceMutations',renderSourceLayout(layout,{slots,actions}));dialog.dataset.mutationId=ev?.id??'';
 const time=dialog.querySelector('[data-source="event"] [data-source=time]');if(time)time.dataset.mutationExpires=ev.expiresAt;
 for(const tab of dialog.querySelectorAll('.mutation-event-tab'))tab.querySelector('[data-source=time]').dataset.mutationExpires=events.find(e=>e.id===Number(tab.dataset.id)).expiresAt;
 updateMutationTimers(s);return dialog;
}
export async function openMutationHelp(s,id){
 const layout=await sourceLayout('panel_msg_act'),dialog=showSource('sourceMutationHelp',renderSourceLayout(layout,{values:{txt_name:'奇遇说明','btn_QueDing/txt_name':'返回'},hidden:new Set(['txt']),slots:{huadong:`<div class="source-activity-help-scroll"><p>1、两龙交配时间大于1小时，有概率触发奇遇事件。<br>2、原版说明提到VIP提升触发概率；本机按你的设定统一为50%。<br>3、培育出紫色品质龙有概率触发变异龙奇遇事件。<br>4、只保留5个事件，触发第6个替换最早的奇遇。</p><p>购买与领取在各奇遇倒计时内完成；变异龙蛋获得后在仓库送入育龙塔孵化。当前客户端配置共14种奇遇：10种变异龙蛋、食物赠送、魔晶赠送、培养丹特惠、强化石特惠。</p><p>服务器触发概率未取得。本机规则：完成符合条件的培育后判定一次，固定概率${Math.round(mutationChance(s)*100)}%（按玩家设定，各VIP等级一致）。立即完成保留加速前时长，倒计时从培育完成时间起算；离线超过有效期的事件不补发。这不是原服务器概率。</p></div>`},actions:{btn_close:{type:'openMutations',id,label:'返回奇遇'},'btn_QueDing/btn':{type:'openMutations',id,label:'返回奇遇'}}}));dialog.dataset.mutationId=id??'';return dialog;
}
