import {playerProgress} from './game.mjs';
import layout from '../assets/original/layout-main.mjs';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LABELS={btn_RenWU:'任务',btn_pickAll:'收金币',btn_GengDuo:'更多',btn_ZhanDou:'战斗',btn_YouJian:'邮件',btn_TuJian:'图鉴',btn_NiuDanJi:'扭蛋机',btn_mydragon:'我的龙族',btn_YuLong:'育龙',btn_ShangDian:'商店',btn_ZhuangBei:'装备',btn_FuWen:'符文',btn_CangKu:'仓库',btn_Rank:'排行',btn_BaoShi:'宝石',btn_BuZhen:'布阵',btn_Guild:'公会',btn_SheZhi:'设置',btn_firstrecharge:'首充',btn_welfare:'福利中心',btn_Huodongzhongxin:'限时活动',btn_dafuweng:'大富翁'};
const ACTIONS={btn_RenWU:'showTasks',btn_pickAll:'collectAll',btn_GengDuo:'showMore',btn_ZhanDou:'battlePlanned',btn_YouJian:'unavailable',btn_recharge:'unavailable',btn_TuJian:'openOriginal',btn_NiuDanJi:'lotteryOptions',btn_mydragon:'openMyDragons',btn_YuLong:'openBreed',btn_ShangDian:'openHabitats',btn_SheZhi:'settings',btn_ZhuangBei:'unavailable',btn_FuWen:'unavailable',btn_CangKu:'unavailable',btn_Rank:'unavailable',btn_BaoShi:'unavailable',btn_BuZhen:'unavailable',btn_Guild:'unavailable',btn_firstrecharge:'unavailable',btn_welfare:'unavailable',btn_Huodongzhongxin:'unavailable',btn_dafuweng:'unavailable'};
// Coordinates and dimensions below come directly from the client's ui_main table.
// Font rasterization and anchor adaptation still require comparison at matching resolution.
export function originalHud(state,{expanded=false}={}){
 const scale=Math.min(innerWidth/layout.width,innerHeight/layout.height),rootWidth=innerWidth/scale,rootHeight=innerHeight/scale;
 const progress=playerProgress(state);
 const values={txt_JinBi:state.coins.toLocaleString('zh-CN'),txt_ShiWu:state.food.toLocaleString('zh-CN'),txt_MoJing:String(state.gems??0),txt_exp:progress.percent+'%',txt_level:String(progress.level),player_name:'御龙高手',power:'0',vip_num:'0'};
 const render=(node,root=false)=>{
  if(node.name==='act_btn')node={...node,children:node.children.filter(n=>['btn_firstrecharge','btn_welfare','btn_Huodongzhongxin','btn_dafuweng'].includes(n.name))};
  if(['bubble','label','label_good','go1','go2','new','pbar_exp','vip','power'].includes(node.name))return '';
  const w=node.width??0,h=node.height??0;let x=node.x??0,y=node.y??0;
  if(root){
   if(node.left!==undefined)x=node.left+w/2-rootWidth/2;
   else if(node.right!==undefined)x=rootWidth/2-node.right-w/2;
   if(node.top!==undefined)y=rootHeight/2-node.top-h/2;
   else if(node.bottom!==undefined)y=-rootHeight/2+node.bottom+h/2;
   if(['btn_TuJian','btn_NiuDanJi','btn_ZhuangBei','btn_FuWen','btn_YuLong','btn_CangKu','btn_Rank','btn_BaoShi','btn_BuZhen','btn_Guild'].includes(node.name)){x+=(rootWidth-layout.width)/2;y-=(rootHeight-layout.height)/2;}
   if(node.name==='btn_ZhanDou'){x=-rootWidth/2+w/2+(layout.width/2+node.x-w/2);y=-rootHeight/2+h/2+(layout.height/2+node.y-h/2);}
  }
  let style=`width:${w}px;height:${h}px;left:calc(50% + ${x}px);top:calc(50% - ${y}px);`;
  const image=node.img||node.img_normal;
  if(image&&ACTIONS[node.name])return `<button class="hud-node hud-clickable" style="${style}" data-action="${ACTIONS[node.name]}" aria-label="${LABELS[node.name]??'未开放入口'}"><img src="assets/original/ui/${escape(image.replace(/^#/,''))}" style="width:100%;height:100%" alt=""></button>`;
  if(image){const file=image.replace(/^#/,'');if(node.scale9)return `<div class="hud-nine" style="width:184px;height:${h}px;left:50%;top:calc(50% - ${y}px);border-image-source:url('assets/original/ui/${escape(file)}')"></div>`;return `<img class="hud-part" style="${style}" src="assets/original/ui/${escape(file)}" alt="">`;}
  if(node.type==='label'){
   const text=values[node.name]??node.text??'';
   const color=Number(node.color??0xffffffff),rgb=(color>>>8).toString(16).padStart(6,'0');
   return `<span class="hud-text" style="${style}font-size:${node.size??20}px;color:#${rgb};text-align:${node.align??'left'};">${escape(text)}</span>`;
  }
  const label=LABELS[node.name],act=ACTIONS[node.name];
  const children=(node.children??[]).map(child=>render(child)).join('');
  const caption=node.children?.find(child=>child.name==='con_name');
  const activity=['btn_firstrecharge','btn_welfare','btn_Huodongzhongxin','btn_dafuweng'].includes(node.name);
  const text=label&&(!activity||node.name==='btn_Huodongzhongxin')?`<span class="hud-caption ${activity?'hud-activity-caption':''}" style="left:calc(50% + ${caption?.x??0}px);top:calc(50% - ${caption?.y??(activity?-40:0)}px)">${label}</span>`:'';
  const portrait=node.name==='icon'?'<img class="hud-avatar" src="assets/original/ui/thumbs_1020_dragon_fire_a_1.png" alt="御龙高手头像">':'';
  return `<${act?'button':'div'} class="hud-node ${act?'hud-clickable':''}" style="${style}" ${act?`data-action="${act}" aria-label="${label}"`:''}>${children}${text}${portrait}</${act?'button':'div'}>`;
 };
 const chosen=['level','gold','food','gem','btn_RenWU','btn_YouJian','btn_pickAll','btn_GengDuo','btn_ZhanDou','btn_recharge',...(!expanded?['act_btn']:[]),...(expanded?['btn_TuJian','btn_NiuDanJi','btn_mydragon','btn_YuLong','btn_ShangDian','btn_SheZhi','btn_ZhuangBei','btn_FuWen','btn_CangKu','btn_Rank','btn_BaoShi','btn_BuZhen','btn_Guild']:[])];
 return `<div class="original-hud" style="width:${rootWidth}px;height:${rootHeight}px;--hud-scale:${scale}">${layout.children.filter(n=>chosen.includes(n.name)).map(n=>render(n,true)).join('')}</div>`;
}
