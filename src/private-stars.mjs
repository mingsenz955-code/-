// Explicit player-requested sandbox override. Never granted by normal gameplay.
// These values are not original-client ten-star equipment/awakening data.
export const PRIVATE_TEN_STAR_POLICY='private-proportional-ten-star-v1';
export const privateTenStars=item=>item?.privateStars===PRIVATE_TEN_STAR_POLICY;
export function privateEquipmentRow(item,definition,native){
 if(!privateTenStars(item)||item.star!==10)return null;
 const cap=native?.star||5,ratio=10/cap;
 const row={...(native??{}),star:10,expCost:-1,expHave:native?.expHave??0,cost:0,privatePolicy:PRIVATE_TEN_STAR_POLICY};
 for(const [base,bonus]of [['atk','atkAdd'],['def','defAdd'],['hp','hpAdd'],['resist','uncritAdd'],['antResist','critAdd']])row[bonus]=Math.floor(((definition[base]??0)+(native?.[bonus]??0))*ratio)-(definition[base]??0);
 return row;
}
