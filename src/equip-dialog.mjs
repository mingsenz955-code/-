import {runeOfDragon,runeDefinition,runeIcon,runeSkill} from './runes.mjs';
import {formationCounts} from './formation.mjs';
import {dragonAttributes,dragonPower,configuredLineup} from './battle.mjs';
import {SPECIES} from './data.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {dragonArt} from './art.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {EQUIPMENT_SLOTS_LAYOUT,EQUIPMENT_PROPERTIES,equipmentCatalog,equipmentDefinition,equipmentIcon,equipmentEmptyIcon,equipmentGradeText,equipmentOfDragon,equipmentInPart,equipmentBonus,equipmentLabel,definitionPart,equipmentEnhancePlan,EQUIPMENT_MATERIAL_NAMES} from './equipment.mjs';

const PART_LABELS=['武器','鳞片','龙骨','龙角','羽翼','皇冠'];
const QUALITY_LABELS=['','白','绿','蓝','紫','橙'];
// EquipSelecter/DragonInfor print the tier as "+grade-1"; nothing in the shipped source
// proves that exp or star already feed those printed numbers.
const stars=count=>count>0?'★'.repeat(count):'';
const attributeRows=definition=>[['攻击',definition.atk],['防御',definition.def],['生命',definition.hp],['抗性',definition.resist],['抗暴',definition.antResist]].filter(([,value])=>value>0);
const portraitOf=species=>{const record=CATALOG.find(entry=>entry.id===SPECIES[species].originalId);return record?.images?.[1]??record?.images?.[0]??null};
const otherOwner=(state,instance)=>state.dragons.find(d=>d.id===instance.dragonid)??null;

function slotContent(instance,part){
 if(!instance)return `<button class="source-equip-slot source-equip-slot-empty" data-action="equipChange" data-id="${part}" aria-label="${PART_LABELS[part]}空槽"><img src="${equipmentEmptyIcon(part)}" alt=""></button>`;
 return `<button class="source-equip-slot" data-action="openEquipInfo" data-id="${instance.id}" aria-label="${esc(equipmentLabel(instance))}"><img src="${equipmentIcon(equipmentDefinition(instance.type))}" alt=""></button>`;
}

function dragonCell(layout,dragon,active){
 const species=SPECIES[dragon.species],portrait=portraitOf(dragon.species);
 return `<button class="source-equip-dragon${active?' is-active':''}" data-action="openEquip" data-id="${dragon.id}" aria-label="${esc(species.name)} Lv.${dragon.level}">${renderSourceLayout(layout,{values:{tx_lv:String(dragon.level)},hidden:new Set(active?[]:['selected','biaoji']),slots:{icon:portrait?`<img class="source-equip-portrait" src="${esc(portrait)}" alt="">`:'<span class="source-equip-portrait-missing">缺图</span>'}})}</button>`;
}

