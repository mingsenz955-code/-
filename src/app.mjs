import {openWarehouse,chooseWarehouseDragon} from './warehouse-dialog.mjs';
import {openEquipDialog,openEquipInfoDialog,openEquipChangeDialog,openEquipSourceDialog} from './equip-dialog.mjs';
import {openAdventureDialog} from './adventure-dialog.mjs';
import {adventureEvent,adventureEventKind} from './adventure.mjs';
import {equipmentInstance,definitionPart,EQUIPMENT_SLOTS} from './equipment.mjs';
import {openShop,openHabitatShop,openHabitatInfo,openExpansionShop,openBreed,openIncubator,openCatalog,openNativePaper,nativeButton} from './ranch-dialogs.mjs';
import {openRaffleDialog,openRafflePreview,closeRafflePreview} from './raffle-dialog.mjs';
import {openLotteryOptions,openLotteryDialog,openLotteryPrize,lotteryHelp} from './lottery-dialog.mjs';
import {lotteryCost} from './lottery.mjs';
import {raffleCost} from './raffle.mjs';
import {openEvolutionDialog} from './evolution-dialog.mjs';
import {dragonAcquisition,sourceDragonName} from './acquisition.mjs';
import {EVOLUTION_TEXT} from '../assets/original/data/evolution.mjs';
import {SPECIES} from './data.mjs';
import {createGame,validate,action,income,farmInfo,playerProgress,isBreedingParent} from './game.mjs';
import {habitatInfo,habitatLimit,habitatPosition} from './habitats.mjs';
import {dragonArt,sceneArt,eggArt} from './art.mjs';
import {storage} from './storage.mjs';
import {openCollectionDialog,rememberCollectionScroll} from './collection-dialog.mjs';
import {openDragonDialog} from './dragon-dialog.mjs';
import {openFarmDialog} from './farm-dialog.mjs';
import {startDragonModels,DRAGON_MODELS} from './dragon-models.mjs';
import {originalHud} from './original-hud.mjs';
let drag;
let collectionFilter='all';
let moreExpanded=false;
let state,tab='ranch',selected=2,location='',busy=false,saveStatus='尚未保存',toastTimer;
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n.toLocaleString('zh-CN');
const duration=ms=>{const n=Math.max(0,Math.ceil(ms/1000));return n>=3600?`${Math.floor(n/3600)}时 ${Math.floor(n%3600/60)}分 ${n%60}秒`:n>=60?`${Math.floor(n/60)}分 ${n%60}秒`:`${n} 秒`};
const time=at=>at>Date.now()?duration(at-Date.now()):'已完成';
const button=(label,act,attrs='',cls='primary')=>`<button class="${cls}" data-action="${act}" ${attrs}>${label}</button>`;
startDragonModels();
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function timer(at){return `<span data-timer="${at}">${time(at)}</span>`}
function ranch(){const positions=[[41,50],[59,51],[48,66],[67,65],[31,65],[56,39]];return `${sceneArt()}<div class="scene-header"></div><div class="world-objects">${state.habitats.map((h,i)=>{const [x,y]=habitatPosition(h,i),info=habitatInfo(h),ds=state.dragons.filter(d=>d.habitatId===h.id&&!isBreedingParent(state,d.id));return `<button class="world-object" data-place-id="${h.id}" style="left:${x}%;top:${y}%" data-action="habitat" data-id="${h.id}" aria-label="${escape(h.name)}"><span class="habitat-platform original-platform"><img class="habitat-art" src="${info.image}" alt="栖息地">${ds.map(d=>`<span data-action="openDragon" data-id="${d.id}">${dragonArt(d.species,'',d.level)}</span>`).join('')}</span><span class="label">${escape(h.name)} · ${h.job?'施工中':`${ds.length}/${info.capacity}`}</span></button>`}).join('')}<button class="world-object" style="left:66%;top:31%" data-action="openBreed"><img class="nest-art original-building" src="assets/original/world/0019_breeding_cave_a_g_bg.png" alt="原版繁殖洞穴"><span class="breeding-parents">${state.breeding?.phase==='breeding'&&Date.now()<state.breeding.readyAt?state.breeding.parents.map(id=>{const d=state.dragons.find(d=>d.id===id);return dragonArt(d.species,'',d.level)}).join(''):''}</span><span class="label">培育山${state.breeding?.phase==='breeding'?' · 进行中':state.breeding?' · 有龙蛋':''}</span></button><button class="world-object" style="left:75%;top:48%" data-action="openIncubator"><img class="nest-art original-building" src="assets/original/world/0001_incubator_g_bg.png" alt="原版初级育龙塔"><span class="label">初级育龙塔${state.incubator?' · 孵化中':''}</span></button><button class="world-object" style="left:26%;top:39%" data-action="farm"><img class="farm-art original-building" src="assets/original/world/${state.farmBuildingId>=17?'0017_farm_2_g_s1.png':'0016_farm_1_g_s1.png'}" alt="原版农场"><span class="label">${farmInfo(state).nameCN}${state.farm?' · 生长中':''}</span></button></div><div class="world-status"><span class="pill">☁ 晨风轻拂 · 离线牧场</span><span class="pill">${state.habitats.length} / ${Math.max(state.habitats.length,habitatLimit(playerProgress(state).level))} 栖息地</span></div>`}
async function showAcquisition(id){const info=dragonAcquisition(id);if(!info)return;const units={g:'金币',c:'魔晶',f:'食物'},costs=Object.entries(info.shop.costs).map(([unit,value])=>`${fmt(value)} ${units[unit]??unit}`).join('、');await openNativePaper(`${info.name} · 获取途径`,`<h3>商店</h3><p>${info.shop.listed?`${escape(costs||'价格待确认')}　牧场Lv.${info.shop.minLevel??'—'}`:'暂无已确认的购买入口'}</p><h3>繁殖</h3><div class="acquisition-pairs">${info.breeding.map(pair=>`<p>${escape(sourceDragonName(pair.parentIds[0]))} ＋ ${escape(sourceDragonName(pair.parentIds[1]))}</p>`).join('')||'<p>暂无已确认的繁殖组合</p>'}</div><p>可繁殖组合不代表必定获得。</p><h3>活动与冒险</h3><p>获取途径仍待确认。</p>`,'nativeAcquisition')}
function render(){
 tab='ranch';$('#app').innerHTML=`<div class="app ranch-mode"><main class="main"><section class="scene" aria-label="牧场主区域">${ranch()}${originalHud(state,{expanded:moreExpanded})}</section></main></div>`;tick();
}
function tick(){document.querySelectorAll('[data-timer]').forEach(el=>el.textContent=time(Number(el.dataset.timer)));document.querySelectorAll('[data-ready]').forEach(el=>el.disabled=busy||Date.now()<Number(el.dataset.ready));document.querySelectorAll('[data-income]').forEach(el=>{const h=state.habitats.find(h=>h.id===Number(el.dataset.income));if(h)el.textContent=fmt(income(state,h))})}
async function persist(next){busy=true;saveStatus='正在保存…';if($('#save-status'))$('#save-status').textContent=saveStatus;try{await storage.save(next);state=next;saveStatus=`已保存 · ${new Date().toLocaleTimeString('zh-CN')}`;}catch(e){saveStatus='保存失败 · 请重试';throw e}finally{busy=false}}
function closeDialog(){const d=$('#modal');d.close();d.className='';delete d.dataset.mode;delete d.dataset.returnToCollection;}
async function showSettings(){await openNativePaper('本地存档',`<p>操作后自动保存</p><div class="native-save-actions">${nativeButton('立即保存','save')}${nativeButton('导出存档','export')}${nativeButton('导入存档','import')}</div>`,'nativeSettings')}
let suppressHabitatClick=false;
const clipNames={breath:'呼吸',walk:'步行',especial:'特殊动作',combat:'战斗姿态',breathinbattle:'战斗待机',movein:'入场',hurt:'受击',dead:'倒下',airattack:'空中攻击',airattackend:'空中攻击收招',landattack:'地面攻击',landattackend:'地面攻击收招',magic:'施法',magicend:'施法收招',fly:'飞行',walk2:'步行二',walk3:'步行三'};
function openDragonPreview(id,stage){closeDialog();const d=state.dragons.find(d=>d.id===id);if(!d)return;stage??=d.level<4?1:d.level<7?2:3;const sp=SPECIES[d.species],key=`${sp.original}_${stage}`,model=DRAGON_MODELS[key],dialog=$('#modal');const content=`<label>成长阶段</label><select id="preview-stage" data-id="${id}">${[1,2,3].map(i=>`<option value="${i}" ${stage===i?'selected':''}>${['','幼年','成长','成年'][i]}</option>`).join('')}</select>${model?`<canvas class="dragon model-preview" width="900" height="900" data-model="${key}" data-clip="breath" role="img" aria-label="${sp.name}"></canvas><label>动作</label><select id="preview-clip">${model.clips.map(c=>`<option value="${c}" ${c==='breath'?'selected':''}>${clipNames[c]??c}</option>`).join('')}</select>${button('重播动作','replayDragon','','gold')}`:'<p>该阶段原版模型尚未取得。</p>'}`;void openNativePaper(sp.name,content,'nativeModelPreview')}
document.addEventListener('click',async e=>{
 if(suppressHabitatClick&&e.target.closest('[data-place-id]')){suppressHabitatClick=false;return}
 const el=e.target.closest('[data-tab],[data-action]');if(!el||busy||el.disabled)return;
 if(el.dataset.tab){closeDialog();if(el.dataset.tab==='habitats')await openHabitatShop(state);else if(el.dataset.tab==='breeding')await openBreed(state);else if(el.dataset.tab==='dragons')await openCollectionDialog(state,collectionFilter);else render();return}
 let type=el.dataset.action;const id=Number(el.dataset.id);
 try{
  if(type==='openMyDragons'||type==='returnCollection'){closeDialog();await openCollectionDialog(state,collectionFilter);return}
  if(type==='collectionFilter'){rememberCollectionScroll();const nextFilter=el.dataset.value;await openCollectionDialog(state,nextFilter);collectionFilter=nextFilter;return}
  if(type==='collectionSelect'){rememberCollectionScroll();selected=id;await openDragonDialog(state,id,{returnToCollection:true});return}
  if(type==='openDragon'){selected=id;closeDialog();await openDragonDialog(state,id);return}
  if(type==='lotteryOptions'){if(new URLSearchParams(window.location.search).get('legacyLottery')==='1')await openLotteryOptions();else await openRaffleDialog(state);return}
  if(type==='rafflePreview'){await openRafflePreview();return}
  if(type==='closeRafflePreview'){closeRafflePreview();return}
  if(type==='raffleDraw'){const [mode,count]=String(el.dataset.value).split(':'),amount=Number(count),cost=raffleCost(state.raffle,mode,amount);if(cost.gems>0&&!confirm(`本次消耗 ${cost.tickets} 张抽奖券及 ${cost.gems} 魔晶，继续吗？`))return;const next=action(state,'raffleDraw',{mode,count:amount});await persist(next);render();await openRaffleDialog(state);toast(state.log[0]);return}
  if(type==='raffleUnverified'){toast('基因中心尚未接入。');return}
  if(type==='openLottery'){await openLotteryDialog(state,Number(el.dataset.value));return}
  if(type==='returnLottery'){await openLotteryDialog(state,Number($('#modal').dataset.lotteryMode));return}
  if(type==='lotteryPrize'){openLotteryPrize(state,id);return}
  if(type==='lotteryHelp'){await openNativePaper('抽奖说明',`<p>${escape(lotteryHelp())}</p>`);return}
  if(type==='openEvolution'){await openEvolutionDialog(state,id,{returnToCollection:$('#modal').dataset.returnToCollection==='true'});return}
  if(type==='returnFromEvolution'){await openDragonDialog(state,id,{returnToCollection:$('#modal').dataset.returnToCollection==='true'});return}
  if(type==='evolutionHelp'){await openNativePaper('进化说明',`<p>${escape(EVOLUTION_TEXT['ev.evolution tip'])}</p>`);return}
  if(type==='acquisition'){await showAcquisition(id);return}
  if(type==='dragonMove'){selected=id;await openHabitatShop(state,{moveDragon:state.dragons.find(d=>d.id===id)});return}
  if(type==='returnMoveDragon'){await openDragonDialog(state,id);return}
  if(type==='openEquip'){await openEquipDialog(state,Number.isSafeInteger(id)&&state.dragons.some(d=>d.id===id)?id:selected,{returnToDragon:false});return}
  if(type==='openEquipInfo'){await openEquipInfoDialog(state,el.dataset.id,{dragonId:Number($('#modal').dataset.dragonId)||null});return}
  if(type==='equipChange'){await openEquipChangeDialog(state,Number($('#modal').dataset.dragonId),el.dataset.id);return}
  if(type==='equipSource'){await openEquipSourceDialog();return}
  if(type==='equipSelect'){const d=$('#modal');d.dataset.selectedEquipment=el.dataset.id;await openEquipDialog(state,Number(d.dataset.dragonId));return}
  if(type==='wearEquipSelected'){const d=$('#modal'),dragonId=Number(d.dataset.dragonId),equipmentId=d.dataset.selectedEquipment;if(!equipmentId){toast('请先在右侧选中一件未装备的装备。');return}const item=equipmentInstance(state,equipmentId);if(!item){toast('找不到这件装备。');return}const part=definitionPart(item);if(part!==Number(el.dataset.value)){toast(`这件装备属于${EQUIPMENT_SLOTS[part]??'未知'}部位，请点对应槽位。`);return}const next=action(state,'wearEquipment',{id:dragonId,equipmentId});await persist(next);render();delete d.dataset.selectedEquipment;await openEquipDialog(state,dragonId);toast(state.log[0]);return}
  if(type==='equipTab'){toast(el.dataset.value==='frag'?'装备碎片尚未接入，当前只有装备列表。':'当前已显示未装备的装备。');return}
  if(type==='unverifiedEquip'){toast('装备的更换、强化、升星与原版获取来源尚未实现。');return}
  if(type==='openAdventure'){await openAdventureDialog(state);return}
  if(type==='pveMap'){await openAdventureDialog(state,Number(el.dataset.value));return}
  if(type==='pveNode'){const node=adventureEvent(Number(el.dataset.id));toast(node?`${node.name} · ${adventureEventKind(node)==='monster'?'怪物关卡':'龙关卡'}（战斗程序尚未实现）`:'找不到这个关卡节点。');return}
  if(type==='pveUnverified'){toast('普通与精英关卡的战斗、体力与结算尚未实现。');return}
  if(type==='openWarehouse'){await openWarehouse(state);return}
  if(type==='raffleEggUse'){const next=action(state,'raffleEggHatch',{id});await persist(next);render();toast(state.log[0]);await openIncubator(state);return}
  if(type==='warehouseFilter'){await openWarehouse(state,el.dataset.value);return}
  if(type==='warehouseChooseDragon'){await chooseWarehouseDragon(state,id);return}
  if(type==='expansionShop'){await openExpansionShop(state);return}
  if(type==='habitatShop'){await openHabitatShop(state);return}
  if(type==='habitatPurchase'){await openHabitatInfo(state,id,{purchase:true});return}
  if(type==='chooseHatchHabitat'){await openHabitatShop(state,{hatch:true});return}
  if(type==='chooseParent'){await openBreed(state,{side:Number(el.dataset.value),id});tick();return}
  if(type==='breedHelp'){await openNativePaper('育龙说明','<p>选择两条达到4级的龙。</p><p>繁殖完成后领取龙蛋，转入育龙塔孵化。</p>');return}
  if(type==='previewDragon'){openDragonPreview(id);return}
  if(type==='replayDragon'){const c=$('#modal canvas');c.dataset.replay=String(Number(c.dataset.replay??0)+1);return}
  if(type==='close')return closeDialog();
  if(type==='settings'){closeDialog();return await showSettings();}
  if(type==='showMore'){moreExpanded=!moreExpanded;closeDialog();tab='ranch';render();return}
  if(type==='unavailable'){toast('该功能尚未开放。');return}
  if(type==='showTasks'){await openNativePaper('任务',`<p>${state.stats.harvests?'✓':'○'} 收获作物</p><p>${state.dragons.slice(0,2).every(x=>x.level>=4)?'✓':'○'} 将两只亲代喂养到Lv4</p><p>${state.stats.hatches?'✓':'○'} 繁殖并孵化幼龙</p>`);return}
  if(type==='battlePlanned'){toast('战斗尚未开放。');return}
  if(type==='openHabitats'){await openShop(state);return}
  if(type==='openIncubator'){await openIncubator(state);tick();return}
  if(type==='openBreed'){await openBreed(state);tick();return}
  if(type==='openOriginal'){await openCatalog(state);return}
  if(type==='catalogFilter'){await openCatalog(state,el.dataset.value);return}
  if(type==='catalogHelp'){toast('龙谱加成尚未接入，当前可查看龙种与获取途径。');return}
  if(type==='farm'){closeDialog();await openFarmDialog(state);tick();return}
  if(type==='habitat'){await openHabitatInfo(state,id);tick();return}
  if(type==='selectDragon'){selected=id;await openDragonDialog(state,id);return}
  if(type==='save'){await persist(state);render();toast('牧场已保存。');return}
  if(type==='export'){if(await storage.export(state))toast('存档已导出。');return}
  if(type==='import'){const imported=await storage.import();if(!imported)return;if(imported.error)throw new Error(imported.error);const next=validate(imported);if(!confirm('将载入这份存档，并备份当前牧场。继续吗？'))return;await persist(next);closeDialog();selected=state.dragons[0].id;render();toast('存档已载入。');return}
  const priorMode=$('#modal').dataset.mode,priorHabitat=Number($('#modal').dataset.habitatId),moveDragon=Number($('#modal').dataset.dragonId);
  const lotteryMode=Number($('#modal').dataset.lotteryMode??1);const refreshWarehouse=priorMode==='nativeWarehouse'||priorMode==='nativeWarehousePlace';const warehouseGroup=$('#modal').dataset.warehouseGroup??'all';const pendingPrize=Number($('#modal').dataset.pendingPrize);const refreshLottery=!refreshWarehouse&&['lotteryDraw','lotteryClaimResources','lotteryPlace'].includes(type);const payload={id};if(type==='unwearEquipment')payload.equipmentId=$('#modal').dataset.equipmentId;if(type==='wearEquipment')payload.equipmentId=el.dataset.value;if(type==='plantNative'){type='plant';payload.cropId=id}if(type==='buyHabitat'){type='build';payload.buildingId=id}if(type==='moveNative'){type=priorMode==='nativeWarehousePlace'?'lotteryPlace':'move';payload.id=priorMode==='nativeWarehousePlace'?pendingPrize:moveDragon;payload.habitatId=id}if(type==='hatchNative'){type='hatch';payload.habitatId=id}if(type==='lotteryDraw'){payload.mode=lotteryMode;payload.count=Number(el.dataset.value);const cost=lotteryCost(state.lottery,payload.mode,payload.count);if(cost.gems>0&&!confirm(`本次扣除 ${cost.tokens} 抽奖币及 ${cost.gems} 魔晶，继续吗？`))return}if(type==='lotteryPlace')payload.habitatId??=Number($('#lottery-habitat').value);if(type==='build')payload.buildingId??=Number(el.dataset.buildingId);if(type==='plant')payload.cropId??=Number(el.dataset.cropId??el.closest('.card')?.querySelector('[data-crop]')?.value??1);if(type==='breed'){payload.a=Number($('#modal').dataset.parentA);payload.b=Number($('#modal').dataset.parentB)}
  if(type==='hatch')payload.habitatId??=Number($('#hatch-target')?.value);
  if(type==='move')payload.habitatId??=Number($('#move-target')?.value);
  const returnToCollection=$('#modal').dataset.returnToCollection==='true';const refreshDragon=type==='feed'&&$('#modal').dataset.mode==='sourceDragon'?Number($('#modal').dataset.dragonId):null;const refreshExpansion=type==='expandIsland';const equipDragon=(type==='unwearEquipment'||type==='wearEquipment')?(Number($('#modal').dataset.dragonId)||Number(el.dataset.id)||selected):null;const next=action(state,type,payload);await persist(next);if(['plant','harvest'].includes(type)&&$('#modal').dataset.mode==='farm')closeDialog();const refreshFarm=['upgradeFarm','completeFarmUpgrade'].includes(type)&&$('#modal').dataset.mode==='farm';render();if(refreshFarm){closeDialog();await openFarmDialog(state);tick();}if(refreshDragon)await openDragonDialog(state,refreshDragon,{returnToCollection});if(refreshLottery)await openLotteryDialog(state,lotteryMode);if(refreshWarehouse)await openWarehouse(state,warehouseGroup);if(refreshExpansion)await openExpansionShop(state);if(equipDragon)await openEquipDialog(state,equipDragon);if(type==='build')await openHabitatInfo(state,state.habitats.at(-1).id);else if(['collect','upgradeHabitat','completeHabitat'].includes(type)&&priorMode==='nativeHabitatInfo')await openHabitatInfo(state,priorHabitat);else if(['breed','takeEgg'].includes(type))await openBreed(state);else if(type==='incubate')await openIncubator(state);else if(type==='hatch')closeDialog();else if(type==='move')await openDragonDialog(state,payload.id);tick();toast(state.log[0]);
 }catch(error){toast(error.message);if($('#save-status'))$('#save-status').textContent=saveStatus}
});
document.addEventListener('change',e=>{if(e.target.id==='preview-stage'){openDragonPreview(Number(e.target.dataset.id),Number(e.target.value));return}if(e.target.id==='preview-clip'){$('#modal canvas').dataset.clip=e.target.value;return}});
document.addEventListener('keydown',async e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();if(state&&!busy)try{await persist(state);render();toast('牧场已保存。')}catch(error){toast(error.message)}}});
async function boot(){try{const loaded=await storage.load();location=loaded.location;state=loaded.state?validate(loaded.state):createGame();selected=state.dragons[0]?.id;if(!loaded.state)await persist(state);else saveStatus=loaded.recovered?'已从备份恢复':'存档已载入';render();if(loaded.recovered)toast('主存档损坏，已载入上一次有效备份。');setInterval(tick,250)}catch(e){$('#app').innerHTML=`<div class="loading"><h1>存档暂时无法载入</h1><p class="error">${escape(e.message)}</p><p>未覆盖任何现有存档。请保留存档文件后检查读写权限或备份。</p></div>`}}
let breedingVisible;setInterval(()=>{if(!state||busy||drag)return;const visible=state.breeding?.phase==='breeding'&&Date.now()<state.breeding.readyAt;if(breedingVisible!==undefined&&visible!==breedingVisible){if(tab==='ranch')render();if($('#modal').dataset.mode==='sourceDragon')void openDragonDialog(state,Number($('#modal').dataset.dragonId),{returnToCollection:$('#modal').dataset.returnToCollection==='true'});}breedingVisible=visible},500);
let resizeFrame;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(state&&tab==='ranch')render();if($('#modal').classList.contains('native-ranch-dialog')||['sourceDragon','sourceCollection','sourceEvolution','sourceLottery','sourceLotteryOptions','sourceRaffle','sourceRafflePreview'].includes($('#modal').dataset.mode))$('#modal').style.setProperty('--source-scale',Math.min((innerWidth-20)/1024,(innerHeight-20)/(['sourceRaffle','sourceRafflePreview'].includes($('#modal').dataset.mode)?770:768)))});});
await boot();

