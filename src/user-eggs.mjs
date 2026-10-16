import CATALOG from '../assets/original/catalog.mjs';
export const ANCIENT_EGGS=Object.freeze(CATALOG.filter(d=>d.name.startsWith('远古')).map(d=>Object.freeze({dragonId:d.id,name:d.name,quality:d.extended.quality})));
// Explicit player gift, separate from lottery pools/probabilities and progression.
export function grantAncientEggs(state){
 state.giftEggs??=[];state.userGrants??={};const key='ancient-eggs-20261015';if(state.userGrants[key])return [];
 const eggs=ANCIENT_EGGS.map(d=>({id:state.nextId++,dragonId:d.dragonId,quality:d.quality,source:'user-request'}));state.giftEggs.push(...eggs);state.userGrants[key]=eggs.map(e=>e.dragonId);return eggs;
}

export const RARE_EGGS=Object.freeze(CATALOG.filter(d=>/^(神圣|远古)/.test(d.name)).map(d=>Object.freeze({dragonId:d.id,name:d.name,quality:d.extended.quality})));
export const eggQuantity=egg=>egg.quantity??1;
export function consumeEgg(eggs,id){return eggs.flatMap(e=>e.id!==id?[e]:eggQuantity(e)>1?[{...e,quantity:eggQuantity(e)-1}]:[])}
export function grantRareEggStock(state,target=99){
 if(!Number.isSafeInteger(target)||target<1||target>999999)throw Error('龙蛋目标数量无效。');
 state.giftEggs??=[];const added=[];
 for(const d of RARE_EGGS){const owned=[...state.giftEggs,...(state.raffle?.pending??[])].filter(e=>e.dragonId===d.dragonId).reduce((n,e)=>n+eggQuantity(e),0),quantity=Math.max(0,target-owned);if(quantity){state.giftEggs.push({id:state.nextId++,dragonId:d.dragonId,quality:d.quality,source:'user-request',quantity});added.push({...d,quantity});}}
 return added;
}
