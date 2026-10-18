import {confirmHabitatSale} from './habitat-sale-dialog.mjs';
import {energyPurchasePlan} from './adventure-energy.mjs';
import {openBossAchievements,openBossSettlement} from './boss-achievement-dialog.mjs';
import {openMail,openMailDetail} from './mail-dialog.mjs';
import {dragonMaterials} from './dragon-materials.mjs';
import {dragonStarMaterialError} from './dragon-stars.mjs';
import {openAwakening,openAwakeningSelect,openAwakeningItem} from './awakening-dialog.mjs';
import {openMutations,openMutationHelp,updateMutationTimers} from './mutation-dialog.mjs';
import {activeMutations,mutationNeedsRefresh} from './mutation-events.mjs';
import {openMonopolyHome,openMonopolyRewards} from './monopoly-dialog.mjs';
import {openCommonDrawOdds,closeCommonDrawOdds} from './draw-odds-dialog.mjs';
import {defaultRuneDragon} from './runes.mjs';
import {resourceBarValues} from './resource-bar.mjs';
import {openHistoryOdds,closeHistoryResult,openHistoryGiftResult,openHistoryRanks,openHistoryTraining,openHistoryActivity,openHistoryHelp,openHistoryCatalogHelp,openHistoryInventory,playHistoryAnimation,openHistoryResult,openHistoryFamily} from './history-activity-dialog.mjs';
import {simulateCombat} from './combat.mjs';
import {openBloodFront,openBloodBuff,openBloodResult,openBloodReset} from './blood-front-dialog.mjs';
import {bloodPlan,bloodToken,refreshBloodFront} from './blood-front.mjs';
import {landBoardPosition} from './islands.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {guideActive,tutorialNavAllowed} from './tutorial.mjs';
import {renderTutorial} from './tutorial-dialog.mjs';
import {landMasksHtml} from './land-geometry.mjs';
import {availableLands,nextIslandOffer,ORIGINAL_LANDS} from './expansion.mjs';
import {missionById} from './missions.mjs';
import {profileOf,avatarImage,nicknameError,renameCost} from './player-profile.mjs';
import {openPlayerProfile,openProfileRename,openProfileHeads,confirmProfileRename} from './player-profile-dialog.mjs';
import {openBreedSpeed,sourceLayout,showSource} from './ranch-dialogs.mjs';
import {openMissions,openMissionReward} from './missions-dialog.mjs';
import {activityFragment,activityItemDescription} from './historical-activities.mjs';
import {showFarmOptions,clearBuildingOptions,openFarmSourceInfo} from './building-options.mjs';
import {openActivities,openSingleRecharge,openSingleRechargeHelp} from './activity-dialog.mjs';
import {openArena,openArenaExchange,openArenaRecords,openArenaRanks,openArenaHelp} from './arena-dialog.mjs';
import {arenaPlan,refreshArena,vipInfo} from './arena.mjs';
import {playEquipmentEffect} from './equipment-effects.mjs';
import {pickRuneDrops} from './acquisition-animation.mjs';
import {worldEntries,openWorldBoss,openHolyTree,openTreeTargets,openWorldHelp,openTreeSeeds} from './world-encounter-dialog.mjs';
import {bossAttackPlan,treeOpponent,WORLD_SOURCE,bossInfo} from './world-encounters.mjs';
import {configuredLineup,lineupPower} from './battle.mjs';
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
import {openGiftUseDialog,openBattleRewards,openLootBoxDialog,openLootBoxResults,openNodeReward} from './loot-dialog.mjs';
import {equipmentFragment} from './loot.mjs';
import {openEquipmentBag,confirmEquipmentDecompose} from './equip-bag-dialog.mjs';
import {installEquipmentListScroll} from './equipment-list-scroll.mjs';
import {openGemExplore,openGemExploreResult} from './gem-explore-dialog.mjs';
import {openRuneHunt,openShenfuDialog} from './rune-hunt-dialog.mjs';
import {openRunePanel,openRuneSelector,openRuneInfo,openRuneUpgrade,refreshRunePreview} from './rune-dialog.mjs';
import {habitatMotionArea,startHabitatMotion} from './habitat-motion.mjs';
import BUILDING_ART from '../assets/original/data/building-art.mjs';
import {zoomCameraAt,clampWorldCamera} from './ranch-camera.mjs';
import {openGemDialog,openGemInfo,openGemUpgrade} from './gem-dialog.mjs';
import {confirmEggQualitySale,openWarehouse,chooseWarehouseDragon} from './warehouse-dialog.mjs';
import {openEquipDialog,openEquipInfoDialog,openEquipChangeDialog,openEquipSourceDialog,openEquipEnhanceDialog} from './equip-dialog.mjs';
import {openAdventureDialog} from './adventure-dialog.mjs';
import {openRechargeDialog,openVipThresholds} from './recharge-dialog.mjs';
import {resourceShopRow} from './resource-shop.mjs';
import {openBattleDialog,playBattleAnimation,playBossAnimation} from './battle-dialog.mjs';
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
import {createGame,createTutorialGame,validate,action,income,farmInfo,playerProgress,isBreedingParent,incubatorSpeedCost,dragonSellGold} from './game.mjs';
import {habitatDefinition,habitatInfo,habitatLimit,habitatPosition,snapHabitatPosition,canPlaceObject,FIXED_BUILDINGS,fixedBuildings} from './habitats.mjs';
import {structureInfo,structurePosition,structureArt,farmWorldArt} from './structures.mjs';
import {dragonArt,sceneArt,eggArt} from './art.mjs';
import {storage} from './storage.mjs';
import {openCollectionDialog,rememberCollectionScroll} from './collection-dialog.mjs';
import {openDragonDialog} from './dragon-dialog.mjs';
import {openFarmDialog} from './farm-dialog.mjs';
import {openFormationDialog,openFormationPicker,openFormationPreview} from './formation-dialog.mjs';
import {formationReplacement} from './formation.mjs';
import {startDragonModels,DRAGON_MODELS} from './dragon-models.mjs';
import {originalHud} from './original-hud.mjs';
installEquipmentListScroll();
let drag;let expansionChoice=null;
let camera={zoom:1,x:0,y:0},pan;
function applyCamera(){const el=document.querySelector('.ranch-world'),scene=document.querySelector('.scene');if(!el||!scene)return;const fit=Math.min(scene.clientWidth/1300,scene.clientHeight/768);camera=clampWorldCamera(camera,scene.clientWidth,scene.clientHeight,fit,WORLD_BOUNDS);if(!drag)activeIsland=nearestWorldIsland(-camera.x/(fit*camera.zoom),-camera.y/(fit*camera.zoom),unlockedIslands(state));el.style.transform=`translate(calc(-50% + ${camera.x}px),calc(-50% + ${camera.y}px)) scale(${fit*camera.zoom})`;el.dataset.zoom=camera.zoom;}
function buildingStyle(info,y){const a=BUILDING_ART[info.id??24],w=a?.width??210,h=a?.height??140,ground=((info.width??5)+(info.height??5)-2)*6.75;return `z-index:${Math.round(y*10)};--art-w:${w}px;--art-h:${h}px;--art-x:${(a?.x??0)-w/2}px;--art-y:${ground-(a?.y??ground)-h/2}px;--plot-w:${info.width??5};--plot-h:${info.height??5}`;}
let collectionFilter='all';
let activeIsland=0;let moreExpanded=false;
let bloodReturn=false;
let state,tab='ranch',selected=2,location='',busy=false,saveStatus='尚未保存',toastTimer;
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n.toLocaleString('zh-CN');
const duration=ms=>{const n=Math.max(0,Math.ceil(ms/1000));return n>=3600?`${Math.floor(n/3600)}时 ${Math.floor(n%3600/60)}分 ${n%60}秒`:n>=60?`${Math.floor(n/60)}分 ${n%60}秒`:`${n} 秒`};
const time=at=>at>Date.now()?duration(at-Date.now()):'已完成';
const button=(label,act,attrs='',cls='primary')=>`<button class="${cls}" data-action="${act}" ${attrs}>${label}</button>`;
function placementTiles(info,valid=true){const tiles=[];for(let row=0;row<(info.height??5);row++)for(let column=0;column<(info.width??5);column++)tiles.push(`<img src="assets/original/ui/grid_${valid?'yellow':'red'}.png" style="--tile-x:${column-row};--tile-y:${column+row}" alt="">`);return `<span style="--grid-center-x:${((info.width??5)-(info.height??5)-0)*13.5}px;--grid-center-y:${((info.width??5)+(info.height??5)-2)*6.75}px" class="placement-tiles ${valid?'valid':'invalid'}">${tiles.join('')}</span>`}
function placeables(){return [...fixedBuildings(state).filter(b=>!b.inactive).map(b=>({...b,islandId:0})),...state.habitats.map((h,i)=>({islandId:islandOf(h),key:`h:${h.id}`,info:habitatInfo(h),position:habitatPosition(h,i)})),...state.structures.map((o,i)=>({islandId:islandOf(o),key:`s:${o.id}`,info:structureInfo(o),position:structurePosition(o,i)}))].filter(o=>islandOf(o)===activeIsland)}
function appendFixedMove(id){$('#modal .source-artboard')?.insertAdjacentHTML('beforeend',`<div class="fixed-move-entry">${nativeButton('移动','beginFixedMove',`data-id="${id}"`)}</div>`)}
function showMoveControls(){document.querySelector('.placement-controls')?.remove();document.querySelector('.scene')?.insertAdjacentHTML('beforeend',`<div class="placement-controls">${nativeButton('取消','cancelBuildingMove')}${nativeButton('确定','confirmBuildingMove')}</div>`)}
function beginObjectMove(kind,id){clearBuildingOptions();const target=kind==='fixed'?0:islandOf((kind==='habitat'?state.habitats:state.structures).find(o=>o.id===id));closeDialog();moreExpanded=false;render();focusIsland(target);const list=kind==='fixed'?fixedBuildings(state):kind==='habitat'?state.habitats:state.structures,object=list.find(x=>x.id===id),el=document.querySelector(`[data-place-kind="${kind}"][data-place-id="${id}"]`);if(!object||!el)return;const index=list.indexOf(object),info=kind==='fixed'?object.info:kind==='habitat'?habitatInfo(object):structureInfo(object),position=kind==='fixed'?object.position:kind==='habitat'?habitatPosition(object,index):structurePosition(object,index),key=kind==='fixed'?object.key:`${kind==='habitat'?'h':'s'}:${id}`;drag={kind,id,key,info,el,x:0,y:0,moved:true,dragging:false,position,valid:canPlaceObject(placeables(),key,info,position,state.expansion.plots,state,activeIsland)};el.classList.add('is-moving');el.insertAdjacentHTML('afterbegin',placementTiles(info,drag.valid));showMoveControls();toast('拖动建筑到格子内，重叠位置会变红。')}
startDragonModels();
startHabitatMotion();
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function timer(at){return `<span data-timer="${at}">${time(at)}</span>`}
function islandBoard(island){const [breedFixed,incubatorFixed,farmFixed]=fixedBuildings(state);return `${sceneArt(state.expansion.plots,island)}${landMasksHtml(state,island)}<div class="scene-header"></div><div class="world-objects" data-island="${island}">${state.habitats.filter(h=>islandOf(h)===island).map((h,i)=>{const [x,y]=habitatPosition(h,i),info=habitatInfo(h),ds=state.dragons.filter(d=>d.habitatId===h.id&&!isBreedingParent(state,d.id));return `<button class="world-object" data-place-kind="habitat" data-place-id="${h.id}" style="left:${x}%;top:${y}%;${buildingStyle(info,y)}" data-action="habitat" data-id="${h.id}" aria-label="${escape(h.name)}"><span class="habitat-platform original-platform"><img class="habitat-art" src="${BUILDING_ART[info.id]?.image??info.image}" alt="栖息地">${ds.map((d,di)=>`<span class="world-resident" data-motion-id="${d.id}" data-motion-area='${JSON.stringify(habitatMotionArea(info))}' style="left:${(di%3-1)*42}px;top:-50px" data-action="openDragon" data-id="${d.id}">${dragonArt(d.species,'',d.level,d.wake?.star??0)}</span>`).join('')}</span><span class="label">${escape(h.name)} · ${h.job?'施工中':`${ds.length}/${info.capacity}`}</span></button>`}).join('')}${state.structures.filter(o=>islandOf(o)===island).map((o,i)=>{const info=structureInfo(o),[x,y]=structurePosition(o,i);return `<button class="world-object structure-object" data-place-kind="structure" data-place-id="${o.id}" style="left:${x}%;top:${y}%;${buildingStyle(info,y)}" data-action="structureInfo" data-id="${o.id}"><span class="habitat-platform original-platform"><img class="habitat-art" src="${[16,17,18,108].includes(info.id)?farmWorldArt(info.id,o.farm):BUILDING_ART[info.id]?.image??structureArt(info)}" alt="${escape(info.nameCN)}"></span><span class="label">${escape(info.nameCN)}${o.readyAt?' · 施工中':o.farmUpgrade?' · 升级中':o.farm?(Date.now()<o.farm.readyAt?' · 生长中':' · 可收获'):''}</span></button>`}).join('')}${island===0?`<button class="world-object" data-place-kind="fixed" data-place-id="1" ${state.tutorial?.sourceOpening?'hidden':''} style="left:${breedFixed.position[0]}%;top:${breedFixed.position[1]}%;${buildingStyle({id:19,width:6,height:6},breedFixed.position[1])}" data-action="openBreed"><img class="nest-art original-building" src="assets/original/world/0019_breeding_cave_a_g_bg.png" alt="原版繁殖洞穴"><span class="breeding-parents">${state.breeding?.phase==='breeding'&&Date.now()<state.breeding.readyAt?state.breeding.parents.map(id=>{const d=state.dragons.find(d=>d.id===id);return dragonArt(d.species,'',d.level,d.wake?.star??0)}).join(''):''}</span><span class="label">培育山${state.breeding?.phase==='breeding'?' · 进行中':state.breeding?' · 有龙蛋':''}</span></button><button class="world-object" data-place-kind="fixed" data-place-id="2" style="left:${incubatorFixed.position[0]}%;top:${incubatorFixed.position[1]}%;${buildingStyle({id:1,width:5,height:5},incubatorFixed.position[1])}" data-action="openIncubator"><img class="nest-art original-building" src="assets/original/world/0001_incubator_g_bg.png" alt="原版初级育龙塔"><span class="label">初级育龙塔${state.incubator?' · 孵化中':''}</span></button><button class="world-object" data-place-kind="fixed" data-place-id="3" ${state.tutorial?.sourceOpening?'hidden':''} style="left:${farmFixed.position[0]}%;top:${farmFixed.position[1]}%;${buildingStyle({id:state.farmBuildingId??16,width:4,height:4},farmFixed.position[1])}" data-action="selectFarm"><img class="farm-art original-building" src="${farmWorldArt(state.farmBuildingId??16,state.farm)}" alt="原版农场"><span class="label">${farmInfo(state).nameCN}${state.farm?' · 生长中':''}</span></button>`:''}</div>`}
function landBoards(island){const offer=nextIslandOffer(state),lands=[...availableLands(state),...(offer?.ready?[ORIGINAL_LANDS.find(l=>l.id===offer.landId)]:[])].filter(l=>l.island===island+1);return lands.map(l=>`<button class="original-land-board ${expansionChoice?'is-selecting':''}" data-action="selectExpansionLand" data-id="${l.id}" style="left:${landBoardPosition(l)[0]}px;top:${landBoardPosition(l)[1]}px"><img src="assets/original/ui/icon_map_PaiZi.png" alt=""><span>购买</span></button>`).join('')}
function ranch(){return `<img class="world-sky" src="assets/original/ui/island_bg_day.png" alt=""><div class="ranch-world">${WORLD_ISLANDS.map(i=>`<section class="world-island" data-world-island="${i.id}" aria-label="${ISLANDS[i.id].name}" style="left:${i.x}px;top:${i.y}px;z-index:${i.z};--island-w:${i.width*.5}px;--island-h:${i.height*.5}px">${islandBoard(i.id)}${i.id>=unlockedIslands(state)?`<button class="native-game-button island-unlock" data-action="switchIsland" data-id="${i.id}">解锁${ISLANDS[i.id].name}</button>`:''}</section>`).join('')}${worldEntries()}${WORLD_ISLANDS.map(i=>landBoards(i.id)).join('')}</div>`}
function focusIsland(id){const scene=document.querySelector('.scene'),fit=Math.min(scene.clientWidth/1300,scene.clientHeight/768),i=WORLD_ISLANDS.find(i=>i.id===id);camera={zoom:1,x:-i.x*fit,y:-i.y*fit};activeIsland=id;applyCamera();}

