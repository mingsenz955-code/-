import {ORIGINAL_RECHARGE_TIERS} from '../assets/original/data/recharge.mjs';

// The client's own single-purchase tiers, taken straight from LibDanbichongzhiInfo (all
// seventeen columns are defined, so nothing here is inferred). The real payment path is
// deliberately NOT implemented: this build grants a tier for free and labels itself as a
// test build, which is what the user asked for. Nothing pretends to charge money.
export const RECHARGE_TEST_MODE=true;
export const RECHARGE_NOTICE='测试模式：点击即到账，不进行任何真实扣款。';
export const RECHARGE_TICKET_IDS=Object.freeze([6047,6048,6049]);
export const RECHARGE_TIERS=Object.freeze(ORIGINAL_RECHARGE_TIERS.map(tier=>Object.freeze({
 id:tier.id,costYuan:tier.costYuan,costIOS:tier.costIOS,
 awards:Object.freeze(tier.awards.map(award=>Object.freeze({...award}))),
})));

export function rechargeTier(id){return RECHARGE_TIERS.find(tier=>tier.id===id)??null}
export function rechargeTierIds(){return RECHARGE_TIERS.map(tier=>tier.id)}
// Ticket awards are the raffle currencies, so a recharge hands them to the raffle save
// instead of the generic item bag.
export function isTicketAward(award){return RECHARGE_TICKET_IDS.includes(award.id)}