document.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-place-id]');if(!el||busy||e.button!==0)return;drag={id:Number(el.dataset.placeId),el,x:e.clientX,y:e.clientY,moved:false};el.setPointerCapture(e.pointerId)});
document.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8&&!drag.moved)return;drag.moved=true;const r=drag.el.parentElement.getBoundingClientRect();drag.position=[Math.round(Math.max(10,Math.min(90,(e.clientX-r.left)/r.width*100))*100)/100,Math.round(Math.max(10,Math.min(90,(e.clientY-r.top)/r.height*100))*100)/100];drag.el.style.left=drag.position[0]+'%';drag.el.style.top=drag.position[1]+'%'});
document.addEventListener('pointerup',async()=>{const ended=drag;drag=null;if(!ended?.moved)return;suppressHabitatClick=true;setTimeout(()=>{suppressHabitatClick=false},500);try{await persist(action(state,'placeHabitat',{id:ended.id,position:ended.position}));render();toast('栖息地位置已保存。')}catch(e){render();toast(e.message)}});
document.addEventListener('pointercancel',()=>{drag=null;if(state)render()});

document.addEventListener('wheel',e=>{const list=e.target.closest('.source-collection-list,.lottery-pending,.native-shop-list');if(list&&list.scrollWidth>list.clientWidth&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){list.scrollLeft+=e.deltaY;e.preventDefault()}},{passive:false});

document.querySelector('#modal').addEventListener('cancel',e=>{e.preventDefault();if($('#modal').dataset.mode==='sourceRafflePreview')closeRafflePreview();else closeDialog()});
