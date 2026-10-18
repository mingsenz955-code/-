import {createEquipmentInstance} from './equipment.mjs';
import {mailEquipmentTypes} from './update-gifts.mjs';
import {RULES} from './data.mjs';
import {acceptsDragon,habitatInfo} from './habitats.mjs';
export const FARM_FIX_GIFT=Object.freeze({
 id:'update-0.16.73',version:'0.16.73',title:'农场修复更新礼物',sender:'御龙高手',campaign:true,adultDragon:true,
 content:`附件：满级${RULES.maxLevel}级、五星棒棒糖龙1条，已穿戴六部位满强化+99五星橙装和四类10级红符文。棒棒糖龙原表没有觉醒配置，使用原表五星上限。龙巢满时成品龙先存仓库待安置，装备与符文先入背包，安置后自动穿戴仍闲置的配套物品。每份存档仅可领取一次。`,
 dragonId:1204,amount:1,equipmentSets:1,equipmentQuality:5,equipmentGrade:100,equipmentStar:5,runeTypes:[60110,60210,60310,60410],
});
export const BOSS_CELEBRATION=Object.freeze({
 id:'celebration-linhaoran-boss-20261018',version:'0.16.72',title:'庆祝林皓然击败世界Boss',sender:'御龙高手',
 content:'为庆祝林皓然成功击败一次世界Boss，向所有更新游戏的玩家发放：冰域皇龙蛋15颗、一套满级橙色装备、一套满级红色符文。每份存档仅可领取一次。橙装为六部位强化+99、五星；红色符文为攻击、特技、属性·天、属性·地各1枚，均10级。',
 dragonId:1201,amount:15,equipmentSets:1,equipmentQuality:5,equipmentGrade:100,equipmentStar:5,
 runeTypes:[60110,60210,60310,60410],campaign:true,
});
export function deliverCampaignGift(s,mail=BOSS_CELEBRATION){
 if(mail.adultDragon){
  const species='original1204',h=s.habitats.find(h=>acceptsDragon(h,species)&&s.dragons.filter(d=>d.habitatId===h.id).length<habitatInfo(h).capacity);
  if(!h&&(s.giftDragons??[]).length>=200)throw Error('成品龙待安置仓库已满，请先安置后领取。');
  if(s.equipment.length+6>2000)throw Error('装备背包空间不足，请腾出位置后领取。');
  if(s.runes.length+4>500)throw Error('符文背包已满，请腾出位置后领取。');
  const id=s.nextId,gear=mailEquipmentTypes(mail).map((type,i)=>({...createEquipmentInstance(`eq-${s.nextEquipId+i}`,type),star:5,dragonid:id}));
  const runes=mail.runeTypes.map((type,i)=>({id:`fw-${s.nextRuneId+i}`,type,exp:0,dragonid:id}));
  if(h)s.dragons.push({id,species,level:RULES.maxLevel,star:5,starExp:0,habitatId:h.id});
  else{for(const v of [...gear,...runes])v.dragonid=0;(s.giftDragons??=[]).push({id,itemId:1204,type:16,amount:1,gift:mail.id,level:RULES.maxLevel,star:5,equipmentIds:gear.map(v=>v.id),runeIds:runes.map(v=>v.id)});}s.nextId++;
  s.equipment.push(...gear);s.nextEquipId+=6;s.runes.push(...runes);s.nextRuneId+=4;return;
 }
 const stack=s.giftEggs.find(e=>e.dragonId===mail.dragonId&&e.source==='activity'&&(e.quantity??1)+mail.amount<=999999);
 if(!stack&&s.giftEggs.length>=200)throw Error('龙蛋仓库已满，请腾出位置后领取，邮件会保留。');
 if(s.equipment.length+6>2000)throw Error('装备背包空间不足，请腾出位置后领取。');
 if(s.runes.length+mail.runeTypes.length>500)throw Error('符文背包已满，请腾出位置后领取。');
 const gear=mailEquipmentTypes(mail).map((type,i)=>({...createEquipmentInstance(`eq-${s.nextEquipId+i}`,type),star:mail.equipmentStar}));
 const runes=mail.runeTypes.map((type,i)=>({id:`fw-${s.nextRuneId+i}`,type,exp:0,dragonid:0}));
 if(stack)stack.quantity=(stack.quantity??1)+mail.amount;else s.giftEggs.push({id:s.nextId++,dragonId:mail.dragonId,quantity:mail.amount,source:'activity'});
 s.equipment.push(...gear);s.nextEquipId+=gear.length;s.runes.push(...runes);s.nextRuneId+=runes.length;
}
