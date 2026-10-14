import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {dragonArt} from './art.mjs';
import {BATTLE_SLOTS,BATTLE_ROUND_LIMIT,BATTLE_POLICY,dragonAttributes,dragonPower,lineupPower,configuredLineup,battleRequirement,battleReward} from './battle.mjs';

// The client's own battle layout (ui_battlenormal) with its own slot portrait (item_battle_touxiang).
// The left line-up is the player's real dragons and their baseline power. The exported client
// never resolves a PVE node to an enemy list, so the right side uses anonymous silhouettes and
// an explicitly labelled offline power requirement rather than invented species.
export async function openBattleDialog(state,{nodeId=null,node=null}={}){
 const [layout,portrait]=await Promise.all([sourceLayout('ui_battlenormal'),sourceLayout('item_battle_touxiang')]);
 const lineup=configuredLineup(state),required=battleRequirement(nodeId),reward=battleReward(nodeId),last=state.adventure?.lastBattle?.nodeId===nodeId?state.adventure.lastBattle:null;
 const values={},slots={};
 for(let index=1;index<=BATTLE_SLOTS;index++){
  const dragon=lineup[index-1];
  for(const side of ['left','right']){
   const key=`${side}${index}`;
   values[`${key}/lv`]=`${side==='left'&&dragon?`Lv.${dragon.level}`:side==='right'?`Lv.${Math.max(1,Math.ceil((required??900)/900))}`:''}`;
   slots[`${key}/icon`]=side==='left'&&dragon?`<div class="source-battle-portrait">${dragonArt(dragon.species,'',dragon.level)}</div>`:side==='right'?'<div class="source-battle-enemy">?</div>':'';
  }
 }
 values['round/num']=`1/${BATTLE_ROUND_LIMIT}`;
 values['skip/miaoshu']='退出';
 slots.power_left=`<span class="source-battle-power">${lineupPower(lineup)}</span>`;
 slots.power_right=`<span class="source-battle-power">${required??'—'}</span>`;
 const rows=lineup.map(dragon=>{const stats=dragonAttributes(dragon);return `<li>${esc(dragon.species)} Lv.${dragon.level}　${stats?`攻 ${stats.attack}　防 ${stats.defend}　血 ${stats.life}　战力 ${dragonPower(dragon)}`:'基础战斗属性尚未取得'}</li>`}).join('');
 const actions={close:{type:'close',label:'退出战斗'},'skip/btn':{type:'close',label:'退出战斗'}};
 const d=showSource('sourceBattle',renderSourceLayout(layout,{values,slots,actions})
  +`<div class="source-battle-panel"><p class="source-battle-title">${node?esc(node.name):'战斗准备'}${nodeId?`（节点 ${nodeId}）`:''}</p>`
  +`<ul class="source-battle-list">${rows||'<li>牧场里还没有可以出战的龙。</li>'}</ul>`
  +`<p>体力：${state.adventure?.energy??0}/10　建议战力：${required??'—'}　奖励：${reward?`${reward.coins}金币、${reward.food}龙粮`:'—'}</p>`
  +(last?`<p class="${last.won?'success':'error'}">${last.won?`胜利 · ${last.stars}星`:'战斗失败'}　我方 ${last.power} / 敌方 ${last.required}</p>`:'')
  +`<div class="native-save-actions"><button class="primary" data-action="openFormation">布阵</button><button class="primary" data-action="battleStart" data-id="${nodeId}">开始战斗</button></div>`
  +'<p class="source-battle-note">我方属性使用客户端基础成长公式。节点到敌方怪物列表仍缺服务器数据，当前敌方战力和金币/龙粮奖励使用明确标记的离线平衡规则，用于形成可玩的关卡闭环；取得原服务器证据后再替换。</p></div>');
 d.dataset.battleNode=nodeId?String(nodeId):'';
}
