import {openNativePaper,nativeButton,esc} from './ranch-dialogs.mjs';
import {SPECIES} from './data.mjs';
import {dragonArt} from './art.mjs';
import {configuredLineup,lineupPower} from './battle.mjs';
export async function openFormationDialog(state){const selected=new Set((state.formation??[]).map(Number)),cards=state.dragons.map(d=>`<label class="source-dragon-card formation-choice"><input type="checkbox" data-formation-dragon value="${d.id}" ${selected.has(d.id)?'checked':''}><span>${dragonArt(d.species,'',d.level)}</span><b>${esc(SPECIES[d.species].name)} Lv.${d.level}</b></label>`).join('');const d=await openNativePaper('出战布阵',`<p>选择1至6条龙。当前战力：${lineupPower(configuredLineup(state)).toLocaleString('zh-CN')}</p><div class="source-collection-list">${cards}</div><div class="native-save-actions">${nativeButton('保存阵容','saveFormation')}</div>`,'nativeFormation');d.dataset.formation='true';return d}
