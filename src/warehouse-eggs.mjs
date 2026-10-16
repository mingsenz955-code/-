import {SPECIES,speciesKey} from './data.mjs';
export const eggQuality=egg=>egg.quality??SPECIES[speciesKey(egg.dragonId)]?.quality;
export function eggSalePlan(s,quality){if(!Number.isInteger(quality)||quality<1||quality>5)throw Error('请选择1至5品质的龙蛋。');const eggs=[...s.raffle.pending,...s.giftEggs].filter(e=>eggQuality(e)===quality);const ids=eggs.map(e=>e.id),gold=eggs.reduce((n,e)=>{const value=SPECIES[speciesKey(e.dragonId)]?.sellGold;if(!Number.isSafeInteger(value)||value<0)throw Error('该龙蛋的原版出售价格尚未取得。');return n+value;},0);return {quality,ids,gold,count:ids.length};}
