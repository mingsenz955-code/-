import {battlePositions} from './battle-positions.mjs';
import {formationPosition} from './formation.mjs';
import {runeSkill,runeOfDragon,runeDefinition} from './runes.mjs';
import SKILL_ART from '../assets/original/data/battle-skill-art.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource} from './ranch-dialogs.mjs';
import {dragonArt} from './art.mjs';
import {SPECIES} from './data.mjs';
import EFFECTS from '../assets/original/effects/index.mjs';
import MODELS from '../assets/original/models/index.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {BATTLE_SLOTS,BATTLE_ROUND_LIMIT,dragonAttributes,lineupPower,configuredLineup,battleRequirement,battleEnemyGroup} from './battle.mjs';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let activeRun=0;
function fighter(item,side,index,positions){const p=positions[index],art=dragonArt(item.species,'',item.level).replace('data-clip="breath"',`data-clip="breathinbattle" data-battle-scale="${p.scale}" data-native-size="true"`);return `<div class="battle-fighter ${side}" data-unit="${side}${index}" data-position="${p.type}" style="left:${p.x}px;top:${p.y}px;z-index:${Math.round(p.y)}">${art}<span class="battle-unit-hp"><i></i></span></div>`}
export async function openBattleDialog(state,{nodeId=null,enemyGroup=null}={}){
 const layout=await sourceLayout('ui_battlenormal');
 layout.height=576;
 for(const n of layout.children){if(n.name==='bg')n.height=576;if(n.y>200)n.y-=96;else if(n.y< -200)n.y+=96;}
 const lineup=configuredLineup(state),enemies=enemyGroup??battleEnemyGroup(nodeId)?.monsters??[],values={},slots={},hidden=new Set(['top_bg']);
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
 const stage=`<div class="battle-stage" aria-label="自动战斗">${lineup.map((d,i)=>fighter(d,'ally',i,allyPositions)).join('')}${enemies.filter(d=>d.species).map((d,i)=>fighter(d,'enemy',i,enemyPositions)).join('')}<div class="battle-fx-layer"></div></div>`;
 const d=showSource('sourceBattle',renderSourceLayout(layout,{values,slots,hidden,actions:{'skip/btn':{type:'close',label:'退出战斗'}}})+stage,'source-battle-dialog');
 d.style.setProperty('--source-scale',Math.min((innerWidth-20)/1024,(innerHeight-20)/576));
 d.querySelector('.battle-stage').addEventListener('dragon-clip-complete',e=>{const fighter=e.target.closest('.battle-fighter');if(!fighter)return;if(['airattack','landattack','magic'].includes(e.detail.clip))fighter.classList.remove('is-attacking');if(e.detail.clip==='hurt')fighter.classList.remove('is-hit');});d.dataset.battleNode=String(nodeId);d.dataset.battleRun=String(++activeRun);
 return d;
}
function clip(el,name){const c=el.querySelector('canvas[data-model]');if(c){const clips=MODELS[c.dataset.model]?.clips??[];c.dataset.clip=clips.includes(name)?name:clips.includes('breathinbattle')?'breathinbattle':'breath';delete c.dataset.afterNextClip;if(['airattack','landattack','magic','hurt'].includes(name)){const idle=clips.includes('breathinbattle')?'breathinbattle':'breath',end=name+'end';c.dataset.nextClip=clips.includes(end)?end:idle;if(clips.includes(end))c.dataset.afterNextClip=idle;}else delete c.dataset.nextClip;c.dataset.replay=String((+c.dataset.replay||0)+1)}}
function effect(layer,key,name,x,y,flip=false){const entry=EFFECTS[key];if(!entry)return null;const canvas=document.createElement('canvas');canvas.width=400;canvas.height=400;canvas.className='battle-source-effect';canvas.dataset.model=key;canvas.dataset.clip=entry.clips.includes(name)?name:entry.clips[0];canvas.style.cssText=`left:${x}px;top:${y}px;${flip?'scale:-1 1;':''}`;layer.append(canvas);return canvas}
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
 const setHp=(u,hp)=>{u.hp=hp;u.el.style.setProperty('--hp',`${hp}%`);const key=`${u.side==='ally'?'left':'right'}${u.index+1}/hp`,bar=d.querySelector(`[data-source="${key}"]`);if(bar)bar.style.clipPath=`inset(0 ${100-hp}% 0 0)`;if(hp<=0){clip(u.el,'dead');u.el.classList.add('is-dead');d.querySelector(`[data-portrait="${u.side}${u.index}"]`)?.classList.add('is-dead')}};
 await wait(600);
 for(let turn=0;turn<losers.length*2&&live();turn++){
  const finishing=turn%2===1,target=finishing?losers[Math.floor(turn/2)]:winners[turn%winners.length],attacker=finishing?winners[turn%winners.length]:losers[Math.floor(turn/2)];
  const round=d.querySelector('[data-source="round/num"]');if(round)round.textContent=`${Math.floor(turn/6)+1}/${BATTLE_ROUND_LIMIT}`;
  const {x,y:ay}=(attacker.side==='ally'?allyPositions:enemyPositions)[attacker.index],{x:targetX,y:ty}=(target.side==='ally'?allyPositions:enemyPositions)[target.index];
  const magic=turn%3===2,slot=magic?2:1,rune=attacker.side==='ally'?runeOfDragon(state,attacker.item.id,slot):null,skill=runeSkill(attacker.item,runeDefinition(rune?.type),slot),common=SKILL_ART[skill?.kind],key=common?common.fireEff:`${magic?'magic':'attack'}_${SPECIES[attacker.item.species].originalId}`;
  if(magic&&common?.nameImage){const name=document.createElement('div');name.className='battle-skill-name';name.innerHTML=`<img src="assets/original/ui/${common.nameImage}" alt="${skill.name}">`;layer.append(name);setTimeout(()=>name.remove(),1600)}
  clip(attacker.el,magic?'magic':formationPosition(target.item)===1?'airattack':'landattack');attacker.el.classList.add('is-attacking');
  const missile=effect(layer,key,'bullistic',x,ay,attacker.side==='enemy');
  if(missile)missile.animate([{left:`${x}px`,top:`${ay}px`},{left:`${targetX}px`,top:`${ty}px`}],{duration:550,fill:'forwards'});
  await wait(550);if(!live()){missile?.remove();return false}missile?.remove();
  const hitKey=common?.hitEff||key,explosion=EFFECTS[hitKey]?.clips.find(v=>v.startsWith('bomb'));const blast=explosion?effect(layer,hitKey,explosion,targetX,ty-45):null;
  clip(target.el,'hurt');target.el.classList.add('is-hit');
  const damage=finishing?Math.max(1,Math.floor((target.stats?.life??1)*target.hp/100)):Math.max(1,Math.floor((attacker.stats?.attack??1)*.4));
  await damageNumber(layer,damage,targetX,ty-75);setHp(target,finishing?0:Math.max(30,target.hp-10));
  await wait(550);blast?.remove();target.el.classList.remove('is-hit');attacker.el.classList.remove('is-attacking');if(target.hp>0&&target.el.querySelector('canvas')?.dataset.clip==='hurt')clip(target.el,'breathinbattle');
 }
 await wait(500);return live();
}