// Original 阵容 page (ui_formation_info). It is where the shipped client shows a dragon's
// six equipment slots plus its four skill slots; the left column is the owned-dragon
// list and the middle card is the dragon itself.
export async function openEquipDialog(state,dragonId,{returnToDragon=false,formation=false,slot=0}={}){
 const dragon=state.dragons.find(d=>d.id===dragonId)??state.dragons[0];
 if(!dragon)throw new Error('牧场里还没有可以查看的龙。');
 const [layout,listItem]=await Promise.all([sourceLayout('ui_formation_info'),sourceLayout('item_star_up_touxiang_dengji')]);
 const species=SPECIES[dragon.species],worn=equipmentOfDragon(state,dragon.id),bonus=equipmentBonus(worn);
 const values={txt_name:'阵容'},slots={},actions={},hidden=new Set(['hint_up','hint_down','type_sky','type_land']);
 for(const {node,part} of EQUIPMENT_SLOTS_LAYOUT){
  const instance=equipmentInPart(worn,part),definition=instance?equipmentDefinition(instance.type):null;
  values['right/'+node+'/txt_name']=definition?definition.name:'';
  values['right/'+node+'/txt_num']=definition?equipmentGradeText(definition):'';
  slots['right/'+node+'/icon']=slotContent(instance,part);
  slots['right/'+node+'/star']=instance&&instance.star?`<span class="source-equip-stars">${stars(instance.star)}</span>`:'';
 }
 // Four source skill slots now open their corresponding rune inventory.
 for(let i=1;i<=4;i++){const item=runeOfDragon(state,dragon.id,i),def=runeDefinition(item?.type),skill=runeSkill(dragon,def,i);values['right/skill'+i+'/txt_name']=skill?.name??'';values['right/skill'+i+'/txt_num']=def?'+'+def.level:'';slots['right/skill'+i+'/icon']=`<button class="source-rune-slot" data-action="${item?'runeInfo':'runeSelector'}" data-id="${item?item.id:dragon.id}" data-value="${i}" aria-label="${esc(skill?.name??'符文槽'+i)}">${def&&runeIcon(def)?`<img src="${runeIcon(def)}" alt="">`:'<img src="assets/original/ui/ui_daojukuang_kong2.png" alt="镶嵌符文">'}</button>`}
 // Every txt_name must be set explicitly: the layout's label lookup falls back to the
 // node name, so the page title would otherwise overwrite each button caption.
 values['right/dragong_info/text_dragong_name']=species.name;
 values['right/dragong_info/text_type']='';
 values['right/dragong_info/btn_xiangqing/txt_name']='详情';
 values['right/change/txt_name']='更换龙';
 values['right/equip/txt_name']='一键装备';
 values['left/btn_formation/txt_name']='阵型';
 slots['right/dragong_info/dragon']=`<div class="source-equip-model">${dragonArt(dragon.species,'',dragon.level)}</div>`;
 for(let i=1;i<=5;i++)slots['right/dragong_info/lv'+i]='';
 values['right/dragong_info/lv/level']=String(dragon.level);
 // dragong_info owns the attribute rows. Only equipment definition totals are known
 // offline, so critical/resist/power stay blank instead of being invented.
 const base=dragonAttributes(dragon,state);
 values['right/dragong_info/hp/num']=String(base?.life??0);
 values['right/dragong_info/atk/num']=String(base?.attack??0);
 values['right/dragong_info/def/num']=String(base?.defend??0);
 values['right/dragong_info/critical/num']='—';
 values['right/dragong_info/resist/num']='—';
 values['right/dragong_info/power/num']=String(dragonPower(dragon,state)??'—');
 slots['left/huadong']=`<div class="source-equip-dragonlist">${state.dragons.map(d=>dragonCell(listItem,d,d.id===dragon.id)).join('')}</div>`;
 values['left/tx_team_num']='—';values['left/tx_shy_num']='—';values['left/tx_land_num']='—';
 actions.close={type:'close',label:'关闭阵容'};
 actions['left/btn_formation/btn']={type:'unverifiedEquip',label:'阵型'};
 actions['right/change/btn']={type:'unverifiedEquip',label:'更换龙'};
 actions['right/equip/btn']={type:'unverifiedEquip',label:'一键装备'};
 actions['right/dragong_info/btn_xiangqing/btn']={type:'openDragon',id:dragon.id,label:'详情'};
 if(formation){
  const lineup=configuredLineup(state),count=formationCounts(lineup),cell=await sourceLayout('item_big_touxiang');
  values['left/tx_team']='队伍';values['left/tx_sky']='飞行龙';values['left/tx_land']='爬行龙';
  values['left/tx_team_num']=`${lineup.length}/6`;values['left/tx_shy_num']=`${count.sky}/4`;values['left/tx_land_num']=`${count.land}/4`;
  const cells=Array.from({length:6},(_,i)=>{const unit=lineup[i],sp=unit?SPECIES[unit.species]:null;return `<button class="source-formation-slot" data-action="${unit?'formationSlot':'formationPick'}" data-id="${i}" aria-label="阵位${i+1}${unit?' '+sp.name:' 添加龙'}">${renderSourceLayout(cell,{values:{tx_lv:unit?`Lv.${unit.level}`:'',txt_num:''},hidden:new Set([...(i!==slot?['selected']:[]),...(unit?['add']:['lvbg','tx_lv'])]),slots:{icon_long:unit?`<img class="formation-slot-portrait" src="assets/original/ui/ui_bookdragon_${sp.original}_1.png" alt="${sp.name}">`:'<img class="formation-slot-add" src="assets/original/ui/ui_daojukuang_kong2.png" alt="添加龙">'}})}</button>`}).join('');
  slots['left/huadong']=`<div class="source-formation-slots">${cells}</div>`;
  actions['right/change/btn']={type:'formationPick',id:slot,label:'更换龙'};
  actions['left/btn_formation/btn']={type:'formationPreview',label:'阵型'};
 }
 const d=showSource(formation?'sourceFormation':'sourceEquip',renderSourceLayout(layout,{values,slots,actions,hidden}));
 d.dataset.formationSlot=String(slot);

 d.dataset.dragonId=String(dragon.id);d.dataset.returnToDragon=String(returnToDragon);
}

