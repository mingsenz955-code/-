import {ISLANDS,islandOf,unlockedIslands} from './islands.mjs';
import UI_SIZES from '../assets/original/data/ui-sizes.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {SPECIES,breedingOptions,speciesKey} from './data.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {playerProgress,income,isBreedingParent,dragonRate,incubatorSpeedCost} from './game.mjs';
import {ORIGINAL_HABITATS,habitatInfo,habitatDefinition,habitatLimit,habitatBuildStatus,acceptsDragon} from './habitats.mjs';
import {EXPANSION_POLICY,nextExpansion} from './expansion.mjs';
import {RESOURCE_SHOP_OFFERS,RESOURCE_SHOP_TYPES} from './resource-shop.mjs';
import {dragonArt,eggArt} from './art.mjs';
import {ORIGINAL_SHOP_ITEMS} from '../assets/original/data/shop.mjs';
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
 for(const [key,label] of Object.entries(labels)){actions[key+'/btn']={type:key==='longchao'?'habitatShop':key==='kuojian'?'expansionShop':key==='ziyuan'?'resourceShop':key==='longdan'?'originalShopCategory':key==='jianzhu'?'originalShopCategory':key==='zhuangshi'?'originalShopCategory':'unavailable',value:{longdan:'eggs',jianzhu:'buildings',zhuangshi:'decorations'}[key],label};slots[key+'/con_name']=`<span class="native-category-label">${label}</span>`}
 showSource('nativeShop',renderSourceLayout(l,{values:{txt_name:'商城'},slots,actions}),'native-fullscreen');
}
export async function openOriginalShopCategory(state,category){
 const [l,item]=await Promise.all([sourceLayout('ui_shop_lv2'),sourceLayout('item_shop')]),titles={eggs:'龙蛋',buildings:'建筑',decorations:'装饰品'},level=playerProgress(state).level;
 const cards=ORIGINAL_SHOP_ITEMS.filter(row=>row.category===category).map(row=>{const costs=Object.entries(row.costs).map(([unit,value])=>`${value.toLocaleString('zh-CN')} ${{g:'金币',c:'魔晶',f:'龙粮'}[unit]??unit}`).join('、'),locked=false;return `<article class="native-shop-card" data-original-shop-item="${row.id}">${renderSourceLayout(item,{values:{txt_name:row.nameCN,shuoming:`${costs}　${row.min_level?`牧场Lv.${row.min_level}`:'商店龙蛋'}`,txt_shuliang:Object.values(row.costs).join('/'),weijiesuo_shuzi:`${row.min_level??'—'} 级解锁`,tx_name:'',tx_power:'','goumai_shuzi/buy_txt':category==='eggs'?'购买':'建造'},hidden:new Set([...(locked?['goumai_shuzi']:['weijiesuo']),...(row.costs.c?['jinbi']:['huangzuan'])]),actions:{'goumai_shuzi/btn':{type:category==='eggs'?'buyShopEgg':'buyStructure',id:row.id,label:`购买${row.nameCN}`}},slots:{con_img:row.category==='eggs'?eggArt(speciesKey(row.id)):row.thumbnail?image(row.thumbnail):'<span class="source-shop-missing">原图待取得</span>',con_cost:image(`assets/original/ui/${row.costs.c?'ui_main_08.png':'ui_main_06.png'}`,'native-cost-icon')}})}</article>`}).join('');
 return showSource('nativeOriginalShop',renderSourceLayout(l,{values:{txt_name:titles[category]??'商城',txt_JinBi:state.coins.toLocaleString('zh-CN'),txt_MoJing:state.gems,txt_LongHun:'—'},hidden:new Set(['longzuleixing']),actions:{close:{type:'close',label:'关闭'},fanhui:{type:'openHabitats',label:'返回商店'}},slots:{huadong:`<div class="native-shop-list">${cards}</div>`}}),'native-fullscreen');
}
export async function openOriginalShopInfo(state,id){const row=ORIGINAL_SHOP_ITEMS.find(item=>item.id===id);if(!row)return;const costs=Object.entries(row.costs).map(([unit,value])=>`${value.toLocaleString('zh-CN')} ${{g:'金币',c:'魔晶',f:'龙粮'}[unit]??unit}`).join('、'),buy=['buildings','decorations','eggs'].includes(row.category);return openNativePaper(row.nameCN,`${row.thumbnail?`<img class="native-shop-info-art" src="${row.thumbnail}" alt="">`:''}<p>售价：${costs}</p><p>出售：${row.sell_price?.g?.toLocaleString('zh-CN')??'—'} 金币</p>${row.width?`<p>占地：${row.width} × ${row.height} 格</p>`:''}${row.build_time!==undefined?`<p>建造时间：${duration(row.build_time)}</p>`:''}${buy?`<div class="native-save-actions">${nativeButton(row.category==='eggs'?'购买龙蛋':'购买并摆放',row.category==='eggs'?'buyShopEgg':'buyStructure',`data-id="${row.id}"`)}</div>`:''}`,'nativeOriginalShopInfo')}
function transferButtons(state,object,kind){return `<div class="native-island-transfer">${ISLANDS.filter(i=>i.id<unlockedIslands(state)&&i.id!==islandOf(object)).map(i=>nativeButton('迁往'+i.name,'transferBuilding',`data-id="${object.id}" data-kind="${kind}" data-island="${i.id}"`)).join('')}</div>`}
export async function openStructureInfo(state,id){const structure=state.structures.find(o=>o.id===id),row=structure&&ORIGINAL_SHOP_ITEMS.find(r=>r.id===structure.itemId);if(!row)return;return openNativePaper(row.nameCN,`${row.thumbnail?`<img class="native-shop-info-art" src="${row.thumbnail}" alt="">`:''}<p>占地：${row.width} × ${row.height} 格</p>${structure.readyAt?`<p>施工中：${timer(structure.readyAt)}</p>`:'<p>已建成</p>'}<div class="native-save-actions">${nativeButton('移动','beginStructureMove',`data-id="${id}"`)}${structure.readyAt?(Date.now()<structure.readyAt?nativeButton('加速完成','openBuildingSpeed',`data-id="${id}" data-kind="structure"`):nativeButton('完成施工','completeStructure',`data-id="${id}"`)):''}${row.sell_price?.g!==undefined?nativeButton(`出售 ${row.sell_price.g} 金币`,'sellStructure',`data-id="${id}"`):''}</div>${transferButtons(state,structure,'structure')}`,'nativeStructureInfo')}
export async function openExpansionShop(state){
 const [l,item]=await Promise.all([sourceLayout('ui_shop_lv2'),sourceLayout('item_shop')]);
 const plots=state.expansion?.plots??0,step=nextExpansion(plots),level=playerProgress(state).level,locked=step?level<step.minLevel:true;
 const art=`assets/original/ui/thumbs_store_expansion_island_${Math.min(2+(plots%3),4)}.png`;
 const card=step?`<article class="native-shop-card" data-expansion-plot="${step.index}">${renderSourceLayout(item,{values:{txt_name:plots<3?`解锁第 ${plots+2} 座龙岛`:`扩建第 ${plots+1} 块地`,shuoming:`需要牧场 Lv.${step.minLevel}　金币 ${step.coins.toLocaleString('zh-CN')}${step.gems>0?`　魔晶 ${step.gems}`:''}`,txt_shuliang:plots,weijiesuo_shuzi:`${step.minLevel} 级解锁`,tx_name:'',tx_power:''},hidden:new Set(['huangzuan',...(locked?['goumai_shuzi']:['weijiesuo'])]),actions:{'goumai_shuzi/btn':{type:'expandIsland',label:'扩建'}},slots:{con_img:`<img class="native-item-art" src="${art}" alt="">`,con_cost:`<img class="native-cost-icon" src="assets/original/ui/${step.gems>0?'ui_main_08.png':'ui_main_06.png'}" alt="">`}})}</article>`:'';
 showSource('nativeExpansion',renderSourceLayout(l,{values:{txt_name:'扩建',txt_JinBi:state.coins.toLocaleString('zh-CN'),txt_MoJing:state.gems,txt_LongHun:'—'},hidden:new Set(['longzuleixing']),actions:{close:{type:'close',label:'关闭'},fanhui:{type:'openHabitats',label:'返回商店'}},slots:{huadong:card?`<div class="native-shop-list">${card}</div>`:'<div class="native-warehouse-empty">原版扩建阶梯已经到头</div>'}}),'native-fullscreen');
}
export async function openResourceShop(state,{type=null}={}){
 const [l,item]=await Promise.all([sourceLayout('ui_shop_lv2'),sourceLayout('item_shop')]);
 // ui/ResourceShopPanel.lua sells these rows for 魔晶; amounts, prices and the 折扣 badges are
 // the client's own values. Rows whose reward has no system in this offline build stay off sale.
 // 金币 / 食物 / 进化果实 are kept in separate sections instead of one mixed list: a currency ＋
 // opens the shop on its own kind, and the shop's 资源 category shows all supported sections.
 const kinds=type?[type]:Object.keys(RESOURCE_SHOP_TYPES);
 const sections=kinds.map(kind=>{
  const offers=RESOURCE_SHOP_OFFERS.filter(row=>row.type===kind);
  if(!offers.length)return '';
  const cards=offers.map(row=>{
   const icon=(row.type==='l1'?'ui_lottery_47':row.type==='l2'?'ui_lottery_48':'resource_icon_80_'+row.type)+'.png';const slots={con_img:row.type==='d'?eggArt(speciesKey(row.xid)):UI_SIZES[icon]?image('assets/original/ui/'+icon):`<span class="native-unpictured-prop">${esc(row.name)}</span>`,con_cost:image('assets/original/ui/ui_main_08.png','native-cost-icon')};
   if(row.zhekouIcon)slots.con_zhekou=image(`assets/original/ui/ui_zhekou_${row.zhekouIcon}.png`,'native-cost-icon');
   return `<article class="native-shop-card" data-resource-offer="${row.id}" data-resource-kind="${row.type}">${renderSourceLayout(item,{values:{txt_name:row.name,shuoming:`${RESOURCE_SHOP_TYPES[row.type]} ${row.amount.toLocaleString('zh-CN')}`,txt_shuliang:row.priceGems,'goumai_shuzi/buy_txt':'购买',weijiesuo_shuzi:`${row.priceGems} 魔晶`,tx_name:'',tx_power:''},hidden:new Set(['huangzuan','weijiesuo','shuxing1','shuxing2','shuxing3','pinzhi']),actions:{'goumai_shuzi/btn':{type:'buyResource',id:row.id,label:`购买${row.name}`}},slots})}</article>`;
  }).join('');
  return `<section class="native-resource-group" data-resource-section="${kind}"><h3 class="native-resource-heading">${RESOURCE_SHOP_TYPES[kind]}</h3><div class="native-resource-row">${cards}</div></section>`;
 }).join('');
 const d=showSource('nativeResourceShop',renderSourceLayout(l,{values:{txt_name:type?`资源 · ${RESOURCE_SHOP_TYPES[type]}`:'资源',txt_JinBi:state.coins.toLocaleString('zh-CN'),txt_MoJing:state.gems,txt_LongHun:'—'},hidden:new Set(['longzuleixing']),actions:{close:{type:'close',label:'关闭'},fanhui:{type:'openHabitats',label:'返回商店'}},slots:{huadong:`<div class="native-resource-groups">${sections}</div>`}}),'native-fullscreen');
 // Keeps the section the player came in on after a purchase reopens the panel.
 d.dataset.resourceKind=type??'';
}
export async function openHabitatShop(state,{moveDragon=null,hatch=false}={}){
 const [l,item]=await Promise.all([sourceLayout('ui_shop_lv2'),sourceLayout('item_shop')]),level=playerProgress(state).level;
 const choices=moveDragon||hatch?state.habitats:ORIGINAL_HABITATS;
 const cards=choices.map(entry=>{const info=moveDragon||hatch?habitatInfo(entry):entry,locked=moveDragon||hatch?!acceptsDragon(entry,moveDragon?.species??state.incubator?.species)||entry.job||state.dragons.filter(d=>d.habitatId===entry.id).length>=info.capacity:false;
  const act=moveDragon?'moveNative':hatch?'hatchNative':'habitatPurchase';
  return `<article class="native-shop-card" data-habitat-offer="${entry.id}">${renderSourceLayout(item,{values:{txt_name:info.nameCN??entry.name,shuoming:`容量 ${info.capacity}　存金 ${info.maxGold}`,txt_shuliang:moveDragon||hatch?`${state.dragons.filter(d=>d.habitatId===entry.id).length}/${info.capacity}`:Object.values(info.costs).join('/'),buy_txt:moveDragon||hatch?'放入':'查看',weijiesuo_shuzi:moveDragon||hatch?(entry.job?'施工中':!acceptsDragon(entry,moveDragon?.species??state.incubator?.species)?(SPECIES[moveDragon?.species??state.incubator?.species]?.isLegendHabitat?'需要神圣系龙巢':'元素不符'):'龙巢已满'):`${info.min_level}级解锁`,tx_name:'',tx_power:''},hidden:new Set(['huangzuan',...(locked?['goumai_shuzi']:['weijiesuo']),...((moveDragon||hatch)?['con_cost']:[])]),actions:{'goumai_shuzi/btn':{type:act,id:entry.id,label:moveDragon||hatch?'放入龙巢':info.nameCN}},slots:{con_img:image(info.image),con_cost:image(`assets/original/ui/${info.costs?.c?'ui_main_08.png':'ui_main_06.png'}`,'native-cost-icon')}})}</article>`
 }).join('');
 const d=showSource(moveDragon?'nativeMove':hatch?'nativeHatchChoose':'nativeHabitatShop',renderSourceLayout(l,{values:{txt_name:moveDragon?'迁移龙巢':hatch?'选择龙巢':'龙巢',txt_JinBi:state.coins.toLocaleString('zh-CN'),txt_MoJing:state.gems,txt_LongHun:'—'},hidden:new Set(['longzuleixing']),actions:{close:{type:'close',label:'关闭'},fanhui:{type:moveDragon?'returnMoveDragon':hatch?'openIncubator':'openHabitats',id:moveDragon?.id,label:'返回'}},slots:{huadong:`<div class="native-shop-list">${cards}</div>`}}),'native-fullscreen');if(moveDragon)d.dataset.dragonId=moveDragon.id;
}
export async function openHabitatInfo(state,id,{purchase=false}={}){
 const h=purchase?habitatDefinition(id):state.habitats.find(h=>h.id===id);if(!h)throw Error('龙巢不存在');const info=purchase?h:habitatInfo(h),l=await sourceLayout('panel_habitat_info'),next=!purchase&&habitatDefinition(info.upgrades_to),level=playerProgress(state).level;
 const residents=purchase?[]:state.dragons.filter(d=>d.habitatId===id);
 const capacity=habitatBuildStatus(state,level);
 const shortCurrency=purchase&&Object.entries(info.costs).find(([unit,cost])=>state[{g:'coins',c:'gems',f:'food'}[unit]]<cost);
 const content=`<div class="native-habitat-description">${purchase?`龙巢数量：${capacity.owned}/${capacity.limit} 座${capacity.blocked?`<p class="error">已达数量上限。${capacity.next?`牧场 ${capacity.next.level} 级可拥有 ${capacity.next.limit} 座。`:'可通过扩建增加上限。'}</p>${nativeButton('查看扩建','expansionShop')}`:''}<br>建造时间：${duration(info.build_time)}<br>牧场等级：${info.min_level}<br>当前金币：${state.coins.toLocaleString('zh-CN')}　当前魔晶：${state.gems}${shortCurrency?`<p class="error">${{g:'金币',c:'魔晶',f:'龙粮'}[shortCurrency[0]]}不足：需要 ${shortCurrency[1]}。</p>${shortCurrency[0]==='c'?nativeButton('获取魔晶','openRecharge'):''}`:''}`:residents.map(d=>`<button class="native-resident" data-action="openDragon" data-id="${d.id}">${dragonArt(d.species,'',d.level)}<span>${esc(SPECIES[d.species].name)} Lv.${d.level}</span></button>`).join('')||'等待幼龙入住'}${!purchase?`<div>待收金币：<b data-income="${id}">${income(state,h)}</b></div>`:''}${!purchase?transferButtons(state,h,'habitat'):''}${h.job?`<div>${h.job.kind==='build'?'建造':'升级'}中　${timer(h.job.readyAt)}</div>`:''}</div>`;
 const waiting=h.job&&Date.now()<h.job.readyAt,action=purchase?'buyHabitat':waiting?'openBuildingSpeed':h.job?'completeHabitat':'collect',label=purchase?'建造':waiting?'加速完成':h.job?'完成施工':'收金币';
 const disabled=purchase&&capacity.blocked;
 const d=showSource(purchase?'nativeHabitatPurchase':'nativeHabitatInfo',renderSourceLayout(l,{values:{txt_name:info.nameCN??h.name,fuhuashangxian:'饲养上限',fuhuashangxian_shuzi:info.capacity,chanchushangxian_shuzi:info.maxGold,chanchushangxian:'产出上限',miaoshu:'龙巢信息',neirong:'',shuzi:purchase?Object.values(info.costs).join('/'):'','exp/tx_xp':purchase?info.xp??'':'','exp/tx_xp_t':purchase?'经验：':'','btn_FangRuLongChao/txt_name':label},hidden:new Set(['weijiesuo',...(!purchase?['gold_bg','con_cost','exp']:[])]),disabled:new Set(disabled?['btn_FangRuLongChao/btn']:[]),actions:{btn_GuanBiXiao:{type:'close',label:'关闭龙巢信息'},'btn_FangRuLongChao/btn':{type:action,id,label}},slots:{con_img:image(info.image),neirong:content,con_cost:image(`assets/original/ui/${info.costs?.c?'ui_main_08.png':'ui_main_06.png'}`,'native-cost-icon')}})+(!purchase?`<div class="native-habitat-upgrade">${nativeButton('移动','beginBuildingMove',`data-id="${id}"`)}${next&&!h.job?`${nativeButton('升级','upgradeHabitat',`data-id="${id}"`,level<next.min_level)}<span>${esc(next.nameCN)}　${Object.values(next.costs).join('/')}　${duration(next.build_time)}</span>`:''}</div>`:''));d.dataset.habitatId=id;if(waiting)d.querySelector('[data-action=openBuildingSpeed]').dataset.kind='habitat';else if(h.job){const b=d.querySelector('[data-action=completeHabitat]');b.dataset.ready=h.job.readyAt}
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
 if(Date.now()<i.readyAt){const l=await sourceLayout('panel_building_speedup'),cost=incubatorSpeedCost(i.readyAt);return showSource('nativeIncubator',renderSourceLayout(l,{values:{txt_name:'初级育龙塔',txt_tishi:'孵化中',txt_duixiang:SPECIES[i.species].name,huafei_t:'立即完成需要',huafei:String(cost),'btn_PeiYu/txt_name':'立即完成'},actions:{btn_GuanBiXiao:{type:'close',label:'关闭育龙塔'},'btn_PeiYu/btn':{type:'speedIncubator',label:`花费${cost}魔晶立即完成`}},slots:{con:`<div class="native-timed-art">${eggArt(i.species)}</div><span class="native-timed-label">剩余时间　${timer(i.readyAt)}</span>`}}))}
 const l=await sourceLayout('panel_hatch'),sp=SPECIES[i.species],slots={con_img:`<div class="native-hatch-dragon">${dragonArt(i.species,'',1)}</div>`};
 for(let n=1;n<=3;n++)slots['img_type'+n]=sp.attributes?.[n-1]?image(`assets/original/ui/shangcheng_long_shuxing_${sp.attributes[n-1]}.png`,'native-cost-icon'):'';
 return showSource('nativeHatch',renderSourceLayout(l,{values:{txt_name:sp.name,type_text:sp.element,chanliang:'产量',tx_rate:`${dragonRate({species:i.species,level:1})}/分钟`,shuxing:'属性',power_miaoshu:'战斗力',power:'—',shuoming:'请选择幼龙入住的龙巢',txt_jineng:'技能','btn_FangRuLongChao/txt_name':'放入龙巢','btn_ChuShou/txt_name':'出售'},hidden:new Set(['type_sky','type_land']),actions:{btn_GuanBiXiao:{type:'close',label:'关闭幼龙信息'},'btn_FangRuLongChao/btn':{type:'chooseHatchHabitat',label:'放入龙巢'},'btn_ChuShou/btn':{type:'sellIncubator',label:`出售${sp.name}`}},slots}));
}
export async function openCatalog(state,filter='all'){
 const [l,item]=await Promise.all([sourceLayout('ui_book_new'),sourceLayout('item_book_show')]);
 const rows=CATALOG.filter(d=>filter==='all'||d.original.attributes.includes(filter)),values={txt_name:'龙族图鉴',exp_num:'—',exp_progress:'', 'book_ability/miaoshu1':'龙谱加成','book_ability/miaoshu2':'','btn_dragon/miaoshu':'龙族'};
 const attributes={life:'生命',atk:'攻击',def:'防御',resilience:'抗性',critical:'暴击',dodge:'闪避',hit:'命中'};
 for(const [key,label] of Object.entries(attributes)){values[`book_ability/${key}/miaoshu`]=label;values[`book_ability/${key}/num`]='—'}
 const actions={close:{type:'close',label:'关闭图鉴'},help:{type:'catalogHelp',label:'图鉴说明'}},checked=new Set(['btn_dragon/btn','longzuleixing/'+filter]);
 for(const key of ['all','e','f','w','p','el','i','m','d'])actions['longzuleixing/'+key]={type:'catalogFilter',value:key,label:key};
 const cards=rows.map(dragon=>`<button class="native-book-card" data-action="catalogDetail" data-id="${dragon.id}" aria-label="${esc(dragon.name)}">${renderSourceLayout(item,{values:{name:dragon.name},hidden:new Set(['bg','ability1','ability2','new','lock']),slots:{daojukuang:image(`assets/original/ui/ui_daojukuang_DaoJuKuang${dragon.extended.quality}.png`,'native-book-frame'),icon:dragon.images[1]?image(dragon.images[1],'native-book-icon'):'<span>图像待补</span>'}})}</button>`).join('');
 showSource('nativeCatalog',renderSourceLayout(l,{values,actions,checked,progress:{exp:0},slots:{huadong:`<div class="native-book-list">${cards}</div>`}}),'native-fullscreen');
}