// Offline world-boss encounter: recorded partial damage, never fake a defeated boss.
export async function playBossAnimation(state,plan){
 const d=document.querySelector('#modal'),run=d.dataset.battleRun,layer=d.querySelector('.battle-fx-layer'),target=d.querySelector('[data-unit="enemy0"]'),team=configuredLineup(state),positions=battlePositions(team),targetPos=battlePositions([plan.enemy],'enemy')[0];let hp=plan.startHp;
 const live=()=>d.open&&d.dataset.battleRun===run&&d.dataset.mode==='sourceBattle';
 for(const hit of plan.hits){if(!live())return false;const actor=d.querySelector(`[data-unit="ally${hit.index}"]`),p=positions[hit.index];clip(actor,'magic');actor.classList.add('is-attacking');const r=d.querySelector('[data-source="round/num"]');if(r)r.textContent=`${hit.round}/30`;await wait(350);if(!live())return false;const fx=effect(layer,'magic_'+SPECIES[team[hit.index].species].originalId,'bomb2',targetPos.x,targetPos.y-45);clip(target,'hurt');await damageNumber(layer,hit.damage,targetPos.x,targetPos.y-75);hp-=hit.damage;const percent=Math.max(0,hp/plan.enemy.life*100);target.style.setProperty('--hp',`${percent}%`);const bar=d.querySelector('[data-source="right1/hp"]');if(bar)bar.style.clipPath=`inset(0 ${100-percent}% 0 0)`;await wait(400);fx?.remove();actor.classList.remove('is-attacking');}
 if(live()&&plan.won){clip(target,'dead');target.classList.add('is-dead')}await wait(500);return live();
}
