import {LOTTERY_MODES,lotteryCost,lotteryPool} from './lottery.mjs';
import {SPECIES,speciesKey} from './data.mjs';
import {dragonArt} from './art.mjs';
import {acceptsDragon,habitatInfo} from './habitats.mjs';
import {renderSourceLayout} from './source-layout.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const layouts=new Map();
async function layout(name){if(!layouts.has(name))layouts.set(name,fetch(`assets/original/layouts/${name}.json`).then(r=>r.json()));return layouts.get(name);}
function openShell(mode,lotteryMode){const dialog=document.querySelector('#modal');if(dialog.open)dialog.close();dialog.className='source-dragon-dialog source-lottery-dialog';dialog.dataset.mode=mode;dialog.dataset.lotteryMode=String(lotteryMode);dialog.style.setProperty('--source-scale',Math.min((innerWidth-20)/1024,(innerHeight-20)/768));return dialog;}
const notice='<p class="lottery-notice">离线基础池：服务器概率、奖励数量待核实；活动抽奖尚未开放。</p>';
export async function openLotteryOptions(){
 const source=await layout('ui_dragonrand_options'),dialog=openShell('sourceLotteryOptions',1);
 const slots={'normal/icon':`<div class="lottery-option-model">${dragonArt(speciesKey(1001),'',7)}</div>`,'pro/icon':`<div class="lottery-option-model">${dragonArt(speciesKey(1041),'',7)}</div>`};
 const actions={close:{type:'close',label:'关闭'},'normal/btn/btn':{type:'openLottery',value:1,label:'普通基础抽奖'},'pro/btn/btn':{type:'openLottery',value:2,label:'高级基础抽奖'}};
 const values={txt_name:'基础抽奖 · 离线版','normal/btn/txt_name':'普通抽奖','pro/btn/txt_name':'高级抽奖','normal/miaoshu':'普通基础池 · 30/次','pro/miaoshu':'高级基础池 · 80/次'};
 dialog.innerHTML=`<div class="source-artboard">${renderSourceLayout(source,{values,slots,actions})}${notice}</div>`;dialog.showModal();
}
export async function openLotteryDialog(state,mode=1){
 const definition=LOTTERY_MODES[mode];if(!definition)throw new Error('未知基础抽奖档位。');
 const source=await layout('ui_dragonrand'),dialog=openShell('sourceLottery',mode);
 const preview=mode===1?[1055,1001,1060,1010,1059,1004,1008,1066]:[1073,1041,1003,1013,1049,1023,1065,1032];
 const values={txt_name:definition.name+' · 离线版',txt_MoJing:state.gems,txt_Card:state.lottery[definition.tokens],'btn_one/txt_name':'抽取1次','btn_one/txt_num':definition.cost,'btn_ten/txt_name':'抽取10次','btn_ten/txt_num':definition.cost*10,'lingqu/txt_name':'领取所有资源','star_up/txt_name':'升星待开放'};
 const slots={card_icon:`<img class="lottery-token-icon" src="assets/original/ui/shangcheng_huobi_k${mode}.png" alt="抽奖币">`,con_oval:`<div class="lottery-preview-pool">${preview.map(id=>`<div>${dragonArt(speciesKey(id),'',7)}<span>${escape(SPECIES[speciesKey(id)].name)}</span></div>`).join('')}</div>`,huadong:`<div class="lottery-pending">${state.lottery.pending.map(prize=>`<button class="lottery-prize" data-action="lotteryPrize" data-id="${prize.id}" aria-label="查看待领取奖励">${prize.type===16?dragonArt(speciesKey(prize.itemId),'',1):`<img src="assets/original/ui/resource_icon_80_${{1:'g',2:'f',3:'c'}[prize.type]}.png" alt="资源">`}<span>${prize.type===16?escape(SPECIES[speciesKey(prize.itemId)].name):'×'+prize.amount}</span></button>`).join('')||'<span>暂无待领取奖励</span>'}</div>`};
 const actions={close:{type:'close',label:'关闭'},fanhui:{type:'lotteryOptions',label:'切换抽奖档位'},tishi:{type:'lotteryHelp',label:'奖池说明'},'btn_one/btn':{type:'lotteryDraw',value:1,label:'抽取1次'},'btn_ten/btn':{type:'lotteryDraw',value:10,label:'抽取10次'},'lingqu/btn':{type:'lotteryClaimResources',label:'领取所有资源'}};
 const disabled=new Set();for(const [count,key] of [[1,'btn_one/btn'],[10,'btn_ten/btn']])if(state.lottery.pending.length+count>30||state.gems<lotteryCost(state.lottery,mode,count).gems)disabled.add(key);
 if(!state.lottery.pending.some(prize=>prize.type!==16))disabled.add('lingqu/btn');
 dialog.innerHTML=`<div class="source-artboard">${renderSourceLayout(source,{values,slots,actions,disabled})}<p class="lottery-count">待领取 ${state.lottery.pending.length}/30 · 总抽取 ${state.lottery.draws}</p>${notice}</div>`;dialog.showModal();
}
export function openLotteryPrize(state,id){
 const prize=state.lottery.pending.find(prize=>prize.id===id);if(!prize)return;
 const dialog=document.querySelector('#modal'),mode=Number(dialog.dataset.lotteryMode??prize.mode);if(dialog.open)dialog.close();dialog.className='lottery-prize-dialog';dialog.dataset.mode='lotteryPrize';dialog.dataset.lotteryMode=String(mode);
 let content;
 if(prize.type===16){const species=speciesKey(prize.itemId);content=`<h2>${escape(SPECIES[species].name)}</h2>${dragonArt(species,'',1)}<p>待安置幼龙 · Lv.1。栖息地满时会继续保留。</p><select id="lottery-habitat">${state.habitats.filter(h=>acceptsDragon(h,species)).map(h=>`<option value="${h.id}">${escape(h.name)} · ${state.dragons.filter(d=>d.habitatId===h.id).length}/${habitatInfo(h).capacity}</option>`).join('')}</select><button class="primary" data-action="lotteryPlace" data-id="${id}">安置幼龙</button>`;}
 else content=`<h2>${{1:'金币',2:'食物',3:'魔晶'}[prize.type]} × ${prize.amount}</h2><p>领取全部资源奖励，幼龙留在待领取栏。</p><button class="primary" data-action="lotteryClaimResources">领取所有资源</button>`;
 dialog.innerHTML=`<button class="small close" data-action="returnLottery">返回抽奖</button>${content}<p class="muted">本次结果已保存，关闭或重启不会重抽。</p>`;dialog.showModal();
}
export function lotteryHelp(){return '单抽/十连优先扣对应抽奖币，不足部分用魔晶补齐。待领取栏30格，资源需领取，幼龙需安置。\n\n离线抽取使用客户端表的第7列累计数值和第5/6列数量范围；该解释与服务器真实概率、数量尚未核实。无虚构免费次数、保底或活动奖池。\n基础池记录：普通'+lotteryPool(1).length+'行，高级'+lotteryPool(2).length+'行。';}
