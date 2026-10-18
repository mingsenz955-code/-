import {bossRankingRow} from './boss-achievements.mjs';
import {bossAchievementRows} from './boss-achievements.mjs';
import {gemDefinition} from './gems.mjs';
import {activityPrizeInfo} from './historical-activities.mjs';
import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
export async function openBossAchievements(s){
 const [layout,item]=await Promise.all(['panel_world_boss_achievement','item_world_boss_achievement'].map(sourceLayout));
 const cards=bossAchievementRows(s).map(r=>{const values={tiaojian:'单日总伤害达到'+r.damage},slots={},hidden=new Set([...(r.claimed?['btn','disable']:r.eligible?['disable','biaoji_yilingqu']:['btn','biaoji_yilingqu']),...(!r.eligible||r.claimed?['biaoji_kelingqu']:[])]);
  for(let i=0;i<2;i++){const p=r.rewards[i],base='gift'+(i+1),gem=p.type===13?gemDefinition(p.itemId):null,info=gem?{name:gem.name,image:'assets/original/ui/'+gem.icon+'.png'}:activityPrizeInfo(p);values[base+'/txt_num']='×'+p.amount;values[base+'/level/txt_level']='Lv.'+(gem?.level??1);if(!gem)hidden.add(base+'/level');hidden.add(base+'/add');slots[base+'/xiangkuang']=`<img class="boss-achievement-icon" src="assets/original/ui/ui_daojukuang_DaoJuKuang${p.quality}.png" alt="">`;slots[base+'/icon_long']=`<button class="boss-achievement-tooltip" title="${esc(info.name)}${gem?' Lv.'+gem.level:''} ×${p.amount}" aria-label="${esc(info.name)}"><img class="boss-achievement-icon" src="${esc(info.image)}" alt="${esc(info.name)}"></button>`;}
  return `<article class="boss-achievement-card" data-boss-achievement="${r.id}">${renderSourceLayout(item,{values,slots,hidden,actions:{'btn/btn':{type:'bossAchievementClaim',id:r.id,label:'领取成就奖励'}}})}</article>`;
 }).join('');
 return showSource('sourceBossAchievement',renderSourceLayout(layout,{values:{damage:s.encounters.boss.highestDailyDamage},slots:{boss_name:'<img class="boss-name-icon" src="assets/original/ui/ui_worldboss_longmingzi_1201.png" alt="远古首领">',huadong:`<div class="boss-achievement-list">${cards}</div>`},actions:{close:{type:'openWorldBoss',label:'返回首领'}}}));
}

export async function openBossSettlement(s){
 const row=bossRankingRow(s.encounters.boss.rankSettlement?.rank??1),layout=await sourceLayout('panel_world_boss_reward'),values={rank_num:'1（个人场）'},slots={},hidden=new Set(['item_two']);
 for(let i=0;i<row.rewards.length;i++){const p=row.rewards[i],info=activityPrizeInfo(p),base=i===0?'item_one/item_box':'item'+i;values[base+'/num']='×'+p.amount;values[base+(i===0?'/box_name':'/item_name')]=info.name;slots[base+'/icon_box']=`<img class="boss-settlement-icon" src="${esc(info.image)}" alt="${esc(info.name)}">`;}
 return showSource('sourceBossSettlement',renderSourceLayout(layout,{values,slots,hidden,actions:{close:{type:'openWorldBoss',label:'返回'},'btn_yes/btn':{type:'openWorldBoss',label:'确定'}}}));
}
