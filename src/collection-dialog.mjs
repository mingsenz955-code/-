import {SPECIES} from './data.mjs';
import {dragonArt} from './art.mjs';
import {renderSourceLayout} from './source-layout.mjs';
import {ownedDragons,dragonElements,ELEMENT_FILTERS} from './collection.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={all:'全部',e:'岩土',f:'烈火',w:'深水',p:'植物',el:'闪电',i:'寒冰',m:'钢铁',d:'暗影',l:'传奇'};
let layouts;const scrollPositions=new Map();
export function rememberCollectionScroll(){const dialog=document.querySelector('#modal'),list=dialog.querySelector('.source-collection-list');if(list)scrollPositions.set(dialog.dataset.elementFilter,list.scrollLeft)}
export async function openCollectionDialog(state,filter='all'){
 const dragons=ownedDragons(state,filter);layouts??=Promise.all(['ui_mydragon','item_mydragon'].map(name=>fetch(`assets/original/layouts/${name}.json`).then(r=>r.json())));const [layout,item]=await layouts;
 const cards=dragons.map(d=>{const sp=SPECIES[d.species],elements=dragonElements(d.species),slots={icon_dragon:`<div class="source-card-model">${dragonArt(d.species,'',d.level)}</div>`,element:`<div class="source-card-elements">${elements.map(e=>`<img src="assets/original/ui/shangcheng_long_shuxing_${e}.png" alt="${labels[e]??e}">`).join('')}</div>`};return `<button class="source-dragon-card" data-action="collectionSelect" data-id="${d.id}" aria-label="${escape(sp.name)} Lv.${d.level}"><div class="source-card-board">${renderSourceLayout(item,{values:{dragon_name:sp.name,dragon_name_shadow:sp.name,level:d.level},slots})}${!sp.originalId?'<span class="source-legacy-card">旧版保留龙</span>':''}</div></button>`}).join('');
 const list=layout.children.find(n=>n.name==='huadong');const slots={huadong:`<div class="source-collection-list" style="width:${list.width}px;height:${list.height}px">${cards||'<p class="source-collection-empty">暂无此属性的龙</p>'}</div>`};
 const actions={close:{type:'close',label:'关闭我的龙'},fanhui:{type:'close',label:'返回牧场'}};
 for(const value of ELEMENT_FILTERS)actions['longzuleixing/'+value]={type:'collectionFilter',value,label:labels[value]};
 const dialog=document.querySelector('#modal');if(dialog.open)dialog.close();dialog.className='source-dragon-dialog source-collection-dialog';dialog.dataset.mode='sourceCollection';dialog.dataset.elementFilter=filter;dialog.style.setProperty('--source-scale',Math.min((innerWidth-20)/1024,(innerHeight-20)/768));dialog.innerHTML=`<div class="source-artboard">${renderSourceLayout(layout,{values:{txt_name:'我的龙'},slots,actions,checked:new Set(['longzuleixing/'+filter])})}</div>`;dialog.showModal();dialog.querySelector('.source-collection-list').scrollLeft=scrollPositions.get(filter)??0;
}