async function showAcquisition(id){await openAcquisition(state,id)}
function render(){
 clearBuildingOptions();tab='ranch';$('#app').innerHTML=`<div class="app ranch-mode"><main class="main"><section class="scene" aria-label="牧场主区域">${ranch()}${originalHud(state,{expanded:moreExpanded})}</section></main></div>`;applyCamera();tick();
}
let mutationRefreshing=false;
async function refreshMutationState(){
 if(busy||drag||mutationRefreshing||!mutationNeedsRefresh(state))return;
 mutationRefreshing=true;
 try{
  await persist(action(state,'refreshMutations'));
  render();
  const modal=$('#modal');
  if(modal?.open&&modal.dataset.mode==='sourceMutations')await openMutations(state,Number(modal.dataset.mutationId));
 }catch(error){toast(error.message)}finally{mutationRefreshing=false}
}
function tick(){updateMutationTimers(state);void refreshMutationState();const modal=$('#modal');if(!busy&&modal?.open&&['nativeIncubator','nativeIncubatorSpeedConfirm'].includes(modal.dataset.mode)&&Number(modal.dataset.incubatorReady)>0&&Date.now()>=Number(modal.dataset.incubatorReady)){delete modal.dataset.incubatorReady;void openIncubator(state);}if(!busy&&modal?.open&&modal.dataset.mode==='nativeBuildingSpeed'&&Number(modal.dataset.buildingReady)>0&&Date.now()>=Number(modal.dataset.buildingReady)){modal.dataset.buildingReady=0;void openBuildingSpeedDialog(state,modal.dataset.buildingKind,Number(modal.dataset.buildingId));}if(!busy&&modal?.open&&['nativeBreedingJob','nativeBreedSpeed'].includes(modal.dataset.mode)&&state.breeding?.phase==='breeding'&&Date.now()>=state.breeding.readyAt&&modal.querySelector('[data-action=openBreedSpeed],[data-action=speedBreed]'))void openBreed(state);if(!busy&&modal?.open&&modal.dataset.mode==='farm'&&Number(modal.dataset.farmReady)>0&&Date.now()>=Number(modal.dataset.farmReady)){delete modal.dataset.farmReady;void openFarmDialog(state,Number(modal.dataset.farmId??0))}if(!busy&&modal?.open&&modal.dataset.mode==='sourceGemExplore'&&Number(modal.dataset.freeReady)>0&&Date.now()>=Number(modal.dataset.freeReady)){delete modal.dataset.freeReady;void openGemExplore(state)}if(!busy&&modal?.open&&modal.dataset.mode==='sourceShenfu'&&Number(modal.dataset.freeReady)>0&&Date.now()>=Number(modal.dataset.freeReady)){delete modal.dataset.freeReady;void openShenfuDialog(state)}document.querySelectorAll('[data-timer]').forEach(el=>el.textContent=el.classList.contains('source-pve-reward-state')&&Date.now()>=Number(el.dataset.timer)?'可领取':time(Number(el.dataset.timer)));document.querySelectorAll('[data-ready]').forEach(el=>el.disabled=busy||Date.now()<Number(el.dataset.ready));document.querySelectorAll('[data-income]').forEach(el=>{const h=state.habitats.find(h=>h.id===Number(el.dataset.income));if(h)el.textContent=fmt(income(state,h))})}
async function persist(next){busy=true;saveStatus='正在保存…';if($('#save-status'))$('#save-status').textContent=saveStatus;try{await storage.save(next);state=next;saveStatus=`已保存 · ${new Date().toLocaleTimeString('zh-CN')}`;}catch(e){saveStatus='保存失败 · 请重试';throw e}finally{busy=false}}
const resourceReturnStack=[];
const resourceScrollSelectors=['.cultivation-task-list','.cultivation-reward-list','.history-reward-list','.history-activity-grid','.history-categories','.native-shop-list','.native-resource-groups','.native-resource-row'];
function captureResourcePage(){const d=$('#modal');return {mode:d.dataset.mode,dataset:{...d.dataset},html:d.innerHTML,className:d.className,style:d.style.cssText,search:d.querySelector('#history-search')?.value,scrolls:resourceScrollSelectors.flatMap(selector=>[...d.querySelectorAll(selector)].map((el,index)=>({selector,index,top:el.scrollTop,left:el.scrollLeft})))};}
async function returnResourcePage(){if(busy||!resourceReturnStack.length)return;const frame=resourceReturnStack.pop();busy=true;try{
 if(frame.mode==='sourceAwakening'||frame.mode==='sourceAwakeningItem'){if(Number(frame.dataset.dragonId))await openAwakening(state,Number(frame.dataset.dragonId));else await openWarehouse(state);}
 else if(frame.mode==='sourceEvolution')await openEvolutionDialog(state,Number(frame.dataset.dragonId),{returnToCollection:frame.dataset.returnToCollection==='true'});
 else if(frame.mode==='sourceHistoryActivity')await openHistoryActivity(state,frame.dataset.activity);
 else if(frame.mode==='sourceHistoryHub')await openActivities(state,frame.dataset.historyFilter??'全部');
 else if(frame.mode==='sourceHistoryFamily')await openHistoryFamily(state,frame.dataset.historyFamily);
 else if(frame.mode==='sourceHistoryTraining')await openHistoryTraining(state,frame.dataset.trainingReturnKey);
 else if(frame.mode==='sourceHistoryInventory')await openHistoryInventory(state);
 else if(frame.mode==='sourceHistoryRanks')await openHistoryRanks(state,frame.dataset.activity);
 else{const d=$('#modal');if(d.open)d.close();d.className=frame.className;d.style.cssText=frame.style;d.style.setProperty('--source-scale',Math.min((innerWidth-20)/1024,(innerHeight-20)/768));for(const key of Object.keys(d.dataset))delete d.dataset[key];Object.assign(d.dataset,frame.dataset);d.innerHTML=frame.html;for(const [key,value] of Object.entries(resourceBarValues(state)))for(const el of d.querySelectorAll(`[data-source="${key}"]`))el.textContent=value;d.showModal();}
 const search=$('#modal').querySelector('#history-search');if(search&&frame.search!==undefined){search.value=frame.search;search.dispatchEvent(new Event('input',{bubbles:true}));}
 for(const {selector,index,top,left} of frame.scrolls){const el=$('#modal').querySelectorAll(selector)[index];if(el){el.scrollTop=top;el.scrollLeft=left;}}
 }finally{busy=false;}}
