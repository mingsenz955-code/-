import {RESOURCE_SHOP_OFFERS} from './resource-shop.mjs';

export const RESOURCE_BAR_ACTIONS=Object.freeze({
 btn_JinBi:{type:'resourceBarGold',label:'获取金币'},
 btn_MoJing:{type:'resourceBarGems',label:'获取魔晶'},
 btn_LongHun:{type:'resourceBarSouls',label:'获取龙魂'},
});
export const resourceAmount=n=>n>=1e8?(n/1e8).toFixed(1).replace(/\.0$/,'')+'亿':n>=1e6?(n/1e4).toFixed(1).replace(/\.0$/,'')+'万':n.toLocaleString('zh-CN');
export function resourceBarLayout(layout){const copy=structuredClone(layout),i=copy.children.findIndex(n=>n.name==='txt_LongHun');if(i>=0&&!copy.children.some(n=>n.name==='resource_souls_bg')){
 copy.children.splice(i,0,{name:'resource_souls_bg',type:'sprite',img:'#ui_main_pbar_bg2.png',scale9:1,x:236.55,y:270.5,width:114,height:46},{name:'resource_souls_icon',type:'sprite',img:'#resource_icon_80_h.png',x:235.15,y:269.5,width:60,height:60});
 }return copy;}
export function resourceBarValues(s){
 const souls=(s.activities?.history?.inventory?.['7:-1']??0)+RESOURCE_SHOP_OFFERS.filter(r=>r.type==='h').reduce((n,r)=>n+(s.shopInventory?.[r.id]??0),0);
 return {txt_JinBi:resourceAmount(s.coins),txt_MoJing:resourceAmount(s.gems),txt_LongHun:resourceAmount(souls)};
}