// Original 装备更换 page (ui_formation_equip_change) with the client's own card
// (item_formation_equip_change). Only equipment of the requested part that is not worn
// by another dragon is offered, which is what the 已装备 marker distinguishes.
export async function openEquipChangeDialog(state,dragonId,part){
 const dragon=state.dragons.find(d=>d.id===dragonId);
 if(!dragon)throw new Error('找不到这只龙。');
 part=Number(part);
 if(!Number.isSafeInteger(part)||part<0||part>5)throw new Error('装备部位无效。');
 const [layout,card]=await Promise.all([sourceLayout('ui_formation_equip_change'),sourceLayout('item_formation_equip_change')]);
 const loose=(state.equipment??[]).filter(instance=>!instance.dragonid&&definitionPart(instance)===part);
 const cards=loose.map(instance=>{
  const definition=equipmentDefinition(instance.type),rows=attributeRows(definition);
  const values={tx_name:equipmentLabel(instance),tx_lv:equipmentGradeText(definition)||'—','pingding/shuzi':String(definition.evaluate),hint:`装备于${SPECIES[dragon.species].name}`};
  for(let i=1;i<=3;i++){const row=rows[i-1];values['shuxing'+i+'/miaoshu']=row?row[0]+'：':'';values['shuxing'+i+'/shuzi']=row?String(row[1]):''}
  return `<article class="source-equip-change-card">${renderSourceLayout(card,{values,hidden:new Set(['biaoji']),actions:{'btn_zhuangbei/btn':{type:'wearEquipment',id:dragon.id,value:instance.id,label:'装备'}},slots:{icon_long:`<img class="source-equip-icon" src="${equipmentIcon(definition)}" alt="">`,node_star:`<span class="source-equip-stars">${stars(instance.star)}</span>`}})}</article>`;
 }).join('');
 const d=showSource('sourceEquipChange',renderSourceLayout(layout,{hidden:new Set(cards?['hint']:[]),actions:{fanhui:{type:'openEquip',id:dragon.id,label:'返回阵容'},'btn_up/btn':{type:'equipSource',label:'获得更多装备'}},slots:{huadong:cards?`<div class="source-equip-change-list">${cards}</div>`:''}}));
 d.dataset.dragonId=String(dragon.id);d.dataset.equipPart=String(part);
}

