import {SPECIES,speciesKey} from './data.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {dragonAttributes,dragonPower} from './battle.mjs';
import {dragonRate} from './game.mjs';
import {dragonArt} from './art.mjs';
import {sourceLayout,showSource,esc} from './ranch-dialogs.mjs';
import {renderSourceLayout} from './source-layout.mjs';
export async function openCatalogDetail(state,id){
 const record=CATALOG.find(d=>d.id===id);if(!record)throw Error('龙族资料不存在。');
 const species=speciesKey(id),owned=state.dragons.filter(d=>d.species===species).sort((a,b)=>b.level-a.level)[0],dragon=owned??{id:0,species,level:1},stats=dragonAttributes(dragon,owned?state:null),layout=await sourceLayout('ui_dragon'),values={txt_name:'龙族图鉴',txt_dragonname:record.name,long_name:record.name,zhongzu:'种族：',xingji:'类型：',xibie:SPECIES[species].rarity,shuxing:'属性：',chanchu:'产出：','ziyuanchanchu/gold':dragonRate(dragon)+'/分钟','ziyuanchanchu/baifenbi':'',lv_miaoshu:'等级：',teshumiaoshu:owned?'已拥有 · 当前养成属性':'未拥有 · Lv.1 基础属性','yidong/txt_name':'获取途径','chushou/txt_name':'返回图鉴'};
 for(const [key,label,value] of [['shengming','生命',stats?.life],['gongji','攻击',stats?.attack],['fangyu','防御',stats?.defend],['kangxing','免暴',stats?.uncrit],['baoji','暴击',stats?.crit],['pingding','战斗力',dragonPower(dragon,owned?state:null)]]){values[key+'/miaoshu']=label+'：';values[key+'/shuzi']=value??'—';values[key+'/fujia']=''}
 layout.children=layout.children.filter(n=>!(n.type==='node'&&!n.name)&&!(n.type==='sprite'&&!n.name&&n.y>260&&n.y<300&&n.x<0));
 const slots={icon:`<div class="source-dragon-model">${dragonArt(species,'',dragon.level)}</div>`,lv:`<span class="source-level">Lv.${dragon.level}</span>`};for(let i=1;i<=3;i++)slots['con_shuxing'+i]=record.original.attributes[i-1]?`<img class="source-element" src="assets/original/ui/shangcheng_long_shuxing_${record.original.attributes[i-1]}.png" alt="${esc(SPECIES[species].element)}">`:'';
 const d=showSource('sourceCatalogDetail',renderSourceLayout(layout,{values,slots,hidden:new Set(['weishi','weishi_vip','evolution_entry','evolution_entry_di','jindu','btn_ShiWu','txt_ShiWu','skill1','skill2','skill3','skill4']),actions:{close:{type:'returnCatalog',label:'返回图鉴'},'chushou/btn':{type:'returnCatalog',label:'返回图鉴'},'yidong/btn':{type:'acquisition',id,label:'获取途径'}}}));d.dataset.catalogId=String(id);
}
