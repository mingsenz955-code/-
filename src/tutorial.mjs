import STEPS from '../assets/original/data/tutorial.mjs';
export {STEPS as TUTORIAL_STEPS};
export function createTutorial(){return {version:1,step:1,paused:false,done:false,refs:{}}}
export function validateTutorial(s){const t=s.tutorial;if(t===undefined)return;if(!t||t.version!==1||!Number.isInteger(t.step)||t.step<1||t.step>47||typeof t.paused!=='boolean'||typeof t.done!=='boolean'||t.sourceOpening!==undefined&&typeof t.sourceOpening!=='boolean'||!t.refs||Array.isArray(t.refs)||Object.values(t.refs).some(v=>!Number.isSafeInteger(v)||v<1))throw Error('新手引导记录无效。')}
export const guideActive=s=>s.tutorial&&!s.tutorial.done&&!s.tutorial.paused;
const NAV={1:['showMore'],2:['openHabitats'],3:['habitatShop'],6:['openIncubator'],7:['originalShopCategory'],9:['openIncubator'],10:['openIncubatorSpeedConfirm'],12:['chooseHatchHabitat'],14:['showMore'],15:['openHabitats'],16:['originalShopCategory'],19:['farm','selectFarm','structureInfo'],20:['farm'],24:['habitat'],25:['openDragon'],27:['close'],28:['showMore'],29:['openHabitats'],30:['originalShopCategory'],33:['openBreed','structureInfo'],34:['openBreed'],35:['chooseParent'],36:['chooseParent'],37:['openTutorialBreedConfirm'],39:['openBreed','structureInfo'],40:['openBreedSpeed'],43:['openIncubatorSpeedConfirm'],45:['chooseHatchHabitat']};
export function tutorialNavAllowed(s,p){const t=s.tutorial;if(!guideActive(s)||!NAV[t.step]?.includes(p.event))return false;
 if([7,16,30].includes(t.step)&&p.value!==(t.step===7?'eggs':'buildings'))return false;
 if(t.step===35&&Number(p.value)!==0||t.step===36&&Number(p.value)!==1)return false;
 if(t.step===19&&p.id!==t.refs.farm)return false;
 if(t.step===24&&p.id!==t.refs.habitat||t.step===25&&p.id!==t.refs.dragon)return false;
 if([35,36].includes(t.step)){const dragon=s.dragons.find(d=>d.id===p.id);if(dragon?.species!==(t.step===35?'ember':'original1011')||dragon.level<4)return false}
 return true;
}
export function updateTutorial(s,old,type,p,now){
 if(!guideActive(old)||!s.tutorial)return;const t=s.tutorial,step=old.tutorial.step;
 if(type==='tutorialNavigate'){if(!tutorialNavAllowed(old,p))return;if(step===35)t.refs.parentA=p.id;if(step===36)t.refs.parentB=p.id;t.step++;return}
 if(step===4&&type==='build'&&p.buildingId===28){t.refs.habitat=s.habitats.at(-1).id;t.step=5}
 if(step===5&&((type==='completeHabitat'&&p.id===t.refs.habitat)||(type==='speedBuilding'&&p.kind==='habitat'&&p.id===t.refs.habitat&&!s.habitats.find(h=>h.id===p.id)?.job)))t.step=6;
 if(step===8&&type==='buyShopEgg'&&p.id===1020){t.refs.egg=s.giftEggs.at(-1).id;t.step=9}
 if(step===11&&type==='speedIncubator'||step===44&&type==='speedIncubator')t.step++;
 if(step===13&&type==='hatch'&&p.habitatId===t.refs.habitat){t.refs.dragon=s.dragons.at(-1).id;t.step=14}
 if(step===17&&type==='buyStructure'&&p.itemId===16){t.refs.farm=s.structures.at(-1).id;t.step=18}
 if(step===18&&type==='placeStructure'&&p.id===t.refs.farm)t.step=19;
 if(step===21&&type==='plant'&&p.cropId===1&&p.farmId===t.refs.farm)t.step=22;
 if(step===22&&type==='tutorialTick'&&s.structures.find(o=>o.id===t.refs.farm)?.farm?.readyAt<=now)t.step=23;
 if(step===23&&type==='harvest'&&p.farmId===t.refs.farm)t.step=24;
 if(step===26&&['feed','feedAll'].includes(type)&&p.id===t.refs.dragon&&s.dragons.find(d=>d.id===p.id)?.level>=4)t.step=27;
 if(step===31&&type==='buyStructure'&&p.itemId===19){t.refs.breed=s.structures.at(-1).id;t.step=32}
 if(step===32&&((type==='completeStructure'&&p.id===t.refs.breed)||(type==='speedBuilding'&&p.kind==='structure'&&p.id===t.refs.breed&&!s.structures.find(o=>o.id===p.id)?.readyAt)))t.step=33;
 if(step===38&&type==='breed'&&[p.a,p.b].includes(t.refs.dragon)&&[p.a,p.b].includes(2))t.step=39;
 if(step===41&&type==='speedBreed')t.step=42;
 if(step===42&&type==='incubate')t.step=43;
 if(step===46&&type==='hatch'&&old.incubator?.species==='original1012')t.step=47;
 // Waiting naturally is valid; do not force players to spend gems to continue.
 if(type==='tutorialTick'&&[10,11,43,44].includes(step)&&s.incubator&&s.incubator.readyAt<=now)t.step=step<20?12:45;
 if(type==='tutorialTick'&&[40,41].includes(step)&&s.breeding?.readyAt<=now)t.step=42;
}
