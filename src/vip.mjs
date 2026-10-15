import SOURCE from '../assets/original/data/arena-vip.mjs';
import {vipProgress} from './recharge.mjs';
export const vipInfo=s=>SOURCE.vip.find(v=>v.level===vipProgress(s.recharge?.totalGems??0).level);
export function vipYield(s,kind,value){const r=vipInfo(s);return Math.floor(value*(1+(r[{xp:'expExtro',coins:'goldExtro',food:'foodExtro'}[kind]]??0)/100));}
export function vipDuration(s,kind,ms){const percent=vipInfo(s)[{breed:'reducebreed',hatch:'reducehatch',building:'reducebuilding'}[kind]]??0;return Math.max(0,Math.ceil(ms*(1-percent/100)));}
