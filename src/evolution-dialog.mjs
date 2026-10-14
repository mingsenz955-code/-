import {SPECIES} from './data.mjs';
import {evolutionRequirements} from './evolution.mjs';
import {EVOLUTION_TEXT} from '../assets/original/data/evolution.mjs';
import {dragonArt} from './art.mjs';
import {renderSourceLayout} from './source-layout.mjs';
let layoutPromise;
export async function openEvolutionDialog(state,id,{returnToCollection=false}={}){
 const dragon=state.dragons.find(d=>d.id===id);if(!dragon)return;
 const species=SPECIES[dragon.species],info=evolutionRequirements(species.originalId);
 if(!info)throw new Error('该龙的原版进化条件尚未取得。');
 layoutPromise??=fetch('assets/original/layouts/ui_dragon_evolution.json').then(r=>r.json());
 const layout=await layoutPromise,dialog=document.querySelector('#modal');if(dialog.open)dialog.close();
 dialog.className='source-dragon-dialog source-evolution-dialog';dialog.dataset.mode='sourceEvolution';dialog.dataset.dragonId=id;dialog.dataset.returnToCollection=String(returnToCollection);
 const cost=info.costs,values={dragon_name:species.name,evo_rank:EVOLUTION_TEXT['ev.Evolution: Lv.#0#'].replace('#0#','0'),res_string_g:state.coins.toLocaleString('zh-CN'),res_string_f:state.food.toLocaleString('zh-CN'),res_string_sp:'—',progress_text:'0 / '+info.cap,evolution_note:dragon.level<info.minLevel?EVOLUTION_TEXT['ev.level lock 1']:'突破结算核对中'};
 for(const name of ['power','health','attack','defense','crit','uncrit']){values[name+'_oi']='—';values[name+'_to']='—';}
 const requirements=[['g',state.coins,cost.coins],['f',state.food,cost.food],['ef',null,cost.evolutionFruit],['lf',null,cost.holyFruit]].filter(([, ,need])=>need>0);
 const slots={};
 const actions={back:{type:'returnFromEvolution',id,label:'返回喂养'},close:{type:'returnFromEvolution',id,label:'返回喂养'},tip:{type:'evolutionHelp',id,label:'进化说明'}};
 const visit=(nodes,path='')=>{for(const node of nodes){const key=path?path+'/'+(node.name??''):node.name??'';
  if(node.name==='dragon_slot')slots[key]=`<div class="source-evolution-model">${dragonArt(dragon.species,'',25)}</div>`;
  for(let i=1;i<=3;i++){
   if(node.name==='res_slot_'+i&&requirements[i-1])slots[key]=`<img class="source-evolution-resource" src="assets/original/ui/resource_icon_80_${requirements[i-1][0]}.png" alt="">`;
   if(node.name==='res_slot_'+i+'_txt'){const requirement=requirements[i-1];values[node.name]=requirement?`${requirement[1]??'—'}/${requirement[2]}`:'';}
  }
  visit(node.children??[],key);
 }};visit(layout.children);
 const scale=Math.min((innerWidth-20)/1024,(innerHeight-20)/768);dialog.style.setProperty('--source-scale',scale);
 dialog.innerHTML=`<div class="source-artboard">${renderSourceLayout(layout,{values,slots,actions,translate:text=>EVOLUTION_TEXT[text]??text})}<p class="evolution-preview-note">条件预览：果实库存、突破结算尚未接入，暂不消耗材料。</p></div>`;dialog.showModal();
}
