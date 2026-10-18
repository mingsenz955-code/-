import {energyCapacity} from './adventure-energy.mjs';
import {sourceAdventureLevel,nodeRewardStatus} from './loot.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {esc,sourceLayout,showSource} from './ranch-dialogs.mjs';
import {lineupPower,configuredLineup} from './battle.mjs';
import {ADVENTURE_MAP_IDS,adventureMap,adventureMapDetail,adventureMapNodes} from './adventure.mjs';
const atlasIndex=atlas=>Number(String(atlas).replace('item_pve_map_',''))||1;
function decorate(layout,nodes,state){
 const slots={},hidden=new Set();
 for(const node of layout.children){
  const match=/^check(\d+)$/.exec(node.name??'');if(!match)continue;
  const event=nodes[Number(match[1])-1];if(!event)continue;
  const source=sourceAdventureLevel(event.id),rewardNode=source?.kind>2;const children=node.children??[],major=children.find(c=>c.name==='diban'),stars=state.adventure?.cleared?.[String(event.id)]??0,unlocked=event.prev===-1||!!state.adventure?.cleared?.[String(event.prev)];
  if(major){
   for(let j=1;j<=3;j++){if(stars===0||rewardNode)hidden.add(`${node.name}/star/level${j}`);else if(j<=stars){const star=children.find(c=>c.name==='star')?.children?.find(c=>c.name===`level${j}`);if(star)star.img='#ui_pve_s4.png';}}
  }
  const target=major??children.find(c=>c.name===(stars?'point3':unlocked?'point2':'point1'));
  for(const c of children)if(c.name?.startsWith('point')&&c!==target)hidden.add(`${node.name}/${c.name}`);
  const claim=rewardNode&&stars>0,status=claim?nodeRewardStatus(state,event.id):null;
  if(target){slots[`${node.name}/${target.name}`]=`<button class="source-pve-node${major?' is-major':''}${stars?' is-cleared':''}" style="width:${target.width}px;height:${target.height}px" data-action="${claim?'claimAdventureReward':'pveNode'}" data-id="${event.id}" aria-label="${esc(event.name)}" ${unlocked?'':'disabled'}><img src="assets/original/ui/${esc(String(target.img).replace(/^#/,''))}" alt="">${claim?`<span class="source-pve-reward-state" ${status.record.count<3&&!status.ready?`data-timer="${status.readyAt}"`:``}>${status.record.count>=3?'领取上限':status.ready?'可领取':''}</span>`:''}</button>`;}
 }
 return {slots,hidden};
}
export async function openAdventureDialog(state,mapId=ADVENTURE_MAP_IDS[0]){
 if(!ADVENTURE_MAP_IDS.includes(mapId))mapId=ADVENTURE_MAP_IDS[0];
 const panel=await sourceLayout('ui_battle_chuangguan_guanka'),map=adventureMap(mapId),detail=adventureMapDetail(mapId),nodes=adventureMapNodes(mapId),mapLayout=await sourceLayout(map.atlas),{slots:nodeSlots,hidden}=decorate(mapLayout,nodes,state),index=ADVENTURE_MAP_IDS.indexOf(mapId);
 const values={txt_name:`第${index+1}关·${detail?.name??''}`,star_num:`${nodes.filter((_,i)=>mapLayout.children.find(n=>n.name===`check${i+1}`)?.children?.some(c=>c.name==='star')).reduce((sum,n)=>sum+(state.adventure?.cleared?.[String(n.id)]??0),0)}/${map.totalStar}`,tx_time:`剩余体力：${state.adventure?.energy??0}/${energyCapacity(state)}`,tx_huifu:'',tx_jiangli:'满星通关奖励：','power_bg/tx_power_num':`当前队伍战斗力：${lineupPower(configuredLineup(state),state)}`};
 const slots={huadong:`<div class="source-pve-map"><div class="source-pve-scene"><img class="source-pve-bg" src="assets/original/ui/map_${atlasIndex(map.atlas)}.jpg" alt="">${renderSourceLayout(mapLayout,{slots:nodeSlots,hidden})}</div></div>`,'buzhen/con_name':'<span class="pve-entry-label">布阵</span>','tansuo/con_name':'<span class="pve-entry-label">宝石</span>'};
 const actions={tianjia_tili:{type:'buyAdventureEnergyInfo',label:'购买体力'},'tansuo/btn':{type:'openGems',label:'宝石'},close:{type:'close',label:'关闭冒险'},'buzhen/btn':{type:'openFormation',label:'布阵'},'page_left/btn':{type:'pveMap',value:String(ADVENTURE_MAP_IDS[(index-1+ADVENTURE_MAP_IDS.length)%ADVENTURE_MAP_IDS.length]),label:'上一张地图'},'page_right/btn':{type:'pveMap',value:String(ADVENTURE_MAP_IDS[(index+1)%ADVENTURE_MAP_IDS.length]),label:'下一张地图'}};
 const d=showSource('sourcePve',renderSourceLayout(panel,{values,slots,actions,hidden:new Set(['node_btn_getreward'])}),'source-pve-dialog');
 d.dataset.pveMap=String(mapId);d.style.setProperty('--source-scale',Math.min((innerWidth-20)/1024,(innerHeight-20)/768));return d;
}
