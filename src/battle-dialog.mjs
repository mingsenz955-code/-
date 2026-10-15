import {BATTLE_VIEWPORT,projectilePoints} from './battle-presentation.mjs';
import {waitForSourceMotion} from './source-motion.mjs';
import {playSourceProjectile,playSourceHit} from './battle-effects.mjs';
import {sourceAnimate} from './acquisition-animation.mjs';
import {battlePositions} from './battle-positions.mjs';
import {formationPosition,formationDefinition} from './formation.mjs';
import {runeSkill,runeOfDragon,runeDefinition} from './runes.mjs';
import SKILL_ART from '../assets/original/data/battle-skill-art.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource} from './ranch-dialogs.mjs';
import {dragonArt} from './art.mjs';
import {SPECIES} from './data.mjs';
import MODELS from '../assets/original/models/index.mjs';
import {BATTLE_SLOTS,BATTLE_ROUND_LIMIT,dragonAttributes,lineupPower,configuredLineup,battleRequirement,battleEnemyGroup} from './battle.mjs';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let activeRun=0;
// BattleUI normalizes appearance level to at least 7 before getDragonGraphic.
// The younger ranch models intentionally contain no combat tracks.
function fighter(item,side,index,positions){const p=positions[index],art=dragonArt(item.species,'',Math.max(7,item.level??7)).replace('data-clip="breath"',`data-clip="breathinbattle" data-battle-scale="${p.scale}" data-native-size="true"`);return `<div class="battle-fighter ${side}" data-unit="${side}${index}" data-position="${p.type}" style="left:${p.x}px;top:${p.y}px;z-index:${Math.round(p.y)}"><div class="battle-model">${art}</div><span class="battle-unit-hp"><img class="hp-background" src="assets/original/ui/ui_battle_hp_diban.png" alt=""><img class="hp-delay" src="assets/original/ui/ui_battle_hp_delay.png" alt=""><img class="hp-current" src="assets/original/ui/ui_battle_hp_${side==='enemy'?'defender':'attacker'}.png" alt=""></span></div>`}
export async function openBattleDialog(state,{nodeId=null,enemyGroup=null}={}){
 const layout=await sourceLayout('ui_battlenormal');
 const lineup=configuredLineup(state),enemies=enemyGroup??battleEnemyGroup(nodeId)?.monsters??[],values={},slots={},hidden=new Set();
 for(let index=1;index<=BATTLE_SLOTS;index++)for(const side of ['left','right']){
  const item=(side==='left'?lineup:enemies)[index-1],key=`${side}${index}`,team=side==='left'?'ally':'enemy';
  values[`${key}/lv`]=item?`Lv.${item.level}`:'';
  if(!item){hidden.add(key);continue}
  slots[`${key}/hp`]=`<img data-source="${key}/hp" class="battle-top-hp" src="assets/original/ui/ui_battle_xuetiao2.png" alt="">`;
  const sp=SPECIES[item.species];
  slots[`${key}/icon`]=`<div class="source-battle-portrait" data-portrait="${team}${index-1}"><img class="battle-portrait-art" src="${`assets/original/ui/ui_bookdragon_${sp.original}_1.png`}" alt="${sp.name}"><img class="battle-portrait-border" src="assets/original/ui/ui_battle_txk60_${Math.min(5,sp.quality??1)}.png" alt=""><img class="battle-dead-mark" src="assets/original/ui/ui_battle_zhenwang.png" alt="阵亡"></div>`;
 }
 values['round/num']=`1/${BATTLE_ROUND_LIMIT}`;values['skip/miaoshu']='退出';
 values.power_left=String(lineupPower(lineup,state));values.power_right=String(battleRequirement(nodeId)??'');
 const allyPositions=battlePositions(lineup),enemyPositions=battlePositions(enemies,'enemy');
 const stage=`<div class="battle-stage" aria-label="自动战斗"><div class="battle-bg-fx-layer"></div>${lineup.map((d,i)=>fighter(d,'ally',i,allyPositions)).join('')}${enemies.filter(d=>d.species).map((d,i)=>fighter(d,'enemy',i,enemyPositions)).join('')}<div class="battle-fx-layer"></div></div>`;
 const d=showSource('sourceBattle',renderSourceLayout(layout,{values,slots,hidden,actions:{'skip/btn':{type:'close',label:'退出战斗'}}})+stage,'source-battle-dialog native-fullscreen');
 d.style.setProperty('--source-scale',Math.min((innerWidth-20)/1024,(innerHeight-20)/BATTLE_VIEWPORT.height));
 d.querySelector('.battle-stage').addEventListener('dragon-clip-complete',e=>{const fighter=e.target.closest('.battle-fighter');if(!fighter)return;if(['airattack','landattack','magic'].includes(e.detail.clip))fighter.classList.remove('is-attacking');if(e.detail.clip==='hurt')fighter.classList.remove('is-hit');});d.dataset.battleNode=String(nodeId);d.dataset.battleRun=String(++activeRun);
 return d;
}
function clip(el,name){const c=el.querySelector('canvas[data-model]');if(c){const clips=MODELS[c.dataset.model]?.clips??[];c.dataset.clip=clips.includes(name)?name:clips.includes('breathinbattle')?'breathinbattle':'breath';delete c.dataset.afterNextClip;if(['airattack','landattack','magic','hurt','movein'].includes(name)){const idle=clips.includes('breathinbattle')?'breathinbattle':'breath',end=name+'end';c.dataset.nextClip=clips.includes(end)?end:idle;if(clips.includes(end))c.dataset.afterNextClip=idle;}else delete c.dataset.nextClip;c.dataset.replay=String((+c.dataset.replay||0)+1)}}
function motion(el,name,live){
 const canvas=el.querySelector('canvas[data-model]');if(!canvas||!MODELS[canvas.dataset.model]?.clips.includes(name)){clip(el,name);return Promise.resolve(live())}
 const done=waitForSourceMotion(canvas,name,live);clip(el,name);return done;
}
function healthBar(unit,hp){
 const bar=unit.el.querySelector('.battle-unit-hp'),front=bar.querySelector('.hp-current'),delay=bar.querySelector('.hp-delay'),before=Number(bar.dataset.hp??100);bar.dataset.hp=hp;
 front.style.scale=hp/100+' 1';for(const a of delay.getAnimations())a.cancel();
 const cancelled=error=>{if(error.name!=='AbortError')console.error(error)};
 void sourceAnimate(delay,[{scale:`${before/100} 1`},{scale:`${hp/100} 1`}],{duration:300}).then(()=>{delay.style.scale=hp/100+' 1'}).catch(cancelled);
 for(const a of bar.getAnimations())a.cancel();bar.style.opacity='1';void sourceAnimate(bar,[{opacity:1},{opacity:0}],{delay:500,duration:500}).then(()=>{bar.style.opacity='0'}).catch(cancelled);
}
async function skillName(layer,skill,common,legend){
 if(!common?.nameImage)return;
 const name=document.createElement('div');name.className='battle-skill-name';name.innerHTML=(legend?'<img class="battle-legend-skill" src="assets/original/ui/skill_shensheng_bg.png" alt="">':'')+`<img src="assets/original/ui/${common.nameImage}" alt="${skill.name}">`;layer.append(name);
 try{await sourceAnimate(name,[{opacity:0,scale:.1,offset:0},{opacity:0,scale:.1,offset:.1},{opacity:1,scale:1.5,offset:.2},{opacity:1,scale:1,offset:.5},{opacity:1,scale:1,offset:.7},{opacity:0,scale:1,offset:1}],{duration:1000})}finally{name.remove()}
}
let glyphs;
async function damageNumber(layer,value,x,y){glyphs??=await fetch('assets/original/fonts/red_50.json').then(r=>r.json());const number=document.createElement('span');number.className='battle-damage';number.style.cssText=`left:${x}px;top:${y}px`;number.setAttribute('aria-label',String(value));for(const char of String(value)){const g=glyphs[char];if(!g)continue;const digit=document.createElement('i');digit.style.cssText=`width:${g.width}px;height:${g.height}px;background-position:-${g.x}px -${g.y}px;margin-right:${g.xadvance-g.width}px`;number.append(digit)}layer.append(number);setTimeout(()=>number.remove(),1000)}
// Source assets are preserved. Targeting and damage remain offline presentation
// of the existing balance result until authoritative server combat data is available.
export async function playBattleAnimation(state,nodeId,result){
 const d=document.querySelector('#modal'),run=d.dataset.battleRun,layer=d.querySelector('.battle-fx-layer');
 const live=()=>d.open&&d.dataset.mode==='sourceBattle'&&d.dataset.battleRun===run;
 const make=(item,side,index)=>({item,side,index,el:d.querySelector(`[data-unit="${side}${index}"]`),stats:side==='ally'?dragonAttributes(item,state):{attack:item.attack,defend:item.defend,life:item.life},hp:100});
 const allies=configuredLineup(state).map((v,i)=>make(v,'ally',i)),enemies=(result.enemyGroup??battleEnemyGroup(nodeId)?.monsters??[]).filter(v=>v.species).map((v,i)=>make(v,'enemy',i));
 const allyPositions=battlePositions(allies.map(v=>v.item)),enemyPositions=battlePositions(enemies.map(v=>v.item),'enemy');
 const winners=result.won?allies:enemies,losers=result.won?enemies:allies;
 const deaths=[];
 const setHp=(u,hp)=>{
  u.hp=hp;healthBar(u,hp);const key=`${u.side==='ally'?'left':'right'}${u.index+1}/hp`,bar=d.querySelector(`[data-source="${key}"]`);if(bar)bar.style.clipPath=`inset(0 ${100-hp}% 0 0)`;
  if(hp<=0){u.el.classList.add('is-dead');d.querySelector(`[data-portrait="${u.side}${u.index}"]`)?.classList.add('is-dead');deaths.push(motion(u.el,'dead',live).then(async complete=>{if(complete){await wait(100);u.el.hidden=true;u.el.dataset.deathComplete='true'}}))}
 };
 if(!(await Promise.all([...allies,...enemies].map(u=>motion(u.el,'movein',live)))).every(Boolean))return false;
 await wait(100);if(!live())return false;
 for(let turn=0;turn<losers.length*2&&live();turn++){
  const finishing=turn%2===1,target=finishing?losers[Math.floor(turn/2)]:winners[turn%winners.length],attacker=finishing?winners[turn%winners.length]:losers[Math.floor(turn/2)];
  const round=d.querySelector('[data-source="round/num"]');if(round)round.textContent=`${Math.floor(turn/6)+1}/${BATTLE_ROUND_LIMIT}`;
  const {x,y:ay}=(attacker.side==='ally'?allyPositions:enemyPositions)[attacker.index],{x:targetX,y:ty}=(target.side==='ally'?allyPositions:enemyPositions)[target.index];
  const magic=turn%3===2,slot=magic?2:1,rune=attacker.side==='ally'?runeOfDragon(state,attacker.item.id,slot):null,skill=runeSkill(attacker.item,runeDefinition(rune?.type),slot),common=SKILL_ART[skill?.kind],key=common?common.fireEff:`${magic?'magic':'attack'}_${SPECIES[attacker.item.species].originalId}`;
  if(magic)void skillName(layer,skill,common,formationDefinition(attacker.item)?.isLegend===1);
  const attackMotion=magic?'magic':formationPosition(target.item)===1?'airattack':'landattack';
  if(!await motion(attacker.el,attackMotion,live))return false;
  const points=projectilePoints(attacker.item,{x,y:ay},target.item,{x:targetX,y:ty},attacker.side);
  if(!await playSourceProjectile(layer,key,common?.type??3,points.from,points.to,live))return false;
  const hitKey=common?.hitEff||key,offset=formationDefinition(target.item)?.offsetY??0,direction=target.side==='ally'?-1:1;
  const hitPoint={x:targetX,y:ty-offset};
  const foreground=playSourceHit(layer,hitKey,'bomb2',hitPoint,live,{direction});
  void playSourceHit(d.querySelector('.battle-bg-fx-layer'),hitKey,'bomb3',hitPoint,live,{direction,depth:-1});
  const hurt=finishing?Promise.resolve(true):motion(target.el,'hurt',live);
  const damage=finishing?Math.max(1,Math.floor((target.stats?.life??1)*target.hp/100)):Math.max(1,Math.floor((attacker.stats?.attack??1)*.4));
  await damageNumber(layer,damage,targetX,ty-75);setHp(target,finishing?0:Math.max(30,target.hp-10));
  const results=await Promise.all([foreground,target.hp>0?hurt:Promise.resolve(true)]);if(!results.every(Boolean))return false;
 }
 await Promise.all(deaths);await wait(1000);return live();
}