async function finishProfileHeads(){const d=$('#modal');if(busy)return;const avatar=Number(d.dataset.profileAvatar);if(avatar!==profileOf(state).avatar)await persist(action(state,'changePlayerAvatar',{avatar}));render();await openPlayerProfile(state);}
function closeDialog(){if(closeCommonDrawOdds()||closeHistoryResult())return;const d=$('#modal');if(d.dataset.mode==='sourceProfileHeads'){void finishProfileHeads().catch(e=>toast(e.message));return;}if(d.dataset.mode==='sourceProfileRename'){void openPlayerProfile(state);return;}if(d.dataset.mode==='sourceProfileRenameConfirm'){void openProfileRename(state,d.dataset.profileName);return;}if(d.dataset.mode==='sourceDragonStarConfirm'){void openDragonStar(state,Number(d.dataset.dragonId),JSON.parse(d.dataset.dragonMaterialIds||'[]')).catch(e=>toast(e.message));return;}if(d.dataset.mode==='sourceEnergyPurchase'){void openAdventureDialog(state,Number(d.dataset.pveMap)||undefined);return;}if(d.dataset.mode==='sourceMailDetail'){void openMail(state);return;}if(d.dataset.mode==='sourceAwakeningItem'){if(Number(d.dataset.dragonId))void openAwakening(state,Number(d.dataset.dragonId));else void openWarehouse(state);return;}if(d.dataset.mode==='sourceAwakeningSelect'){void openAwakening(state,Number(d.dataset.dragonId)).catch(e=>toast(e.message));return;}if(d.dataset.mode==='sourceAwakening'){void openDragonStar(state,Number(d.dataset.dragonId)).catch(e=>toast(e.message));return;}if(d.dataset.mode==='sourceMutationHelp'){void openMutations(state,Number(d.dataset.mutationId)).catch(e=>toast(e.message));return;}if(['sourceHistoryHelp','sourceHistoryOdds'].includes(d.dataset.mode)){void openHistoryActivity(state,d.dataset.activity).catch(e=>toast(e.message));return;}if(d.dataset.mode==='sourceMonopolyRewards'||d.classList.contains('source-monopoly-board')){void openMonopolyHome(state).catch(e=>toast(e.message));return;}if(d.dataset.mode==='sourceHistoryCatalogHelp'){void openActivities(state).catch(e=>toast(e.message));return;}if(d.dataset.mode==='warehouseEggSaleConfirm'){void openWarehouse(state).catch(e=>toast(e.message));return;}if(resourceReturnStack.length&&['nativeResourceShop','sourceRecharge','nativeVipThresholds'].includes(d.dataset.mode)){void returnResourcePage().catch(e=>toast(e.message));return;}d.close();d.className='';delete d.dataset.mode;delete d.dataset.returnToCollection;}
async function showSettings(){const version=await window.ranch?.version?.().catch(()=>null);await openNativePaper('本地存档',`<p>御龙高手 <b>v${version??'未知'}</b>　操作后自动保存</p><div class="native-save-actions">${nativeButton('立即保存','save')}${nativeButton('导出存档','export')}${nativeButton('导入存档','import')}${state.tutorial&&!state.tutorial.done?nativeButton('继续新手引导','tutorialResume'):''}</div>`,'nativeSettings')}
let suppressHabitatClick=false,buildingClickTimer;
function cancelBuildingClick(){clearTimeout(buildingClickTimer);buildingClickTimer=undefined;}
const clipNames={breath:'呼吸',walk:'步行',especial:'特殊动作',combat:'战斗姿态',breathinbattle:'战斗待机',movein:'入场',hurt:'受击',dead:'倒下',airattack:'空中攻击',airattackend:'空中攻击收招',landattack:'地面攻击',landattackend:'地面攻击收招',magic:'施法',magicend:'施法收招',fly:'飞行',walk2:'步行二',walk3:'步行三'};
function openDragonPreview(id,stage){closeDialog();const d=state.dragons.find(d=>d.id===id);if(!d)return;stage??=d.level<4?1:d.level<7?2:3;const sp=SPECIES[d.species],key=`${sp.original}_${stage}`,model=DRAGON_MODELS[key],dialog=$('#modal');const content=`<label>成长阶段</label><select id="preview-stage" data-id="${id}">${[1,2,3].map(i=>`<option value="${i}" ${stage===i?'selected':''}>${['','幼年','成长','成年'][i]}</option>`).join('')}</select>${model?`<canvas class="dragon model-preview" width="900" height="900" data-model="${key}" data-clip="breath" role="img" aria-label="${sp.name}"></canvas><label>动作</label><select id="preview-clip">${model.clips.map(c=>`<option value="${c}" ${c==='breath'?'selected':''}>${clipNames[c]??c}</option>`).join('')}</select>${button('重播动作','replayDragon','','gold')}`:'<p>该阶段原版模型尚未取得。</p>'}`;void openNativePaper(sp.name,content,'nativeModelPreview')}
document.addEventListener('click',async e=>{
 if(suppressHabitatClick&&e.target.closest('[data-place-id]')){suppressHabitatClick=false;cancelBuildingClick();return}
 const building=e.target.closest('[data-place-id]');
 if(building&&drag){cancelBuildingClick();return}
 if(e.isTrusted&&building&&e.target.closest('[data-action]')===building&&!guideActive(state)){
  cancelBuildingClick();if(e.detail>1)return;
  buildingClickTimer=setTimeout(()=>{buildingClickTimer=undefined;if(building.isConnected&&!busy&&!drag&&!$('#modal').open)building.dispatchEvent(new MouseEvent('click',{bubbles:true}));},300);return;
 }
 if(e.isTrusted)cancelBuildingClick();
 const el=e.target.closest('[data-tab],[data-action]');if(!el){if(!e.target.closest('#modal,#building-options'))clearBuildingOptions();return}if((busy&&el.dataset.action!='close')||el.disabled)return;
 if($('#modal')?.dataset.animating==='true'&&el.closest('#modal')&&el.dataset.action!=='close')return;
 if(el.dataset.tab){closeDialog();if(el.dataset.tab==='habitats')await openHabitatShop(state);else if(el.dataset.tab==='breeding')await openBreed(state);else if(el.dataset.tab==='dragons')await openCollectionDialog(state,collectionFilter);else render();return}
 let type=el.dataset.action;const id=Number(el.dataset.id);const guideBefore=state.tutorial?.step;let guideSucceeded=true;
 try{
  if(type==='tutorialPause'||type==='tutorialResume'){await persist(action(state,type));if(type==='tutorialResume'){closeDialog();moreExpanded=false;render();await recoverTutorialView();}void renderTutorial(state);return}
  if(type==='tutorialFinish'){await persist(action(state,type));render();return}
  if(type==='speedIncubator'||type==='applyIncubatorSpeed'){el.disabled=true;try{await persist(action(state,'speedIncubator'));render();await openIncubator(state);tick();toast(state.log[0]);}finally{if(el.isConnected)el.disabled=false;}return}
  if(type==='openIncubatorSpeedConfirm'){const cost=incubatorSpeedCost(state.incubator.readyAt);showSource('tutorialIncubatorConfirm',renderSourceLayout(await sourceLayout('panel_msg'),{values:{txt:`立即完成孵化需要 ${cost} 魔晶，是否继续？`,'btn_QueDing/txt_name':'是'},actions:{btn_close:{type:'cancelTutorialIncubator',label:'取消'},'btn_QueDing/btn':{type:'confirmTutorialIncubator',label:'是'}}}));return}
  if(type==='cancelTutorialIncubator'){await openIncubator(state);return}
  if(type==='breed'&&guideActive(state)&&state.tutorial.step===37){const a=Number($('#modal').dataset.parentA),b=Number($('#modal').dataset.parentB);const d=showSource('tutorialBreedConfirm',renderSourceLayout(await sourceLayout('panel_msg'),{values:{txt:'是否立即培育？','btn_QueDing/txt_name':'立即培育'},actions:{btn_close:{type:'cancelTutorialBreed',label:'取消'},'btn_QueDing/btn':{type:'confirmTutorialBreed',label:'立即培育'}}}));d.dataset.parentA=a;d.dataset.parentB=b;await persist(action(state,'tutorialNavigate',{event:'openTutorialBreedConfirm'}));return}
  if(type==='cancelTutorialBreed'){await persist(action(state,'tutorialBreedBack'));await openBreed(state);return}
  if(type==='confirmTutorialBreed')type='breed';
  if(type==='confirmTutorialIncubator')type='speedIncubator';

  if(['resourceBarGold','resourceBarGems','resourceBarSouls'].includes(type)){const d=$('#modal'),kind=type==='resourceBarGold'?'g':'h';if(type!=='resourceBarGems'&&d.dataset.mode==='nativeResourceShop'&&d.dataset.resourceKind===kind){toast(`当前已是${kind==='g'?'金币':'龙魂'}商店。`);return;}resourceReturnStack.push(captureResourcePage());if(type==='resourceBarGems')await openRechargeDialog(state);else await openResourceShop(state,{type:kind});return;}
  if(type==='openHabitats'&&resourceReturnStack.length&&$('#modal').dataset.mode==='nativeResourceShop'){await returnResourcePage();return;}
  if(type==='openActivities'||type==='openWelfare'||type==='openMonopolyActivities'){await persist(action(state,'activityVisit'));render();await openActivities(state,type==='openWelfare'?'福利':type==='openMonopolyActivities'?'大富翁':'全部');return}
  if(type==='openFirstCharge'){await persist(action(state,'activityVisit'));render();await openHistoryActivity(state,'first');return}
  if(type==='historyResultClose'){closeHistoryResult();return}
  if(type==='raffleOdds'){await openCommonDrawOdds('raffle',el.dataset.value);return}
  if(type==='lotteryOdds'){await openCommonDrawOdds('lottery',$('#modal').dataset.lotteryMode??1);return}
  if(type==='drawOddsClose'){closeCommonDrawOdds();return}
  if(type==='monopolyHome'){await openMonopolyHome(state);return}
  if(type==='monopolyRewards'){await openMonopolyRewards(state,el.dataset.value);return}
  if(type==='monopolyEnter'){const key=el.dataset.value;await persist(action(state,'historyActivity',{key,op:'enter',token:String(state.activities.history.revision)}));render();await openHistoryActivity(state,key);return}
  if(type==='historyOdds'){await openHistoryOdds(state,el.dataset.value,id||1);return}
  if(type==='historyRanks'){await openHistoryRanks(state,el.dataset.value);return}
  if(type==='historyGift'){await openGiftUseDialog(state,id);return}
  if(type==='giftUseCount'){const d=$('#modal');await openGiftUseDialog(state,Number(d.dataset.giftId),el.dataset.value==='max'?Number(d.dataset.giftMax):Number(d.dataset.giftCount)+Number(el.dataset.value));return}
  if(type==='confirmGiftUse'){await persist(action(state,activityFragment(id)?'composeActivityFragment':'activityGift',{id,count:Number($('#modal').dataset.giftCount)}));render();await openHistoryGiftResult(state);return}
  if(type==='warehouseItemInfo'){if([7111,7112,7113,7114].includes(id)){await openAwakeningItem(state,null,id);return}toast(activityItemDescription(id)||'原客户端未取得该道具的使用说明。');return}
  if(type==='historyTraining'){await openHistoryTraining(state,$('#modal').dataset.activity??'train-points');return}
  if(type==='historyChestWarehouse'){resourceReturnStack.push(captureResourcePage());await openWarehouse(state,'prop');return}
  if(type==='historyPillShop'){resourceReturnStack.push(captureResourcePage());await openResourceShop(state,{type:'i'});return}
  if(type==='historyTrain'){const returnKey=$('#modal').dataset.trainingReturnKey;await persist(action(state,'activityTrain',{id,count:Number(el.dataset.count??1)}));render();await openHistoryTraining(state,returnKey);toast(state.log[0]);return}
  if(type==='warehouseSellByQuality'){await confirmEggQualitySale(state,Number(document.querySelector('#warehouse-egg-quality').value));return}
  if(type==='sellEggsByQuality'){const ids=$('#modal').dataset.saleEggIds.split(',').map(Number);await persist(action(state,type,{quality:id,ids}));render();await openWarehouse(state,'dragon');toast(state.log[0]);return}
  if(type==='historyTrainingBuy'){const key=$('#modal').dataset.activity,offer=resourceShopRow(id);if(state.gems<offer.priceGems){resourceReturnStack.push(captureResourcePage());await openRechargeDialog(state);toast(`魔晶不足，还差${offer.priceGems-state.gems}魔晶。`);return;}await persist(action(state,'buyResource',{id}));render();await openHistoryActivity(state,key);toast(state.log[0]);return}
  if(type==='historyFilter'){await openActivities(state,el.dataset.value);return}
  if(type==='openPlayerProfile'){if(!state.profile)await persist(action(state,'initProfile'));render();await openPlayerProfile(state);return}
  if(type==='profileRename'){await openProfileRename(state);return}
  if(type==='profileRenameConfirm'){const name=$('#profile-nickname').value;if(name===''){await openPlayerProfile(state);return;}const error=nicknameError(name);if(error)throw Error(error);if(name===profileOf(state).name){await openPlayerProfile(state);return;}if(renameCost(state)){await confirmProfileRename(name);return;}await persist(action(state,'renamePlayer',{name}));render();await openPlayerProfile(state);return}
  if(type==='profileRenameCancel'){await openProfileRename(state,$('#modal').dataset.profileName);return}
  if(type==='profileRenameApply'){await persist(action(state,'renamePlayer',{name:$('#modal').dataset.profileName}));render();await openPlayerProfile(state);return}
  if(type==='profileHeads'){await openProfileHeads(state);return}
  if(type==='profileHeadSelect'){const d=$('#modal');d.dataset.profileAvatar=id;d.querySelectorAll('.profile-head-choice').forEach(b=>b.classList.toggle('is-selected',Number(b.dataset.id)===id));document.querySelector('.hud-avatar').src=avatarImage(id);return}
  if(type==='profileHeadsClose'){await finishProfileHeads();return}
  if(type==='openBreedSpeed'){await openBreedSpeed(state);return}
  if(type==='speedBreed'){await persist(action(state,'speedBreed'));render();await openBreed(state);tick();toast(state.log[0]);return}
  if(type==='historyFamily'){await openHistoryFamily(state,el.dataset.value);return}
  if(type==='historyOpen'){if(!state.activities.history){await persist(action(state,'activityVisit'));render();}await openHistoryActivity(state,el.dataset.value);return}
  if(type==='historyHelp'){await openHistoryHelp(el.dataset.value);return}
  if(type==='historyCatalogHelp'){await openHistoryCatalogHelp();return}
  if(type==='historyInventory'){await openWarehouse(state,'prop');return}
  if(type==='historyAct'){const key=el.dataset.value,old=state.activities.history.boards[key]?.position??0;await persist(action(state,'historyActivity',{key,id,token:el.dataset.token,count:Number(el.dataset.count??1),op:el.dataset.op,code:document.querySelector('#history-code')?.value}));render();const dialog=await openHistoryActivity(state,key);if(state.activities.history.last.length&&await playHistoryAnimation(dialog,state,key,old))await openHistoryResult(state,key);toast(state.log[0]);return}
  if(type==='openSingleRecharge'){await openSingleRecharge(state);return}
  if(type==='singleRechargeHelp'){await openSingleRechargeHelp();return}
  if(type==='singleRechargeClaim'){await persist(action(state,type,{id}));render();await openSingleRecharge(state);toast(state.log[0]);return}
  if(type==='openArena'){await openArena(state);tick();return}
  if(type==='arenaHelp'){await openArenaHelp();return}
  if(type==='arenaExchangeList'){await openArenaExchange(state);return}
  if(type==='arenaRecords'){await openArenaRecords(state);return}
  if(type==='arenaRanks'){await openArenaRanks(state);return}
  if(type==='arenaBuyConfirm'||type==='arenaResetConfirm'){const buy=type==='arenaBuyConfirm';await openNativePaper(buy?'增加挑战次数':'重置挑战冷却',buy?`<p>花费10魔晶增加一次挑战。当前VIP每日最多购买 ${vipInfo(state).pvpBuyTime} 次，今日已购买 ${state.arena.bought} 次。</p>${nativeButton('确定','arenaBuy')}${nativeButton('返回','openArena')}`:`<p>花费50魔晶立即清除挑战冷却。</p>${nativeButton('确定','arenaReset')}${nativeButton('返回','openArena')}`,'sourceArenaConfirm');return}
  if(type==='arenaChallenge'){const before=structuredClone(state);refreshArena(before,Date.now());const plan=arenaPlan(before,id,Date.now(),el.dataset.value);await persist(action(state,type,{id,token:el.dataset.value}));render();await openBattleDialog(before,{enemyGroup:plan.enemies});if(await playBattleAnimation(before,null,{won:plan.won,enemyGroup:plan.enemies,combat:plan.combat})){await openArena(state);tick();toast(state.log[0]);}return}
  if(['arenaBuy','arenaReset','arenaRefresh','arenaClaim','arenaExchange'].includes(type)){await persist(action(state,type,{id}));render();if(type==='arenaExchange')await openArenaExchange(state);else await openArena(state);tick();toast(state.log[0]);return}
  if(type==='openWorldBoss'){if(playerProgress(state).level<15){toast('15级开启远古首领。');return}await openWorldBoss(state);return}
  if(type==='openHolyTree'){if(playerProgress(state).level<10){toast('10级开启圣树抢夺战。');return}await openHolyTree(state);tick();return}
  if(type==='worldHelp'){await openWorldHelp(el.dataset.value);return}
  if(type==='treeChooseSeed'){await openTreeSeeds(state,id);return}
  if(type==='treeTargets'){await openTreeTargets(state);return}
  if(['treePlant','treeHarvest'].includes(type)){await persist(action(state,type,{id,slot:el.dataset.slot===undefined?undefined:Number(el.dataset.slot)}));render();await openHolyTree(state);tick();toast(state.log[0]);return}
  if(type==='bossChallenge'){const before=structuredClone(state),plan=bossAttackPlan(state);await persist(action(state,type));render();await openBattleDialog(before,{enemyGroup:[plan.enemy]});if(await playBossAnimation(before,plan)){if(plan.won)await openBossSettlement(state);else await openWorldBoss(state);toast(state.log[0]);}return}
  if(type==='bossAttemptInfo'){const cost=[10,30,50,70,90][Math.min(state.encounters.boss.bought,4)];await openNativePaper('增加首领挑战次数',`<p>花费 ${cost} 魔晶增加1次挑战。</p>${nativeButton('确定','bossBuyAttempt')}`,'sourceBossAttempt');return}
  if(type==='bossBuyAttempt'){await persist(action(state,type));await openWorldBoss(state);toast(state.log[0]);return}
  if(type==='bossHistory'){const b=state.encounters.boss;await openNativePaper('首领战绩',`<p>累计伤害：${fmt(b.totalDamage)}</p><p>已击杀首领：${b.kills}</p>`,'sourceBossHistory');return}
  if(type==='bossAchievements'){await openBossAchievements(state);return}
  if(type==='bossAchievementClaim'){await persist(action(state,type,{id}));render();await openBossAchievements(state);toast(state.log[0]);return}
  if(type==='treePlunder'){const before=structuredClone(state),op=treeOpponent(state,id),combat=simulateCombat(state,op.enemies),won=combat.won;await persist(action(state,type,{id}));render();await openBattleDialog(before,{enemyGroup:op.enemies});if(await playBattleAnimation(before,null,{won,enemyGroup:op.enemies,combat})){await openTreeTargets(state);toast(state.log[0]);}return}
  if(type==='openBloodFront'){if(playerProgress(state).level<17){toast('17级开启血战前线。');return}bloodReturn=false;refreshBloodFront(state,Date.now());await openBloodFront(state);return}
  if(type==='close'&&bloodReturn){bloodReturn=false;await openBloodFront(state);return}
  if(type==='bloodSelect'){await openBloodFront(state,id,$('#modal').dataset.mode==='sourceBloodNext');return}
  if(type==='bloodBuffInfo'){if(state.bloodFront.buffs.includes(id)){toast('本关该增益已激活。');return}await openBloodBuff(state,id);return}
  if(type==='bloodBuffCurrency'){await openBloodBuff(state,id,el.dataset.value);return}
  if(type==='bloodResetConfirm'){await openBloodReset();return}
  if(type==='bloodBuff'||type==='bloodReset'){await persist(action(state,type,{id,currency:el.dataset.value}));render();await openBloodFront(state);toast(state.log[0]);return}
  if(type==='bloodFormation'||type==='bloodEquipment'){bloodReturn=true;if(type==='bloodFormation')await openFormationDialog(state);else await openEquipDialog(state,configuredLineup(state)[0]?.id??state.dragons[0]?.id);return}
  if(type==='bloodFight'||type==='bloodSweep'){
   const token=$('#modal').dataset.bloodToken,before=structuredClone(state),plan=type==='bloodFight'?bloodPlan(state,id,token):null;
   await persist(action(state,type,{difficulty:id,token}));render();
   if(type==='bloodSweep'){await openBloodResult(state);return}
   bloodReturn=true;await openBattleDialog(before,{enemyGroup:plan.enemies,layoutName:'ui_battleblood',allyPower:plan.power,enemyPower:plan.required});busy=true;
   let complete;try{complete=await playBattleAnimation(before,null,{won:plan.won,enemyGroup:plan.enemies,allyStats:plan.allyStats,combat:plan.combat});}finally{busy=false}
   if(complete){bloodReturn=false;if(state.bloodFront.last)await openBloodResult(state);else await openBloodFront(state,id,true);toast(state.log[0]);}return;
  }
  if(type==='openRunes'||type==='openRuneHunt'){await openRuneHunt(state);return}
  if(type==='runeEquipment'||type==='runePanelDragon'){const target=type==='runePanelDragon'?id:defaultRuneDragon(state,id||selected)?.id;await openRunePanel(state,target);return}
  if(type==='openShenfu'){await openShenfuDialog(state);tick();return}
  if(['buyShenfu','huntRune','pickRuneHunt'].includes(type)){
   const next=action(state,type,{count:Number(el.dataset.value),npc:id,id:el.dataset.id||null}),previousIds=new Set(state.runeHunt.pending.map(p=>p.id));
   // Save before the visual sequence: closing during it must never lose a reward.
   await persist(next);busy=true;
   try{if(type==='pickRuneHunt')await pickRuneDrops($('#modal'),el.dataset.id||null);render();if(type==='buyShenfu')await openShenfuDialog(state);else if($('#modal').open)await openRuneHunt(state,{newDrops:type==='huntRune'?state.runeHunt.pending.filter(p=>!previousIds.has(p.id)).map(p=>p.id):null,reveal:type!=='pickRuneHunt'});}finally{busy=false}
   tick();toast(state.log[0]);return
  }
  if(type==='runeSelector'){await openRuneSelector(state,id,Number(el.dataset.value));return}
  if(type==='runeInfo'){await openRuneInfo(state,Number($('#modal').dataset.dragonId),el.dataset.id);return}
  if(type==='runeUpgrade'){await openRuneUpgrade(state,Number($('#modal').dataset.dragonId),el.dataset.id);return}
  if(type==='runeFeedSelect'){el.classList.toggle('is-selected');refreshRunePreview(state);return}
  if(type==='runeSelectAll'){const cells=[...$('#modal').querySelectorAll('.source-rune-feed .source-rune-cell')],all=cells.every(c=>c.classList.contains('is-selected'));cells.forEach(c=>c.classList.toggle('is-selected',!all));refreshRunePreview(state);return}
  if(['wearRune','unwearRune','upgradeRune','wearBestRunes'].includes(type)){const dragonId=Number($('#modal').dataset.dragonId),materials=[...$('#modal').querySelectorAll('.source-rune-feed .is-selected')].map(e=>e.dataset.id);await persist(action(state,type,{id:dragonId,runeId:el.dataset.id,materials}));render();if(type==='upgradeRune')await openRuneInfo(state,dragonId,el.dataset.id);else if($('#modal').dataset.runeContext==='panel')await openRunePanel(state,dragonId);else await openEquipDialog(state,dragonId);toast(state.log[0]);return}
  if(type==='openBuildingSpeed'){await openBuildingSpeedDialog(state,el.dataset.kind,id);tick();return}
  if(type==='speedBuilding'){const kind=el.dataset.kind;await persist(action(state,'speedBuilding',{kind,id:kind==='farm'&&!Number.isFinite(id)?0:id}));closeDialog();render();toast(state.log[0]);return}
  if(type==='cancelBuildingMove'){if(drag?.kind==='structure'){const o=state.structures.find(o=>o.id===drag.id);if(o?.placementPending)await persist(action(state,'placeStructure',{id:o.id,position:o.position,islandId:o.islandId}));}drag=null;render();toast('已取消移动。');return}
  if(type==='confirmBuildingMove'){if(!drag?.position)return;if(!drag.valid){toast('红色地块不能摆放建筑。');return}const ended=drag,pending=ended.kind==='structure'&&state.structures.find(o=>o.id===ended.id)?.placementPending;drag=null;await persist(action(state,ended.kind==='fixed'?'placeFixed':ended.kind==='habitat'?'placeHabitat':'placeStructure',{id:ended.id,position:ended.position,islandId:activeIsland}));render();if(pending)await openBuildingSpeedDialog(state,'structure',ended.id);toast('建筑已按地块摆放。');return}
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
  if(type==='structureInfo'){let o=state.structures.find(o=>o.id===id);if(o?.placementPending){await persist(action(state,'placeStructure',{id:o.id,position:o.position,islandId:o.islandId}));o=state.structures.find(o=>o.id===id);}if(o&&!o.readyAt&&[16,17,18,108].includes(o.itemId)){closeDialog();await showFarmOptions(state,id)}else await openStructureInfo(state,id);tick();return}
  if(type==='selectFarm'){closeDialog();await showFarmOptions(state,0);return}
  if(type==='farmSourceInfo'||type==='farmSourceUpgrade'){await openFarmSourceInfo(state,id,type==='farmSourceUpgrade');return}
  if(type==='farmConstructionSpeed'){const o=id?state.structures.find(o=>o.id===id):state;await openBuildingSpeedDialog(state,o.readyAt?'structure':'farm',id);tick();return}
  if(type==='closeRafflePreview'){closeRafflePreview();return}
  if(type==='raffleAgain'){const value=el.dataset.value;await openRaffleDialog(state);const target=Array.from($('#modal').querySelectorAll('[data-action=raffleDraw]')).find(node=>node.dataset.value===value);target?.click();return}
  if(type==='returnRaffle'){await openRaffleDialog(state);return}
  if(type==='raffleDraw'){const [mode,count]=String(el.dataset.value).split(':'),amount=Number(count),cost=raffleCost(state.raffle,mode,amount);if(cost.gems>0&&!confirm(`本次消耗 ${cost.tickets} 张抽奖券及 ${cost.gems} 魔晶，继续吗？`))return;const next=action(state,'raffleDraw',{mode,count:amount}),results=next.raffle.pending.slice(-amount);await persist(next);busy=true;let keepDialog=false;try{keepDialog=await playRaffleDraw(mode)}finally{busy=false}render();if(keepDialog)await openRaffleResult(state,results,mode,amount);toast(state.log[0]);return}
  if(type==='raffleUnverified'){toast('基因中心尚未接入。');return}
  if(type==='openLottery'){await openLotteryDialog(state,Number(el.dataset.value));return}
  if(type==='returnLottery'){await openLotteryDialog(state,Number($('#modal').dataset.lotteryMode));return}
  if(type==='lotteryPrize'){openLotteryPrize(state,id);return}
  if(type==='lotteryHelp'){await openNativePaper('抽奖说明',`<p>${escape(lotteryHelp())}</p>`);return}
  if(type==='confirmSellHabitat'){await confirmHabitatSale(state,id);return}
  if(type==='cancelHabitatSale'){await openHabitatInfo(state,id);return}
  if(type==='sellHabitat'){await persist(action(state,type,{id}));closeDialog();render();tick();toast(state.log[0]);return}
  if(type==='confirmSellDragon'){await confirmDragonSale(state,id);return}
  if(type==='cancelDragonSale'||type==='returnStarDragon'){await openDragonDialog(state,id,{returnToCollection:$('#modal').dataset.returnToCollection==='true'});return}
  if(type==='sellDragon'){const collection=$('#modal').dataset.returnToCollection==='true';await persist(action(state,type,{id}));selected=state.dragons[0]?.id;render();closeDialog();if(collection)await openCollectionDialog(state,collectionFilter);toast(state.log[0]);return}
  if(type==='openDragonStar'||type==='openDragonGrowth'){const target=type==='openDragonGrowth'?(selected??state.dragons[0]?.id):id;if(!target)throw Error('牧场里还没有可以升星的龙。');await openDragonStar(state,target);return}
  if(type==='dragonStarMaterial'){const modal=$('#modal'),ids=JSON.parse(modal.dataset.dragonMaterialIds||'[]'),key=el.dataset.value?.includes(':')?el.dataset.value:id,next=ids.includes(key)?ids.filter(v=>v!==key):[...ids,key];await openDragonStar(state,Number(modal.dataset.dragonId),next);return}
  if(type==='requestStarDragon'){await confirmDragonStar(state,id,JSON.parse($('#modal').dataset.dragonMaterialIds||'[]'));return}
  if(type==='cancelStarDragon'){await openDragonStar(state,id,JSON.parse($('#modal').dataset.dragonMaterialIds||'[]'));return}
  if(type==='starDragon'){const ids=JSON.parse($('#modal').dataset.dragonMaterialIds||'[]');const before=state.dragons.find(v=>v.id===id)?.star??1;await persist(action(state,type,{id,ids}));render();await openDragonStar(state,id);void playEquipmentEffect($('#modal'),(state.dragons.find(v=>v.id===id)?.star??1)>before?'star_up':'exp_up','.dragon-star-right [data-source=tx_star]').catch(console.error);toast(state.log[0]);return}
  if(type==='dragonStarAll'){const d=state.dragons.find(v=>v.id===id),candidates=dragonMaterials(state).filter(v=>!dragonStarMaterialError(state,d,v)).map(v=>v.id),chosen=JSON.parse($('#modal').dataset.dragonMaterialIds||'[]');await openDragonStar(state,id,chosen.length===candidates.length?[]:candidates);return}
  if(type==='buyAdventureEnergyInfo'){const p=energyPurchasePlan(state);await openNativePaper('购买体力',`<p>花费50魔晶将体力补满至${p.capacity}。</p><p>今日可购买：${p.remaining}/${p.limit}次</p>${nativeButton('购买','buyAdventureEnergy', '',!p.remaining||state.adventure.energy>=p.capacity)}`,'sourceEnergyPurchase');return}
  if(type==='buyAdventureEnergy'){const map=Number($('#modal').dataset.pveMap)||undefined;await persist(action(state,type));render();await openAdventureDialog(state,map);toast(state.log[0]);return}
  if(type==='openMail'){await openMail(state);return}
  if(type==='readMail'){await openMailDetail(state,el.dataset.value);return}
  if(type==='claimMail'||type==='deleteReadMail'){await persist(action(state,type,{id:el.dataset.value}));render();await openMail(state);toast(state.log[0]);return}
  if(type==='awakeningItem'){await openAwakeningItem(state,id,Number(el.dataset.value));return}
  if(type==='awakeningShop'){resourceReturnStack.push(captureResourcePage());await openResourceShop(state,{type:'i',itemId:Number(el.dataset.value)});return}
  if(type==='openAwakening'){await openAwakening(state,id);return}
  if(type==='awakeningSelect'){const d=$('#modal');await openAwakeningSelect(state,id,JSON.parse(d.dataset.awakeningKeys||'[]'));return}
  if(type==='awakeningMaterial'){const d=$('#modal'),keys=JSON.parse(d.dataset.awakeningKeys||'[]'),key=el.dataset.value.includes(':')?el.dataset.value:id,next=keys.includes(key)?keys.filter(v=>v!==key):[...keys,key];await openAwakeningSelect(state,Number(d.dataset.dragonId),next);return}
  if(type==='awakeningSelected'){const d=$('#modal');await openAwakening(state,id,el.dataset.value==='accept'?JSON.parse(d.dataset.awakeningKeys||'[]'):[]);return}
  if(type==='dragonAwaken'){const priorStar=state.dragons.find(d=>d.id===id).wake?.star??0,keys=JSON.parse($('#modal').dataset.awakeningKeys||'[]');await persist(action(state,type,{id,op:el.dataset.value,keys}));render();await openAwakening(state,id);void playEquipmentEffect($('#modal'),el.dataset.value==='upgrade'?'eff_juexing_03':'eff_juexing_01','[data-source="node_center/node_starbar"]',el.dataset.value==='upgrade'?{x:-64.5+priorStar*32,y:-1.5}:{}).catch(console.error);toast(state.log[0]);return}
  if(type==='dragonMutationHelp'||type==='openMutations'){await openMutations(state,id);return}
  if(type==='mutationHelp'){await openMutationHelp(state,Number.isFinite(id)?id:Number($('#modal').dataset.mutationId));return}
  if(type==='claimMutation'){const events=activeMutations(state),index=events.findIndex(e=>e.id===id),remaining=events.filter(e=>e.id!==id),nextId=remaining[Math.min(index,remaining.length-1)]?.id;await persist(action(state,type,{id}));render();await openMutations(state,nextId);toast(state.log[0]);return}
  if(type==='evolutionResources'){resourceReturnStack.push(captureResourcePage());await openResourceShop(state,{type:el.dataset.value});return}
  if(type==='evolveDragon'){const from=$('#modal').dataset.returnToCollection==='true';await persist(action(state,type,{id}));render();await openEvolutionDialog(state,id,{returnToCollection:from});toast(state.log[0]);return}
  if(type==='openEvolution'){await openEvolutionDialog(state,id,{returnToCollection:$('#modal').dataset.returnToCollection==='true'});return}
  if(type==='returnFromEvolution'){await openDragonDialog(state,id,{returnToCollection:$('#modal').dataset.returnToCollection==='true'});return}
  if(type==='evolutionHelp'){await openNativePaper('进化说明',`<p>${escape(EVOLUTION_TEXT['ev.evolution tip'])}</p><p>离线结算：按客户端区间表解释当前成功率，失败增加1点进化值，达到进化条上限后必成；成功清空本阶进化值。原服务器结算尚未取得。</p>`);return}
  if(type==='dragonSkillInfo'){const prev=$('#modal'),origin={mode:prev.dataset.mode,catalogId:prev.dataset.catalogId,collection:prev.dataset.returnToCollection},dragon=state.dragons.find(d=>d.id===id)??{id:0,species:speciesKey(Number(origin.catalogId)),level:1};const dialog=await openSkillDialog(state,dragon,Number(el.dataset.value));dialog.dataset.returnCatalogId=origin.mode==='sourceCatalogDetail'?origin.catalogId:'';dialog.dataset.returnRunePanel=String(origin.mode==='sourceRunePanel');dialog.dataset.returnToCollection=origin.collection??'false';return}
  if(type==='returnSkillDragon'){const d=$('#modal');if(d.dataset.returnRunePanel==='true')await openRunePanel(state,id);else if(d.dataset.returnCatalogId)await openCatalogDetail(state,Number(d.dataset.returnCatalogId));else await openDragonDialog(state,id,{returnToCollection:d.dataset.returnToCollection==='true'});return}
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
  if(type==='openEquipmentStar'){const part=Number($('#modal').dataset.bagPart??-1);await openEquipmentStar(state,el.dataset.id);$('#modal').dataset.bagPart=part;return}
  if(type==='starMaterial'){const d=$('#modal'),part=Number(d.dataset.bagPart??-1),ids=(d.dataset.starMaterialIds||'').split(',').filter(Boolean),next=ids.includes(el.dataset.id)?ids.filter(v=>v!==el.dataset.id):[...ids,el.dataset.id];await openEquipmentStar(state,d.dataset.equipmentId,next);$('#modal').dataset.bagPart=part;return}
  if(type==='starEquipment'){const d=$('#modal'),part=Number(d.dataset.bagPart??-1),eid=d.dataset.equipmentId,before=state.equipment.find(v=>v.id===eid)?.star??0;await persist(action(state,type,{equipmentId:eid,ids:(d.dataset.starMaterialIds||'').split(',').filter(Boolean)}));render();await openEquipmentStar(state,eid);$('#modal').dataset.bagPart=part;void playEquipmentEffect($('#modal'),(state.equipment.find(v=>v.id===eid)?.star??0)>before?'star_up':'exp_up','[data-source=zhuangbei_icon]').catch(console.error);toast(state.log[0]);return}
  if(type==='openEquipmentBag'){await openEquipmentBag(state,el.dataset.value,[],{part:Number($('#modal').dataset.bagPart??-1)});return}
  if(type==='equipmentBagFilter'){const d=$('#modal');await openEquipmentBag(state,d.dataset.bagMode,(d.dataset.selectedEquipmentIds||'').split(',').filter(Boolean),{part:Number(el.dataset.value)});return}
  if(type==='selectDecomposeEquipment'||type==='selectAllDecomposeEquipment'){const modal=$('#modal'),current=(modal.dataset.selectedEquipmentIds||'').split(',').filter(Boolean),visible=[...modal.querySelectorAll('.source-bag-equipment:not([hidden])')].map(e=>e.dataset.id),all=visible.length&&visible.every(id=>current.includes(id)),ids=type==='selectAllDecomposeEquipment'?(all?current.filter(id=>!visible.includes(id)):[...new Set([...current,...visible])]):current.includes(el.dataset.id)?current.filter(id=>id!==el.dataset.id):[...current,el.dataset.id];await openEquipmentBag(state,'decompose',ids,{part:Number(modal.dataset.bagPart??-1)});return}
  if(type==='confirmDecomposeEquipment'){await confirmEquipmentDecompose(state,($('#modal').dataset.selectedEquipmentIds||'').split(',').filter(Boolean),{part:Number($('#modal').dataset.bagPart??-1)});return}
  if(type==='cancelDecomposeEquipment'){await openEquipmentBag(state,'decompose',($('#modal').dataset.selectedEquipmentIds||'').split(',').filter(Boolean),{part:Number($('#modal').dataset.bagPart??-1)});return}
  if(type==='decomposeEquipment'){const part=Number($('#modal').dataset.bagPart??-1);await persist(action(state,type,{ids:($('#modal').dataset.selectedEquipmentIds||'').split(',').filter(Boolean)}));render();await openEquipmentBag(state,'decompose',[],{part});toast(state.log[0]);return}
  if(type==='wearBestEquipment'){const d=$('#modal'),formation=d.dataset.mode==='sourceFormation',slot=Number(d.dataset.formationSlot??0),dragonId=Number(d.dataset.dragonId);await persist(action(state,type,{id:dragonId}));render();if(formation)await openFormationDialog(state,slot);else await openEquipDialog(state,dragonId);for(const item of state.equipment.filter(v=>v.dragonid===dragonId))void playEquipmentEffect($('#modal'),'effect_dress_equip',`[data-action=openEquipInfo][data-id="${item.id}"]`).catch(console.error);toast(state.log[0]);return}
  if(type==='openEquip'){await openEquipDialog(state,Number.isSafeInteger(id)&&state.dragons.some(d=>d.id===id)?id:selected,{returnToDragon:false});return}
  if(type==='openEquipEnhance'){const part=Number($('#modal').dataset.bagPart??-1);await openEquipEnhanceDialog(state,el.dataset.id,{returnToBag:$('#modal').dataset.mode==='sourceEquipmentBag'});$('#modal').dataset.bagPart=part;return}
  if(type==='enhanceEquipment'){const part=Number($('#modal').dataset.bagPart??-1),returnToBag=$('#modal').dataset.returnToBag==='true';await persist(action(state,'enhanceEquipment',{equipmentId:el.dataset.id,count:Number(el.dataset.value)}));render();await openEquipEnhanceDialog(state,el.dataset.id,{returnToBag});$('#modal').dataset.bagPart=part;void playEquipmentEffect($('#modal'),'equip_strengthen','.source-equip-icon').catch(console.error);toast(state.log[0]);return}
  if(type==='openEquipInfo'){await openEquipInfoDialog(state,el.dataset.id,{dragonId:Number($('#modal').dataset.dragonId)||null});return}
  if(type==='equipChange'){await openEquipChangeDialog(state,Number($('#modal').dataset.dragonId),el.dataset.id);return}
  if(type==='equipSource'){await openEquipSourceDialog(state,Number($('#modal').dataset.equipPart)||0);return}
  if(type==='equipSelect'){const d=$('#modal');d.dataset.selectedEquipment=el.dataset.id;await openEquipDialog(state,Number(d.dataset.dragonId));return}
  if(type==='wearEquipSelected'){const d=$('#modal'),dragonId=Number(d.dataset.dragonId),equipmentId=d.dataset.selectedEquipment;if(!equipmentId){toast('请先在右侧选中一件未装备的装备。');return}const item=equipmentInstance(state,equipmentId);if(!item){toast('找不到这件装备。');return}const part=definitionPart(item);if(part!==Number(el.dataset.value)){toast(`这件装备属于${EQUIPMENT_SLOTS[part]??'未知'}部位，请点对应槽位。`);return}const next=action(state,'wearEquipment',{id:dragonId,equipmentId});await persist(next);render();delete d.dataset.selectedEquipment;await openEquipDialog(state,dragonId);toast(state.log[0]);return}
  if(type==='equipTab'){toast(el.dataset.value==='frag'?'装备碎片尚未接入，当前只有装备列表。':'当前已显示未装备的装备。');return}
  if(type==='unverifiedEquip'){toast('请先选择龙和可用装备。');return}
  if(type==='openRecharge'){await openRechargeDialog(state);return}
  if(type==='rechargeVip'){if(resourceReturnStack.length)resourceReturnStack.push(captureResourcePage());await openVipThresholds(state);return}
  if(type==='resourceShop'){await openResourceShop(state);return}
  if(type==='resourceShopGold'){await openResourceShop(state,{type:'g'});return}
  if(type==='resourceShopFood'){await openResourceShop(state,{type:'f'});return}
  if(type==='buyResource'){const offer=resourceShopRow(id);if(!offer){toast('这个商品尚未开放。');return}const kind=$('#modal')?.dataset.resourceKind||null,itemId=Number($('#modal')?.dataset.resourceItem)||null;if(state.gems<offer.priceGems){toast(`魔晶不足，还差 ${offer.priceGems-state.gems} 魔晶。`);resourceReturnStack.push(captureResourcePage());await openRechargeDialog(state);return}const next=action(state,'buyResource',{id});await persist(next);render();await openResourceShop(state,{type:kind,itemId});toast(state.log[0]);return}
  if(type==='openAdventure'){await openAdventureDialog(state);return}
  if(type==='openGemExplore'){await openGemExplore(state);return}
  if(type==='exploreGem'){const [mode,count]=el.dataset.value.split(':');await persist(action(state,type,{mode,count:Number(count)}));busy=true;try{render();await openGemExploreResult(state,state.gemInventory.slice(-Number(count)),mode,Number(count))}finally{busy=false}toast(state.log[0]);return}
  if(type==='openGems'||type==='gemTab'){await openGemDialog(state,el.dataset.value||'land');return}
  if(type==='gemInfo'){await openGemInfo(state,el.dataset.id,$('#modal').dataset.gemTab||'land');return}
  if(type==='gemUpgrade'){await openGemUpgrade(state,el.dataset.id,$('#modal').dataset.gemTab||'land');return}
  if(type==='gemFeedSelect'){el.classList.toggle('is-selected');return}
  if(['insertGem','removeGem','fuseGem','autoFuseGem'].includes(type)){const tab=$('#modal').dataset.gemTab||'land',materials=Array.from($('#modal').querySelectorAll('.gem-feed-list .is-selected')).map(v=>v.dataset.id);await persist(action(state,type,{gemId:el.dataset.id,tab,materials}));render();await openGemDialog(state,tab);toast(state.log[0]);return}
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
  if(type==='composeEquipmentFragments'){const part=Number($('#modal').dataset.bagPart??-1);await persist(action(state,type,{id}));render();await openEquipmentBag(state,'fragments',[],{part});toast(state.log[0]);return}
  if(type==='openWarehouse'){await openWarehouse(state);return}
  if(type==='raffleEggUse'){const next=action(state,'raffleEggHatch',{id});await persist(next);render();toast(state.log[0]);await openIncubator(state);return}
  if(type==='warehouseFilter'){await openWarehouse(state,el.dataset.value);return}
  if(type==='warehouseChooseDragon'){await chooseWarehouseDragon(state,id);return}
  if(type==='cancelExpansion'){expansionChoice=null;render();return}
  if(type==='chooseExpansion'||type==='chooseIsland'){
   const islandOffer=nextIslandOffer(state);if(type==='chooseIsland'&&!islandOffer?.ready)throw Error('请先扩建完已拥有的龙岛。');
   const currency=el.dataset.value??'g',landId=Number($('#modal').dataset.landId)||0;
   if(type==='chooseExpansion'&&landId){const next=action(state,'expandLand',{landId,currency});await persist(next);render();await openExpansionShop(state);toast(state.log[0]);return}
   expansionChoice={currency,island:type==='chooseIsland'?islandOffer.island:null};closeDialog();render();focusIsland(type==='chooseIsland'?islandOffer.island-1:(availableLands(state)[0]?.island??1)-1);document.querySelector('.scene').insertAdjacentHTML('beforeend',`<div class="placement-controls">${nativeButton('取消','cancelExpansion')}</div>`);toast('点击购买木牌，选择要扩建的地块。');return;
  }
  if(type==='selectExpansionLand'){
   if(!expansionChoice){await openExpansionShop(state,id);return}
   const pending=expansionChoice;if(pending.island&&id!==nextIslandOffer(state)?.landId)throw Error('请选择新龙岛的购买木牌。');const next=action(state,pending.island?'unlockIsland':'expandLand',pending.island?{island:pending.island}:{landId:id,currency:pending.currency});await persist(next);expansionChoice=null;render();toast(state.log[0]);if(state.missions?.notices.length)await openMissionReward(state);return;
  }
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
  if(type==='showTasks'){await persist(action(state,'activateMissions'));render();await openMissions(state);return}
  if(type==='missionToggle'){const details=JSON.parse($('#modal').dataset.missionDetails??'[]'),scroll=$('#modal .mission-source-list')?.scrollTop??0;await openMissions(state,details.includes(id)?details.filter(v=>v!==id):[...details,id]);$('#modal .mission-source-list').scrollTop=scroll;return}
  if(type==='dismissMission'){await persist(action(state,type,{id}));render();await openMissions(state);return}
  if(type==='missionGoto'){const g=missionById(id);if(!g)return;const k=g.kind;closeDialog();if(['SelectTime','CollectGroup'].includes(k))await openFarmDialog(state);else if(['BuildId','UpgradeId'].includes(k)){if(g.args[0].some(id=>habitatDefinition(id)))await openHabitatShop(state);else await openOriginalShopCategory(state,'buildings');}else if(['Breed','SpeedBreed'].includes(k))await openBreed(state);else if(['BuyDragon'].includes(k))await openOriginalShopCategory(state,'eggs');else if(['HatchEgg','SpeedHatchByElement'].includes(k))await openIncubator(state);else if(['LevelDragonUp','DragonAmount'].includes(k))await openCollectionDialog(state,collectionFilter);else if(k==='WinPVEBattle')await openAdventureDialog(state,g.args[0]);else if(k==='BuyResources')await openResourceShop(state,{type:id===165?'g':'f'});else if(['Expand','ExpandIsland','IslandComplete'].includes(k))await openExpansionShop(state);else toast(g.text[3]??g.text[0]);tick();return}
  if(type==='battlePlanned'){toast('战斗尚未开放。');return}
  if(type==='openHabitats'){await openShop(state);return}
  if(type==='openIncubator'){await openIncubator(state);appendFixedMove(2);tick();return}
  if(type==='openBreed'){await openBreed(state,{moveKind:'fixed',moveId:1});tick();return}
  if(type==='openOriginal'){await openCatalog(state);return}
  if(type==='catalogFilter'){await openCatalog(state,el.dataset.value);return}
  if(type==='catalogHelp'){toast('龙谱加成尚未接入，当前可查看龙种与获取途径。');return}
  if(type==='farm'){closeDialog();await openFarmDialog(state,Number.isFinite(id)?id:0);tick();return}
  if(type==='habitat'){await openHabitatInfo(state,id);tick();return}
  if(type==='selectDragon'){selected=id;await openDragonDialog(state,id);return}
  if(type==='save'){await persist(state);render();toast('牧场已保存。');return}
  if(type==='export'){if(await storage.export(state))toast('存档已导出。');return}
  if(type==='import'){const imported=await storage.import();if(!imported)return;if(imported.error)throw new Error(imported.error);const next=validate(imported);if(!confirm('将载入这份存档，并备份当前牧场。继续吗？'))return;await persist(next);closeDialog();selected=state.dragons[0]?.id;render();toast('存档已载入。');return}
  const priorMode=$('#modal').dataset.mode,priorHabitat=Number($('#modal').dataset.habitatId),moveDragon=Number($('#modal').dataset.dragonId);
  const lotteryMode=Number($('#modal').dataset.lotteryMode??1);const refreshWarehouse=priorMode==='nativeWarehouse'||priorMode==='nativeWarehousePlace';const warehouseGroup=$('#modal').dataset.warehouseGroup??'all';const pendingPrize=Number($('#modal').dataset.pendingPrize);const refreshLottery=!refreshWarehouse&&['lotteryDraw','lotteryClaimResources','lotteryPlace'].includes(type);const payload={id,islandId:activeIsland};if(['plantNative','plant','harvest','speedCrop','upgradeFarm','completeFarmUpgrade'].includes(type))payload.farmId=Number($('#modal').dataset.farmId??0);if(type==='unwearEquipment')payload.equipmentId=$('#modal').dataset.equipmentId;if(type==='wearEquipment')payload.equipmentId=el.dataset.value;if(type==='recharge')payload.tierId=id;if(type==='plantNative'){type='plant';payload.cropId=id}if(type==='buyHabitat'){type='build';payload.buildingId=id}if(type==='moveNative'){type=priorMode==='nativeWarehousePlace'?'lotteryPlace':'move';payload.id=priorMode==='nativeWarehousePlace'?pendingPrize:moveDragon;payload.habitatId=id}if(type==='hatchNative'){type='hatch';payload.habitatId=id}if(type==='lotteryDraw'){payload.mode=lotteryMode;payload.count=Number(el.dataset.value);const cost=lotteryCost(state.lottery,payload.mode,payload.count);if(cost.gems>0&&!confirm(`本次扣除 ${cost.tokens} 抽奖币及 ${cost.gems} 魔晶，继续吗？`))return}if(type==='lotteryPlace')payload.habitatId??=Number($('#lottery-habitat').value);if(type==='build')payload.buildingId??=Number(el.dataset.buildingId);if(type==='plant')payload.cropId??=Number(el.dataset.cropId??el.closest('.card')?.querySelector('[data-crop]')?.value??1);if(type==='breed'){payload.a=Number($('#modal').dataset.parentA);payload.b=Number($('#modal').dataset.parentB)}
  if(type==='hatch')payload.habitatId??=Number($('#hatch-target')?.value);
  if(type==='move')payload.habitatId??=Number($('#move-target')?.value);
  if(type==='sellIncubator'){const sp=SPECIES[state.incubator?.species],gold=dragonSellGold(state.incubator?.species);if(!confirm(`确定出售${sp?.name??'幼龙'}并获得 ${gold} 金币吗？`))return}
  if(type==='sellRaffleEgg'){const prize=[...state.raffle.pending,...(state.giftEggs??[])].find(p=>p.id===id),species=prize?speciesKey(prize.dragonId):null,sp=SPECIES[species];if(!prize||!confirm(`确定出售${sp?.name??'这枚'}龙蛋并获得 ${dragonSellGold(species)} 金币吗？`))return}
  if(type==='sellLotteryDragon'){const prize=state.lottery.pending.find(p=>p.id===id),species=prize?speciesKey(prize.itemId):null,sp=SPECIES[species];if(!prize||!confirm(`确定出售${sp?.name??'这只幼龙'}并获得 ${dragonSellGold(species)} 金币吗？`))return}
  if(type==='sellStructure'){const structure=state.structures.find(o=>o.id===id),info=structure&&structureInfo(structure);if(!info||!confirm(`确定出售${info.nameCN}吗？`))return}
  if(type==='buyStructure'){payload.itemId=id;payload.deferConstruction=true;}const returnToCollection=$('#modal').dataset.returnToCollection==='true';const refreshDragon=['feed','feedAll'].includes(type)&&$('#modal').dataset.mode==='sourceDragon'?Number($('#modal').dataset.dragonId):null;const refreshRecharge=type==='recharge';const refreshExpansion=type==='expandIsland';const equipDragon=(type==='unwearEquipment'||type==='wearEquipment')?(Number($('#modal').dataset.dragonId)||Number(el.dataset.id)||selected):null;const next=action(state,type,payload);await persist(next);if(['plant','harvest'].includes(type)&&$('#modal').dataset.mode==='farm')closeDialog();const refreshFarm=['speedCrop','upgradeFarm','completeFarmUpgrade'].includes(type)&&['farm','farmSourceInfo'].includes($('#modal').dataset.mode);render();if(refreshFarm){closeDialog();await openFarmDialog(state,payload.farmId);tick();}if(refreshDragon)await openDragonDialog(state,refreshDragon,{returnToCollection});if(refreshLottery)await openLotteryDialog(state,lotteryMode);if(refreshWarehouse)await openWarehouse(state,warehouseGroup);if(refreshExpansion)await openExpansionShop(state);if(refreshRecharge)await openRechargeDialog(state);if(equipDragon){await openEquipDialog(state,equipDragon);if(type==='wearEquipment')void playEquipmentEffect($('#modal'),'effect_dress_equip',`[data-action=openEquipInfo][data-id="${payload.equipmentId}"]`).catch(console.error);}if(type==='buyShopEgg'){if(guideActive(state)&&state.tutorial.step===9){await persist(action(state,'raffleEggHatch',{id:state.tutorial.refs.egg}));closeDialog();render();}else await openOriginalShopCategory(state,'eggs');}if(type==='build')beginObjectMove('habitat',state.habitats.at(-1).id);else if(type==='buyStructure')beginObjectMove('structure',state.structures.at(-1).id);else if(['collect','upgradeHabitat','completeHabitat'].includes(type)&&priorMode==='nativeHabitatInfo')await openHabitatInfo(state,priorHabitat);else if(['breed','takeEgg'].includes(type))await openBreed(state);else if(['incubate','speedIncubator'].includes(type))await openIncubator(state);else if(['hatch','sellIncubator'].includes(type))closeDialog();else if(type==='move')await openDragonDialog(state,payload.id);tick();toast(state.log[0]);if(state.missions?.notices.length&&!$('#modal').open&&!drag)await openMissionReward(state);
 }catch(error){guideSucceeded=false;toast(error.message);if($('#save-status'))$('#save-status').textContent=saveStatus}finally{if(guideSucceeded&&guideBefore===state.tutorial?.step&&tutorialNavAllowed(state,{event:type,id,value:el.dataset.value})){await persist(action(state,'tutorialNavigate',{event:type,id,value:el.dataset.value}));}if(guideActive(state)&&guideBefore!==state.tutorial.step&&[6,9,14,19,24,28,33,39,47].includes(state.tutorial.step)){closeDialog();moreExpanded=false;render();}void renderTutorial(state)}
});
document.addEventListener('change',e=>{if(e.target.id==='preview-stage'){openDragonPreview(Number(e.target.dataset.id),Number(e.target.value));return}if(e.target.id==='preview-clip'){$('#modal canvas').dataset.clip=e.target.value;return}});
document.addEventListener('keydown',async e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();if(state&&!busy)try{await persist(state);render();toast('牧场已保存。')}catch(error){toast(error.message)}}});
async function recoverTutorialView(){if(!guideActive(state))return;const n=state.tutorial.step,r=state.tutorial.refs;closeDialog();
 if([2,15,29].includes(n)){moreExpanded=true;render();}
 else if([3,16,30].includes(n))await openShop(state);
 else if(n===4)await openHabitatInfo(state,28,{purchase:true});
 else if(n===5)await openHabitatInfo(state,r.habitat);
 else if(n===7||[10,11,12,43,44,45].includes(n))await openIncubator(state);
 else if(n===8)await openOriginalShopCategory(state,'eggs');
 else if(n===9&&!state.incubator&&state.giftEggs.some(e=>e.id===r.egg)){await persist(action(state,'raffleEggHatch',{id:r.egg}));render();}
 else if([13,46].includes(n))await openHabitatShop(state,{hatch:true});
 else if([17,31].includes(n))await openOriginalShopCategory(state,'buildings');
 else if(n===18)beginObjectMove('structure',r.farm);
 else if(n===20)await showFarmOptions(state,r.farm);
 else if([21,23].includes(n))await openFarmDialog(state,r.farm);
 else if(n===25)await openHabitatInfo(state,r.habitat);
 else if([26,27].includes(n))await openDragonDialog(state,r.dragon);
 else if(n===32)await openStructureInfo(state,r.breed);
 else if(n===34)await openBreed({...state,tutorial:{...state.tutorial,step:33}});
 else if([35,36,37].includes(n)){await openBreed(state,{side:0,id:r.parentA??r.dragon});if(r.parentB)await openBreed(state,{side:1,id:r.parentB});}
 else if(n===38){const d=showSource('tutorialBreedConfirm',renderSourceLayout(await sourceLayout('panel_msg'),{values:{txt:'是否立即培育？','btn_QueDing/txt_name':'立即培育'},actions:{btn_close:{type:'cancelTutorialBreed',label:'取消'},'btn_QueDing/btn':{type:'confirmTutorialBreed',label:'立即培育'}}}));d.dataset.parentA=r.parentA;d.dataset.parentB=r.parentB;}
 else if([40,42].includes(n))await openBreed(state);
 else if(n===41)await openBreedSpeed(state);
 await renderTutorial(state);
}
async function tutorialClock(){if(!guideActive(state)||busy)return;const t=state.tutorial.step;
 if([5,32].includes(t)){const at=t===5?state.habitats.find(h=>h.id===state.tutorial.refs.habitat)?.job?.readyAt:state.structures.find(o=>o.id===state.tutorial.refs.breed)?.readyAt;if(at&&Date.now()>=at&&$('#modal').open&&$('#modal').querySelector('[data-action=openBuildingSpeed],[data-action=speedBuilding]')){if(t===5)await openHabitatInfo(state,state.tutorial.refs.habitat);else await openStructureInfo(state,state.tutorial.refs.breed);void renderTutorial(state);}return;}
 if(![10,11,22,40,41,43,44].includes(t))return;const next=action(state,'tutorialTick');if(next.tutorial.step!==t){await persist(next);if([12,45].includes(next.tutorial.step))await openIncubator(state);if(next.tutorial.step===42)await openBreed(state);void renderTutorial(state)}}