// panel_equip_info is the original equipment sheet: icon, +tier, star activation rows,
// three attribute lines, 装备评定 and the 更换/强化/升星/卸下 buttons.
export async function openEquipInfoDialog(state,equipmentId,{dragonId=null}={}){
 const instance=(state.equipment??[]).find(entry=>entry.id===equipmentId);
 if(!instance)throw new Error('找不到这件装备。');
 const definition=equipmentDefinition(instance.type);
 const owner=otherOwner(state,instance)??state.dragons.find(d=>d.id===dragonId)??null;
 const layout=await sourceLayout('panel_equip_info');
 const rows=attributeRows(definition),values={tx_name:equipmentLabel(instance),tx_lv:equipmentGradeText(definition)||'—','pingding/shuzi':String(definition.evaluate)};
 for(let i=1;i<=3;i++){const row=rows[i-1];values['shuxing'+i+'/miaoshu']=row?row[0]+'：':'';values['shuxing'+i+'/shuzi']=row?String(row[1]):''}
 // The five star-activation rows belong to equipinfostar, whose rollout rules are still
 // unconfirmed, so the block stays hidden instead of printing guesses.
 const hidden=new Set(['node_starinfo']);
 for(let i=1;i<=5;i++){hidden.add('txt_close_star'+i);hidden.add('txt_open_star'+i)}
 const actions={
  close:{type:owner?'openEquip':'close',id:owner?.id,label:'返回阵容'},
  'btn_xiexia/btn':instance.dragonid?{type:'unwearEquipment',id:equipmentId,label:'卸下'}:{type:'unverifiedEquip',label:'尚未穿戴'},
  'btn_genghuan/btn':{type:'equipChange',id:definition.part,label:'更换'},
  'btn_qianghua/btn':{type:'openEquipEnhance',id:equipmentId,label:'强化'},
  'btn_upstar/btn':{type:'unverifiedEquip',label:'升星'},
 };
 const disabled=new Set(['btn_upstar/btn',...(!instance.dragonid?['btn_xiexia/btn']:[])]);
 const d=showSource('sourceEquipInfo',renderSourceLayout(layout,{values,hidden,actions,disabled,slots:{icon_long:`<img class="source-equip-icon" src="${equipmentIcon(definition)}" alt="">`}})
  +`<div class="source-equip-notes"><p>品质 ${QUALITY_LABELS[definition.quality]}　部位 ${PART_LABELS[definition.part]}　系别 ${EQUIPMENT_PROPERTIES[definition.property]??'—'}　${owner?`所属 ${esc(SPECIES[owner.species].name)}`:'未穿戴'}${instance.star?`　星级 ${instance.star}`:''}</p>`
  +'</div>');
 d.dataset.equipmentId=equipmentId;if(owner)d.dataset.dragonId=String(owner.id);d.dataset.equipPart=String(definition.part);
}

