import {ORIGINAL_CROPS,ORIGINAL_FARMS} from './data.mjs';
import {farmInfo,unlockedCrops,playerProgress} from './game.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,nativeButton,esc} from './ranch-dialogs.mjs';
const time=ms=>ms>=3600000?`${Math.floor(ms/3600000)}小时`:ms>=60000?`${Math.floor(ms/60000)}分`:`${ms/1000}秒`;
export async function openFarmDialog(state){
 const info=farmInfo(state),next=ORIGINAL_FARMS.find(f=>f.id===info.upgrades_to),crop=ORIGINAL_CROPS.find(c=>c.id===state.farm?.cropId);
 if(state.farm||state.farmUpgrade){
  const l=await sourceLayout('panel_building_speedup'),job=state.farmUpgrade??state.farm,act=state.farmUpgrade?(Date.now()<state.farmUpgrade.readyAt?'openBuildingSpeed':'completeFarmUpgrade'):'harvest',title=state.farmUpgrade?'农场升级中':crop?.name??'作物',ready=job.readyAt;
  const d=showSource('farm',renderSourceLayout(l,{values:{txt_name:title,txt_tishi:'',txt_duixiang:'',huafei_t:'',huafei:'','btn_PeiYu/txt_name':state.farmUpgrade?(act==='openBuildingSpeed'?'加速完成':'完成升级'):'收获'},actions:{btn_GuanBiXiao:{type:'close',label:'关闭农场'},'btn_PeiYu/btn':{type:act,label:state.farmUpgrade?(act==='openBuildingSpeed'?'加速完成':'完成升级'):'收获'}},disabled:new Set(!state.farmUpgrade&&Date.now()<ready?['btn_PeiYu/btn']:[]),slots:{con:`<img class="native-timed-art" src="${esc(crop?.image??'assets/original/world/0016_farm_1_g_s1.png')}" alt=""><span class="native-timed-label">剩余时间　<span data-timer="${ready}"></span></span>`}}));if(act==='openBuildingSpeed')d.querySelector(`[data-action=${act}]`).dataset.kind='farm';else d.querySelector(`[data-action=${act}]`).dataset.ready=ready;return;
 }
 const [l,item]=await Promise.all([sourceLayout('panel_zhongzhi_info'),sourceLayout('item_zhongzhi')]);
 const cards=unlockedCrops(state).map(c=>`<article class="native-crop-card">${renderSourceLayout(item,{values:{tx_name:c.name,tx_time:time(c.ms),tx_time_t:'时间',tx_food:c.yield,tx_food_t:'收获',tx_xp:c.xp,tx_xp_t:'经验',tx_gold:c.cost,'btn_zhongzhi/txt_name':'种植'},actions:{'btn_zhongzhi/btn':{type:'plantNative',id:c.id,label:'种植'+c.name}},hidden:new Set(['fruit_ico']),slots:{con_img:`<img class="native-crop-art" src="${esc(c.image)}" alt="${esc(c.name)}">`}})}</article>`).join('');
 showSource('farm',renderSourceLayout(l,{values:{txt_name:info.nameCN},actions:{btn_GuanBiXiao:{type:'close',label:'关闭农场'}},slots:{hadong:`<div class="native-crop-list">${cards}</div>`}})+(next?`<div class="native-farm-upgrade">${nativeButton('升级农场','upgradeFarm','',playerProgress(state).level<next.min_level||state.coins<next.costs.g)}<span>${esc(next.nameCN)}　Lv.${next.min_level}　${next.costs.g}金币</span></div>`:''));
}