async function boot(){try{const loaded=await storage.load();location=loaded.location;state=loaded.state?validate(loaded.state):createTutorialGame();selected=state.dragons[0]?.id;if(!loaded.state)await persist(state);else saveStatus=loaded.recovered?'已从备份恢复':'存档已载入';render();await recoverTutorialView();void renderTutorial(state);if(loaded.recovered)toast('主存档损坏，已载入上一次有效备份。');setInterval(()=>{tick();void tutorialClock()},250)}catch(e){$('#app').innerHTML=`<div class="loading"><h1>${e.code==='PREVIEW_PROFILE'?'当前打开的是网页预览':'存档暂时无法载入'}</h1><p class="error">${escape(e.message)}</p><p>未覆盖任何现有存档。请保留存档文件后检查读写权限或备份。</p></div>`}}
let breedingVisible;setInterval(()=>{if(!state||busy||drag)return;const visible=state.breeding?.phase==='breeding'&&Date.now()<state.breeding.readyAt;if(breedingVisible!==undefined&&visible!==breedingVisible){if(tab==='ranch')render();if($('#modal').dataset.mode==='sourceDragon')void openDragonDialog(state,Number($('#modal').dataset.dragonId),{returnToCollection:$('#modal').dataset.returnToCollection==='true'});}breedingVisible=visible},500);
let resizeFrame;window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(state&&tab==='ranch')render();if($('#modal').classList.contains('native-ranch-dialog')||['sourceDragon','sourceCollection','sourceEvolution','sourceLottery','sourceLotteryOptions','sourceRaffle','sourceRafflePreview'].includes($('#modal').dataset.mode))$('#modal').style.setProperty('--source-scale',Math.min((innerWidth-20)/($('#modal').dataset.mode==='sourceFuwenHunt'?1435:1024),(innerHeight-20)/($('#modal').dataset.mode==='sourcePve'?576:$('#modal').dataset.mode==='sourceFuwenHunt'?769:['sourceRaffle','sourceRafflePreview'].includes($('#modal').dataset.mode)?770:768)))});});
await boot();

