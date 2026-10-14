import CATALOG from '../assets/original/catalog.mjs';
import {RAFFLE_PREVIEW_ROWS} from '../assets/original/data/raffle.mjs';
import EFFECTS from '../assets/original/effects/index.mjs';
import {renderSourceLayout} from './source-layout.mjs';
let layoutPromise,previewPromise,itemPromise;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Later mobile raffle UI is a different system from the old Dragonrand table.
// Never charge its prices while sampling the unrelated legacy pool.
export async function openRaffleDialog(state){
 layoutPromise??=fetch('assets/original/layouts/ui_lottery_dragon.json').then(r=>r.json());
 const layout=structuredClone(await layoutPromise),dialog=document.querySelector('#modal');if(dialog.open)dialog.close();
 dialog.className='source-dragon-dialog source-raffle-dialog';dialog.dataset.mode='sourceRaffle';
 const slots={},values={txt_name:'扭蛋机','btn_yulan/txt_name':'奖品预览','btn_jiyin/txt_name':'基因中心','ziyuan_daijuan/num_chuji':'—','ziyuan_daijuan/num_zhongji':'—','ziyuan_daijuan/num_gaoji':'—','ziyuan_mojing/num_mojing':state.gems,'chuji/money/num_one':'1','chuji/money/num_ten':'10','zhongji/money/num_one':'100','zhongji/money/num_ten':'900','gaoji/money/num_one':'280','gaoji/money/num_ten':'2500','zhongji/Countdown/num':'?','gaoji/Countdown/num':'?','chuji/free':'','zhongji/free':'','gaoji/free':''};
 const actions={close:{type:'close',label:'关闭扭蛋机'},'btn_yulan/btn':{type:'rafflePreview',label:'奖品预览'},'btn_jiyin/btn':{type:'raffleUnverified',label:'基因中心'}};
 for(const [i,node] of ['chuji','zhongji','gaoji'].entries()){
  const key='eff_choujiangji'+(i+1),bounds=EFFECTS[key].bounds,w=bounds[2]-bounds[0],h=bounds[3]-bounds[1];
  slots[`${node}/bg_eff_choujiangji${i+1}`]=`<canvas class="source-raffle-machine" width="${w}" height="${h}" data-model="${key}" data-clip="1" data-native-size="true" style="width:${w}px;height:${h}px;transform:translate(${bounds[0]}px,${bounds[1]}px)" aria-label="${['初级','中级','高级'][i]}扭蛋机"></canvas>`;
  for(const count of ['one','ten'])actions[`${node}/${count}/btn`]={type:'raffleUnverified',label:`${['初级','中级','高级'][i]}抽${count==='one'?1:10}次`};
 }
 // Original code swaps the middle/high currency sprites to gems with no tickets.
 for(const node of layout.children)if(['zhongji','gaoji'].includes(node.name))for(const group of node.children??[])if(group.name==='money')for(const image of group.children??[])if(image.name?.startsWith('daijuan_'))image.img='#ui_lotterydragon_mojing.png';
 const scale=Math.min((innerWidth-20)/1024,(innerHeight-20)/770);dialog.style.setProperty('--source-scale',scale);
 dialog.innerHTML=`<div class="source-artboard">${renderSourceLayout(layout,{values,slots,actions,hidden:new Set(['txt1','zhongji/money/mojing_one','zhongji/money/mojing_ten','gaoji/money/mojing_one','gaoji/money/mojing_ten'])})}</div>`;dialog.showModal();
}

export async function openRafflePreview(){
 const dialog=document.querySelector('#modal');if(dialog.querySelector('.raffle-preview-layer'))return;
 previewPromise??=fetch('assets/original/layouts/panel_lottery_dragon_show.json').then(r=>r.json());itemPromise??=fetch('assets/original/layouts/item_lottery_dragon_show.json').then(r=>r.json());
 const [preview,item]=await Promise.all([previewPromise,itemPromise]),byId=new Map(CATALOG.map(d=>[d.id,d]));
 const cards=RAFFLE_PREVIEW_ROWS.map(([index,id,quality])=>{const dragon=byId.get(id),image=dragon?.images[1],color=['','#000','#00ff00','#00a8ff','#d33bff','#fead00'][quality];return `<div class="raffle-preview-card" data-raffle-preview-id="${id}" style="--prize-color:${color}">${renderSourceLayout(item,{values:{txt_name:dragon?.name??'原ID '+id},hidden:new Set(['add']),slots:{xiangkuang:`<img class="raffle-preview-frame" src="assets/original/ui/ui_daojukuang_DaoJuKuang${quality}.png" alt="">`,icon:image?`<img class="raffle-preview-icon" src="${escape(image)}" alt="${escape(dragon.name)}">`:'<span class="raffle-missing-icon">图像待补</span>'}})}</div>`}).join('');
 dialog.dataset.mode='sourceRafflePreview';dialog.querySelector('.source-artboard').insertAdjacentHTML('beforeend',`<div class="raffle-preview-shade"></div><div class="raffle-preview-layer">${renderSourceLayout(preview,{values:{txt_name:'奖品预览'},actions:{close:{type:'closeRafflePreview',label:'关闭奖品预览'}},slots:{huadong:`<div class="raffle-preview-list">${cards}</div>`}})}</div>`);
}
export function closeRafflePreview(){const dialog=document.querySelector('#modal');dialog.querySelector('.raffle-preview-shade')?.remove();dialog.querySelector('.raffle-preview-layer')?.remove();dialog.dataset.mode='sourceRaffle';}
