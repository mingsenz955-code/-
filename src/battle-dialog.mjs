import {renderSourceLayout} from './source-layout.mjs';
import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {dragonArt} from './art.mjs';
import {BATTLE_SLOTS,BATTLE_ROUND_LIMIT,BATTLE_POLICY,dragonAttributes,dragonPower,lineupPower} from './battle.mjs';

// The client's own battle layout (ui_battlenormal) with its own slot portrait (item_battle_touxiang).
// The left line-up is the player's real dragons and their baseline power. The right side is
// deliberately blank: a PVE node never resolves to an enemy list in the exported tables, so
// nothing is invented to fill those six slots.
export async function openBattleDialog(state,{nodeId=null,node=null}={}){
 const [layout,portrait]=await Promise.all([sourceLayout('ui_battlenormal'),sourceLayout('item_battle_touxiang')]);
 const lineup=(state.dragons??[]).slice(0,BATTLE_SLOTS);
 const values={},slots={};
 for(let index=1;index<=BATTLE_SLOTS;index++){
  const dragon=lineup[index-1];
  for(const side of ['left','right']){
   const key=`${side}${index}`;
   values[`${key}/lv`]=`${side==='left'&&dragon?`Lv.${dragon.level}`:''}`;
   slots[`${key}/icon`]=side==='left'&&dragon?`<div class="source-battle-portrait">${dragonArt(dragon.species,'',dragon.level)}</div>`:'';
  }
 }
 values['round/num']=`1/${BATTLE_ROUND_LIMIT}`;
 values['skip/miaoshu']='退出';
 slots.power_left=`<span class="source-battle-power">${lineupPower(lineup)}</span>`;
 slots.power_right='<span class="source-battle-power">—</span>';
 const rows=lineup.map(dragon=>{const stats=dragonAttributes(dragon);return `<li>${esc(dragon.species)} Lv.${dragon.level}　${stats?`攻 ${stats.attack}　防 ${stats.defend}　血 ${stats.life}　战力 ${dragonPower(dragon)}`:'基础战斗属性尚未取得'}</li>`}).join('');
 const actions={close:{type:'close',label:'退出战斗'},'skip/btn':{type:'close',label:'退出战斗'}};
 const d=showSource('sourceBattle',renderSourceLayout(layout,{values,slots,actions})
  +`<div class="source-battle-panel"><p class="source-battle-title">${node?esc(node.name):'战斗准备'}${nodeId?`（节点 ${nodeId}）`:''}</p>`
  +`<ul class="source-battle-list">${rows||'<li>牧场里还没有可以出战的龙。</li>'}</ul>`
  +'<p class="source-battle-note">出战列表是牧场里的真实龙，战力按客户端基础成长与 getPower 的基础项计算（未含暴击、免暴、觉醒、秘宝与符文）。'
  +'<b>敌方配置未取得</b>：PVE 节点在客户端表里无法解析到敌人列表，所以右侧六格保持为空，也没有战斗结算。</p></div>');
 d.dataset.battleNode=nodeId?String(nodeId):'';
}
