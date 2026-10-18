import {ORIGINAL_CROPS,ORIGINAL_FARMS} from './data.mjs';
import {farmOwner,farmInfo,unlockedCrops,playerProgress,incubatorSpeedCost} from './game.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,nativeButton,esc,openStructureInfo} from './ranch-dialogs.mjs';
const time=ms=>ms>=3600000?`${Math.floor(ms/3600000)}小时`:ms>=60000?`${Math.floor(ms/60000)}分`:`${ms/1000}秒`;
export async function openFarmDialog(state,farmId=0){
 const owner=farmOwner(state,farmId);if(owner.readyAt)return openStructureInfo(state,farmId);
 const info=farmInfo(state,farmId),next=ORIGINAL_FARMS.find(f=>f.id===info.upgrades_to),crop=ORIGINAL_CROPS.find(c=>c.id===owner.farm?.cropId);
 if(owner.farm||owner.farmUpgrade){
  const l=await sourceLayout('panel_building_speedup'),job=owner.farmUpgrade??owner.farm,act=owner.farmUpgrade?(Date.now()<owner.farmUpgrade.readyAt?'openBuildingSpeed':'completeFarmUpgrade'):(Date.now()<owner.farm.readyAt?'speedCrop':'harvest'),title=owner.farmUpgrade?'农场升级中':crop?.name??'作物',ready=job.readyAt;
  const d=showSource('farm',renderSourceLayout(l,{values:{txt_name:title,txt_tishi:'',txt_duixiang:'',huafei_t:act==='speedCrop'?'花费':'',huafei:act==='speedCrop'?incubatorSpeedCost(ready):'','btn_PeiYu/txt_name':owner.farmUpgrade?(act==='openBuildingSpeed'?'加速完成':'完成升级'):(act==='speedCrop'?'加速成熟':'收获')},actions:{btn_GuanBiXiao:{type:'close',label:'关闭农场'},'btn_PeiYu/btn':{type:act,id:farmId,label:owner.farmUpgrade?(act==='openBuildingSpeed'?'加速完成':'完成升级'):(act==='speedCrop'?'加速成熟':'收获')}},hidden:new Set(act==='harvest'?['huafei','huafei_t','ico_mojing']:[]),slots:{con:`<img class="native-timed-art" src="${esc(crop?.image??'assets/original/world/0016_farm_1_g_s1.png')}" alt=""><span class="native-timed-label">剩余时间　<span data-timer="${ready}"></span></span>`}}));d.dataset.farmId=farmId;if(act==='speedCrop')d.dataset.farmReady=ready;if(act==='openBuildingSpeed')d.querySelector(`[data-action=${act}]`).dataset.kind='farm';else if(act!=='speedCrop')d.querySelector(`[data-action=${act}]`).dataset.ready=ready;return;
 }
 const [l,item]=await Promise.all([sourceLayout('panel_zhongzhi_info'),sourceLayout('item_zhongzhi')]);
 const cards=unlockedCrops(state,farmId).map(c=>`<article class="native-crop-card">${renderSourceLayout(item,{values:{tx_name:c.name,tx_time:time(c.ms),tx_time_t:'时间',tx_food:c.yield,tx_food_t:'收获',tx_xp:c.xp,tx_xp_t:'经验',tx_gold:c.cost,'btn_zhongzhi/txt_name':'种植'},actions:{'btn_zhongzhi/btn':{type:'plantNative',id:c.id,label:'种植'+c.name}},hidden:new Set([c.id>9?'food_ico':'fruit_ico']),slots:{con_img:`<img class="native-crop-art" src="${esc(c.image)}" alt="${esc(c.name)}">`}})}</article>`).join('');
 const d=showSource('farm',renderSourceLayout(l,{values:{txt_name:info.nameCN},actions:{btn_GuanBiXiao:{type:'close',label:'关闭农场'}},slots:{hadong:`<div class="native-crop-list">${cards}</div>`}}));d.dataset.farmId=farmId;
}
