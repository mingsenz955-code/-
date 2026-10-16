import {sourceLayout,showSource,esc,nativeButton,openNativePaper} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {SPECIES} from './data.mjs';
import {bloodLevel,bloodWaves,bloodEnemies,bloodTeamPower,bloodToken} from './blood-front.mjs';
async function layout(name){const l=await sourceLayout(name);const visit=n=>{if(n.type==='maskBtn')n.type='btn';if(n.y===undefined&&(n.top!==undefined||n.bottom!==undefined))n.y=n.top!==undefined?384-n.top:-384+n.bottom;if(n.children){if(!Array.isArray(n.children))n.children=[];n.children.forEach(visit);}};visit(l);return l;}
function paths(l){const out={};const walk=(n,p='')=>{const k=p?p+'/'+(n.name??''):n.name??'';if(n.name)out[n.name]=k;for(const c of n.children??[])walk(c,k);};for(const c of l.children)walk(c);return out;}
function digits(value,file,w,h,left=0){return `<span class="blood-digits" style="left:${left}px">${String(value).split('').map(c=>`<i style="width:${w}px;height:${h}px;background-image:url('assets/original/ui/${file}');background-position:-${Number(c)*w}px 0"></i>`).join('')}</span>`;}
function enemyArt(e){const sp=SPECIES[e.species];return `<span class="blood-enemy" title="${esc(sp.name)} · Lv.${e.level} · 攻${e.attack} 防${e.defend} 生命${e.life}"><img src="assets/original/ui/ui_common_DaoJuKuang${sp.quality}.png" alt=""><img src="assets/original/ui/ui_bookdragon_${sp.original}_1.png" alt="${esc(sp.name)}"><b>${e.level}</b></span>`;}
export async function openBloodFront(s,selected=1,next=false){
 const b=s.bloodFront,l=await layout(next?'panel_bloodbattle_nextware':'ui_battle_blood'),names=paths(l),rule=bloodLevel(b.stage),wave=bloodWaves(b.stage)[b.wave],values={stage_record_txt:`最高纪录：${b.best[b.stage]??0}积分`,stage_reward_txt:`本关奖励：本次获得积分x${rule.passAward}培养丹`,player_score_txt:`我的积分：${b.totalScore}`,player_ATB_txt:`当前队伍战斗力：${bloodTeamPower(s)}`,txt_leftreset:`剩余重置次数:${b.resets}`,fight_btn_txt:b.finished?'已全部通关':'开始挑战'},slots={},hidden=new Set(),disabled=new Set(),actions={close:{type:'close'},fight_btn:{type:'bloodFight',id:selected},next_battle:{type:'bloodFight',id:selected},auto_btn:{type:'bloodSweep'},reset_btn:{type:'bloodResetConfirm'},buzhen:{type:'bloodFormation'},zhandouli:{type:'bloodEquipment'}};
 if(b.finished){disabled.add('fight_btn');disabled.add('next_battle');}
 if(!b.resets)disabled.add('reset_btn');if(b.finished||b.wave!==0||(b.best[b.stage]??0)<rule.autoPassNeed)disabled.add('auto_btn');
 if(names.stage_txt)slots[names.stage_txt]=`<img class="source-sprite" src="assets/original/ui/ui_bloodwar_text_stage.png" alt="关卡" style="width:161px;height:44px">${digits(b.stage,'ui_bloodwar_num_yellow.png',29,36,0)}`;
 if(names.wave_txt)slots[names.wave_txt]=`<img class="source-sprite" src="assets/original/ui/ui_bloodwar_text_wave.png" alt="波次" style="width:138px;height:38px">${digits(b.wave+1,'ui_bloodwar_num_orange.png',25,31,0)}`;
 for(let i=1;i<=3;i++){
  const enemies=bloodEnemies(wave,i),prefix=`selection_${i}`;actions[prefix+'_sel']={type:'bloodSelect',id:i};hidden.add(names[prefix+'_selected']);if(i===selected)hidden.delete(names[prefix+'_selected']);
  values[`s${i}_ATB_txt`]=String(Math.floor(enemies.reduce((n,e)=>n+e.attack+e.defend+e.life/3+e.crit+e.uncrit,0)));values[`s${i}_RWD_txt`]=`积分x${i}`;
  for(let j=1;j<=3;j++)slots[names[`s${i}_slot_${j}`]]=enemyArt(enemies[j-1]);
  slots[names[`s${i}_star_node`]]=`<span class="blood-stars">${Array.from({length:wave['star'+i]},()=>'<img src="assets/original/ui/ui_battle_s4.png" alt="星">').join('')}</span>`;
  const key=['atk','def','hp'][i-1],base=`left_panel/buff_${key}_node`;values[`buff_${key}_txt`]='+'+rule['desc'+i];hidden.add(`${base}/buff_${key}/${b.buffs.includes(i)?'image_close':'image_open'}`);
 }
 let html=renderSourceLayout(l,{values,slots,hidden,disabled,actions});
 if(!next)for(let i=1;i<=3;i++){const key=['atk','def','hp'][i-1];html=html.replace(`data-source="left_panel/buff_${key}_node"`,`data-source="left_panel/buff_${key}_node" data-action="bloodBuffInfo" data-id="${i}" role="button" tabindex="0" aria-label="${['攻击','防御','生命'][i-1]}增益"`);}
 const d=showSource(next?'sourceBloodNext':'sourceBloodFront',html,'source-blood-front');d.dataset.bloodSelection=selected;d.dataset.bloodToken=bloodToken(s);return d;
}
export async function openBloodBuff(s,id,currency=null){
 const l=await layout('ui_battle_blood_buff_info'),r=bloodLevel(s.bloodFront.stage),values={tip_content:`效果：本关所有出战的龙${['攻击力','防御力','生命值'][id-1]}增加${r['desc'+id]}`,score_cost:'x'+r['cost'+id],cryst_cost:'x'+r.costMojing},hidden=new Set();if(currency!=='score')hidden.add('sel_score');if(currency!=='gems')hidden.add('sel_cryst');
 const d=showSource('sourceBloodBuff',renderSourceLayout(l,{values,hidden,disabled:new Set(currency?[]:['btn_active']),actions:{btn_score:{type:'bloodBuffCurrency',id,value:'score'},btn_cryst:{type:'bloodBuffCurrency',id,value:'gems'},btn_active:{type:'bloodBuff',id,value:currency},btn_close:{type:'openBloodFront'}}}),'source-blood-front');d.dataset.bloodBuff=id;
}
export async function openBloodResult(s){const r=s.bloodFront.last,l=await layout(r.won?'ui_bloodwar_win':'ui_bloodwar_lose'),names=paths(l),slots={},values={score:`${r.score}/${bloodWaves(r.stage).length*3} 积分`,itemnum:r.award,stage:`第${r.stage}关挑战失败，你可以提升战斗力后重新挑战本关！`};if(r.won)slots[names.stage]=`<img class="source-sprite" src="assets/original/ui/ui_bloodwar_text_pass.png" alt="通过关卡" style="width:278px;height:38px">${digits(r.stage,'ui_bloodwar_num_yellow.png',29,36,72)}`;showSource('sourceBloodResult',renderSourceLayout(l,{values,slots,actions:{btn_ok:{type:'openBloodFront'}}}),'source-blood-front');}
export async function openBloodReset(){await openNativePaper('重置血战前线',`<p>是否确认重新挑战血战前线？从第1关重新开始，本次积分清零；最高纪录和已获培养丹保留。</p>${nativeButton('确定','bloodReset')}${nativeButton('取消','openBloodFront')}`,'sourceBloodReset');}
