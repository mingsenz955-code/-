import {renderSourceLayout} from './source-layout.mjs';
import {SPECIES,breedingOptions} from './data.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {playerProgress,income,isBreedingParent,dragonRate} from './game.mjs';
import {ORIGINAL_HABITATS,habitatInfo,habitatDefinition,habitatLimit,acceptsDragon} from './habitats.mjs';
import {EXPANSION_POLICY,nextExpansion} from './expansion.mjs';
import {dragonArt,eggArt} from './art.mjs';
const layouts=new Map();
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const duration=seconds=>seconds>=3600?`${Math.floor(seconds/3600)}小时${Math.floor(seconds%3600/60)}分`:seconds>=60?`${Math.floor(seconds/60)}分${seconds%60}秒`:`${seconds}秒`;
const timer=at=>`<span data-timer="${at}"></span>`;
export const nativeButton=(text,action,attrs='',disabled=false)=>`<button class="native-game-button" data-action="${action}" ${attrs} ${disabled?'disabled':''}>${esc(text)}</button>`;
const image=(src,cls='native-item-art')=>`<img class="${cls}" src="${esc(src)}" alt="">`;
export async function sourceLayout(name){if(!layouts.has(name))layouts.set(name,fetch(`assets/original/layouts/${name}.json`).then(r=>{if(!r.ok)throw Error('原界面未载入');return r.json()}));return structuredClone(await layouts.get(name))}
export function showSource(name,html,extra=''){
 const d=document.querySelector('#modal');if(d.open)d.close();d.className=`source-dragon-dialog native-ranch-dialog ${extra}`;d.dataset.mode=name;d.style.setProperty('--source-scale',Math.min((innerWidth-20)/1024,(innerHeight-20)/768));d.innerHTML=`<div class="source-artboard">${html}</div>`;d.showModal();return d;
}
export async function openNativePaper(title,body,mode='nativePaper'){
 const l=await sourceLayout('panel_building_info');return showSource(mode,renderSourceLayout(l,{values:{txt_name:title,miaoshu:'',neirong:'',shuzi:''},hidden:new Set(['con_img','exp','btn_FangRuLongChao','weijiesuo','gold_bg','con_cost']),actions:{btn_GuanBiXiao:{type:'close',label:'关闭'}}})+`<div class="native-paper-body">${body}</div>`);
}
export async function openShop(state){
 const l=await sourceLayout('ui_shop'),labels={longdan:'龙蛋',jianzhu:'建筑',zhuangshi:'装饰品',longchao:'龙巢',kuojian:'扩建',ziyuan:'资源'},actions={close:{type:'close',label:'关闭商店'}},slots={};
 for(const [key,label] of Object.entries(labels)){actions[key+'/btn']={type:key==='longchao'?'habitatShop':key==='kuojian'?'expansionShop':'unavailable',label};slots[key+'/con_name']=`<span class="native-category-label">${label}</span>`}
 showSource('nativeShop',renderSourceLayout(l,{values:{txt_name:'商城'},slots,actions}),'native-fullscreen');
}
export async function openExpansionShop(state){
 const [l,item]=await Promise.all([sourceLayout('ui_shop_lv2'),sourceLayout('item_shop')]);
 const plots=state.expansion?.plots??0,step=nextExpansion(plots),level=playerProgress(state).level,locked=step?level<step.minLevel:true;
 const art=`assets/original/ui/thumbs_store_expansion_island_${Math.min(2+(plots%3),4)}.png`;
 const card=step?`<article class="native-shop-card" data-expansion-plot="${step.index}">${renderSourceLayout(item,{values:{txt_name:`扩建第 ${plots+1} 块地`,shuoming:`需要牧场 Lv.${step.minLevel}　金币 ${step.coins.toLocaleString('zh-CN')}${step.gems>0?`　魔晶 ${step.gems}`:''}`,txt_shuliang:plots,weijiesuo_shuzi:`${step.minLevel} 级解锁`,tx_name:'',tx_power:''},hidden:new Set(['huangzuan',...(locked?['goumai_shuzi']:['weijiesuo'])]),actions:{'goumai_shuzi/btn':{type:'expandIsland',label:'扩建'}},slots:{con_img:`<img class="native-item-art" src="${art}" alt="">`,con_cost:`<img class="native-cost-icon" src="assets/original/ui/${step.gems>0?'ui_main_08.png':'ui_main_06.png'}" alt="">`}})}</article>`:'';
 showSource('nativeExpansion',renderSourceLayout(l,{values:{txt_name:'扩建',txt_JinBi:state.coins.toLocaleString('zh-CN'),txt_MoJing:state.gems,txt_LongHun:'—'},hidden:new Set(['longzuleixing']),actions:{close:{type:'close',label:'关闭'},fanhui:{type:'openHabitats',label:'返回商店'}},slots:{huadong:card?`<div class="native-shop-list">${card}</div>`:'<div class="native-warehouse-empty">原版扩建阶梯已经到头</div>'}}),'native-fullscreen');
}
export async function openHabitatShop(state,{moveDragon=null,hatch=false}={}){
 const [l,item]=await Promise.all([sourceLayout('ui_shop_lv2'),sourceLayout('item_shop')]),level=playerProgress(state).level;
 const choices=moveDragon||hatch?state.habitats:ORIGINAL_HABITATS.filter(h=>h.in_store);
 const cards=choices.map(entry=>{const info=moveDragon||hatch?habitatInfo(entry):entry,locked=moveDragon||hatch?!acceptsDragon(entry,moveDragon?.species??state.incubator?.species)||entry.job||state.dragons.filter(d=>d.habitatId===entry.id).length>=info.capacity:level<info.min_level;
  const act=moveDragon?'moveNative':hatch?'hatchNative':'habitatPurchase';
  return `<article class="native-shop-card" data-habitat-offer="${entry.id}">${renderSourceLayout(item,{values:{txt_name:info.nameCN??entry.name,shuoming:`容量 ${info.capacity}　存金 ${info.maxGold}`,txt_shuliang:moveDragon||hatch?`${state.dragons.filter(d=>d.habitatId===entry.id).length}/${info.capacity}`:Object.values(info.costs).join('/'),buy_txt:moveDragon||hatch?'放入':'查看',weijiesuo_shuzi:moveDragon||hatch?(entry.job?'施工中':!acceptsDragon(entry,moveDragon?.species??state.incubator?.species)?'元素不符':'龙巢已满'):`${info.min_level}级解锁`,tx_name:'',tx_power:''},hidden:new Set(['huangzuan',...(locked?['goumai_shuzi']:['weijiesuo']),...((moveDragon||hatch)?['con_cost']:[])]),actions:{'goumai_shuzi/btn':{type:act,id:entry.id,label:moveDragon||hatch?'放入龙巢':info.nameCN}},slots:{con_img:image(info.image),con_cost:image(`assets/original/ui/${info.costs?.c?'ui_main_08.png':'ui_main_06.png'}`,'native-cost-icon')}})}</article>`
 }).join('');
 const d=showSource(moveDragon?'nativeMove':hatch?'nativeHatchChoose':'nativeHabitatShop',renderSourceLayout(l,{values:{txt_name:moveDragon?'迁移龙巢':hatch?'选择龙巢':'龙巢',txt_JinBi:state.coins.toLocaleString('zh-CN'),txt_MoJing:state.gems,txt_LongHun:'—'},hidden:new Set(['longzuleixing']),actions:{close:{type:'close',label:'关闭'},fanhui:{type:moveDragon?'returnMoveDragon':hatch?'openIncubator':'openHabitats',id:moveDragon?.id,label:'返回'}},slots:{huadong:`<div class="native-shop-list">${cards}</div>`}}),'native-fullscreen');if(moveDragon)d.dataset.dragonId=moveDragon.id;
}
export async function openHabitatInfo(state,id,{purchase=false}={}){
 const h=purchase?habitatDefinition(id):state.habitats.find(h=>h.id===id);if(!h)throw Error('龙巢不存在');const info=purchase?h:habitatInfo(h),l=await sourceLayout('panel_habitat_info'),next=!purchase&&habitatDefinition(info.upgrades_to),level=playerProgress(state).level;
 const residents=purchase?[]:state.dragons.filter(d=>d.habitatId===id);
 const content=`<div class="native-habitat-description">${purchase?`建造时间：${duration(info.build_time)}<br>牧场等级：${info.min_level}`:residents.map(d=>`<button class="native-resident" data-action="openDragon" data-id="${d.id}">${dragonArt(d.species,'',d.level)}<span>${esc(SPECIES[d.species].name)} Lv.${d.level}</span></button>`).join('')||'等待幼龙入住'}${!purchase?`<div>待收金币：<b data-income="${id}">${income(state,h)}</b></div>`:''}${h.job?`<div>${h.job.kind==='build'?'建造':'升级'}中　${timer(h.job.readyAt)}</div>`:''}</div>`;
 const action=purchase?'buyHabitat':h.job?'completeHabitat':'collect',label=purchase?'建造':h.job?'完成施工':'收金币';
 const disabled=purchase?(level<info.min_level||state.habitats.length>=habitatLimit(level)):h.job&&Date.now()<h.job.readyAt;
 const d=showSource(purchase?'nativeHabitatPurchase':'nativeHabitatInfo',renderSourceLayout(l,{values:{txt_name:info.nameCN??h.name,fuhuashangxian:'饲养上限',fuhuashangxian_shuzi:info.capacity,chanchushangxian:'产出上限',chanchushangxian_shuzi:info.maxGold,miaoshu:'龙巢信息',neirong:'',shuzi:purchase?Object.values(info.costs).join('/'):'','exp/tx_xp':purchase?info.xp??'':'','exp/tx_xp_t':purchase?'经验：':'','btn_FangRuLongChao/txt_name':label},hidden:new Set(['weijiesuo',...(!purchase?['gold_bg','con_cost','exp']:[])]),disabled:new Set(disabled?['btn_FangRuLongChao/btn']:[]),actions:{btn_GuanBiXiao:{type:'close',label:'关闭龙巢信息'},'btn_FangRuLongChao/btn':{type:action,id,label}},slots:{con_img:image(info.image),neirong:content,con_cost:image(`assets/original/ui/${info.costs?.c?'ui_main_08.png':'ui_main_06.png'}`,'native-cost-icon')}})+(!purchase&&next&&!h.job?`<div class="native-habitat-upgrade">${nativeButton('升级','upgradeHabitat',`data-id="${id}"`,level<next.min_level)}<span>${esc(next.nameCN)}　${Object.values(next.costs).join('/')}　${duration(next.build_time)}</span></div>`:''));d.dataset.habitatId=id;if(h.job){const b=d.querySelector('[data-action=completeHabitat]');b.dataset.ready=h.job.readyAt}
}
let parentA,parentB;
export async function openBreed(state,{side=null,id=null}={}){
 if(state.breeding)return openBreedingJob(state);
 if(side===0)parentA=id;if(side===1)parentB=id;
 if(!state.dragons.some(d=>d.id===parentA))parentA=state.dragons[0]?.id;
 if(!state.dragons.some(d=>d.id===parentB))parentB=state.dragons.find(d=>d.id!==parentA)?.id;
 const [l,item]=await Promise.all([sourceLayout('ui_breed'),sourceLayout('item_breed')]);
 const list=side=>`<div class="native-parent-list">${state.dragons.map(d=>{const selected=d.id===(side?parentB:parentA),blocked=d.level<4||isBreedingParent(state,d.id);return `<div class="native-parent-card">${renderSourceLayout(item,{values:{tx_name:SPECIES[d.species].name,tx_type:SPECIES[d.species].element,tx_lv:'Lv'+d.level},actions:{btn:{type:'chooseParent',id:d.id,value:side,label:SPECIES[d.species].name}},checked:new Set(selected?['btn']:[]),disabled:new Set(blocked?['btn']:[]),slots:{icon:`<div class="native-parent-portrait">${dragonArt(d.species,'',d.level)}</div>`}})}</div>`}).join('')}</div>`;
 const a=state.dragons.find(d=>d.id===parentA),b=state.dragons.find(d=>d.id===parentB),opts=a&&b?breedingOptions(a.species,b.species):[];
 const previews=(opts??[]).map(p=>`<div class="native-breed-outcome">${eggArt(p.species)}<span>${esc(SPECIES[p.species].name)}</span></div>`).join('');
 const d=showSource('nativeBreed',renderSourceLayout(l,{values:{txt_name:'育龙',miaoshu:'培育山',txt:'选择一条龙',preview:'可能的结果',txt_peiyudan:'—',hint2:'',shuoming1:'',shuoming2:'', 'btn_peiyu_free/txt_name':'培育'},hidden:new Set(['btn_shengmingshan','btn_peiyu','btn_peiyudan','hint2','hint3','btn_peiyushan/hint']),actions:{close:{type:'close',label:'关闭育龙'},'btn_peiyu_free/btn':{type:'breed',label:'开始培育'},tishi:{type:'breedHelp',label:'育龙说明'}},disabled:new Set(!a||!b||a.id===b.id||a.level<4||b.level<4?['btn_peiyu_free/btn']:[]),slots:{huadong_left:list(0),huadong_right:list(1),huadong_preview:`<div class="native-outcome-list">${previews||'当前亲代组合没有已核实的候选。'}</div>`}}),'native-fullscreen');d.dataset.parentA=parentA;d.dataset.parentB=parentB;
}
async function openBreedingJob(state){
 const l=await sourceLayout('panel_breed_building'),b=state.breeding,base='yulongshan',slots={};
 slots[base+'/img_building']=image('assets/original/world/0019_breeding_cave_a_g_bg.png');
 b.parents.forEach((id,i)=>{const dragon=state.dragons.find(d=>d.id===id);slots[base+`/di${i+1}/icon`]=`<div class="native-parent-portrait">${dragonArt(dragon.species,'',dragon.level)}</div>`});
 slots[base+'/tx_doc']=`<span class="native-job-text">${b.phase==='egg'?'龙蛋待转移':`繁殖中　${timer(b.readyAt)}`}</span>`;
 const act=b.phase==='egg'?'incubate':'takeEgg',label=b.phase==='egg'?'转入育龙塔':'领取龙蛋';
 const d=showSource('nativeBreedingJob',renderSourceLayout(l,{values:{txt_name:'培育山','yulongshan/txt_yulongta':'培育山','yulongshan/btn_LiKeWanCheng/txt_name':label,'shengmingshan/txt_yulongta':'生命之山','shengmingshan/tx_doc':'尚未开放','shengmingshan/btn_LiKeWanCheng/txt_name':'未开放'},hidden:new Set(['yulongshan/quality1','yulongshan/quality2','yulongshan/con1','yulongshan/con2','yulongshan/wg_state','shengmingshan/quality1','shengmingshan/quality2','shengmingshan/con1','shengmingshan/con2','shengmingshan/wg_state']),disabled:new Set((b.phase==='egg'?!!state.incubator:Date.now()<b.readyAt)?['yulongshan/btn_LiKeWanCheng/btn']:[]),actions:{btn_GuanBiXiao:{type:'close',label:'关闭培育山'},'yulongshan/btn_LiKeWanCheng/btn':{type:act,label}},slots}));if(b.phase==='breeding')d.querySelector('[data-action=takeEgg]').dataset.ready=b.readyAt;
}
export async function openIncubator(state){
 const i=state.incubator;
 if(!i){const l=await sourceLayout('panel_yulongta_info');return showSource('nativeIncubator',renderSourceLayout(l,{values:{txt_name:'初级育龙塔',shuzi_fuhua:'1',fuhua_shangxian:'孵化上限',miaoshu:'说明',neirong:'育龙塔空闲。将培育山的龙蛋转入这里进行孵化。',hint_vip:'',shuzi:'','btn_FangRuLongChao/txt_name':'前往培育山'},hidden:new Set(['weijiesuo','gold_bg','con_cost','exp']),actions:{btn_GuanBiXiao:{type:'close',label:'关闭育龙塔'},'btn_FangRuLongChao/btn':{type:'openBreed',label:'前往培育山'}},slots:{con_img:image('assets/original/world/0001_incubator_g_bg.png')}}))}
 if(Date.now()<i.readyAt){const l=await sourceLayout('panel_building_speedup');const d=showSource('nativeIncubator',renderSourceLayout(l,{values:{txt_name:'初级育龙塔',txt_tishi:'孵化中',txt_duixiang:'',huafei_t:'',huafei:'','btn_PeiYu/txt_name':'查看幼龙'},actions:{btn_GuanBiXiao:{type:'close',label:'关闭育龙塔'},'btn_PeiYu/btn':{type:'openIncubator',label:'查看幼龙'}},disabled:new Set(['btn_PeiYu/btn']),slots:{con:`<div class="native-timed-art">${eggArt(i.species)}</div><span class="native-timed-label">剩余时间　${timer(i.readyAt)}</span>`}}));d.querySelector('[data-action=openIncubator]').dataset.ready=i.readyAt;return d}
 const l=await sourceLayout('panel_hatch'),sp=SPECIES[i.species],slots={con_img:`<div class="native-hatch-dragon">${dragonArt(i.species,'',1)}</div>`};
 for(let n=1;n<=3;n++)slots['img_type'+n]=sp.attributes?.[n-1]?image(`assets/original/ui/shangcheng_long_shuxing_${sp.attributes[n-1]}.png`,'native-cost-icon'):'';
 return showSource('nativeHatch',renderSourceLayout(l,{values:{txt_name:sp.name,type_text:sp.element,chanliang:'产量',tx_rate:`${dragonRate({species:i.species,level:1})}/分钟`,shuxing:'属性',power_miaoshu:'战斗力',power:'—',shuoming:'请选择幼龙入住的龙巢',txt_jineng:'技能','btn_FangRuLongChao/txt_name':'放入龙巢','btn_ChuShou/txt_name':'出售'},hidden:new Set(['type_sky','type_land']),actions:{btn_GuanBiXiao:{type:'close',label:'关闭幼龙信息'},'btn_FangRuLongChao/btn':{type:'chooseHatchHabitat',label:'放入龙巢'}},slots}));
}
export async function openCatalog(state,filter='all'){
 const [l,item]=await Promise.all([sourceLayout('ui_book_new'),sourceLayout('item_book_show')]);
 const rows=CATALOG.filter(d=>filter==='all'||d.original.attributes.includes(filter)),values={txt_name:'龙族图鉴',exp_num:'—',exp_progress:'', 'book_ability/miaoshu1':'龙谱加成','book_ability/miaoshu2':'','btn_dragon/miaoshu':'龙族'};
 const attributes={life:'生命',atk:'攻击',def:'防御',resilience:'抗性',critical:'暴击',dodge:'闪避',hit:'命中'};
 for(const [key,label] of Object.entries(attributes)){values[`book_ability/${key}/miaoshu`]=label;values[`book_ability/${key}/num`]='—'}
 const actions={close:{type:'close',label:'关闭图鉴'},help:{type:'catalogHelp',label:'图鉴说明'}},checked=new Set(['btn_dragon/btn','longzuleixing/'+filter]);
 for(const key of ['all','e','f','w','p','el','i','m','d'])actions['longzuleixing/'+key]={type:'catalogFilter',value:key,label:key};
 const cards=rows.map(dragon=>`<button class="native-book-card" data-action="acquisition" data-id="${dragon.id}" aria-label="${esc(dragon.name)}">${renderSourceLayout(item,{values:{name:dragon.name},hidden:new Set(['bg','ability1','ability2','new','lock']),slots:{daojukuang:image(`assets/original/ui/ui_daojukuang_DaoJuKuang${dragon.extended.quality}.png`,'native-book-frame'),icon:dragon.images[1]?image(dragon.images[1],'native-book-icon'):'<span>图像待补</span>'}})}</button>`).join('');
 showSource('nativeCatalog',renderSourceLayout(l,{values,actions,checked,progress:{exp:0},slots:{huadong:`<div class="native-book-list">${cards}</div>`}}),'native-fullscreen');
}
