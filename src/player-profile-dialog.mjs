import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {profileOf,profileAvatars,avatarImage,renameCost} from './player-profile.mjs';
import {playerProgress} from './game.mjs';
import {ORIGINAL_LEVELS} from './data.mjs';
import {vipInfo} from './vip.mjs';
export async function openPlayerProfile(s){
 const l=await sourceLayout('panel_user_name_info'),p=profileOf(s),progress=playerProgress(s),next=ORIGINAL_LEVELS.find(r=>r.level===progress.level+1);
 return showSource('sourcePlayerProfile',renderSourceLayout(l,{values:{player_name:p.name,userid_num:p.id,userexp_num:next?Math.max(0,next.xp_required-progress.xp):0,'vip/vip_num':'VIP'+vipInfo(s).level,strength_num:`${s.adventure.energy}/10`,boss_num:s.encounters.boss.attempts,arena_num:s.arena.attempts},hidden:new Set(['btn_usercenter','btn_approve']),actions:{close:{type:'close',label:'关闭玩家信息'},'revise/btn':{type:'profileRename',label:'修改昵称'},'btn_set/btn':{type:'settings',label:'设置'}},slots:{icon:`<button class="profile-avatar-button" data-action="profileHeads" aria-label="更换头像"><img src="${avatarImage(p.avatar)}" alt="当前头像"></button>`}}));
}
export async function openProfileRename(s,draft=profileOf(s).name){
 const l=await sourceLayout('panel_user_name'),cost=renameCost(s);
 const d=showSource('sourceProfileRename',renderSourceLayout(l,{hidden:new Set([cost===0?'txt':'txt2']),actions:{'btn_no/btn':{type:'openPlayerProfile',label:'取消改名'},'btn_yes/btn':{type:'profileRenameConfirm',label:'确定修改昵称'}},slots:{player_name:`<input id="profile-nickname" class="profile-nickname" value="${esc(draft)}" aria-label="新昵称" placeholder="请输入新昵称" autocomplete="off">`}}));
 const input=d.querySelector('#profile-nickname'),trim=()=>{input.value=[...input.value].slice(0,6).join('')};input.addEventListener('input',e=>{if(!e.isComposing)trim()});input.addEventListener('compositionend',trim);input.focus();input.select();return d;
}
export async function confirmProfileRename(name){const l=await sourceLayout('panel_msg'),d=showSource('sourceProfileRenameConfirm',renderSourceLayout(l,{values:{txt_name:'提示',txt:'修改昵称需要消耗100魔晶，是否确认修改？','btn_QueDing/txt_name':'确定'},actions:{'btn_QueDing/btn':{type:'profileRenameApply',label:'确认花费100魔晶修改昵称'},btn_close:{type:'profileRenameCancel',label:'取消改名'}}}));d.dataset.profileName=name;return d;}
export async function openProfileHeads(s,selected=profileOf(s).avatar){
 const l=await sourceLayout('panel_userhead_change'),heads=profileAvatars(s);
 const d=showSource('sourceProfileHeads',renderSourceLayout(l,{hidden:new Set(['head']),actions:{btn_close:{type:'profileHeadsClose',label:'完成头像选择'}},slots:{lst:`<div class="profile-head-list">${heads.map(h=>`<button class="profile-head-choice${h.id===selected?' is-selected':''}" data-action="profileHeadSelect" data-id="${h.id}" aria-label="${esc(h.name)}头像"><img class="profile-head-frame" src="assets/original/ui/ui_daojukuang_DaoJuKuang1_small.png" alt=""><img class="profile-head-image" src="${h.image}" alt="${esc(h.name)}"><img class="profile-head-selected" src="assets/original/ui/ui_daojukuang_selected85.png" alt="已选择"></button>`).join('')}</div>`}}));d.dataset.profileAvatar=selected;return d;
}
