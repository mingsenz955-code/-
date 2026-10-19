import {gameAudio} from './audio.mjs';
import {installBattleControls,runBattlePlayback,battleWait,battleSpeed} from './battle-playback.mjs';
import {BATTLE_VIEWPORT,projectilePoints} from './battle-presentation.mjs';
import {waitForSourceMotion} from './source-motion.mjs';
import {playSourceProjectile,playSourceHit} from './battle-effects.mjs';
import {sourceAnimate} from './acquisition-animation.mjs';
import {battlePositions} from './battle-positions.mjs';
import {simulateCombat} from './combat.mjs';
import {formationPosition,formationDefinition} from './formation.mjs';
import {runeSkill,runeOfDragon,runeDefinition,sourceCombatSkill,activeCombatSkill,sourceSkill} from './runes.mjs';
import SKILL_ART from '../assets/original/data/battle-skill-art.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {dragonArt} from './art.mjs';
import {SPECIES} from './data.mjs';
import MODELS from '../assets/original/models/index.mjs';
import {BATTLE_SLOTS,BATTLE_ROUND_LIMIT,dragonAttributes,lineupPower,configuredLineup,battleRequirement,battleEnemyGroup} from './battle.mjs';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let activeRun=0;
// BattleUI normalizes appearance level to at least 7 before getDragonGraphic.
// The younger ranch models intentionally contain no combat tracks.
function fighter(item,side,index,positions){const p=positions[index],art=dragonArt(item.species,'',Math.max(7,item.level??7),item.wake?.star??0).replace('data-clip="breath"',`data-clip="breathinbattle" data-battle-scale="${p.scale}" data-native-size="true"`);return `<div class="battle-fighter ${side}" data-unit="${side}${index}" data-position="${p.type}" style="left:${p.x}px;top:${p.y}px;z-index:${Math.round(p.y)}"><div class="battle-model">${art}</div><span class="battle-unit-hp"><img class="hp-background" src="assets/original/ui/ui_battle_hp_diban.png" alt=""><img class="hp-delay" src="assets/original/ui/ui_battle_hp_delay.png" alt=""><img class="hp-current" src="assets/original/ui/ui_battle_hp_${side==='enemy'?'defender':'attacker'}.png" alt=""></span></div>`}
export async function openBattleDialog(state,{nodeId=null,enemyGroup=null,layoutName='ui_battlenormal',allyPower=null,enemyPower=null}={}){
 const layout=await sourceLayout(layoutName);
 const lineup=configuredLineup(state),enemies=enemyGroup??battleEnemyGroup(nodeId)?.monsters??[],values={},slots={},hidden=new Set();
 for(let index=1;index<=BATTLE_SLOTS;index++)for(const side of ['left','right']){
  const item=(side==='left'?lineup:enemies)[index-1],key=`${side}${index}`,team=side==='left'?'ally':'enemy';
  values[`${key}/lv`]=item?`Lv.${item.level}`:'';
  if(!item){hidden.add(key);continue}
  slots[`${key}/hp`]=`<img data-source="${key}/hp" class="battle-top-hp" src="assets/original/ui/ui_battle_xuetiao2.png" alt="">`;
  const sp=SPECIES[item.species];
  slots[`${key}/icon`]=`<div class="source-battle-portrait" data-portrait="${team}${index-1}"><img class="battle-portrait-art" src="${`assets/original/ui/ui_bookdragon_${sp.original}_1.png`}" alt="${sp.name}"><img class="battle-portrait-border" src="assets/original/ui/ui_battle_txk60_${Math.min(5,sp.quality??1)}.png" alt=""><img class="battle-dead-mark" src="assets/original/ui/ui_battle_zhenwang.png" alt="阵亡"></div>`;
 }
 values['round/num']=`1/${BATTLE_ROUND_LIMIT}`;values['skip/miaoshu']='跳过';
 values.power_left=String(allyPower??lineupPower(lineup,state));values.power_right=String(enemyPower??(enemyGroup?Math.floor(enemies.reduce((n,e)=>n+e.attack+e.defend+e.life/3+(e.crit??0)+(e.uncrit??0),0)):battleRequirement(nodeId)??''));
 const allyPositions=battlePositions(lineup),enemyPositions=battlePositions(enemies,'enemy');
 const stage=`<div class="battle-stage" aria-label="自动战斗"><div class="battle-bg-fx-layer"></div>${lineup.map((d,i)=>fighter(d,'ally',i,allyPositions)).join('')}${enemies.filter(d=>d.species).map((d,i)=>fighter(d,'enemy',i,enemyPositions)).join('')}<div class="battle-fx-layer"></div></div>`;
 const d=showSource('sourceBattle',renderSourceLayout(layout,{values,slots,hidden,actions:{'skip/btn':{type:'battleSkip',label:'跳过战斗并查看计算结果'}}})+stage,'source-battle-dialog native-fullscreen');
 d.style.setProperty('--source-scale',Math.min((innerWidth-20)/1024,(innerHeight-20)/BATTLE_VIEWPORT.height));
 d.querySelector('.battle-stage').addEventListener('dragon-clip-complete',e=>{const fighter=e.target.closest('.battle-fighter');if(!fighter)return;if(['airattack','landattack','magic'].includes(e.detail.clip))fighter.classList.remove('is-attacking');if(e.detail.clip==='hurt')fighter.classList.remove('is-hit');});d.dataset.battleNode=String(nodeId);d.dataset.battleRun=String(++activeRun);
 d.dataset.battleMusic=layoutName==='ui_battleblood'?'advance':'normal';installBattleControls(d);return d;
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
 if(!skill)return;
 const name=document.createElement('div');name.className='battle-skill-name';name.dataset.skillName=skill.name??'普通攻击';name.innerHTML=(legend?'<img class="battle-legend-skill" src="assets/original/ui/skill_shensheng_bg.png" alt="">':'')+(common?.nameImage?`<img src="assets/original/ui/${common.nameImage}" alt="${esc(skill.name??'技能')}">`:`<span class="battle-skill-text">${esc(skill.name??'普通攻击')}</span>`);layer.append(name);const img=name.querySelector('img:not(.battle-legend-skill)');if(img)img.addEventListener('error',()=>{const label=document.createElement('span');label.className='battle-skill-text';label.textContent=skill.name??'普通攻击';img.replaceWith(label);},{once:true});
 try{await sourceAnimate(name,[{opacity:0,scale:.1,offset:0},{opacity:0,scale:.1,offset:.1},{opacity:1,scale:1.5,offset:.2},{opacity:1,scale:1,offset:.5},{opacity:1,scale:1,offset:.7},{opacity:0,scale:1,offset:1}],{duration:1000})}finally{name.remove()}
}
let glyphs;
async function damageNumber(layer,value,x,y){glyphs??=await fetch('assets/original/fonts/red_50.json').then(r=>r.json());const number=document.createElement('span');number.className='battle-damage';number.style.cssText=`left:${x}px;top:${y}px`;number.setAttribute('aria-label',String(value));for(const char of String(value)){const g=glyphs[char];if(!g)continue;const digit=document.createElement('i');digit.style.cssText=`width:${g.width}px;height:${g.height}px;background-position:-${g.x}px -${g.y}px;margin-right:${g.xadvance-g.width}px`;number.append(digit)}layer.append(number);void battleWait(layer,1000).then(()=>number.remove());for(const a of number.getAnimations())a.playbackRate=battleSpeed(number)}
// Render the same HP/damage record used for settlement; never force a last-hit kill.
export async function playBattleAnimation(state,nodeId,result){return runBattlePlayback(document.querySelector('#modal'),()=>replayBattleAnimation(state,nodeId,result));}
async function replayBattleAnimation(state,nodeId,result){
 const d=document.querySelector('#modal'),run=d.dataset.battleRun,layer=d.querySelector('.battle-fx-layer');
 const live=()=>d.open&&d.dataset.battleSkipped!=='true'&&d.dataset.mode==='sourceBattle'&&d.dataset.battleRun===run;
 const make=(item,side,index)=>{const stats=side==='ally'?(result.allyStats?.[item.id]??dragonAttributes(item,state)):{attack:item.attack,defend:item.defend,life:item.life};const unit={item,side,index,el:d.querySelector(`[data-unit="${side}${index}"]`),stats,maxHp:stats.life,hp:stats.life};unit.el.dataset.maxHp=String(unit.maxHp);unit.el.dataset.currentHp=String(unit.hp);return unit;};
 const allies=configuredLineup(state).map((v,i)=>make(v,'ally',i)),enemies=(result.enemyGroup??battleEnemyGroup(nodeId)?.monsters??[]).filter(v=>v.species).map((v,i)=>make(v,'enemy',i));
 const allyPositions=battlePositions(allies.map(v=>v.item)),enemyPositions=battlePositions(enemies.map(v=>v.item),'enemy');
 const combat=result.combat??simulateCombat(state,enemies.map(u=>u.item),{allyStats:result.allyStats});if(combat.won!==result.won)throw Error('战斗记录与结算结果不一致。');d.dataset.combatPolicy=combat.policy;
 const deaths=[];
 const setHp=(u,hp)=>{
  u.hp=hp;const percent=100*hp/u.maxHp;u.el.dataset.currentHp=String(hp);u.el.querySelector('.battle-unit-hp').title=`${hp} / ${u.maxHp}`;healthBar(u,percent);const key=`${u.side==='ally'?'left':'right'}${u.index+1}/hp`,bar=d.querySelector(`[data-source="${key}"]`);if(bar){bar.style.clipPath=`inset(0 ${100-percent}% 0 0)`;bar.dataset.currentHp=String(hp);bar.dataset.maxHp=String(u.maxHp);}
  if(hp<=0){u.el.classList.add('is-dead');d.querySelector(`[data-portrait="${u.side}${u.index}"]`)?.classList.add('is-dead');deaths.push(motion(u.el,'dead',live).then(async complete=>{if(complete){await battleWait(d,100);u.el.hidden=true;u.el.dataset.deathComplete='true'}}))}
 };
 if(!(await Promise.all([...allies,...enemies].map(u=>motion(u.el,'movein',live)))).every(Boolean))return false;
 await battleWait(d,100);if(!live())return false;
 for(const turn of combat.events){
  if(!live())return false;
  const target=(turn.side==='ally'?enemies:allies)[turn.target],attacker=(turn.side==='ally'?allies:enemies)[turn.actor];
  if(attacker.hp<=0||target.hp!==turn.hpBefore)throw Error('战斗回放生命值不一致。');
  attacker.el.dataset.attacks=String(Number(attacker.el.dataset.attacks??0)+1);
  const round=d.querySelector('[data-source="round/num"]');if(round)round.textContent=`${turn.round}/${BATTLE_ROUND_LIMIT}`;
  const {x,y:ay}=(attacker.side==='ally'?allyPositions:enemyPositions)[attacker.index],{x:targetX,y:ty}=(target.side==='ally'?allyPositions:enemyPositions)[target.index];
  const magic=turn.slot===2,slot=turn.slot,rune=attacker.side==='ally'?runeOfDragon(state,attacker.item.id,slot):null,skill=sourceSkill(turn.skillId)??runeSkill(attacker.item,runeDefinition(rune?.type),slot),common=SKILL_ART[skill?.kind],key=common?common.fireEff:`${magic?'magic':'attack'}_${SPECIES[attacker.item.species].originalId}`;
  void skillName(layer,skill,common,formationDefinition(attacker.item)?.isLegend===1);
  const attackMotion=magic?'magic':formationPosition(target.item)===1?'airattack':'landattack';
  if(!await motion(attacker.el,attackMotion,live))return false;
  gameAudio.skill(skill?.kind,'fire',battleSpeed(d));
  const points=projectilePoints(attacker.item,{x,y:ay},target.item,{x:targetX,y:ty},attacker.side);
  if(!await playSourceProjectile(layer,key,common?.type??3,points.from,points.to,live))return false;
  gameAudio.skill(skill?.kind,'hit',battleSpeed(d));
  const hitKey=common?.hitEff||key,offset=formationDefinition(target.item)?.offsetY??0,direction=target.side==='ally'?-1:1;
  const hitPoint={x:targetX,y:ty-offset};
  const foreground=playSourceHit(layer,hitKey,'bomb2',hitPoint,live,{direction});
  void playSourceHit(d.querySelector('.battle-bg-fx-layer'),hitKey,'bomb3',hitPoint,live,{direction,depth:-1});
  const hurt=turn.hpAfter===0?Promise.resolve(true):motion(target.el,'hurt',live);
  await damageNumber(layer,turn.damage,targetX,ty-75);setHp(target,turn.hpAfter);d.dispatchEvent(new CustomEvent('battle-hp-applied',{bubbles:true,detail:turn}));
  attacker.el.dataset.resolvedAttacks=String(Number(attacker.el.dataset.resolvedAttacks??0)+1);
  const results=await Promise.all([foreground,target.hp>0?hurt:Promise.resolve(true)]);if(!results.every(Boolean))return false;
 }
 await Promise.all(deaths);await battleWait(d,1000);return live();
}

