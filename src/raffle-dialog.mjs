import CATALOG from '../assets/original/catalog.mjs';
import {RAFFLE_PREVIEW_ROWS} from '../assets/original/data/raffle.mjs';
import {ORIGINAL_EGGS} from '../assets/original/data/eggs.mjs';
import {RAFFLE_GUARANTEE_DRAWS,raffleCost} from './raffle.mjs';
import EFFECTS from '../assets/original/effects/index.mjs';
import {renderSourceLayout} from './source-layout.mjs';
let layoutPromise,previewPromise,itemPromise,resultPromise;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Later mobile raffle UI is a different system from the old Dragonrand table.
// Never charge its prices while sampling the unrelated legacy pool.
export async function openRaffleDialog(state){
 layoutPromise??=fetch('assets/original/layouts/ui_lottery_dragon.json').then(r=>r.json());
 const layout=structuredClone(await layoutPromise),dialog=document.querySelector('#modal');if(dialog.open)dialog.close();
 dialog.className='source-dragon-dialog source-raffle-dialog';dialog.dataset.mode='sourceRaffle';
 // Ticket counts, the 必得紫/橙 countdown and the junior 0/10 prices come from the save
 // and from the machine definitions; free state and cooldown remain server-side.
 const tickets=state.raffle?.tickets??{},counters=state.raffle?.counters??{},held=id=>String(tickets[id]??0);
 const slots={},values={txt_name:'扭蛋机','btn_yulan/txt_name':'奖品预览','btn_jiyin/txt_name':'基因中心','ziyuan_daijuan/num_chuji':held(6047),'ziyuan_daijuan/num_zhongji':held(6048),'ziyuan_daijuan/num_gaoji':held(6049),'ziyuan_mojing/num_mojing':state.gems,'chuji/money/num_one':'0','chuji/money/num_ten':'10','zhongji/money/num_one':(tickets[6048]??0)>0?'1':'100','zhongji/money/num_ten':(tickets[6048]??0)>0?'10':'900','gaoji/money/num_one':(tickets[6049]??0)>0?'1':'280','gaoji/money/num_ten':(tickets[6049]??0)>0?'10':'2500','zhongji/Countdown/num':String(RAFFLE_GUARANTEE_DRAWS-(counters.mid??0)),'gaoji/Countdown/num':String(RAFFLE_GUARANTEE_DRAWS-(counters.senior??0)),'chuji/free':'','zhongji/free':'','gaoji/free':''};
 const actions={close:{type:'close',label:'关闭扭蛋机'},'btn_yulan/btn':{type:'rafflePreview',label:'奖品预览'},'btn_jiyin/btn':{type:'raffleUnverified',label:'基因中心'}};
 for(const [i,node] of ['chuji','zhongji','gaoji'].entries()){
  const key='eff_choujiangji'+(i+1),bounds=EFFECTS[key].bounds,w=bounds[2]-bounds[0],h=bounds[3]-bounds[1];
  slots[`${node}/bg_eff_choujiangji${i+1}`]=`<canvas class="source-raffle-machine" width="${w}" height="${h}" data-model="${key}" data-clip="1" data-native-size="true" style="width:${w}px;height:${h}px;transform:translate(${bounds[0]}px,${bounds[1]}px)" aria-label="${['初级','中级','高级'][i]}扭蛋机"></canvas>`;
  // Machine keys here match the client's own junior/mid/senior naming in the save.
  for(const [suffix,count] of [['one',1],['ten',10]])actions[`${node}/${suffix}/btn`]={type:'raffleDraw',value:`${['junior','mid','senior'][i]}:${count}`,label:`${['初级','中级','高级'][i]}抽${count}次`};
 }
 // The client shows ticket icons and 1/10 while any matching tickets remain.
 // With no ticket it swaps the same two positions to gems and shows 100/900 or 280/2500.
 for(const node of layout.children)if((node.name==='zhongji'&&(tickets[6048]??0)===0)||(node.name==='gaoji'&&(tickets[6049]??0)===0))for(const group of node.children??[])if(group.name==='money')for(const image of group.children??[])if(image.name?.startsWith('daijuan_'))image.img='#ui_lotterydragon_mojing.png';
 const scale=Math.min((innerWidth-20)/1024,(innerHeight-20)/770);dialog.style.setProperty('--source-scale',scale);
 dialog.innerHTML=`<div class="source-artboard">${renderSourceLayout(layout,{values,slots,actions,hidden:new Set(['txt1','zhongji/money/mojing_one','zhongji/money/mojing_ten','gaoji/money/mojing_one','gaoji/money/mojing_ten'])})}</div>`;dialog.showModal();
}

export async function playRaffleDraw(mode){
 const index={junior:1,mid:2,senior:3}[mode],dialog=document.querySelector('#modal');
 const canvas=dialog?.querySelector(`canvas[data-model="eff_choujiangji${index}"]`);if(!canvas)return false;
 canvas.dataset.clip='2';canvas.dataset.replay=String(Number(canvas.dataset.replay??0)+1);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){canvas.dataset.clip='1';return dialog.open&&canvas.isConnected}
 return new Promise(resolve=>{const started=performance.now();const finish=kept=>{if(canvas.isConnected){canvas.dataset.clip='1';canvas.dataset.replay=String(Number(canvas.dataset.replay??0)+1)}resolve(kept)};const frame=now=>{if(!dialog.open||!canvas.isConnected)return finish(false);if(now-started>=1000)return finish(true);requestAnimationFrame(frame)};requestAnimationFrame(frame)});
}

