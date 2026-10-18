import {createEquipmentInstance,equipmentCatalog} from './equipment.mjs';
import CATALOG from '../assets/original/catalog.mjs';
export const MUTANT_MAIL_POOL=CATALOG.filter(d=>d.id>=2000&&d.extended.baseID>0).map(d=>d.id);
export const UPDATE_MAIL_V69=Object.freeze({id:'update-0.16.69',version:'0.16.69',title:'版本更新礼包',sender:'御龙高手',content:'更新附件：随机变异龙蛋1颗、棒棒糖龙蛋1颗、100000魔晶、一套紫色装备（六部位，初始强化与星级）。随机龙蛋从已收录10种变异龙等概率抽取，领取后确定并保存。',dragonId:1204,amount:1,gems:100000,equipmentSets:1,equipmentQuality:4,equipmentGrade:1,equipmentStar:0,randomMutant:true});
export function deliverLatestMail(s,mail,random=Math.random){
 const roll=random();if(!Number.isFinite(roll)||roll<0||roll>=1)throw Error('随机数无效。');
 const dragonId=MUTANT_MAIL_POOL[Math.floor(roll*MUTANT_MAIL_POOL.length)];
 const eggs=structuredClone(s.giftEggs);let nextId=s.nextId;
 for(const id of [dragonId,1204]){const stack=eggs.find(e=>e.dragonId===id&&e.source==='activity'&&(e.quantity??1)<999999);if(stack)stack.quantity=(stack.quantity??1)+1;else eggs.push({id:nextId++,dragonId:id,quantity:1,source:'activity'});}
 if(eggs.length>200)throw Error('仓库龙蛋已满，请腾出位置后领取，邮件会保留。');
 if(s.equipment.length+6>2000)throw Error('装备背包空间不足，请腾出位置后领取，邮件会保留。');
 const gear=mailEquipmentTypes(mail).map((type,i)=>createEquipmentInstance(`eq-${s.nextEquipId+i}`,type));
 s.giftEggs=eggs;s.nextId=nextId;s.gems+=mail.gems;s.equipment.push(...gear);s.nextEquipId+=6;
 s.mail.randomEggs??={};s.mail.randomEggs[mail.id]=dragonId;return dragonId;
}
export const UPDATE_MAIL_V68=Object.freeze({id:'update-0.16.68',version:'0.16.68',title:'冒险修复与养成礼包',sender:'御龙高手',content:'本次更新修复冒险地图重叠，加入购买体力并调整中央首领。附件：2000魔晶、棒棒糖龙蛋1颗、六套满级橙色装备（共36件，强化+99、五星）。领取后分别进入资源、龙蛋仓库和装备背包。',dragonId:1204,amount:1,gems:2000,equipmentSets:6});
export const mailEquipmentTypes=(mail={})=>Array.from({length:6},(_,part)=>equipmentCatalog({part,quality:mail.equipmentQuality??5,grade:mail.equipmentGrade??100}).sort((a,b)=>a.id-b.id)[0].id);
export function deliverUpdateMail(s,mail){const stack=s.giftEggs.find(e=>e.dragonId===mail.dragonId&&e.source==='activity'&&(e.quantity??1)<999999);if(!stack&&s.giftEggs.length>=200)throw Error('仓库龙蛋已满，请腾出位置后领取，邮件会保留。');if(s.equipment.length+(mail.equipmentSets??0)*6>2000)throw Error('装备背包空间不足，请腾出位置后领取，邮件会保留。');if(stack)stack.quantity=(stack.quantity??1)+1;else s.giftEggs.push({id:s.nextId++,dragonId:mail.dragonId,quantity:1,source:'activity'});s.gems+=mail.gems??0;for(let i=0;i<(mail.equipmentSets??0);i++)for(const type of mailEquipmentTypes())s.equipment.push({...createEquipmentInstance(`eq-${s.nextEquipId++}`,type),star:5});}
