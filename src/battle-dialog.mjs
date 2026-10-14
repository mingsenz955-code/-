import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {dragonArt} from './art.mjs';
import {SPECIES} from './data.mjs';
import {BATTLE_SLOTS,BATTLE_ROUND_LIMIT,BATTLE_POLICY,dragonAttributes,dragonPower,lineupPower,configuredLineup,battleRequirement,battleReward,battleEnemyGroup} from './battle.mjs';

// The client's own battle layout (ui_battlenormal) with its own slot portrait (item_battle_touxiang).
// The left line-up is the player's real dragons and their baseline power. The exported client
// never resolves a PVE node to an enemy list, so the right side uses anonymous silhouettes and
// an explicitly labelled offline power requirement rather than invented species.
export async function openBattleDialog(state,{nodeId=null,node=null}={}){
 const [layout,portrait]=await Promise.all([sourceLayout('ui_battlenormal'),sourceLayout('item_battle_touxiang')]);
 const lineup=configuredLineup(state),enemyGroup=battleEnemyGroup(nodeId),enemies=enemyGroup?.monsters??[],required=battleRequirement(nodeId),reward=battleReward(nodeId),last=state.adventure?.lastBattle?.nodeId===nodeId?state.adventure.lastBattle:null;
 const values={},slots={};
 for(let index=1;index<=BATTLE_SLOTS;index++){
  const dragon=lineup[index-1],enemy=enemies[index-1];
  for(const side of ['left','right']){
   const key=`${side}${index}`;
   values[`${key}/lv`]=`${side==='left'&&dragon?`Lv.${dragon.level}`:side==='right'&&enemy?`Lv.${enemy.level}`:''}`;
   slots[`${key}/icon`]=side==='left'&&dragon?`<div class="source-battle-portrait battle-unit ally">${dragonArt(dragon.species,'',dragon.level)}</div>`:side==='right'&&enemy?`<div class="source-battle-portrait battle-unit enemy">${enemy.species?dragonArt(enemy.species,'',enemy.level):`<span class="source-battle-enemy">${enemy.dragonId}</span>`}</div>`:'';
  }
 }
 values['round/num']=`1/${BATTLE_ROUND_LIMIT}`;
 values['skip/miaoshu']='退出';
 slots.power_left=`<span class="source-battle-power">${lineupPower(lineup)}</span>`;
 slots.power_right=`<span class="source-battle-power">${required??'—'}</span>`;
 const rows=lineup.map(dragon=>{const stats=dragonAttributes(dragon);return `<li>${esc(SPECIES[dragon.species]?.name??dragon.species)} Lv.${dragon.level}　${stats?`攻 ${stats.attack}　防 ${stats.defend}　血 ${stats.life}　战力 ${dragonPower(dragon)}`:'基础战斗属性尚未取得'}</li>`}).join('');
 const stage=`<div class="battle-stage">${lineup.map((dragon,index)=>`<div class="battle-fighter ally slot-${index+1}">${dragonArt(dragon.species,'',dragon.level)}<i></i></div>`).join('')}${enemies.map((enemy,index)=>`<div class="battle-fighter enemy slot-${index+1}">${enemy.species?dragonArt(enemy.species,'',enemy.level):`<span>${enemy.dragonId}</span>`}<i></i></div>`).join('')}<b class="battle-projectile"></b></div>`;
 const actions={close:{type:'close',label:'退出战斗'},'skip/btn':{type:'close',label:'退出战斗'}};
 const d=showSource('sourceBattle',renderSourceLayout(layout,{values,slots,actions})+stage
  +`<div class="source-battle-panel"><p class="source-battle-title">${node?esc(node.name):'战斗准备'}${nodeId?`（节点 ${nodeId}）`:''}</p>`
  +`<ul class="source-battle-list">${rows||'<li>牧场里还没有可以出战的龙。</li>'}</ul>`
  +`<p>体力：${state.adventure?.energy??0}/10　建议战力：${required??'—'}　奖励：${reward?`${reward.coins}金币、${reward.food}龙粮`:'—'}</p>`
  +(last?`<p class="${last.won?'success':'error'}">${last.won?`胜利 · ${last.stars}星`:'战斗失败'}　我方 ${last.power} / 敌方 ${last.required}</p>`:'')
  +`<div class="native-save-actions"><button class="primary" data-action="openFormation">布阵</button><button class="primary" data-action="battleStart" data-id="${nodeId}">开始战斗</button></div>`
  +`<p class="source-battle-note">敌方使用客户端怪物表与怪物组合包 ${enemyGroup?.sourceGroup??'—'} 的真实龙模型、等级和属性。节点到组合包的服务器映射缺失，因此关卡按组合包战力递增顺序离线配对；奖励仍采用明确标记的离线规则。</p></div>`);
 d.dataset.battleNode=nodeId?String(nodeId):'';
}
