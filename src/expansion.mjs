import {ORIGINAL_EXPANSION_PRICES} from '../assets/original/data/expansion.mjs';

// expansion_prices ships without any *Info.lua column definition, so the reading below is an
// explicit inference recorded in expansion-provenance.json. Rows are
// [index, requiredLevel, coins, gems, fifth], where column 1 is a running step, column 2 the
// required ranch level, columns 3/4 the gold and gem price, and the first four rows are the
// free starting plots. Column 5 repeats values (many steps share 30), so it is NOT a unique
// plot number and is deliberately not exposed here.
export const EXPANSION_POLICY='offline-expansion-inferred-v1';
const steps=ORIGINAL_EXPANSION_PRICES.map(row=>Object.freeze({index:row[0],minLevel:row[1],coins:row[2],gems:row[3]}));
const freeSteps=steps.filter(step=>step.coins===0&&step.gems===0).length;
export const EXPANSION_FREE_STEPS=freeSteps;
export const EXPANSION_PAID_STEPS=steps.length-freeSteps;
export const EXPANSION_LAST=steps.at(-1)??null;

export function expansionStep(index){
 if(!Number.isSafeInteger(index)||index<0)return null;
 return steps[index]??null;
}

// The next paid expansion, given how many paid plots the ranch already bought.
export function nextExpansion(owned){
 if(!Number.isSafeInteger(owned)||owned<0)throw new Error('已扩建数量无效。');
 return expansionStep(freeSteps+owned);
}
