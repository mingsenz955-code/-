import {createEquipmentInstance} from './equipment.mjs';
import {mailEquipmentTypes} from './update-gifts.mjs';
export const BOSS_CELEBRATION=Object.freeze({
 id:'celebration-linhaoran-boss-20261018',version:'0.16.72',title:'庆祝林皓然击败世界Boss',sender:'御龙高手',
 content:'为庆祝林皓然成功击败一次世界Boss，向所有更新游戏的玩家发放：冰域皇龙蛋15颗、一套满级橙色装备、一套满级红色符文。每份存档仅可领取一次。橙装为六部位强化+99、五星；红色符文为攻击、特技、属性·天、属性·地各1枚，均10级。',
 dragonId:1201,amount:15,equipmentSets:1,equipmentQuality:5,equipmentGrade:100,equipmentStar:5,
 runeTypes:[60110,60210,60310,60410],campaign:true,
});
export function deliverCampaignGift(s,mail=BOSS_CELEBRATION){
 const stack=s.giftEggs.find(e=>e.dragonId===mail.dragonId&&e.source==='activity'&&(e.quantity??1)+mail.amount<=999999);
 if(!stack&&s.giftEggs.length>=200)throw Error('龙蛋仓库已满，请腾出位置后领取，邮件会保留。');
 if(s.equipment.length+6>2000)throw Error('装备背包空间不足，请腾出位置后领取。');
 if(s.runes.length+mail.runeTypes.length>500)throw Error('符文背包已满，请腾出位置后领取。');
 const gear=mailEquipmentTypes(mail).map((type,i)=>({...createEquipmentInstance(`eq-${s.nextEquipId+i}`,type),star:mail.equipmentStar}));
 const runes=mail.runeTypes.map((type,i)=>({id:`fw-${s.nextRuneId+i}`,type,exp:0,dragonid:0}));
 if(stack)stack.quantity=(stack.quantity??1)+mail.amount;else s.giftEggs.push({id:s.nextId++,dragonId:mail.dragonId,quantity:mail.amount,source:'activity'});
 s.equipment.push(...gear);s.nextEquipId+=gear.length;s.runes.push(...runes);s.nextRuneId+=runes.length;
}