// Offline world-boss encounter: recorded partial damage, never fake a defeated boss.
export async function playBossAnimation(state,plan){
 const d=document.querySelector('#modal'),run=d.dataset.battleRun,layer=d.querySelector('.battle-fx-layer'),target=d.querySelector('[data-unit="enemy0"]'),team=configuredLineup(state),positions=battlePositions(team),targetPos=battlePositions([plan.enemy],'enemy')[0];let hp=plan.startHp;
 const live=()=>d.open&&d.dataset.battleRun===run&&d.dataset.mode==='sourceBattle';
 if(!(await Promise.all([...d.querySelectorAll('.battle-fighter')].map(el=>motion(el,'movein',live)))).every(Boolean))return false;
 await wait(100);
 for(const hit of plan.hits){if(!live())return false;const actor=d.querySelector(`[data-unit="ally${hit.index}"]`);const r=d.querySelector('[data-source="round/num"]');if(r)r.textContent=`${hit.round}/30`;if(!await motion(actor,'magic',live))return false;const fx=playSourceHit(layer,'magic_'+SPECIES[team[hit.index].species].originalId,'bomb2',{x:targetPos.x,y:targetPos.y-45},live),hurt=motion(target,'hurt',live);await damageNumber(layer,hit.damage,targetPos.x,targetPos.y-75);hp-=hit.damage;const percent=Math.max(0,hp/plan.enemy.life*100);healthBar({el:target},percent);const bar=d.querySelector('[data-source="right1/hp"]');if(bar)bar.style.clipPath=`inset(0 ${100-percent}% 0 0)`;if(!(await Promise.all([fx,hurt])).every(Boolean))return false;}
 if(live()&&plan.won){target.classList.add('is-dead');if(!await motion(target,'dead',live))return false;await wait(100);target.hidden=true}await wait(500);return live();
}
