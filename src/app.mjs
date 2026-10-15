import {ISLANDS,islandOf,unlockedIslands,WORLD_ISLANDS,WORLD_BOUNDS,nearestWorldIsland} from './islands.mjs';
import {openAcquisition} from './acquisition-dialog.mjs';
import {openDragonStar,confirmDragonStar} from './dragon-star-dialog.mjs';
import {confirmDragonSale} from './dragon-sale-dialog.mjs';
import {mutationRecord} from './dragon-stars.mjs';
import {openSkillDialog} from './skill-dialog.mjs';
import {formationSwap} from './formation.mjs';
import {runeSkill} from './runes.mjs';
import {openCatalogDetail} from './catalog-detail.mjs';
import {openEquipmentStar} from './equipment-star-dialog.mjs';
import {openBattleRewards,openLootBoxDialog,openLootBoxResults,openNodeReward} from './loot-dialog.mjs';
import {equipmentFragment} from './loot.mjs';
import {openEquipmentBag,confirmEquipmentDecompose} from './equip-bag-dialog.mjs';
import {openGemExplore,openGemExploreResult} from './gem-explore-dialog.mjs';
import {openRuneHunt,openShenfuDialog} from './rune-hunt-dialog.mjs';
import {openRuneSelector,openRuneInfo,openRuneUpgrade,refreshRunePreview} from './rune-dialog.mjs';
import {habitatMotionArea,startHabitatMotion} from './habitat-motion.mjs';
import BUILDING_ART from '../assets/original/data/building-art.mjs';
import {zoomCameraAt,clampWorldCamera} from './ranch-camera.mjs';
import {openGemDialog,openGemInfo,openGemUpgrade} from './gem-dialog.mjs';
import {openWarehouse,chooseWarehouseDragon} from './warehouse-dialog.mjs';
import {openEquipDialog,openEquipInfoDialog,openEquipChangeDialog,openEquipSourceDialog,openEquipEnhanceDialog} from './equip-dialog.mjs';
import {openAdventureDialog} from './adventure-dialog.mjs';
import {openRechargeDialog,openVipThresholds} from './recharge-dialog.mjs';
import {resourceShopRow} from './resource-shop.mjs';
import {openBattleDialog,playBattleAnimation} from './battle-dialog.mjs';
import {adventureEvent,adventureEventKind} from './adventure.mjs';
import {equipmentInstance,definitionPart,EQUIPMENT_SLOTS} from './equipment.mjs';
import {openBuildingSpeedDialog,openShop,openHabitatShop,openHabitatInfo,openExpansionShop,openResourceShop,openOriginalShopCategory,openOriginalShopInfo,openStructureInfo,openBreed,openIncubator,openCatalog,openNativePaper,nativeButton} from './ranch-dialogs.mjs';
import {openRaffleDialog,openRafflePreview,closeRafflePreview,playRaffleDraw,openRaffleResult} from './raffle-dialog.mjs';
import {openLotteryOptions,openLotteryDialog,openLotteryPrize,lotteryHelp} from './lottery-dialog.mjs';
import {lotteryCost} from './lottery.mjs';
import {raffleCost} from './raffle.mjs';
import {openEvolutionDialog} from './evolution-dialog.mjs';
import {dragonAcquisition,sourceDragonName} from './acquisition.mjs';
import {EVOLUTION_TEXT} from '../assets/original/data/evolution.mjs';
import {SPECIES,speciesKey} from './data.mjs';
import {createGame,validate,action,income,farmInfo,playerProgress,isBreedingParent,incubatorSpeedCost,dragonSellGold} from './game.mjs';
import {habitatInfo,habitatLimit,habitatPosition,snapHabitatPosition,canPlaceObject,FIXED_BUILDINGS,fixedBuildings} from './habitats.mjs';
import {structureInfo,structurePosition,structureArt} from './structures.mjs';
import {dragonArt,sceneArt,eggArt} from './art.mjs';
import {storage} from './storage.mjs';
import {openCollectionDialog,rememberCollectionScroll} from './collection-dialog.mjs';
import {openDragonDialog} from './dragon-dialog.mjs';
import {openFarmDialog} from './farm-dialog.mjs';
import {openFormationDialog,openFormationPicker,openFormationPreview} from './formation-dialog.mjs';
import {formationReplacement} from './formation.mjs';
import {startDragonModels,DRAGON_MODELS} from './dragon-models.mjs';
import {originalHud} from './original-hud.mjs';
let drag;
let camera={zoom:1,x:0,y:0},pan;
function applyCamera(){const el=document.querySelector('.ranch-world'),scene=document.querySelector('.scene');if(!el||!scene)return;const fit=Math.min(scene.clientWidth/1300,scene.clientHeight/768);camera=clampWorldCamera(camera,scene.clientWidth,scene.clientHeight,fit,WORLD_BOUNDS);if(!drag)activeIsland=nearestWorldIsland(-camera.x/(fit*camera.zoom),-camera.y/(fit*camera.zoom),unlockedIslands(state));el.style.transform=`translate(calc(-50% + ${camera.x}px),calc(-50% + ${camera.y}px)) scale(${fit*camera.zoom})`;el.dataset.zoom=camera.zoom;}
function buildingStyle(info,y){const a=BUILDING_ART[info.id??24],w=a?.width??210,h=a?.height??140,ground=((info.width??5)+(info.height??5)-2)*6.75;return `z-index:${Math.round(y*10)};--art-w:${w}px;--art-h:${h}px;--art-x:${(a?.x??0)-w/2}px;--art-y:${ground-(a?.y??ground)-h/2}px;--plot-w:${info.width??5};--plot-h:${info.height??5}`;}
let collectionFilter='all';
let activeIsland=0;let moreExpanded=false;
let state,tab='ranch',selected=2,location='',busy=false,saveStatus='尚未保存',toastTimer;
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n.toLocaleString('zh-CN');
const duration=ms=>{const n=Math.max(0,Math.ceil(ms/1000));return n>=3600?`${Math.floor(n/3600)}时 ${Math.floor(n%3600/60)}分 ${n%60}秒`:n>=60?`${Math.floor(n/60)}分 ${n%60}秒`:`${n} 秒`};
const time=at=>at>Date.now()?duration(at-Date.now()):'已完成';
const button=(label,act,attrs='',cls='primary')=>`<button class="${cls}" data-action="${act}" ${attrs}>${label}</button>`;
function placementTiles(info,valid=true){const tiles=[];for(let row=0;row<(info.height??5);row++)for(let column=0;column<(info.width??5);column++)tiles.push(`<img src="assets/original/ui/grid_${valid?'yellow':'red'}.png" style="--tile-x:${column-row};--tile-y:${column+row}" alt="">`);return `<span style="--grid-center-x:${((info.width??5)-(info.height??5)-0)*13.5}px;--grid-center-y:${((info.width??5)+(info.height??5)-2)*6.75}px" class="placement-tiles ${valid?'valid':'invalid'}">${tiles.join('')}</span>`}
function placeables(){return [...fixedBuildings(state).map(b=>({...b,islandId:0})),...state.habitats.map((h,i)=>({islandId:islandOf(h),key:`h:${h.id}`,info:habitatInfo(h),position:habitatPosition(h,i)})),...state.structures.map((o,i)=>({islandId:islandOf(o),key:`s:${o.id}`,info:structureInfo(o),position:structurePosition(o,i)}))].filter(o=>islandOf(o)===activeIsland)}
function appendFixedMove(id){$('#modal .source-artboard')?.insertAdjacentHTML('beforeend',`<div class="fixed-move-entry">${nativeButton('移动','beginFixedMove',`data-id="${id}"`)}</div>`)}
function showMoveControls(){document.querySelector('.placement-controls')?.remove();document.querySelector('.scene')?.insertAdjacentHTML('beforeend',`<div class="placement-controls">${nativeButton('取消','cancelBuildingMove')}${nativeButton('确定','confirmBuildingMove')}</div>`)}
function beginObjectMove(kind,id){const target=kind==='fixed'?0:islandOf((kind==='habitat'?state.habitats:state.structures).find(o=>o.id===id));closeDialog();moreExpanded=false;render();focusIsland(target);const list=kind==='fixed'?fixedBuildings(state):kind==='habitat'?state.habitats:state.structures,object=list.find(x=>x.id===id),el=document.querySelector(`[data-place-kind="${kind}"][data-place-id="${id}"]`);if(!object||!el)return;const index=list.indexOf(object),info=kind==='fixed'?object.info:kind==='habitat'?habitatInfo(object):structureInfo(object),position=kind==='fixed'?object.position:kind==='habitat'?habitatPosition(object,index):structurePosition(object,index),key=kind==='fixed'?object.key:`${kind==='habitat'?'h':'s'}:${id}`;drag={kind,id,key,info,el,x:0,y:0,moved:true,dragging:false,position,valid:canPlaceObject(placeables(),key,info,position,state.expansion.plots)};el.classList.add('is-moving');el.insertAdjacentHTML('afterbegin',placementTiles(info,drag.valid));showMoveControls();toast('拖动建筑到格子内，重叠位置会变红。')}
startDragonModels();
startHabitatMotion();
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function timer(at){return `<span data-timer="${at}">${time(at)}</span>`}
function islandBoard(island){const [breedFixed,incubatorFixed,farmFixed]=fixedBuildings(state);return `${sceneArt(state.expansion.plots,island)}<div class="scene-header"></div><div class="world-objects" data-island="${island}">${state.habitats.filter(h=>islandOf(h)===island).map((h,i)=>{const [x,y]=habitatPosition(h,i),info=habitatInfo(h),ds=state.dragons.filter(d=>d.habitatId===h.id&&!isBreedingParent(state,d.id));return `<button class="world-object" data-place-kind="habitat" data-place-id="${h.id}" style="left:${x}%;top:${y}%;${buildingStyle(info,y)}" data-action="habitat" data-id="${h.id}" aria-label="${escape(h.name)}"><span class="habitat-platform original-platform"><img class="habitat-art" src="${BUILDING_ART[info.id]?.image??info.image}" alt="栖息地">${ds.map((d,di)=>`<span class="world-resident" data-motion-id="${d.id}" data-motion-area='${JSON.stringify(habitatMotionArea(info))}' style="left:${(di%3-1)*42}px;top:-50px" data-action="openDragon" data-id="${d.id}">${dragonArt(d.species,'',d.level)}</span>`).join('')}</span><span class="label">${escape(h.name)} · ${h.job?'施工中':`${ds.length}/${info.capacity}`}</span></button>`}).join('')}${state.structures.filter(o=>islandOf(o)===island).map((o,i)=>{const info=structureInfo(o),[x,y]=structurePosition(o,i);return `<button class="world-object structure-object" data-place-kind="structure" data-place-id="${o.id}" style="left:${x}%;top:${y}%;${buildingStyle(info,y)}" data-action="structureInfo" data-id="${o.id}"><span class="habitat-platform original-platform"><img class="habitat-art" src="${BUILDING_ART[info.id]?.image??structureArt(info)}" alt="${escape(info.nameCN)}"></span><span class="label">${escape(info.nameCN)}${o.readyAt?' · 施工中':''}</span></button>`}).join('')}<button class="world-object" data-place-kind="fixed" data-place-id="1" style="left:${breedFixed.position[0]}%;top:${breedFixed.position[1]}%;${buildingStyle({id:19,width:6,height:6},breedFixed.position[1])}" data-action="openBreed"><img class="nest-art original-building" src="assets/original/world/0019_breeding_cave_a_g_bg.png" alt="原版繁殖洞穴"><span class="breeding-parents">${state.breeding?.phase==='breeding'&&Date.now()<state.breeding.readyAt?state.breeding.parents.map(id=>{const d=state.dragons.find(d=>d.id===id);return dragonArt(d.species,'',d.level)}).join(''):''}</span><span class="label">培育山${state.breeding?.phase==='breeding'?' · 进行中':state.breeding?' · 有龙蛋':''}</span></button><button class="world-object" data-place-kind="fixed" data-place-id="2" style="left:${incubatorFixed.position[0]}%;top:${incubatorFixed.position[1]}%;${buildingStyle({id:1,width:5,height:5},incubatorFixed.position[1])}" data-action="openIncubator"><img class="nest-art original-building" src="assets/original/world/0001_incubator_g_bg.png" alt="原版初级育龙塔"><span class="label">初级育龙塔${state.incubator?' · 孵化中':''}</span></button><button class="world-object" data-place-kind="fixed" data-place-id="3" style="left:${farmFixed.position[0]}%;top:${farmFixed.position[1]}%;${buildingStyle({id:state.farmBuildingId??16,width:4,height:4},farmFixed.position[1])}" data-action="farm"><img class="farm-art original-building" src="assets/original/world/${state.farmBuildingId>=17?'0017_farm_2_g_s1.png':'0016_farm_1_g_s1.png'}" alt="原版农场"><span class="label">${farmInfo(state).nameCN}${state.farm?' · 生长中':''}</span></button></div>`}
function ranch(){return `<img class="world-sky" src="assets/original/world/islandbg_bg.png" alt=""><div class="ranch-world">${WORLD_ISLANDS.map(i=>`<section class="world-island" data-world-island="${i.id}" aria-label="${ISLANDS[i.id].name}" style="left:${i.x}px;top:${i.y}px;z-index:${i.z};--island-w:${i.width*.5}px;--island-h:${i.height*.5}px">${islandBoard(i.id)}${i.id>=unlockedIslands(state)?`<button class="native-game-button island-unlock" data-action="switchIsland" data-id="${i.id}">解锁${ISLANDS[i.id].name}</button>`:''}</section>`).join('')}</div>`}
function focusIsland(id){const scene=document.querySelector('.scene'),fit=Math.min(scene.clientWidth/1300,scene.clientHeight/768),i=WORLD_ISLANDS.find(i=>i.id===id);camera={zoom:1,x:-i.x*fit,y:-i.y*fit};activeIsland=id;applyCamera();}

