import {lootProp} from './loot.mjs';
import {mailbox,mailEquipmentTypes} from './mail.mjs';
import {equipmentDefinition,equipmentIcon} from './equipment.mjs';
import {SPECIES,speciesKey} from './data.mjs';
import {eggArt} from './art.mjs';
import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
export async function openMail(s){const [layout,card]=await Promise.all(['panel_mail_main','item_mail_main'].map(sourceLayout)),mails=mailbox(s);return showSource('sourceMail',renderSourceLayout(layout,{values:{txt_unread_num:mails.filter(m=>!m.claimed).length},hidden:new Set(['btn_getall']),actions:{close:{type:'close',label:'关闭'},'btn_delread/btn':{type:'deleteReadMail',label:'删除已读'}},slots:{huadong:`<div class="source-mail-list">${mails.map(m=>`<article class="source-mail-card" role="button" tabindex="0" data-action="readMail" data-value="${m.id}" aria-label="${esc(m.title)}">${renderSourceLayout(card,{values:{'node_info/txt_title':m.title,'node_info/txt_from':m.sender,'node_info/txt_time':'版本 '+m.version},hidden:new Set([m.claimed?'node_state_bg/node_unread':'node_state_bg/node_read'])})}</article>`).join('')||'<p>暂无邮件</p>'}</div>`}}));}
export async function openMailDetail(s,id){
 const m=mailbox(s).find(m=>id?m.id===id:true);if(!m)return openMail(s);
 const layout=await sourceLayout('panel_mail_boss'),rewards=[];
 if(m.dragonId)rewards.push(`<div class="source-mail-reward">${eggArt(speciesKey(m.dragonId))}<span>${esc(SPECIES[speciesKey(m.dragonId)].name)}龙蛋 ×1</span></div>`);
 if(m.randomMutant)rewards.push(`<div class="source-mail-reward">${eggArt(speciesKey(m.randomDragonId??2002))}<span>${m.randomDragonId?esc(SPECIES[speciesKey(m.randomDragonId)].name):'随机变异'}龙蛋 ×1</span></div>`);
 if(m.gems)rewards.push(`<div class="source-mail-reward"><img class="mail-attachment-icon" src="assets/original/ui/ui_main_08.png" alt="魔晶"><span>${m.gems}魔晶</span></div>`);
 for(const box of m.boxes??[]){const d=lootProp(box.id);rewards.push(`<div class="source-mail-reward"><img class="mail-attachment-icon" src="assets/original/ui/${esc(d.image)}" alt="${esc(d.name)}"><span>${esc(d.name)} ×${box.amount}</span></div>`);}
 if(m.equipmentSets)rewards.push(`<p>${m.equipmentSets}套共${m.equipmentSets*6}件，强化+${(m.equipmentGrade??100)-1}、${m.equipmentStar??5}星</p><div class="mail-equipment-preview">${mailEquipmentTypes(m).map(type=>{const d=equipmentDefinition(type);return `<div><img src="${equipmentIcon(d)}" alt="${esc(d.name)}"><span>${esc(d.name)} ×${m.equipmentSets}</span></div>`}).join('')}</div>`);
 return showSource('sourceMailDetail',renderSourceLayout(layout,{values:{txt_title:'查看邮件','node_btn_ok/txt_name':m.claimed?'确定':'领取'},actions:{'node_btn_ok/btn':{type:m.claimed?'openMail':'claimMail',value:m.id,label:m.claimed?'返回邮箱':'领取附件'}},slots:{huadong:`<div class="source-mail-content"><h3>${esc(m.title)}</h3><p>${esc(m.content)}</p><p class="source-mail-sender">${esc(m.sender)}</p><img class="source-mail-divider" src="assets/original/ui/ui_mail_fgxian.png" alt=""><p>附件${m.claimed?'（已领取）':''}：</p>${rewards.join('')}</div>`}}));
}