document.addEventListener('pointerdown',e=>{
 if(busy||e.button!==0||$('#modal').open)return;
 const el=e.target.closest('[data-place-id]');
 if(el&&drag){
  const id=Number(el.dataset.placeId),kind=el.dataset.placeKind;if(drag.id!==id||drag.kind!==kind)return;
  activeIsland=Number(el.closest('[data-island]').dataset.island);drag.el=el;drag.x=e.clientX;drag.y=e.clientY;drag.dragging=true;
  const wr=el.parentElement.getBoundingClientRect();drag.grab=[(e.clientX-wr.left)/wr.width*100-drag.position[0],(e.clientY-wr.top)/wr.height*100-drag.position[1]];el.setPointerCapture(e.pointerId);return;
 }
 // Existing buildings cannot be picked up by an ordinary press or map drag.
 if(!drag&&e.target.closest('.scene')&&!e.target.closest('.original-hud,.placement-controls,#building-options')&&(!e.target.closest('[data-action]')||e.target.closest('[data-action]')===el)){
  pan={x:e.clientX,y:e.clientY,startX:camera.x,startY:camera.y,moved:false};if(el)el.setPointerCapture(e.pointerId);else e.preventDefault();
 }
});
document.addEventListener('pointermove',e=>{if(pan){if(Math.hypot(e.clientX-pan.x,e.clientY-pan.y)<8&&!pan.moved)return;pan.moved=true;cancelBuildingClick();camera.x=pan.startX+e.clientX-pan.x;camera.y=pan.startY+e.clientY-pan.y;applyCamera();return}if(!drag?.dragging)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8&&!drag.moved)return;drag.moved=true;const r=drag.el.parentElement.getBoundingClientRect();drag.position=snapHabitatPosition([(e.clientX-r.left)/r.width*100-(drag.grab?.[0]??0),(e.clientY-r.top)/r.height*100-(drag.grab?.[1]??0)]);drag.valid=canPlaceObject(placeables(),drag.key,drag.info,drag.position,state.expansion.plots,state,activeIsland);drag.el.style.left=drag.position[0]+'%';drag.el.style.top=drag.position[1]+'%';drag.el.classList.add('is-moving');drag.el.querySelector('.placement-tiles')?.remove();drag.el.insertAdjacentHTML('afterbegin',placementTiles(drag.info,drag.valid));showMoveControls()});
document.addEventListener('pointerup',()=>{const panned=pan?.moved;pan=null;if(panned){suppressHabitatClick=true;setTimeout(()=>{suppressHabitatClick=false},500);return}if(!drag?.dragging)return;drag.dragging=false;suppressHabitatClick=true;setTimeout(()=>{suppressHabitatClick=false},500)});

