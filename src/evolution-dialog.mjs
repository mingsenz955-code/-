import {SPECIES} from './data.mjs';
import {evolutionPlan} from './evolution.mjs';
import {dragonAttributes,dragonPower} from './battle.mjs';
import {isBreedingParent} from './game.mjs';
import {EVOLUTION_TEXT} from '../assets/original/data/evolution.mjs';
import {dragonArt} from './art.mjs';
import {renderSourceLayout} from './source-layout.mjs';
let layoutPromise;
const short=n=>n>=10000?Math.floor(n/10000)+'w':String(n);
export async function openEvolutionDialog(state,id,{returnToCollection=false}={}){
 const dragon=state.dragons.find(d=>d.id===id);if(!dragon)return;
 const species=SPECIES[dragon.species],info=evolutionPlan(state,id,species.originalId);
 if(!info)throw new Error('该龙的原版进化条件尚未取得。');
 layoutPromise??=fetch('assets/original/layouts/ui_dragon_evolution.json').then(r=>r.json());
 const layout=await layoutPromise,dialog=document.querySelector('#modal');if(dialog.open)dialog.close();
 dialog.className='source-dragon-dialog source-evolution-dialog';dialog.dataset.mode='sourceEvolution';dialog.dataset.dragonId=id;dialog.dataset.returnToCollection=String(returnToCollection);
 const values={dragon_name:species.name,evo_rank:EVOLUTION_TEXT['ev.Evolution: Lv.#0#'].replace('#0#',String(info.phase)),res_string_g:state.coins.toLocaleString('zh-CN'),res_string_f:state.food.toLocaleString('zh-CN'),res_string_sp:String(state.items[7028]??0),progress_text:info.max?'100 / 100':`${info.value} / ${info.cap}`,evolution_note:info.max?EVOLUTION_TEXT['ev.level lock 3']:dragon.level<info.minLevel?`小龙${info.minLevel}级开启${info.phase+1}阶进化`:''};
 const after={...dragon,evolution:{phase:Math.min(2,info.phase+1),value:0}},current=dragonAttributes(dragon,state),next=dragonAttributes(after,state);
 for(const [name,key] of [['health','life'],['attack','attack'],['defense','defend'],['crit','crit'],['uncrit','uncrit']]){values[name+'_oi']=current?.[key]??'—';values[name+'_to']=info.max?'MAX':next?.[key]??'—';}
 values.power_oi=dragonPower(dragon,state);values.power_to=info.max?'MAX':dragonPower(after,state);
 const requirements=info.costs.map(c=>[c.key==='coins'?'g':c.key==='food'?'f':c.key,c.held,c.need]);
 const slots={};
 const actions={back:{type:'returnFromEvolution',id,label:'返回喂养'},close:{type:'returnFromEvolution',id,label:'返回喂养'},tip:{type:'evolutionHelp',id,label:'进化说明'},evolution_btn:{type:'evolveDragon',id,label:'突破进化'},buy_gold:{type:'evolutionResources',value:'g',label:'获取金币'},buy_food:{type:'evolutionResources',value:'f',label:'获取食物'},buy_fruit:{type:'arenaExchangeList',label:'兑换神圣果实'}};
 const visit=(nodes,path='')=>{for(const node of nodes){const key=path?path+'/'+(node.name??''):node.name??'';
  if(node.name==='dragon_slot')slots[key]=`<div class="source-evolution-model">${dragonArt(dragon.species,'',25,dragon.wake?.star??0)}</div>`;
  if(node.name==='progress_root')slots[key]=`<img src="assets/original/ui/ui_main_X_JinDu2.png" style="position:absolute;left:-147px;top:-9px;width:294px;height:18px;clip-path:inset(0 ${100-(info.max?100:info.value/info.cap*100)}% 0 0)" alt="进化进度">`;
  for(let i=1;i<=3;i++){
   if(node.name==='res_slot_'+i&&requirements[i-1])slots[key]=`<img class="source-evolution-resource" src="assets/original/ui/resource_icon_80_${requirements[i-1][0]}.png" alt="">`;
   if(node.name==='res_slot_'+i+'_txt'){const requirement=requirements[i-1];values[node.name]=requirement?`${short(requirement[1])}/${short(requirement[2])}`:'';}
  }
  visit(node.children??[],key);
 }};visit(layout.children);
 const scale=Math.min((innerWidth-20)/1024,(innerHeight-20)/768);dialog.style.setProperty('--source-scale',scale);
 dialog.innerHTML=`<div class="source-artboard">${renderSourceLayout(layout,{values,slots,actions,hidden:new Set(info.max?['req_1','req_2','req_3']:requirements.length<3?['req_3']:[]),disabled:new Set(info.error||isBreedingParent(state,id)?['evolution_btn']:[]),translate:text=>EVOLUTION_TEXT[text]??text})}</div>`;dialog.showModal();
}
