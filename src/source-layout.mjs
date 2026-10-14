import UI_SIZES from '../assets/original/data/ui-sizes.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Cocos labels and nine-slice sprites use a left anchor; regular sprites/buttons
// use the center anchor. Child node positions are local to their parent origin.
export function renderSourceLayout(layout,{values={},slots={},actions={},hidden=new Set(),disabled=new Set(),progress={},checked=new Set()}={}){
 const render=(n,path='',root=false)=>{if(!n.name&&n.type==='btn')return '';const key=path?path+'/'+(n.name??''):n.name??'';if(hidden.has(key)||hidden.has(n.name))return '';const x=n.x??0,y=n.y??0,w=n.width??0,h=n.height??0,origin=root?'calc(50% + ':'',left=root?`${origin}${x}px)`:`${x}px`,top=root?`calc(50% - ${y}px)`:`${-y}px`,point=`left:${left};top:${top};`,img=n.type==='ckb'?(checked.has(key)?n.img_on:n.img_off):n.img??n.img_normal;
  if(Object.hasOwn(slots,key))return `<div class="source-node" style="${point}">${slots[key]}</div>`;
  if(n.type==='label'){const color=(Number(n.color??0xffffffff)>>>8).toString(16).padStart(6,'0'),text=values[key]??values[n.name]??n.text??'';return `<span class="source-label" data-source="${escape(key)}" style="${point}width:${w}px;height:${h}px;font-size:${n.size??23}px;color:#${color};text-align:${n.align==='justify'?'left':n.align??'left'}">${escape(text)}</span>`}
  if(n.type==='btn'||n.type==='ckb'){const action=actions[key]??actions[n.name],isDisabled=!action||disabled.has(key)||disabled.has(n.name);return `<button class="source-button" style="${point}width:${w||UI_SIZES[img?.replace(/^#/,'')]?.[0]||85}px;height:${h||UI_SIZES[img?.replace(/^#/,'')]?.[1]||85}px" ${action?`data-action="${escape(action.type)}" data-id="${action.id??''}" data-value="${escape(action.value??'')}"`:''} ${isDisabled?'disabled':''} aria-pressed="${checked.has(key)}" aria-label="${escape(action?.label??n.name??'未开放功能')}">${img?`<img src="assets/original/ui/${escape(img.replace(/^#/,''))}" alt="">`:''}</button>`}
  if(img){const p=progress[key],clip=p===undefined?'':`clip-path:inset(0 ${100-p}% 0 0);`;if(n.scale9)return `<span class="source-nine" style="${point}width:${w}px;height:${h}px;border-image-source:url('assets/original/ui/${escape(img.replace(/^#/,''))}');${clip}" data-source="${escape(key)}"></span>`;return `<img class="source-sprite" style="${point}width:${w}px;height:${h}px;${clip}" src="assets/original/ui/${escape(img.replace(/^#/,''))}" alt="">`}
  const children=(n.children??[]).map(child=>render(child,key,false)).join('');return `<div class="source-node" data-source="${escape(key)}" style="${point}">${children}</div>`;
 };
 return layout.children.map(n=>render(n,'',true)).join('');
}