async function showAcquisition(id){await openAcquisition(state,id)}
function render(){
 tab='ranch';$('#app').innerHTML=`<div class="app ranch-mode"><main class="main"><section class="scene" aria-label="牧场主区域">${ranch()}${originalHud(state,{expanded:moreExpanded})}</section></main></div>`;applyCamera();tick();
}
function tick(){const modal=$('#modal');if(!busy&&modal?.open&&modal.dataset.mode==='sourceGemExplore'&&Number(modal.dataset.freeReady)>0&&Date.now()>=Number(modal.dataset.freeReady)){delete modal.dataset.freeReady;void openGemExplore(state)}if(!busy&&modal?.open&&modal.dataset.mode==='sourceShenfu'&&Number(modal.dataset.freeReady)>0&&Date.now()>=Number(modal.dataset.freeReady)){delete modal.dataset.freeReady;void openShenfuDialog(state)}document.querySelectorAll('[data-timer]').forEach(el=>el.textContent=el.classList.contains('source-pve-reward-state')&&Date.now()>=Number(el.dataset.timer)?'可领取':time(Number(el.dataset.timer)));document.querySelectorAll('[data-ready]').forEach(el=>el.disabled=busy||Date.now()<Number(el.dataset.ready));document.querySelectorAll('[data-income]').forEach(el=>{const h=state.habitats.find(h=>h.id===Number(el.dataset.income));if(h)el.textContent=fmt(income(state,h))})}
async function persist(next){busy=true;saveStatus='正在保存…';if($('#save-status'))$('#save-status').textContent=saveStatus;try{await storage.save(next);state=next;saveStatus=`已保存 · ${new Date().toLocaleTimeString('zh-CN')}`;}catch(e){saveStatus='保存失败 · 请重试';throw e}finally{busy=false}}
function closeDialog(){const d=$('#modal');d.close();d.className='';delete d.dataset.mode;delete d.dataset.returnToCollection;}
async function showSettings(){const version=await window.ranch?.version?.().catch(()=>null);await openNativePaper('本地存档',`<p>御龙高手 <b>v${version??'未知'}</b>　操作后自动保存</p><div class="native-save-actions">${nativeButton('立即保存','save')}${nativeButton('导出存档','export')}${nativeButton('导入存档','import')}</div>`,'nativeSettings')}
let suppressHabitatClick=false;
const clipNames={breath:'呼吸',walk:'步行',especial:'特殊动作',combat:'战斗姿态',breathinbattle:'战斗待机',movein:'入场',hurt:'受击',dead:'倒下',airattack:'空中攻击',airattackend:'空中攻击收招',landattack:'地面攻击',landattackend:'地面攻击收招',magic:'施法',magicend:'施法收招',fly:'飞行',walk2:'步行二',walk3:'步行三'};
function openDragonPreview(id,stage){closeDialog();const d=state.dragons.find(d=>d.id===id);if(!d)return;stage??=d.level<4?1:d.level<7?2:3;const sp=SPECIES[d.species],key=`${sp.original}_${stage}`,model=DRAGON_MODELS[key],dialog=$('#modal');const content=`<label>成长阶段</label><select id="preview-stage" data-id="${id}">${[1,2,3].map(i=>`<option value="${i}" ${stage===i?'selected':''}>${['','幼年','成长','成年'][i]}</option>`).join('')}</select>${model?`<canvas class="dragon model-preview" width="900" height="900" data-model="${key}" data-clip="breath" role="img" aria-label="${sp.name}"></canvas><label>动作</label><select id="preview-clip">${model.clips.map(c=>`<option value="${c}" ${c==='breath'?'selected':''}>${clipNames[c]??c}</option>`).join('')}</select>${button('重播动作','replayDragon','','gold')}`:'<p>该阶段原版模型尚未取得。</p>'}`;void openNativePaper(sp.name,content,'nativeModelPreview')}
document.addEventListener('click',async e=>{
 if(suppressHabitatClick&&e.target.closest('[data-place-id]')){suppressHabitatClick=false;return}
 const el=e.target.closest('[data-tab],[data-action]');if(!el||(busy&&el.dataset.action!='close')||el.disabled)return;
 if(el.dataset.tab){closeDialog();if(el.dataset.tab==='habitats')await openHabitatShop(state);else if(el.dataset.tab==='breeding')await openBreed(state);else if(el.dataset.tab==='dragons')await openCollectionDialog(state,collectionFilter);else render();return}
 let type=el.dataset.action;const id=Number(el.dataset.id);
 try{
  if(type==='openRunes'||type==='openRuneHunt'){await openRuneHunt(state);return}
  if(type==='runeEquipment'){await openEquipDialog(state,selected);return}
  if(type==='openShenfu'){await openShenfuDialog(state);tick();return}
  if(['buyShenfu','huntRune','pickRuneHunt'].includes(type)){await persist(action(state,type,{count:Number(el.dataset.value),npc:id,id:el.dataset.id||null}));render();if(type==='buyShenfu')await openShenfuDialog(state);else await openRuneHunt(state);tick();toast(state.log[0]);return}
  if(type==='runeSelector'){await openRuneSelector(state,id,Number(el.dataset.value));return}
  if(type==='runeInfo'){await openRuneInfo(state,Number($('#modal').dataset.dragonId),el.dataset.id);return}
  if(type==='runeUpgrade'){await openRuneUpgrade(state,Number($('#modal').dataset.dragonId),el.dataset.id);return}
  if(type==='runeFeedSelect'){el.classList.toggle('is-selected');refreshRunePreview(state);return}
  if(type==='runeSelectAll'){const cells=[...$('#modal').querySelectorAll('.source-rune-feed .source-rune-cell')],all=cells.every(c=>c.classList.contains('is-selected'));cells.forEach(c=>c.classList.toggle('is-selected',!all));refreshRunePreview(state);return}
  if(['wearRune','unwearRune','upgradeRune'].includes(type)){const dragonId=Number($('#modal').dataset.dragonId),materials=[...$('#modal').querySelectorAll('.source-rune-feed .is-selected')].map(e=>e.dataset.id);await persist(action(state,type,{id:dragonId,runeId:el.dataset.id,materials}));render();if(type==='upgradeRune')await openRuneInfo(state,dragonId,el.dataset.id);else await openEquipDialog(state,dragonId);toast(state.log[0]);return}
  if(type==='openBuildingSpeed'){await openBuildingSpeedDialog(state,el.dataset.kind,id);tick();return}
  if(type==='speedBuilding'){const kind=el.dataset.kind;await persist(action(state,'speedBuilding',{kind,id}));closeDialog();render();toast(state.log[0]);return}
  if(type==='cancelBuildingMove'){drag=null;render();toast('已取消移动。');return}
  if(type==='confirmBuildingMove'){if(!drag?.position)return;if(!drag.valid){toast('红色地块不能摆放建筑。');return}const ended=drag;drag=null;await persist(action(state,ended.kind==='fixed'?'placeFixed':ended.kind==='habitat'?'placeHabitat':'placeStructure',{id:ended.id,position:ended.position,islandId:activeIsland}));render();toast('建筑已按地块摆放。');return}
  if(type==='beginFixedMove'){beginObjectMove('fixed',id);return}
  if(type==='beginBuildingMove'){beginObjectMove('habitat',id);return}
  if(type==='beginStructureMove'){beginObjectMove('structure',id);return}
  if(type==='openMyDragons'||type==='returnCollection'){closeDialog();await openCollectionDialog(state,collectionFilter);return}
  if(type==='collectionFilter'){rememberCollectionScroll();const nextFilter=el.dataset.value;await openCollectionDialog(state,nextFilter);collectionFilter=nextFilter;return}
  if(type==='collectionSelect'){rememberCollectionScroll();selected=id;await openDragonDialog(state,id,{returnToCollection:true});return}
  if(type==='openDragon'){selected=id;closeDialog();await openDragonDialog(state,id);return}
  if(type==='lotteryOptions'){if(new URLSearchParams(window.location.search).get('legacyLottery')==='1')await openLotteryOptions();else await openRaffleDialog(state);return}
  if(type==='rafflePreview'){await openRafflePreview();return}
  if(type==='originalShopCategory'){await openOriginalShopCategory(state,el.dataset.value);return}
  if(type==='originalShopInfo'){await openOriginalShopInfo(state,id);return}
  if(type==='structureInfo'){await openStructureInfo(state,id);tick();return}
  if(type==='closeRafflePreview'){closeRafflePreview();return}
  if(type==='raffleAgain'){const value=el.dataset.value;await openRaffleDialog(state);const target=Array.from($('#modal').querySelectorAll('[data-action=raffleDraw]')).find(node=>node.dataset.value===value);target?.click();return}
  if(type==='returnRaffle'){await openRaffleDialog(state);return}
  if(type==='raffleDraw'){const [mode,count]=String(el.dataset.value).split(':'),amount=Number(count),cost=raffleCost(state.raffle,mode,amount);if(cost.gems>0&&!confirm(`本次消耗 ${cost.tickets} 张抽奖券及 ${cost.gems} 魔晶，继续吗？`))return;const next=action(state,'raffleDraw',{mode,count:amount}),results=next.raffle.pending.slice(-amount);await persist(next);busy=true;let keepDialog=false;try{keepDialog=await playRaffleDraw(mode)}finally{busy=false}render();if(keepDialog)await openRaffleResult(state,results,mode,amount);toast(state.log[0]);return}
  if(type==='raffleUnverified'){toast('基因中心尚未接入。');return}
  if(type==='openLottery'){await openLotteryDialog(state,Number(el.dataset.value));return}
  if(type==='returnLottery'){await openLotteryDialog(state,Number($('#modal').dataset.lotteryMode));return}
  if(type==='lotteryPrize'){openLotteryPrize(state,id);return}
  if(type==='lotteryHelp'){await openNativePaper('抽奖说明',`<p>${escape(lotteryHelp())}</p>`);return}
  if(type==='confirmSellDragon'){await confirmDragonSale(state,id);return}
  if(type==='cancelDragonSale'||type==='returnStarDragon'){await openDragonDialog(state,id,{returnToCollection:$('#modal').dataset.returnToCollection==='true'});return}
  if(type==='sellDragon'){const collection=$('#modal').dataset.returnToCollection==='true';await persist(action(state,type,{id}));selected=state.dragons[0]?.id;render();closeDialog();if(collection)await openCollectionDialog(state,collectionFilter);toast(state.log[0]);return}
  if(type==='openDragonStar'||type==='openDragonGrowth'){const target=type==='openDragonGrowth'?(selected??state.dragons[0]?.id):id;if(!target)throw Error('牧场里还没有可以升星的龙。');await openDragonStar(state,target);return}
  if(type==='dragonStarMaterial'){const modal=$('#modal'),ids=(modal.dataset.dragonMaterialIds||'').split(',').filter(Boolean).map(Number),next=ids.includes(id)?ids.filter(v=>v!==id):[...ids,id];await openDragonStar(state,Number(modal.dataset.dragonId),next);return}
  if(type==='requestStarDragon'){await confirmDragonStar(state,id,($('#modal').dataset.dragonMaterialIds||'').split(',').filter(Boolean).map(Number));return}
  if(type==='cancelStarDragon'){await openDragonStar(state,id,($('#modal').dataset.dragonMaterialIds||'').split(',').filter(Boolean).map(Number));return}
  if(type==='starDragon'){const ids=($('#modal').dataset.dragonMaterialIds||'').split(',').filter(Boolean).map(Number);await persist(action(state,type,{id,ids}));render();await openDragonStar(state,id);toast(state.log[0]);return}
  if(type==='dragonMutationHelp'){const d=state.dragons.find(d=>d.id===id),record=d&&mutationRecord(d.species);await openNativePaper('变异龙',`<p>${record?'对应变异龙：'+escape(record.name):'当前客户端未记录这条龙对应的变异品种。'}</p><p>原版提示：两龙交配时间大于1小时，有概率触发奇遇；培育出紫色品质龙，有概率触发变异龙奇遇。概率随VIP提高，最多保留5个事件。</p><p>变异龙最高7星；奇遇触发、奖励结算与五星后的觉醒修炼仍未完成。</p>`);return}
  if(type==='openEvolution'){await openEvolutionDialog(state,id,{returnToCollection:$('#modal').dataset.returnToCollection==='true'});return}
  if(type==='returnFromEvolution'){await openDragonDialog(state,id,{returnToCollection:$('#modal').dataset.returnToCollection==='true'});return}
  if(type==='evolutionHelp'){await openNativePaper('进化说明',`<p>${escape(EVOLUTION_TEXT['ev.evolution tip'])}</p>`);return}
  if(type==='dragonSkillInfo'){const prev=$('#modal'),origin={mode:prev.dataset.mode,catalogId:prev.dataset.catalogId,collection:prev.dataset.returnToCollection},dragon=state.dragons.find(d=>d.id===id)??{id:0,species:speciesKey(Number(origin.catalogId)),level:1};const dialog=await openSkillDialog(state,dragon,Number(el.dataset.value));dialog.dataset.returnCatalogId=origin.mode==='sourceCatalogDetail'?origin.catalogId:'';dialog.dataset.returnToCollection=origin.collection??'false';return}
  if(type==='returnSkillDragon'){const d=$('#modal');if(d.dataset.returnCatalogId)await openCatalogDetail(state,Number(d.dataset.returnCatalogId));else await openDragonDialog(state,id,{returnToCollection:d.dataset.returnToCollection==='true'});return}
  if(type==='formationReorder'){const first=Number($('#modal').dataset.selectedFormationId);if(!first||first===id){await openFormationPreview(state,first===id?null:id);return}await persist(action(state,'setFormation',{ids:formationSwap(state,first,id)}));await openFormationPreview(state);render();toast('阵位已保存。');return}
  if(type==='catalogDetail'){await openCatalogDetail(state,id);return}
  if(type==='returnCatalog'){await openCatalog(state);return}
  if(type==='transferBuilding'){const islandId=Number(el.dataset.island);await persist(action(state,type,{id,kind:el.dataset.kind,islandId}));activeIsland=islandId;closeDialog();render();focusIsland(islandId);toast(state.log[0]);return}
  if(type==='switchIsland'){if(id>=unlockedIslands(state)){await openExpansionShop(state);return}drag=null;activeIsland=id;closeDialog();render();focusIsland(id);return}
  if(type==='acquisitionResource'){await openResourceShop(state,{type:'d'});return}
  if(type==='acquisitionShop'){await openOriginalShopCategory(state,'eggs');return}
  if(type==='acquisitionBreed'){await openBreed(state);return}
  if(type==='acquisitionReturn'){await openCatalogDetail(state,id);return}
  if(type==='acquisition'){await showAcquisition(id);return}
  if(type==='dragonMove'){selected=id;await openHabitatShop(state,{moveDragon:state.dragons.find(d=>d.id===id)});return}
  if(type==='returnMoveDragon'){await openDragonDialog(state,id);return}
  if(type==='openEquipmentStar'){await openEquipmentStar(state,el.dataset.id);return}
  if(type==='starMaterial'){const d=$('#modal'),ids=(d.dataset.starMaterialIds||'').split(',').filter(Boolean),next=ids.includes(el.dataset.id)?ids.filter(v=>v!==el.dataset.id):[...ids,el.dataset.id];await openEquipmentStar(state,d.dataset.equipmentId,next);return}
  if(type==='starEquipment'){const d=$('#modal'),eid=d.dataset.equipmentId;await persist(action(state,type,{equipmentId:eid,ids:(d.dataset.starMaterialIds||'').split(',').filter(Boolean)}));render();await openEquipmentStar(state,eid);toast(state.log[0]);return}
  if(type==='openEquipmentBag'){await openEquipmentBag(state,el.dataset.value);return}
  if(type==='equipmentBagFilter'){const part=Number(el.dataset.value);const icons=[['ui_equip_c0010.png','ui_equip_a0010.png'],['ui_equip_c0011.png','ui_equip_a0011.png'],['ui_equip_c0013.png','ui_equip_a0013.png'],['ui_equip_c0012.png','ui_equip_a0012.png'],['ui_equip_c0014.png','ui_equip_a0014.png'],['ui_equip_yi1.png','ui_equip_yi2.png'],['ui_equip_guan1.png','ui_equip_guan2.png']];document.querySelectorAll('[data-action=equipmentBagFilter]').forEach(b=>{const active=Number(b.dataset.value)===part;b.setAttribute('aria-pressed',String(active));b.querySelector('img').src='assets/original/ui/'+icons[Number(b.dataset.value)+1][active?0:1]});document.querySelectorAll('.source-bag-equipment').forEach(e=>e.hidden=part>=0&&(e.dataset.fragmentId?equipmentFragment(e.dataset.fragmentId)?.part:definitionPart(equipmentInstance(state,e.dataset.id)))!==part);return}
  if(type==='selectDecomposeEquipment'||type==='selectAllDecomposeEquipment'){const modal=$('#modal'),current=(modal.dataset.selectedEquipmentIds||'').split(',').filter(Boolean),ids=type==='selectAllDecomposeEquipment'?(current.length===state.equipment.filter(e=>!e.dragonid).length?[]:state.equipment.filter(e=>!e.dragonid).map(e=>e.id)):current.includes(el.dataset.id)?current.filter(id=>id!==el.dataset.id):[...current,el.dataset.id];await openEquipmentBag(state,'decompose',ids);return}
  if(type==='confirmDecomposeEquipment'){await confirmEquipmentDecompose(state,($('#modal').dataset.selectedEquipmentIds||'').split(',').filter(Boolean));return}
  if(type==='cancelDecomposeEquipment'){await openEquipmentBag(state,'decompose',($('#modal').dataset.selectedEquipmentIds||'').split(',').filter(Boolean));return}
  if(type==='decomposeEquipment'){await persist(action(state,type,{ids:($('#modal').dataset.selectedEquipmentIds||'').split(',').filter(Boolean)}));render();await openEquipmentBag(state,'decompose');toast(state.log[0]);return}
  if(type==='openEquip'){await openEquipDialog(state,Number.isSafeInteger(id)&&state.dragons.some(d=>d.id===id)?id:selected,{returnToDragon:false});return}
  if(type==='openEquipEnhance'){await openEquipEnhanceDialog(state,el.dataset.id,{returnToBag:$('#modal').dataset.mode==='sourceEquipmentBag'});return}
  if(type==='enhanceEquipment'){const returnToBag=$('#modal').dataset.returnToBag==='true';await persist(action(state,'enhanceEquipment',{equipmentId:el.dataset.id,count:Number(el.dataset.value)}));render();await openEquipEnhanceDialog(state,el.dataset.id,{returnToBag});toast(state.log[0]);return}
  if(type==='openEquipInfo'){await openEquipInfoDialog(state,el.dataset.id,{dragonId:Number($('#modal').dataset.dragonId)||null});return}
  if(type==='equipChange'){await openEquipChangeDialog(state,Number($('#modal').dataset.dragonId),el.dataset.id);return}
  if(type==='equipSource'){await openEquipSourceDialog(state,Number($('#modal').dataset.equipPart)||0);return}
  if(type==='equipSelect'){const d=$('#modal');d.dataset.selectedEquipment=el.dataset.id;await openEquipDialog(state,Number(d.dataset.dragonId));return}
  if(type==='wearEquipSelected'){const d=$('#modal'),dragonId=Number(d.dataset.dragonId),equipmentId=d.dataset.selectedEquipment;if(!equipmentId){toast('请先在右侧选中一件未装备的装备。');return}const item=equipmentInstance(state,equipmentId);if(!item){toast('找不到这件装备。');return}const part=definitionPart(item);if(part!==Number(el.dataset.value)){toast(`这件装备属于${EQUIPMENT_SLOTS[part]??'未知'}部位，请点对应槽位。`);return}const next=action(state,'wearEquipment',{id:dragonId,equipmentId});await persist(next);render();delete d.dataset.selectedEquipment;await openEquipDialog(state,dragonId);toast(state.log[0]);return}
  if(type==='equipTab'){toast(el.dataset.value==='frag'?'装备碎片尚未接入，当前只有装备列表。':'当前已显示未装备的装备。');return}
  if(type==='unverifiedEquip'){toast('装备升星、一键装备与完整获取途径仍在开发。');return}
  if(type==='openRecharge'){await openRechargeDialog(state);return}
  if(type==='rechargeVip'){await openVipThresholds(state);return}
  if(type==='resourceShop'){await openResourceShop(state);return}
  if(type==='resourceShopGold'){await openResourceShop(state,{type:'g'});return}
  if(type==='resourceShopFood'){await openResourceShop(state,{type:'f'});return}
  if(type==='buyResource'){const offer=resourceShopRow(id);if(!offer){toast('这个商品尚未开放。');return}const kind=$('#modal')?.dataset.resourceKind||null;if(state.gems<offer.priceGems){toast(`魔晶不足，还差 ${offer.priceGems-state.gems} 魔晶。`);await openRechargeDialog(state);return}const next=action(state,'buyResource',{id});await persist(next);render();await openResourceShop(state,{type:kind});toast(state.log[0]);return}
  if(type==='openAdventure'){await openAdventureDialog(state);return}
  if(type==='openGemExplore'){await openGemExplore(state);return}
  if(type==='exploreGem'){const [mode,count]=el.dataset.value.split(':');await persist(action(state,type,{mode,count:Number(count)}));render();await openGemExploreResult(state,state.gemInventory.slice(-Number(count)),mode,Number(count));toast(state.log[0]);return}
  if(type==='openGems'||type==='gemTab'){await openGemDialog(state,el.dataset.value||'land');return}
  if(type==='gemInfo'){await openGemInfo(state,el.dataset.id,$('#modal').dataset.gemTab||'land');return}
  if(type==='gemUpgrade'){await openGemUpgrade(state,el.dataset.id,$('#modal').dataset.gemTab||'land');return}
  if(type==='gemFeedSelect'){el.classList.toggle('is-selected');return}
  if(['insertGem','removeGem','fuseGem'].includes(type)){const tab=$('#modal').dataset.gemTab||'land',materials=Array.from($('#modal').querySelectorAll('.gem-feed-list .is-selected')).map(v=>v.dataset.id);await persist(action(state,type,{gemId:el.dataset.id,tab,materials}));render();await openGemDialog(state,tab);toast(state.log[0]);return}
  if(type==='openFormation'){await openFormationDialog(state);return}
  if(type==='formationSlot'){await openFormationDialog(state,id);return}
  if(type==='formationPick'){await openFormationPicker(state,id);return}
  if(type==='formationFilter'){await openFormationPicker(state,Number($('#modal').dataset.formationSlot),el.dataset.value);return}
  if(type==='formationPreview'){await openFormationPreview(state);return}
  if(type==='formationEnlist'||type==='formationRemove'){const slot=Number($('#modal').dataset.formationSlot),ids=formationReplacement(state,slot,type==='formationRemove'?null:id);await persist(action(state,'setFormation',{ids}));render();await openFormationDialog(state,Math.min(slot,Math.max(0,ids.length-1)));toast(state.log[0]);return}
  if(type==='pveMap'){await openAdventureDialog(state,Number(el.dataset.value));return}
  if(type==='pveNode'){const node=adventureEvent(id);if(!node)throw new Error('找不到这个关卡节点。');const next=action(state,'battleResolve',{nodeId:id});await openBattleDialog(state,{nodeId:id});busy=true;let completed;try{completed=await playBattleAnimation(state,id,next.adventure.lastBattle)}finally{busy=false}if(!completed)return;await persist(next);closeDialog();render();if(next.adventure.lastBattle.won)await openBattleRewards(state);else await openAdventureDialog(state);toast(state.log[0]);return}
  if(type==='pveUnverified'){toast('普通与精英关卡的战斗、体力与结算尚未实现。');return}
  if(type==='claimAdventureReward'){await persist(action(state,type,{nodeId:id}));render();await openNodeReward(state);toast(state.log[0]);return}
  if(type==='lootBoxUse'){await openLootBoxDialog(state,id);return}
  if(type==='lootBoxCount'){const modal=$('#modal'),count=el.dataset.value==='max'?Number(modal.dataset.boxMax):Number(modal.dataset.boxCount)+Number(el.dataset.value);await openLootBoxDialog(state,Number(modal.dataset.boxId),count);return}
  if(type==='openLootBox'){await persist(action(state,type,{id,count:Number($('#modal').dataset.boxCount)}));render();await openLootBoxResults(state);return}
  if(type==='returnLootWarehouse'){await openWarehouse(state,'prop');return}
  if(type==='returnAdventureRewards'){await openAdventureDialog(state,Number(el.dataset.value));return}
  if(type==='composeEquipmentFragments'){await persist(action(state,type,{id}));render();await openEquipmentBag(state,'fragments');toast(state.log[0]);return}
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
  if(type==='openIncubator'){await openIncubator(state);appendFixedMove(2);tick();return}
  if(type==='openBreed'){await openBreed(state);appendFixedMove(1);tick();return}
  if(type==='openOriginal'){await openCatalog(state);return}
  if(type==='catalogFilter'){await openCatalog(state,el.dataset.value);return}
  if(type==='catalogHelp'){toast('龙谱加成尚未接入，当前可查看龙种与获取途径。');return}
  if(type==='farm'){closeDialog();await openFarmDialog(state);appendFixedMove(3);tick();return}
  if(type==='habitat'){await openHabitatInfo(state,id);tick();return}
  if(type==='selectDragon'){selected=id;await openDragonDialog(state,id);return}
  if(type==='save'){await persist(state);render();toast('牧场已保存。');return}
  if(type==='export'){if(await storage.export(state))toast('存档已导出。');return}
  if(type==='import'){const imported=await storage.import();if(!imported)return;if(imported.error)throw new Error(imported.error);const next=validate(imported);if(!confirm('将载入这份存档，并备份当前牧场。继续吗？'))return;await persist(next);closeDialog();selected=state.dragons[0]?.id;render();toast('存档已载入。');return}
  const priorMode=$('#modal').dataset.mode,priorHabitat=Number($('#modal').dataset.habitatId),moveDragon=Number($('#modal').dataset.dragonId);
  const lotteryMode=Number($('#modal').dataset.lotteryMode??1);const refreshWarehouse=priorMode==='nativeWarehouse'||priorMode==='nativeWarehousePlace';const warehouseGroup=$('#modal').dataset.warehouseGroup??'all';const pendingPrize=Number($('#modal').dataset.pendingPrize);const refreshLottery=!refreshWarehouse&&['lotteryDraw','lotteryClaimResources','lotteryPlace'].includes(type);const payload={id,islandId:activeIsland};if(type==='unwearEquipment')payload.equipmentId=$('#modal').dataset.equipmentId;if(type==='wearEquipment')payload.equipmentId=el.dataset.value;if(type==='recharge')payload.tierId=id;if(type==='plantNative'){type='plant';payload.cropId=id}if(type==='buyHabitat'){type='build';payload.buildingId=id}if(type==='moveNative'){type=priorMode==='nativeWarehousePlace'?'lotteryPlace':'move';payload.id=priorMode==='nativeWarehousePlace'?pendingPrize:moveDragon;payload.habitatId=id}if(type==='hatchNative'){type='hatch';payload.habitatId=id}if(type==='lotteryDraw'){payload.mode=lotteryMode;payload.count=Number(el.dataset.value);const cost=lotteryCost(state.lottery,payload.mode,payload.count);if(cost.gems>0&&!confirm(`本次扣除 ${cost.tokens} 抽奖币及 ${cost.gems} 魔晶，继续吗？`))return}if(type==='lotteryPlace')payload.habitatId??=Number($('#lottery-habitat').value);if(type==='build')payload.buildingId??=Number(el.dataset.buildingId);if(type==='plant')payload.cropId??=Number(el.dataset.cropId??el.closest('.card')?.querySelector('[data-crop]')?.value??1);if(type==='breed'){payload.a=Number($('#modal').dataset.parentA);payload.b=Number($('#modal').dataset.parentB)}
  if(type==='hatch')payload.habitatId??=Number($('#hatch-target')?.value);
  if(type==='move')payload.habitatId??=Number($('#move-target')?.value);
  if(type==='speedIncubator'){const cost=incubatorSpeedCost(state.incubator?.readyAt??0);if(!confirm(`立即完成孵化需要 ${cost} 魔晶，继续吗？`))return}
  if(type==='sellIncubator'){const sp=SPECIES[state.incubator?.species],gold=dragonSellGold(state.incubator?.species);if(!confirm(`确定出售${sp?.name??'幼龙'}并获得 ${gold} 金币吗？`))return}
  if(type==='sellRaffleEgg'){const prize=[...state.raffle.pending,...(state.giftEggs??[])].find(p=>p.id===id),species=prize?speciesKey(prize.dragonId):null,sp=SPECIES[species];if(!prize||!confirm(`确定出售${sp?.name??'这枚'}龙蛋并获得 ${dragonSellGold(species)} 金币吗？`))return}
  if(type==='sellLotteryDragon'){const prize=state.lottery.pending.find(p=>p.id===id),species=prize?speciesKey(prize.itemId):null,sp=SPECIES[species];if(!prize||!confirm(`确定出售${sp?.name??'这只幼龙'}并获得 ${dragonSellGold(species)} 金币吗？`))return}
  if(type==='sellStructure'){const structure=state.structures.find(o=>o.id===id),info=structure&&structureInfo(structure);if(!info||!confirm(`确定出售${info.nameCN}吗？`))return}
  if(type==='buyStructure')payload.itemId=id;const returnToCollection=$('#modal').dataset.returnToCollection==='true';const refreshDragon=['feed','feedAll'].includes(type)&&$('#modal').dataset.mode==='sourceDragon'?Number($('#modal').dataset.dragonId):null;const refreshRecharge=type==='recharge';const refreshExpansion=type==='expandIsland';const equipDragon=(type==='unwearEquipment'||type==='wearEquipment')?(Number($('#modal').dataset.dragonId)||Number(el.dataset.id)||selected):null;const next=action(state,type,payload);await persist(next);if(['plant','harvest'].includes(type)&&$('#modal').dataset.mode==='farm')closeDialog();const refreshFarm=['upgradeFarm','completeFarmUpgrade'].includes(type)&&$('#modal').dataset.mode==='farm';render();if(refreshFarm){closeDialog();await openFarmDialog(state);tick();}if(refreshDragon)await openDragonDialog(state,refreshDragon,{returnToCollection});if(refreshLottery)await openLotteryDialog(state,lotteryMode);if(refreshWarehouse)await openWarehouse(state,warehouseGroup);if(refreshExpansion)await openExpansionShop(state);if(refreshRecharge)await openRechargeDialog(state);if(equipDragon)await openEquipDialog(state,equipDragon);if(type==='buyShopEgg')await openOriginalShopCategory(state,'eggs');if(type==='build')beginObjectMove('habitat',state.habitats.at(-1).id);else if(type==='buyStructure')beginObjectMove('structure',state.structures.at(-1).id);else if(['collect','upgradeHabitat','completeHabitat'].includes(type)&&priorMode==='nativeHabitatInfo')await openHabitatInfo(state,priorHabitat);else if(['breed','takeEgg'].includes(type))await openBreed(state);else if(['incubate','speedIncubator'].includes(type))await openIncubator(state);else if(['hatch','sellIncubator'].includes(type))closeDialog();else if(type==='move')await openDragonDialog(state,payload.id);tick();toast(state.log[0]);
 }catch(error){toast(error.message);if($('#save-status'))$('#save-status').textContent=saveStatus}
});
document.addEventListener('change',e=>{if(e.target.id==='preview-stage'){openDragonPreview(Number(e.target.dataset.id),Number(e.target.value));return}if(e.target.id==='preview-clip'){$('#modal canvas').dataset.clip=e.target.value;return}});
document.addEventListener('keydown',async e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();if(state&&!busy)try{await persist(state);render();toast('牧场已保存。')}catch(error){toast(error.message)}}});
async function boot(){try{const loaded=await storage.load();location=loaded.location;state=loaded.state?validate(loaded.state):createGame();selected=state.dragons[0]?.id;if(!loaded.state)await persist(state);else saveStatus=loaded.recovered?'已从备份恢复':'存档已载入';render();if(loaded.recovered)toast('主存档损坏，已载入上一次有效备份。');setInterval(tick,250)}catch(e){$('#app').innerHTML=`<div class="loading"><h1>${e.code==='PREVIEW_PROFILE'?'当前打开的是网页预览':'存档暂时无法载入'}</h1><p class="error">${escape(e.message)}</p><p>未覆盖任何现有存档。请保留存档文件后检查读写权限或备份。</p></div>`}}
let breedingVisible;setInterval(()=>{if(!state||busy||drag)return;const visible=state.breeding?.phase==='breeding'&&Date.now()<state.breeding.readyAt;if(breedingVisible!==undefined&&visible!==breedingVisible){if(tab==='ranch')render();if($('#modal').dataset.mode==='sourceDragon')void openDragonDialog(state,Number($('#modal').dataset.dragonId),{returnToCollection:$('#modal').dataset.returnToCollection==='true'});}breedingVisible=visible},500);
let resizeFrame;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(state&&tab==='ranch')render();if($('#modal').classList.contains('native-ranch-dialog')||['sourceDragon','sourceCollection','sourceEvolution','sourceLottery','sourceLotteryOptions','sourceRaffle','sourceRafflePreview'].includes($('#modal').dataset.mode))$('#modal').style.setProperty('--source-scale',Math.min((innerWidth-20)/($('#modal').dataset.mode==='sourceFuwenHunt'?1435:1024),(innerHeight-20)/(['sourcePve','sourceBattle'].includes($('#modal').dataset.mode)?576:$('#modal').dataset.mode==='sourceFuwenHunt'?769:['sourceRaffle','sourceRafflePreview'].includes($('#modal').dataset.mode)?770:768)))});});
await boot();

