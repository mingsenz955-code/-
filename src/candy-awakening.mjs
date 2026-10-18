// User-authorized offline extension; never presented as recovered original candy awakening data.
import SOURCE from '../assets/original/data/dragon-growth.mjs';
import {dragonStarRow} from './dragon-stars.mjs';
export const CANDY_AWAKENING_POLICY=Object.freeze({id:'custom-candy-awakening-v1',dragonId:1204,templateId:1100,fragmentId:7141,maxStars:10});
const target=dragonStarRow({species:'original1204',star:5}),donor=dragonStarRow({species:'original1100',star:5});
export const CANDY_AWAKENING_RATIOS=Object.freeze(['baseAttack','baseDefence','baseLife'].map(k=>target[k]/donor[k]).concat([1,1]));
const cfg=SOURCE.dragon_juexingjingyan.find(r=>r[0]===1100);
export const CANDY_AWAKENING_CONFIG=Object.freeze([1204,7141,...cfg.slice(2)]);
export const CANDY_AWAKENING_ROWS=Object.freeze(SOURCE.dragon_juexingshengxing.filter(r=>r[1]===1100).map(r=>Object.freeze([900000+r[0],1204,r[2],r[2]<10?'属性增强':'十星已满',...r.slice(4)])));
const sourceAttrs=SOURCE.dragon_juexingshuxing.filter(r=>r[1]===1100),names=['攻击','防御','生命','免暴','暴击'];
export const CANDY_AWAKENING_ATTRIBUTES=Object.freeze(sourceAttrs.map(r=>{const v=[...r];v[0]=900000+r[0];v[1]=1204;const prev=sourceAttrs.find(p=>p[2]===r[2]&&p[3]===r[3]-1);for(let i=0;i<5;i++){v[10+i]=Math.floor(r[10+i]*CANDY_AWAKENING_RATIOS[i]);v[5+i]=r[3]===0?0:v[10+i]-Math.floor((prev?.[10+i]??0)*CANDY_AWAKENING_RATIOS[i]);}v[4]=names.flatMap((name,i)=>v[5+i]?[`${name}+${v[5+i]}`]:[]).join('、');return Object.freeze(v);}));
export const isCustomCandy=d=>d?.species==='original1204';