// panel_formation_equip_info is the client's own 装备来源 sheet: 宝箱抽取, 龙境仙踪 and
// 活动获得. The box and adventure routes now lead to playable acquisition.
export async function openEquipSourceDialog(state,part=0){
 const layout=await sourceLayout('panel_formation_equip_info'),info=equipmentCatalog({part:Number.isInteger(part)&&part>=0&&part<6?part:0,quality:3})[0],dragonId=Number(document.querySelector('#modal').dataset.dragonId)||state.dragons[0]?.id,values={tx_title:'装备来源',tx_name:info?.name??'',tx_lv:'','hint_box/miaoshu':'宝箱抽取','hint_pve/miaoshu':'龙境仙踪','hint_pve/hint':'通关可获得','btn_down/miaoshu':'获得更多装备','pingding/miaoshu':'装备评分：','pingding/shuzi':info?.evaluate??''},hidden=new Set(['add','item1','item2','item3','item4','item5','hint_activity']),slots={icon_long:info?`<img class="source-equip-icon" src="${equipmentIcon(info)}" alt="">`:''},background=layout.children.find(n=>n.type==='btn'&&!n.name);
 if(background){background.name='close';delete background.img_normal;delete background.img_down}const top=layout.children.find(n=>n.name==='btn_down')?.children.find(n=>n.type==='btn');if(top){delete top.img_normal;delete top.img_down}
 const attrs=info?attributeRows(info):[];for(let i=1;i<=3;i++){const a=attrs[i-1];if(!a)hidden.add('shuxing'+i);else{values[`shuxing${i}/miaoshu`]=a[0]+'：';values[`shuxing${i}/shuzi`]=a[1]}}
 for(const [key,action,label] of [['hint_box','openWarehouse','宝箱抽取'],['hint_pve','openAdventure','龙境仙踪']]){const node=layout.children.find(n=>n.name===key),image=node?.children.find(n=>n.type==='sprite');if(image){image.name='route';slots[key+'/route']=`<button class="source-equip-source-route" data-action="${action}" aria-label="${label}"><img src="assets/original/ui/${image.img.replace(/^#/,'')}" alt=""></button>`}}
 const d=showSource('sourceEquipFrom',renderSourceLayout(layout,{values,slots,hidden,actions:{close:{type:'equipChange',id:part,label:'返回装备选择'},'btn_down/btn':{type:'openAdventure',label:'获得更多装备'}}}));d.dataset.dragonId=String(dragonId);d.dataset.equipPart=String(part);
}
export async function openEquipEnhanceDialog(state,equipmentId,{returnToBag=false}={}){
 const instance=(state.equipment??[]).find(v=>v.id===equipmentId);if(!instance)throw new Error('找不到这件装备。');
 const layout=await sourceLayout('panel_formation_equip_strengthen'),info=equipmentDefinition(instance.type),material=info.part===4?'wing':info.part===5?'crystal':'stone',icon=material==='wing'?'resource_icon_80_yuyi.png':material==='crystal'?'resource_icon_80_shuijing.png':'shangcheng_huobi_qhs.png';
 let plan=null;try{plan=equipmentEnhancePlan(instance)}catch{}
 const values={tx_name:'装备强化',zhuangbei_name:info.name,tx_lv:equipmentGradeText(info),'qianghua/txt_name':'强化','qianghuaall/txt_name':'强化10次',expense_txt:'消耗：',expense_num:plan?String(plan.cost):'已达最高等级',txt_ShiWu:String(state.equipmentMaterials?.[material]??0)},slots={},hidden=new Set();
 const attrs=[['攻击','atk'],['生命','hp'],['防御','def'],['暴击','resist'],['免暴','antResist']].filter(([,key])=>info[key]||(plan?.definition[key]??0));
 for(let i=1;i<=3;i++){const row=attrs[i-1],key=`shuxing/shuxing${i}`;if(!row){hidden.add(key);continue}values[`${key}/miaoshu`]=`${row[0]}：`;values[`${key}/shuzi`]=String(info[row[1]]);values[`${key}/fujia`]=String(plan?.definition[row[1]]??info[row[1]])}
 slots.icon_long=`<img class="source-equip-icon" src="${equipmentIcon(info)}" alt="">`;
 for(const key of ['node_showicon','node_costiicon'])slots[key]=`<img class="equip-enhance-material" src="assets/original/ui/${icon}" alt="${EQUIPMENT_MATERIAL_NAMES[material]}">`;
 const disabled=new Set(!plan?['qianghua/btn','qianghuaall/btn']:[]);
 const d=showSource('sourceEquipEnhance',renderSourceLayout(layout,{values,slots,hidden,disabled,actions:{close:{type:returnToBag?'openEquipmentBag':'openEquipInfo',id:equipmentId,label:'返回装备'},'qianghua/btn':{type:'enhanceEquipment',id:equipmentId,value:'1',label:'强化'},'qianghuaall/btn':{type:'enhanceEquipment',id:equipmentId,value:'10',label:'强化10次'}}}));d.dataset.equipmentId=equipmentId;d.dataset.returnToBag=String(returnToBag);
}