document.addEventListener('pointercancel',()=>{pan=null;if(drag?.dragging){drag=null;if(state)render()}});

document.addEventListener('wheel',e=>{if(e.target.closest('.scene')&&!document.querySelector('#modal').open&&!e.target.closest('.original-hud,.placement-controls')){e.preventDefault();const r=document.querySelector('.scene').getBoundingClientRect();camera=zoomCameraAt(camera,e.deltaY,e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2);applyCamera();return}const h=e.target.closest('.source-collection-list,.lottery-pending,.native-shop-list,.native-resource-row');if(h&&h.scrollWidth>h.clientWidth&&Math.abs(e.deltaY)>Math.abs(e.deltaX)){h.scrollLeft+=e.deltaY;e.preventDefault();return}const v=e.target.closest('.native-resource-groups');if(v&&v.scrollHeight>v.clientHeight){v.scrollTop+=e.deltaY;e.preventDefault()}},{passive:false});

document.querySelector('#modal').addEventListener('cancel',e=>{e.preventDefault();if($('#modal').dataset.mode==='sourceRafflePreview')closeRafflePreview();else closeDialog()});

document.addEventListener('dblclick',e=>{const building=e.target.closest('[data-place-id]');if(building&&e.target.closest('[data-action]')===building){cancelBuildingClick();if(!busy&&!drag&&!$('#modal').open&&!guideActive(state)){e.preventDefault();beginObjectMove(building.dataset.placeKind,Number(building.dataset.placeId));}return}if(e.target.closest('.scene')&&!e.target.closest('[data-action],.original-hud,.placement-controls')&&!$('#modal').open&&!drag){camera={zoom:1,x:0,y:0};applyCamera();}});

document.addEventListener('input',e=>{if(e.target.id==='history-search'){const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.history-activity-card').forEach(el=>el.hidden=!(el.dataset.search??el.textContent).toLowerCase().includes(q));}});