// Offline world-boss encounter: recorded partial damage, never fake a defeated boss.
export async function playBossAnimation(state,plan){return runBattlePlayback(document.querySelector('#modal'),()=>replayBossAnimation(state,plan));}
async function replayBossAnimation(state,plan){
 const d=document.querySelector('#modal'),run=d.dataset.battleRun,layer=d.querySelector('.battle-fx-layer'),team=configuredLineup(state),allies=battlePositions(team),enemies=battlePositions([plan.enemy],'enemy');const live=()=>d.open&&d.dataset.battleSkipped!=='true'&&d.dataset.battleRun===run&&d.dataset.mode==='sourceBattle';
 const applyHp=(el,hp,max,barKey)=>{const percent=Math.max(0,hp/max*100);el.dataset.currentHp=String(hp);el.dataset.maxHp=String(max);healthBar({el},percent);const top=d.querySelector(`[data-source="${barKey}/hp"]`);if(top){top.dataset.currentHp=String(hp);top.dataset.maxHp=String(max);top.style.clipPath=`inset(0 ${100-percent}% 0 0)`;}};
 const initialTarget=d.querySelector('[data-unit=enemy0]');applyHp(initialTarget,plan.startHp,plan.enemy.life,'right1');for(let i=0;i<team.length;i++)applyHp(d.querySelector(`[data-unit=ally${i}]`),dragonAttributes(team[i],state).life,dragonAttributes(team[i],state).life,'left'+(i+1));
 let hp=plan.startHp;const events=plan.events??plan.hits.map(hit=>({...hit,side:'ally',slot:hit.slot??2,hp:hp=Math.max(0,hp-hit.damage),maxHp:plan.enemy.life}));
 if(!(await Promise.all([...d.querySelectorAll('.battle-fighter')].map(el=>motion(el,'movein',live)))).every(Boolean))return false;
 for(const hit of events){if(!live())return false;const ally=hit.side==='ally',actor=d.querySelector(`[data-unit="${ally?'ally'+hit.index:'enemy0'}"]`),target=d.querySelector(`[data-unit="${ally?'enemy0':'ally'+hit.target}"]`),actorItem=ally?team[hit.index]:plan.enemy,targetItem=ally?plan.enemy:team[hit.target],from=ally?allies[hit.index]:enemies[0],to=ally?enemies[0]:allies[hit.target],skill=sourceCombatSkill(hit.skillId)??activeCombatSkill(ally?state:null,actorItem,hit.slot),art=SKILL_ART[skill?.kind],key=art?.fireEff??`${hit.slot===2?'magic':'attack'}_${SPECIES[actorItem.species].originalId}`;
 const label=d.querySelector('[data-source="round/num"]');if(label)label.textContent=`${hit.round}/${plan.roundLimit??30}`;d.dataset.lastBattleSide=hit.side;d.dataset.bossRound=hit.round;void skillName(layer,skill,art,formationDefinition(actorItem)?.isLegend===1);
 if(!await motion(actor,hit.slot===2?'magic':formationPosition(targetItem)===1?'airattack':'landattack',live))return false;
 gameAudio.skill(skill?.kind,'fire',battleSpeed(d));
 const points=projectilePoints(actorItem,from,targetItem,to,ally?'ally':'enemy');if(!await playSourceProjectile(layer,key,art?.type??3,points.from,points.to,live))return false;
 gameAudio.skill(skill?.kind,'hit',battleSpeed(d));
 const fx=playSourceHit(layer,art?.hitEff??key,'bomb2',{x:to.x,y:to.y-45},live),hurt=hit.hp>0?motion(target,'hurt',live):Promise.resolve(true);await damageNumber(layer,hit.damage,to.x,to.y-75);applyHp(target,hit.hp,hit.maxHp,ally?'right1':'left'+(hit.target+1));if(!(await Promise.all([fx,hurt])).every(Boolean))return false;
 if(hit.hp===0){target.classList.add('is-dead');d.querySelector(`[data-portrait="${ally?'enemy0':'ally'+hit.target}"]`)?.classList.add('is-dead');if(!await motion(target,'dead',live))return false;target.hidden=true;}
 }
 d.dataset.bossEndReason=plan.endedBy;await battleWait(d,500);return live();
}
