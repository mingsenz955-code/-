import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {SPECIES} from './data.mjs';
import {dragonArt} from './art.mjs';
import {configuredLineup,dragonPower} from './battle.mjs';
import {openEquipDialog} from './equip-dialog.mjs';
import {formationReplacement,formationPosition,formationDefinition} from './formation.mjs';
export async function openFormationDialog(state,slot=0){
 const lineup=configuredLineup(state),dragon=lineup[slot]??lineup[0];
 if(!dragon)return openFormationPicker(state,0);
 if(!lineup[slot])slot=0;
 await openEquipDialog(state,dragon.id,{formation:true,slot});
}
export async function openFormationPicker(state,slot=0,filter='all'){
 const [layout,card]=await Promise.all([sourceLayout('ui_dragon_list'),sourceLayout('item_dragon_list')]);
 const current=state.formation[slot],actions={close:{type:'formationSlot',id:Math.min(slot,Math.max(0,state.formation.length-1)),label:'返回阵容'}},slots={},checked=new Set([`longzuleixing/${filter}`]);
 for(const element of ['all','e','f','w','p','el','i','m','d','l'])actions[`longzuleixing/${element}`]={type:'formationFilter',value:element,label:element==='all'?'全部':element};
 const choices=state.dragons.filter(d=>filter==='all'||SPECIES[d.species]?.attributes?.[0]===filter).sort((a,b)=>(SPECIES[b.species].quality??0)-(SPECIES[a.species].quality??0)||b.level-a.level||a.id-b.id);
 const cards=choices.map(dragon=>{
  const sp=SPECIES[dragon.species],same=dragon.id===current;let error=null;try{formationReplacement(state,slot,same?null:dragon.id)}catch(e){error=e.message}
  const values={dragon_name:sp.name,dragon_name_shadow:sp.name,level:String(dragon.level),power:String(dragonPower(dragon,state)??0),'battle/miaoshu':same?'下阵':error?(dragon.level<7?'等级不足':'已达限制'):'出战'};
  const slots={icon_dragon:`<div class="formation-picker-model">${dragonArt(dragon.species,'',dragon.level,dragon.wake?.star??0)}</div>`};
  const html=renderSourceLayout(card,{values,slots,actions:{'battle/btn':{type:same?'formationRemove':'formationEnlist',id:dragon.id,label:same?'下阵':`上阵${sp.name}`}},disabled:new Set(error?['battle/btn']:[])});
  return `<article class="formation-picker-card" title="${esc(error??sp.name)}">${html}</article>`;
 }).join('');
 slots.huadong=`<div class="formation-picker-list">${cards}</div>`;
 const d=showSource('sourceFormationPicker',renderSourceLayout(layout,{values:{txt_name:'选择龙'},actions,slots,checked}));d.dataset.formationSlot=String(slot);d.dataset.formationFilter=filter;
}
export async function openFormationPreview(state,selected=null){
 const layout=await sourceLayout('ui_formation_new'),slots={},groups={sky:[],earth:[]};
 for(const dragon of configuredLineup(state))groups[formationPosition(dragon)===1?'sky':'earth'].push(dragon);
 for(const [group,dragons] of Object.entries(groups)){

  dragons.forEach((dragon,i)=>slots[group+(i+1)]=`<button class="formation-preview-model formation-preview-unit${selected===dragon.id?' is-selected':''}" data-action="formationReorder" data-id="${dragon.id}" aria-label="调整${SPECIES[dragon.species].name}阵位">${dragonArt(dragon.species,'',dragon.level,dragon.wake?.star??0).replace('data-clip="breath"','data-clip="breathinbattle"')}</button>`);
 }
 const d=showSource('sourceFormationPreview',renderSourceLayout(layout,{values:{txt_name:'阵型','btn_yes/txt_name':'确定'},slots,actions:{'btn_yes/btn':{type:'formationSlot',id:0,label:'返回阵容'}}})+`<p class="formation-reorder-help">点选两条飞行龙或两条爬行龙交换阵位</p>`);d.dataset.selectedFormationId=selected??'';return d;
}
