import layout from '../assets/original/layout-main.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LABELS={btn_RenWU:'任务',btn_pickAll:'收金币',btn_GengDuo:'更多',btn_ZhanDou:'战斗',btn_YouJian:'邮件'};
const ACTIONS={btn_RenWU:'showTasks',btn_pickAll:'collectAll',btn_GengDuo:'showMore',btn_ZhanDou:'battlePlanned'};
// Coordinates and dimensions below come directly from the client's ui_main table.
// Font rasterization and anchor adaptation still require comparison at matching resolution.
export function originalHud(state){
 const values={txt_JinBi:state.coins.toLocaleString('zh-CN'),txt_ShiWu:state.food.toLocaleString('zh-CN'),txt_MoJing:String(state.gems??0),txt_exp:'0%',txt_level:'1',player_name:'御龙高手',power:'0',vip_num:'0'};
 const render=(node,root=false)=>{
  if(['bubble','label','label_good','go1','go2','new','pbar_exp','vip','power'].includes(node.name))return '';
  const w=node.width??0,h=node.height??0,x=node.x??0,y=node.y??0;
  let style=`width:${w}px;height:${h}px;left:calc(50% + ${x}px);top:calc(50% - ${y}px);`;
  const image=node.img||node.img_normal;
  if(image){const file=image.replace(/^#/,'');if(node.scale9)return `<div class="hud-nine" style="width:184px;height:${h}px;left:50%;top:calc(50% - ${y}px);border-image-source:url('assets/original/ui/${escape(file)}')"></div>`;return `<img class="hud-part" style="${style}" src="assets/original/ui/${escape(file)}" alt="">`;}
  if(node.type==='label'){
   const text=values[node.name]??node.text??'';
   const color=Number(node.color??0xffffffff),rgb=(color>>>8).toString(16).padStart(6,'0');
   return `<span class="hud-text" style="${style}font-size:${node.size??20}px;color:#${rgb};text-align:${node.align??'left'};">${escape(text)}</span>`;
  }
  const label=LABELS[node.name],act=ACTIONS[node.name];
  const children=(node.children??[]).map(child=>render(child)).join('');
  const caption=node.children?.find(child=>child.name==='con_name');
  const text=label?`<span class="hud-caption" style="left:calc(50% + ${caption?.x??0}px);top:calc(50% - ${caption?.y??0}px)">${label}</span>`:'';
  const portrait=node.name==='icon'?'<img class="hud-avatar" src="assets/original/ui/thumbs_1020_dragon_fire_a_1.png" alt="御龙高手头像">':'';
  return `<${act?'button':'div'} class="hud-node ${act?'hud-clickable':''}" style="${style}" ${act?`data-action="${act}" aria-label="${label}"`:''}>${children}${text}${portrait}</${act?'button':'div'}>`;
 };
 const chosen=['level','gold','food','gem','btn_RenWU','btn_pickAll','btn_GengDuo','btn_ZhanDou'];
 const scale=Math.min(innerWidth/layout.width,innerHeight/layout.height);
 return `<div class="original-hud" style="width:${layout.width}px;height:${layout.height}px;--hud-scale:${scale}">${layout.children.filter(n=>chosen.includes(n.name)).map(n=>render(n,true)).join('')}</div>`;
}
