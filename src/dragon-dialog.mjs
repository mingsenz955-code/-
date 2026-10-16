import {dragonStars} from './dragon-stars.mjs';
import {dragonSkillSlots} from './dragon-skill-ui.mjs';
import {dragonAttributes,dragonPower} from './battle.mjs';
import {SPECIES} from './data.mjs';
import {feedCost,dragonRate,isBreedingParent} from './game.mjs';
import {dragonLevelCap,dragonLevelHint} from './dragon-levels.mjs';
import {dragonArt} from './art.mjs';
import {renderSourceLayout} from './source-layout.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let layoutPromise;
export async function openDragonDialog(state,id,{returnToCollection=false}={}){const d=state.dragons.find(d=>d.id===id);if(!d)return;layoutPromise??=fetch('assets/original/layouts/ui_dragon.json').then(r=>r.json());const layout=await layoutPromise,sp=SPECIES[d.species],busy=isBreedingParent(state,id),dialog=document.querySelector('#modal');if(dialog.open)dialog.close();dialog.style.removeProperty('width');dialog.style.removeProperty('height');dialog.className='source-dragon-dialog';dialog.dataset.mode='sourceDragon';dialog.dataset.dragonId=id;dialog.dataset.returnToCollection=String(returnToCollection);
 const values={txt_name:'喂养',txt_dragonname:sp.name,long_name:sp.name,zhongzu:'种族：',xingji:'类型：',xibie:sp.rarity,shuxing:'属性：',chanchu:'产出：','ziyuanchanchu/gold':dragonRate(d)+'/分钟','ziyuanchanchu/baifenbi':'',lv_miaoshu:'等级：',txt_ShiWu:state.food.toLocaleString('zh-CN'),'weishi/txt_name':'喂食','weishi/txt_name_t':feedCost(d),'weishi_vip/txt_name':'一键喂食','yidong/txt_name':'移动','chushou/txt_name':'出售',teshumiaoshu:busy?'亲代正在培育山，繁殖结束后可以喂养。':d.level>=dragonLevelCap(state)?dragonLevelHint(state):'',evolution_dsp:'进化条件'};
 const stats=dragonAttributes(d,state),numbers={shengming:stats?.life,gongji:stats?.attack,fangyu:stats?.defend,kangxing:stats?.uncrit,baoji:stats?.crit,pingding:dragonPower(d,state)};
 const labels={shengming:'生命：',gongji:'攻击：',fangyu:'防御：',kangxing:'免暴：',baoji:'暴击：',pingding:'战斗力：'};
 for(const [key,label] of Object.entries(labels)){values[key+'/miaoshu']=label;values[key+'/shuzi']=numbers[key]??'—';values[key+'/fujia']=''}
 const slots={icon:`<div class="source-dragon-model">${dragonArt(d.species,'',d.level,d.wake?.star??0)}</div>`,lv:`<span class="source-level">Lv.${d.level}</span>`};
 Object.assign(slots,dragonSkillSlots(state,d));
 for(let i=1;i<=3;i++)slots['con_shuxing'+i]=sp.attributes?.[i-1]?`<img class="source-element" src="assets/original/ui/shangcheng_long_shuxing_${sp.attributes[i-1]}.png" alt="${escape(sp.element)}">`:'';
 const actions={'chushou/btn':{type:'confirmSellDragon',id,label:'出售幼龙'},evolution_entry:{type:'openEvolution',id,label:'进化条件'},close:{type:returnToCollection?'returnCollection':'close',label:'关闭喂养'},'weishi/btn':{type:'feed',id,label:'喂食'},'weishi_vip/btn':{type:'feedAll',id,label:'一键喂食'},'yidong/btn':{type:'dragonMove',id,label:'移动幼龙'},btn_ShiWu:{type:'farm',label:'种植龙粮'}};
 const disabled=new Set(busy||d.level>=dragonLevelCap(state)||state.food<feedCost(d)?['weishi/btn','weishi_vip/btn']:[]);if(busy)disabled.add('yidong/btn');
 const scale=Math.min((innerWidth-20)/1024,(innerHeight-20)/768);dialog.style.setProperty('--source-scale',scale);dialog.innerHTML=`<div class="source-artboard">${renderSourceLayout(layout,{values,slots,actions,disabled,hidden:new Set(['evolution_entry_di']),progress:{'jindu/tianchong':(d.feedsInLevel??0)/4*100}})}</div>`;dialog.querySelector('.source-artboard').insertAdjacentHTML('beforeend',`<div class="dragon-growth-entry"><span>${dragonStars(d)} 星</span><button class="native-game-button" data-action="openDragonStar" data-id="${id}">升星</button><button class="native-game-button" data-action="dragonMutationHelp" data-id="${id}">变异获取</button></div>`);dialog.showModal();
}