document.addEventListener('pointerdown',e=>{if(!drag&&!e.target.closest('#modal,.original-hud,.placement-controls,[data-action],[data-place-id]')&&e.target.closest('.scene')&&e.button===0){pan={x:e.clientX,y:e.clientY,startX:camera.x,startY:camera.y};e.preventDefault();return}const el=e.target.closest('[data-place-id]');if(!el||busy||e.button!==0)return;activeIsland=Number(el.closest('[data-island]').dataset.island);const id=Number(el.dataset.placeId),kind=el.dataset.placeKind;if(drag){if(drag.id!==id||drag.kind!==kind)return;drag.el=el;drag.x=e.clientX;drag.y=e.clientY;drag.dragging=true}else{const list=kind==='fixed'?fixedBuildings(state):kind==='habitat'?state.habitats:state.structures,object=list.find(x=>x.id===id),index=list.indexOf(object),info=kind==='fixed'?object.info:kind==='habitat'?habitatInfo(object):structureInfo(object),position=kind==='fixed'?object.position:kind==='habitat'?habitatPosition(object,index):structurePosition(object,index),key=kind==='fixed'?object.key:`${kind==='habitat'?'h':'s'}:${id}`;drag={kind,id,key,info,el,x:e.clientX,y:e.clientY,moved:false,dragging:true,position,valid:true}};const wr=el.parentElement.getBoundingClientRect();drag.grab=[(e.clientX-wr.left)/wr.width*100-drag.position[0],(e.clientY-wr.top)/wr.height*100-drag.position[1]];el.setPointerCapture(e.pointerId)});
document.addEventListener('pointermove',e=>{if(pan){camera.x=pan.startX+e.clientX-pan.x;camera.y=pan.startY+e.clientY-pan.y;applyCamera();return}if(!drag?.dragging)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8&&!drag.moved)return;drag.moved=true;const r=drag.el.parentElement.getBoundingClientRect();drag.position=snapHabitatPosition([(e.clientX-r.left)/r.width*100-(drag.grab?.[0]??0),(e.clientY-r.top)/r.height*100-(drag.grab?.[1]??0)]);drag.valid=canPlaceObject(placeables(),drag.key,drag.info,drag.position,state.expansion.plots);drag.el.style.left=drag.position[0]+'%';drag.el.style.top=drag.position[1]+'%';drag.el.classList.add('is-moving');drag.el.querySelector('.placement-tiles')?.remove();drag.el.insertAdjacentHTML('afterbegin',placementTiles(drag.info,drag.valid));showMoveControls()});
document.addEventListener('pointerup',()=>{pan=null;if(!drag?.dragging)return;drag.dragging=false;if(!drag.moved){drag=null;return}suppressHabitatClick=true;setTimeout(()=>{suppressHabitatClick=false},500)});
document.addEventListener('pointercancel',()=>{pan=null;if(drag?.dragging){drag=null;if(state)render()}});

document.addEventListener('wheel',e=>{if(e.target.closest('.scene')&&!document.querySelector('#modal').open&&!e.target.closest('.original-hud,.placement-controls')){e.preventDefault();const r=document.querySelector('.scene').getBoundingClientRect();camera=zoomCameraAt(camera,e.deltaY,e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2);applyCamera();return}const h=e.target.closest('.source-collection-list,.lottery-pending,.native-shop-list,.native-resource-row');if(h&&h.scrollWidth>h.clientWidth&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){h.scrollLeft+=e.deltaY;e.preventDefault();return}const v=e.target.closest('.native-resource-groups');if(v&&v.scrollHeight>v.clientHeight){v.scrollTop+=e.deltaY;e.preventDefault()}},{passive:false});

document.querySelector('#modal').addEventListener('cancel',e=>{e.preventDefault();if($('#modal').dataset.mode==='sourceRafflePreview')closeRafflePreview();else closeDialog()});

document.addEventListener('dblclick',e=>{if(e.target.closest('.scene')&&!e.target.closest('[data-action],.original-hud,.placement-controls')&&!$('#modal').open&&!drag){camera={zoom:1,x:0,y:0};applyCamera();}});
