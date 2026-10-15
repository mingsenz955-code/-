import CATALOG from '../assets/original/catalog.mjs';
export const ANCIENT_EGGS=Object.freeze(CATALOG.filter(d=>d.name.startsWith('远古')).map(d=>Object.freeze({dragonId:d.id,name:d.name,quality:d.extended.quality})));
// Explicit player gift, separate from lottery pools/probabilities and progression.
export function grantAncientEggs(state){
 state.giftEggs??=[];state.userGrants??={};const key='ancient-eggs-20261015';if(state.userGrants[key])return [];
 const eggs=ANCIENT_EGGS.map(d=>({id:state.nextId++,dragonId:d.dragonId,quality:d.quality,source:'user-request'}));state.giftEggs.push(...eggs);state.userGrants[key]=eggs.map(e=>e.dragonId);return eggs;
}
