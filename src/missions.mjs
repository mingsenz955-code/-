import {currentIsland,islandOwnership,LANDS_IN_ISLAND} from './expansion.mjs';
import SOURCE from '../assets/original/data/missions.mjs';
import {SPECIES} from './data.mjs';
export const MISSIONS=SOURCE.goals;
export const missionById=id=>MISSIONS.find(g=>g.id===Number(id));
export const createMissions=()=>({version:1,progress:{},done:[],linked:[],notices:[]});
export const missionTarget=g=>['Expand','DragonAmount'].includes(g.kind)?g.args[0]:g.kind==='SelectTime'?g.args[2]:g.kind==='LevelDragonUp'?g.args[2]:['WinPVEBattle','ExpandIsland','IslandComplete'].includes(g.kind)?1:g.args[1];
export const activeMissions=s=>s.missions?MISSIONS.filter(g=>!s.missions.done.includes(g.id)&&!s.missions.linked.includes(g.id)).slice(0,SOURCE.activeLimit):[];
export function validateMissions(s){const m=s.missions;if(m===undefined)return;if(!m||m.version!==1||!m.progress||Array.isArray(m.progress))throw Error('任务存档无效。');for(const k of ['done','linked','notices'])if(!Array.isArray(m[k])||new Set(m[k]).size!==m[k].length||m[k].some(id=>!missionById(id)))throw Error('任务完成记录无效。');if(m.linked.some(id=>m.done.includes(id))||m.notices.some(id=>!m.done.includes(id)))throw Error('任务奖励记录无效。');for(const [id,n] of Object.entries(m.progress))if(!missionById(id)||!Number.isSafeInteger(n)||n<0||n>missionTarget(missionById(id)))throw Error('任务进度无效。');}
export function missionRewards(g){const r=g.reward,out=[];for(const i of [0,2])if(['g','f','c','x'].includes(r[i])&&r[i+1]>0)out.push({type:{g:1,f:2,c:3,x:0}[r[i]],itemId:-1,amount:r[i+1]});if(r[4]===1&&r[7]>0)out.push({type:r[5],itemId:r[6],amount:r[7]});return out;}
const dragonId=d=>SPECIES[d?.species]?.originalId;
const buildings=s=>[...(!s.tutorial?.sourceOpening?[19,s.farmBuildingId??16]:[]),1,...s.habitats.filter(h=>!h.job).map(h=>h.buildingId??24),...s.structures.filter(o=>!o.readyAt).map(o=>o.itemId)];
const nodeId=mission=>(Math.floor(mission/1000)+900)*100+mission%1000;
function snapshot(s,g){const a=g.args,b=buildings(s);switch(g.kind){
 case 'BuildId':return b.filter(id=>a[0].includes(id)).length;
 case 'UpgradeId':return b.filter(id=>a[0].map(v=>SOURCE.upgrades[v]).includes(id)).length;
 case 'LevelDragonUp':return s.dragons.filter(d=>d.level>=a[1]&&(!a[0].length||a[0].includes(dragonId(d)))).length;
 case 'DragonAmount':return s.dragons.length;
 case 'BuyDragon':return s.dragons.filter(d=>a[0].includes(dragonId(d))).length;
 case 'WinPVEBattle':return s.adventure.cleared[nodeId(a[1])]?1:0;
 case 'Expand':return LANDS_IN_ISLAND.every((_,i)=>islandOwnership(s,i+1)==='full')?missionTarget(g):null;
 case 'ExpandIsland':return currentIsland(s)>=a[0]?1:0;
 case 'IslandComplete':return islandOwnership(s,a[0])==='full'?1:0;
 case 'SpeedClear':return a[0].every(id=>!b.includes(id))?missionTarget(g):null;
 case 'CollectId':return a[0].every(id=>SOURCE.obstacleIds.includes(id)&&!b.includes(id))?missionTarget(g):null;
 default:return null;
}}
function eventStep(s,old,g,type,p){const a=g.args;
 if(g.kind==='SelectTime')return type==='plant'&&(p.cropId??1)===a[3]?1:0;
 if(g.kind==='CollectGroup')return type==='harvest'&&a[0]==='FARM'?1:0;
 if(g.kind==='BuyDragon')return type==='buyShopEgg'&&a[0].includes(p.id)?1:0;
 if(g.kind==='BuyResources')return type==='buyResource'&&a[0].includes(p.id)?1:0;
 if(g.kind==='Expand')return ['expandIsland','expandLand'].includes(type)?1:0;
 if(g.kind==='Breed'){const ids=[p.a,p.b].map(id=>dragonId(old.dragons.find(d=>d.id===id)));return type==='breed'&&ids.every(id=>a[0].includes(id))?1:0;}
 if(g.kind==='SpeedBreed'){const ids=(old.breeding?.parents??[]).map(id=>dragonId(old.dragons.find(d=>d.id===id)));return type==='speedBreed'&&ids.length===2&&ids.every(id=>a[0].includes(id))?1:0;}
 if(g.kind==='HatchEgg'){if(type!=='hatch'||(a[2]??[]).some(id=>!s.missions.done.includes(id)&&!s.missions.linked.includes(id)))return 0;return a[0].includes(dragonId(old.incubator))?1:0;}
 if(g.kind==='SpeedHatchByElement'){if(type!=='speedIncubator'||(a[3]??[]).some(id=>!s.missions.done.includes(id)&&!s.missions.linked.includes(id)))return 0;const elements=a[2]===false?a[0]:[...new Set(a[0].flatMap(id=>Object.values(SPECIES).find(d=>d.originalId===id)?.attributes??[]))];return (SPECIES[old.incubator?.species]?.attributes??['?']).every(v=>elements.includes(v))?1:0;}
 return 0;
}
// The existing offline ranch predates the original tutorial. Opening Tasks opts
// that save into the original post-tutorial list; historical event counts are not invented.
export function updateMissions(s,old,type,p,{awardXp,deliver}){
 if(!s.missions)return;
 const active=new Set(activeMissions(old).map(g=>g.id));
 for(let pass=0;pass<MISSIONS.length;pass++){
  let changed=false;
  for(const g of activeMissions(s)){
   const n=snapshot(s,g),current=s.missions.progress[g.id]??0,target=missionTarget(g);
   const next=Math.min(target,n===null?current+(pass===0&&active.has(g.id)?eventStep(s,old,g,type,p):0):Math.max(n,current));
   s.missions.progress[g.id]=next;
   if(next<target)continue;
   const rewards=missionRewards(g);for(const r of rewards)if(r.type===0)awardXp(r.amount);else deliver([r]);
   s.missions.done.push(g.id);s.missions.notices.push(g.id);
   for(const id of g.linked)if(missionById(id)&&!s.missions.done.includes(id)&&!s.missions.linked.includes(id))s.missions.linked.push(id);
   changed=true;
  }
  if(!changed)break;
 }
}
