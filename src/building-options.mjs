import {farmOwner,farmInfo,incubatorSpeedCost} from './game.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource} from './ranch-dialogs.mjs';
import descriptions from '../assets/original/data/farm-description.mjs';
export function clearBuildingOptions(){document.querySelector('#building-options')?.remove();document.querySelector('.scene')?.classList.remove('building-selected')}
export async function showFarmOptions(state,id=0){
 clearBuildingOptions();const owner=farmOwner(state,id),info=farmInfo(state,id),job=owner.farm;
 const entries=[['cp_move','移动',id===0?'beginFixedMove':'beginStructureMove',false],['cp_huishou','出售','sellStructure',id===0],['cp_info','信息','farmSourceInfo',false]];
 if(info.upgrades_to>0&&!owner.readyAt&&!owner.farmUpgrade&&!job)entries.push(['cp_building_upgrade','升级','farmSourceUpgrade',false]);
 if(owner.readyAt||owner.farmUpgrade)entries.push(['cp_speedup','立即完成','farmConstructionSpeed',false]);
 else if(job&&Date.now()<job.readyAt)entries.push(['cp_speedup','立即完成','farm',false]);
 else entries.push(['cp_plant',job?'收获':'种植','farm',false]);
 const html=await Promise.all(entries.filter(e=>!e[3]).reverse().map(async([name,label,type])=>`<div class="original-building-option">${renderSourceLayout(await sourceLayout(name),{values:{txt_name:name==='cp_speedup'?incubatorSpeedCost((owner.readyAt?owner:owner.farmUpgrade??job).readyAt):label,txt_boost:label},actions:{btn:{type,id:type==='beginFixedMove'?3:id,label}},slots:name==='cp_speedup'?{miaoshu:'<img class="original-instant-label" src="assets/original/ui/t_lijiwancheng_cn.png" alt="立即完成">'}:{}})}</div>`));
 const bar=document.createElement('div');bar.id='building-options';bar.dataset.farmId=id;bar.className='original-building-options';bar.style.setProperty('--options-scale',Math.min(innerWidth/1024,innerHeight/768));bar.innerHTML=html.join('');document.querySelector('.scene').append(bar);document.querySelector('.scene').classList.add('building-selected');
}
export async function openFarmSourceInfo(state,id=0,upgrade=false){
 const owner=farmOwner(state,id),current=farmInfo(state,id),info=upgrade?farmInfo({...state,farmBuildingId:current.upgrades_to}):current,l=await sourceLayout('panel_building_info');
 const d=showSource('farmSourceInfo',renderSourceLayout(l,{values:{txt_name:info.nameCN,miaoshu:'描述',neirong:descriptions[info.id]??'',shuzi:upgrade?info.costs.g:'','exp/tx_xp':upgrade?info.xp:'','btn_FangRuLongChao/txt_name':upgrade?'升级':'马上种植'},hidden:new Set(['weijiesuo',...(!upgrade?['gold_bg','shuzi','con_cost','exp']:[])]),actions:{btn_GuanBiXiao:{type:'close',label:'关闭'},'btn_FangRuLongChao/btn':{type:upgrade?'upgradeFarm':'farm',id,label:upgrade?'升级':'马上种植'}},disabled:new Set(!upgrade&&(owner.farm||owner.readyAt||owner.farmUpgrade)?['btn_FangRuLongChao/btn']:[]),slots:{con_img:`<img class="native-item-art" src="assets/original/ui/thumbs_store_${info.id===16?'0016_farm_1':info.id===108?'0108_farm2_EvolutionLand':'0017_farm_2'}.png" alt="">`,con_cost:'<img class="native-cost-icon" src="assets/original/ui/ui_main_06.png" alt="">'}}));d.dataset.farmId=id;
}