export async function openBuildingSpeedDialog(state,kind,id){
 const object=kind==='habitat'?state.habitats.find(h=>h.id===id):kind==='structure'?state.structures.find(o=>o.id===id):null;
 const ready=kind==='farm'?state.farmUpgrade?.readyAt:kind==='habitat'?object?.job?.readyAt:object?.readyAt;
 if(!ready)throw Error('没有正在施工的建筑。');
 const info=kind==='habitat'?habitatInfo(object):kind==='structure'?ORIGINAL_SHOP_ITEMS.find(i=>i.id===object.itemId):ORIGINAL_SHOP_ITEMS.find(i=>i.id===state.farmUpgrade?.targetId);
 const cost=incubatorSpeedCost(ready),l=await sourceLayout('panel_building_speedup');
 const d=showSource('nativeBuildingSpeed',renderSourceLayout(l,{values:{txt_name:info?.nameCN??'农场升级',txt_tishi:'',txt_duixiang:'',huafei_t:'花费',huafei:cost,'btn_PeiYu/txt_name':'加速完成'},actions:{btn_GuanBiXiao:{type:'close',label:'关闭'},'btn_PeiYu/btn':{type:'speedBuilding',id,label:'加速完成'}},slots:{con:`${image(info?.thumbnail??info?.image??'assets/original/world/0016_farm_1_g_s1.png','native-timed-art')}<span class="native-timed-label">剩余时间　${timer(ready)}</span>`}}));d.querySelector('[data-action=speedBuilding]').dataset.kind=kind;
}
