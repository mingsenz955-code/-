import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {dragonStars,dragonStarPlan,dragonStarMaterialError} from './dragon-stars.mjs';
import {dragonAttributes,dragonPower} from './battle.mjs';
import {SPECIES} from './data.mjs';
import {dragonArt} from './art.mjs';
const starArt=n=>`<img class="dragon-star-image" src="assets/original/ui/${n?'ui_star_x0007.png':'ui_star_x0008.png'}" alt="${n?'已获得星级':'未获得星级'}">`;
export async function openDragonStar(state,id,selected=[]){
 const plan=dragonStarPlan(state,id,selected),d=plan.dragon,sp=SPECIES[d.species],stats=dragonAttributes(d,state),[frame,left,right]=await Promise.all(['ui_tab_group','item_star_up_zuo_equipPart2','item_star_up_you'].map(sourceLayout));
 const values={tx_name:sp.name,'tx_zhandouli/miaoshu':'战斗力：','tx_zhandouli/shuzi':dragonPower(d,state)};
 for(const [node,label,value] of [['tx_shengming','生命',stats?.life],['tx_gongji','攻击',stats?.attack],['tx_fangyu','防御',stats?.defend],['tx_baoji','暴击',stats?.crit],['tx_fangbao','免暴',stats?.uncrit]]){values[node+'/miaoshu']=label+'：';values[node+'/shuzi']=value??'—';}
 const slots={dragon:`<div class="dragon-star-model">${dragonArt(d.species,'',d.level)}</div>`},hidden=new Set(['linjia','zhua','gu','jiao','img_type1','img_type2','img_type3']);
 const candidates=state.dragons.filter(v=>!dragonStarMaterialError(state,d,v));
 const cards=candidates.map(v=>`<button class="dragon-star-material${selected.includes(v.id)?' is-selected':''}" style="background-image:url(assets/original/ui/ui_daojukuang_DaoJuKuang${SPECIES[v.species].quality??1}.png)!important" data-action="dragonStarMaterial" data-id="${v.id}" aria-pressed="${selected.includes(v.id)}"><div>${dragonArt(v.species,'',v.level)}</div><span>${esc(SPECIES[v.species].name)}</span><small>Lv.${v.level} · ${dragonStars(v)} 星</small>${selected.includes(v.id)?'<img class="dragon-star-tick" src="assets/original/ui/ui_common_gou.png" alt="已选择">':''}</button>`).join('');
 const rightSlots={huadong_xiao:`<div class="dragon-star-materials">${cards||'<p>没有可融合的同种龙</p>'}</div>`};for(let i=1;i<=5;i++)rightSlots['star'+i]=starArt(i<=plan.star);
 rightSlots['jindu/tianchong']=`<img class="dragon-star-progress" style="clip-path:inset(0 ${100-Math.min(100,plan.exp/plan.current.perxp*100)}% 0 0)" src="assets/original/ui/ui_starup_xp2.png" alt="">`;
 const locked=dragonStars(d)>=plan.cap,rv={tx_star:'星级：',tx_exp:'',tx_hongzi:'同种神龙',tx_shuoming:d.level<7?'7级以下的龙不能升星':locked?(plan.limit>5?'五星后进入觉醒修炼':'已达到最大星级'):`选择同种龙进行融合培养`,'jindu/txt_shuzi':locked?'当前五星':`经验：${d.starExp??0}${plan.gained?' + '+plan.gained:''} / ${plan.current.perxp}`,xuanze_miaoshu:'选择要融合的龙：','quanxuan/miaoshu':'全选','btn_shengji/txt_name':'融合'};
 const actions={'btn_shengji/btn':{type:'requestStarDragon',id,label:'融合升星'}};
 const roster=`<div class="dragon-star-roster">${state.dragons.map(v=>`<button class="dragon-star-roster-item${v.id===id?' is-selected':''}" style="background-image:url(assets/original/ui/ui_daojukuang_DaoJuKuang${SPECIES[v.species].quality??1}.png)!important" data-action="openDragonStar" data-id="${v.id}" aria-label="选择${esc(SPECIES[v.species].name)}"><div>${dragonArt(v.species,'',v.level)}</div><small>Lv.${v.level} · ${dragonStars(v)}星</small></button>`).join('')}</div>`;
 const html=roster+renderSourceLayout(frame,{hidden:new Set(['container','tab_huadong']),actions:{'fanhui/btn':{type:'returnStarDragon',id,label:'返回喂养'}}})+`<div class="dragon-star-tab"><img src="assets/original/ui/ui_analysis_ico_lsx.png" alt="">龙升星</div><div class="dragon-star-left">${renderSourceLayout(left,{values,slots,hidden})}</div><div class="dragon-star-right">${renderSourceLayout(right,{values:rv,slots:rightSlots,actions,hidden:new Set(['switch_page_node','quanxuan','mask_btn']),disabled:new Set(locked||d.level<7||!selected.length?['btn_shengji/btn']:[])})}</div>`;
 const collection=document.querySelector('#modal').dataset.returnToCollection,modal=showSource('sourceDragonStar',html,'native-fullscreen');modal.dataset.dragonId=id;modal.dataset.dragonMaterialIds=selected.join(',');modal.dataset.returnToCollection=collection??'false';
}
export async function confirmDragonStar(state,id,ids){
 const plan=dragonStarPlan(state,id,ids);if(!ids.length)throw Error('请选择至少一条材料龙。');
 const previous=document.querySelector('#modal .source-artboard').innerHTML,layout=await sourceLayout('panel_apply_or_cancel'),collection=document.querySelector('#modal').dataset.returnToCollection;
 const modal=showSource('sourceDragonStarConfirm',`<div class="source-equipment-confirm-bg">${previous}</div><div class="source-equipment-confirm-shade"></div><div class="source-equipment-confirm-panel">${renderSourceLayout(layout,{values:{txt_name:'融合升星',txt_miaoshu:`将消耗 ${ids.length} 条材料龙，获得 ${plan.gained} 经验。确认后材料龙消失，是否继续？`,'btn_QueDing/txt_name':'融合','btn_quxiao/txt_name':'取消'},actions:{'btn_QueDing/btn':{type:'starDragon',id,label:'确认融合'},'btn_quxiao/btn':{type:'cancelStarDragon',id,label:'取消融合'},btn_close:{type:'cancelStarDragon',id,label:'取消融合'}}})}</div>`,'native-fullscreen');modal.classList.add('source-equipment-confirm');modal.dataset.dragonId=id;modal.dataset.dragonMaterialIds=ids.join(',');modal.dataset.returnToCollection=collection??'false';
}
