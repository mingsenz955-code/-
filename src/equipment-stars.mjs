import rows from '../assets/original/data/equipment-stars.mjs';
import {privateTenStars,privateEquipmentRow} from './private-stars.mjs';
import {equipmentDefinition,equipmentInstance} from './equipment.mjs';
export const EQUIPMENT_STAR_POLICY='offline-source-equipment-star-v1';
const lookup=new Map(rows.map(r=>[`${r.equipIDFix}:${r.quality}:${r.part}:${r.star}`,Object.freeze(r)]));
export function equipmentStarRow(item,star=item?.star??0){const d=equipmentDefinition(item?.type);if(!d)return null;const key=`${String(d.id).slice(0,3)}:${d.quality}:${d.part}:`;if(privateTenStars(item)&&star===10){const native=rows.filter(r=>`${r.equipIDFix}:${r.quality}:${r.part}:`===key).at(-1);return privateEquipmentRow(item,d,native)}return lookup.get(key+star)??null}
export function equipmentStarMaterialError(target,material){
 const a=equipmentDefinition(target?.type),b=equipmentDefinition(material?.type);
 if(!a||!equipmentStarRow(target))return '只有蓝色及以上装备可以升星。';
 if(!b||!equipmentStarRow(material))return '材料装备无法用于升星。';
 if(target.id===material.id)return '不能吞噬正在升星的装备。';
 if(material.dragonid)return '请先卸下材料装备。';
 if(a.quality!==b.quality)return '请选择相同品质的装备。';
 if(a.part<4?b.part>=4:a.part!==b.part)return '羽翼和皇冠只能吞噬同部位装备。';
 return '';
}
export function equipmentStarPlan(state,id,ids=[]){
 const item=equipmentInstance(state,id),current=equipmentStarRow(item);
 if(!item||!current)throw Error('只有蓝色及以上装备可以升星。');
 if(!Array.isArray(ids)||ids.length>5||new Set(ids).size!==ids.length)throw Error('一次最多选择五件不同的材料装备。');
 if(current.expCost===-1&&ids.length)throw Error('已达到最高星级。');
 let gained=0;
 for(const mid of ids){const material=equipmentInstance(state,mid),error=equipmentStarMaterialError(item,material);if(error)throw Error(error);gained+=equipmentStarRow(material).expHave}
 let exp=item.exp+gained,star=item.star,row=current;
 while(row.expCost>0&&exp>=row.expCost){const next=equipmentStarRow(item,star+1);if(!next)throw Error('缺少下一星级数据。');exp-=row.expCost;row=next;star++}
 return {star,exp,gained,cost:current.cost*ids.length,current,next:row,ids:[...ids],policy:EQUIPMENT_STAR_POLICY};
}
