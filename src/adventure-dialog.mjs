import {renderSourceLayout} from './source-layout.mjs';
import {esc} from './ranch-dialogs.mjs';
import {ADVENTURE_MAP_IDS,adventureMap,adventureMapDetail,adventureMapNodes,adventureEventKind} from './adventure.mjs';

let panelPromise;
const mapLayouts=new Map();
const loadPanel=()=>panelPromise??=fetch('assets/original/layouts/panel_pve.json').then(response=>response.json());
const loadMapLayout=atlas=>{if(!mapLayouts.has(atlas))mapLayouts.set(atlas,fetch(`assets/original/layouts/${atlas}.json`).then(response=>response.json()));return mapLayouts.get(atlas)};
// The twenty exported maps reuse seven layouts and seven backgrounds, cycled in map order.
const atlasIndex=atlas=>Number(String(atlas).replace('item_pve_map_',''))||1;

// item_pve_map_N draws check1..check20, and mapevents holds exactly twenty nodes per map in
// order, so checkN is the Nth node. Small nodes carry point1/2/3 (three states) and large
// nodes carry diban+star+icon; both are made clickable the same way.
function decorate(layout,nodes){
 const slots={},hidden=new Set(),visit=(list,path='')=>{
  for(const node of list){
   const key=path?`${path}/${node.name??''}`:node.name??'';
   const match=/^check(\d+)$/.exec(node.name??'');
   if(match){
    const event=nodes[Number(match[1])-1],children=node.children??[],major=children.find(child=>child.name==='diban'),point=children.find(child=>child.name==='point2'),target=major??point;
    for(const child of children)if(child.name==='point1'||child.name==='point3')hidden.add(`${key}/${child.name}`);
    if(event&&target){const image=String(target.img??target.img_normal??'').replace(/^#/,'');slots[`${key}/${target.name}`]=`<button class="source-pve-node${major?' is-major':''}" data-action="pveNode" data-id="${event.id}" aria-label="${esc(event.name)}"><img src="assets/original/ui/${esc(image)}" alt=""></button>`}
    continue;
   }
   visit(node.children??[],key);
  }
 };
 visit(layout.children);
 return {slots,hidden};
}

// The client's own adventure panel. Player progress, stars and chests live on the server
// (PVEData.getPveMapInfo), so every node is drawn in its neutral state and no clear/star
// state is invented.
export async function openAdventureDialog(state,mapId=ADVENTURE_MAP_IDS[0]){
 if(!ADVENTURE_MAP_IDS.includes(mapId))mapId=ADVENTURE_MAP_IDS[0];
 const panel=await loadPanel(),map=adventureMap(mapId),detail=adventureMapDetail(mapId),nodes=adventureMapNodes(mapId);
 const mapLayout=await loadMapLayout(map.atlas),{slots:nodeslots,hidden}=decorate(mapLayout,nodes);
 const index=ADVENTURE_MAP_IDS.indexOf(mapId);
 const values={
  tx_biaoti:`${detail?.name??''}`,
  tx_biaoti2:`${detail?.name??''}`,
  'btn_normal/txt_name':'普通','btn_elite/txt_name':'精英',
 };
 const actions={
  close:{type:'close',label:'关闭冒险'},
  'map_ctrl/btn_left/btn':{type:'pveMap',value:String(ADVENTURE_MAP_IDS[(index-1+ADVENTURE_MAP_IDS.length)%ADVENTURE_MAP_IDS.length]),label:'上一张地图'},
  'map_ctrl/btn_right/btn':{type:'pveMap',value:String(ADVENTURE_MAP_IDS[(index+1)%ADVENTURE_MAP_IDS.length]),label:'下一张地图'},
  'map_ctrl/btn_normal/btn':{type:'pveUnverified',label:'普通关卡'},
  'map_ctrl/btn_elite/btn':{type:'pveUnverified',label:'精英关卡'},
 };
 const slots={
  huadong:`<div class="source-pve-scroll"><div class="source-pve-map" style="width:${mapLayout.width}px;height:${mapLayout.height}px">`
   +`<img class="source-pve-bg" src="assets/original/ui/map_${atlasIndex(map.atlas)}.jpg" alt="">`
   +`${renderSourceLayout(mapLayout,{slots:nodeslots,hidden})}</div></div>`,
 };
 const dialog=document.querySelector('#modal');if(dialog.open)dialog.close();
 dialog.className='source-dragon-dialog native-ranch-dialog source-pve-dialog';dialog.dataset.mode='sourcePve';dialog.dataset.pveMap=String(mapId);
 const scale=Math.min((innerWidth-20)/panel.width,(innerHeight-20)/panel.height);
 dialog.style.setProperty('--source-scale',scale);
 dialog.innerHTML=`<div class="source-artboard source-pve-artboard">${renderSourceLayout(panel,{values,slots,actions,hidden:new Set(['txt1'])})}</div>`;
 // panel_pve references eleven frames that this APK does not ship at all
 // (ui_bg_960_640bg, ui_common_bg_t_0..5, ui_common_btn_fanye_l/r_1, ui_common_biaoqian_01/02,
 // ui_pve_title2). They are checked against every packed atlas and are simply absent, so a
 // failed load is hidden rather than shown as a broken icon.
 for(const image of dialog.querySelectorAll('img')){
  const hide=()=>{image.style.display='none'};
  if(image.complete){if(!image.naturalWidth)hide()}else image.addEventListener('error',hide,{once:true});
 }
 dialog.showModal();
}