export async function openRaffleResult(state,results,mode,count){
 resultPromise??=fetch('assets/original/layouts/panel_dragon_lottery_effect.json').then(r=>r.json());
 const layout=structuredClone(await resultPromise),dialog=document.querySelector('#modal'),byId=new Map(CATALOG.map(d=>[d.id,d]));
 if(dialog.open)dialog.close();dialog.className='source-dragon-dialog source-raffle-dialog';dialog.dataset.mode='sourceRaffleResult';
 let cost=null;try{cost=raffleCost(state.raffle,mode,count)}catch{}
 const useTicket=cost&&cost.tickets===count,costValue=useTicket?count:cost?.gems??0,machineIndex={junior:1,mid:2,senior:3}[mode];
 const actions={'quit/btn_yes/btn':{type:'returnRaffle',label:'确定'},'quit/btn_too/btn':{type:'raffleAgain',value:`${mode}:${count}`,label:'再来一次'}};
 const hidden=new Set();if(!cost)hidden.add('quit/btn_too');
 const values={'quit/num':String(costValue),'quit/btn_too/miaoshu':'再来一次','quit/btn_yes/miaoshu':'确    定'};
 const ticket=`#ui_lotterydragon_daijuan${machineIndex}.png`;for(const node of layout.children)if(node.name==='quit')for(const child of node.children??[])if(child.name==='icon')child.img=useTicket?ticket:'#ui_lotterydragon_mojing.png';
 const colors={1:'#f6f6f6',2:'#00fe30',3:'#00a8ff',4:'#d33bff',5:'#fead00'};
 const eggs=results.map((result,i)=>{const dragon=byId.get(result.dragonId),x=results.length===1?0:(i%5)*125-250,y=results.length===1?0:-Math.floor(i/5)*150+80,image=ORIGINAL_EGGS[result.dragonId]??dragon?.images[1];return `<div class="raffle-result-egg" style="left:calc(50% + ${x}px);top:calc(50% - ${y}px);--result-delay:${i*90}ms"><img src="${escape(image??'')}" alt="${escape(dragon?.name??'龙蛋')}"><span style="color:${colors[result.quality]??'#fff'}">${escape(dragon?.name??`原ID ${result.dragonId}`)}</span></div>`}).join('');
 const scale=Math.min((innerWidth-20)/1024,(innerHeight-20)/768);dialog.style.setProperty('--source-scale',scale);
 dialog.innerHTML=`<div class="source-artboard">${renderSourceLayout(layout,{values,actions,hidden})}<div class="raffle-result-eggs">${eggs}</div></div>`;dialog.showModal();
}

export async function openRafflePreview(){
 const dialog=document.querySelector('#modal');if(dialog.querySelector('.raffle-preview-layer'))return;
 previewPromise??=fetch('assets/original/layouts/panel_lottery_dragon_show.json').then(r=>r.json());itemPromise??=fetch('assets/original/layouts/item_lottery_dragon_show.json').then(r=>r.json());
 const [preview,item]=await Promise.all([previewPromise,itemPromise]),byId=new Map(CATALOG.map(d=>[d.id,d]));
 const cards=RAFFLE_PREVIEW_ROWS.map(([index,id,quality])=>{const dragon=byId.get(id),image=dragon?.images[1],color=['','#000','#00ff00','#00a8ff','#d33bff','#fead00'][quality];return `<div class="raffle-preview-card" data-raffle-preview-id="${id}" style="--prize-color:${color}">${renderSourceLayout(item,{values:{txt_name:dragon?.name??'原ID '+id},hidden:new Set(['add']),slots:{xiangkuang:`<img class="raffle-preview-frame" src="assets/original/ui/ui_daojukuang_DaoJuKuang${quality}.png" alt="">`,icon:image?`<img class="raffle-preview-icon" src="${escape(image)}" alt="${escape(dragon.name)}">`:'<span class="raffle-missing-icon">图像待补</span>'}})}</div>`}).join('');
 dialog.dataset.mode='sourceRafflePreview';dialog.querySelector('.source-artboard').insertAdjacentHTML('beforeend',`<div class="raffle-preview-shade"></div><div class="raffle-preview-layer">${renderSourceLayout(preview,{values:{txt_name:'奖品预览'},actions:{close:{type:'closeRafflePreview',label:'关闭奖品预览'}},slots:{huadong:`<div class="raffle-preview-list">${cards}</div>`}})}</div>`);
}
export function closeRafflePreview(){const dialog=document.querySelector('#modal');dialog.querySelector('.raffle-preview-shade')?.remove();dialog.querySelector('.raffle-preview-layer')?.remove();dialog.dataset.mode='sourceRaffle';}
