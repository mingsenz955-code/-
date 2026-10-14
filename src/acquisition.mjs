import {lotteryPool} from './lottery.mjs';
import CATALOG from '../assets/original/catalog.mjs';
import {ORIGINAL_BREEDING} from '../assets/original/data/rules.mjs';
const records=new Map(CATALOG.map(record=>[record.id,record]));
const pools=new Map(CATALOG.map(record=>[record.id,[]]));
for(const row of ORIGINAL_BREEDING){
 if(row[3]!==1)continue;
 const seen=new Set();
 for(let column=4;column<row.length;column+=2){
  const child=row[column];
  if(!pools.has(child)||!(row[column+1]>0)||seen.has(child))continue;
  seen.add(child);pools.get(child).push(Object.freeze({sourceRow:row[0],parentIds:Object.freeze([row[1],row[2]])}));
 }
}
export function dragonAcquisition(id){
 const record=records.get(id);if(!record)return null;
 return {id,name:record.name,shop:{listed:record.original.in_store===1||record.original.in_store===true,costs:{...record.original.costs},minLevel:record.original.min_level??null},breeding:[...pools.get(id)],baseLottery:[...lotteryPool(1),...lotteryPool(2)].filter(row=>row.type===16&&row.itemId===id).map(row=>({mode:row.mode,sourceRow:row.id,probability:'unverified'})),otherSources:'unverified'};
}
export function sourceDragonName(id){return records.get(id)?.name??`原ID ${id}（目录未收录）`;}
