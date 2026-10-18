import {equipmentCatalog} from './equipment.mjs';
export const RED_RUNE_BOX=990071,ORANGE_SET_BOX=990072;
export const COMPENSATION_PROPS=[
 {id:RED_RUNE_BOX,name:'红色符文随机宝箱',quality:6,image:'thumbs_fuwen_fuwen106.png',description:'开启随机获得攻击、特技、属性·天、属性·地四类红色符文之一，各25%，初始1级。'},
 {id:ORANGE_SET_BOX,name:'橙色装备套装随机宝箱',quality:5,image:'thumbs_equip_5_0.png',description:'开启获得六部位橙色装备各1件，各部位从原装备目录独立等概率抽取，初始强化与星级。'},
];
// User-defined update compensation, not an original event or original probability.
export const compensationBox=id=>COMPENSATION_PROPS.find(p=>p.id===Number(id))??null;
export function compensationRewards(id,count,random=Math.random){
 const pick=list=>{const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('宝箱随机数无效。');return list[Math.floor(n*list.length)];};
 const result=[];for(let i=0;i<count;i++){
  if(id===RED_RUNE_BOX)result.push({type:29,itemId:pick([60101,60201,60301,60401]),amount:1});
  else if(id===ORANGE_SET_BOX)for(let part=0;part<6;part++)result.push({type:8,itemId:pick(equipmentCatalog({part,quality:5,grade:1})).id,amount:1});
  else throw Error('补偿宝箱不存在。');
 }return result;
}
