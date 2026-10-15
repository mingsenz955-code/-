import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import rows from '../assets/original/data/equipment-stars.mjs';
import {createGame,action,validate} from '../src/game.mjs';
import {createEquipmentInstance,equipmentBonus,equipmentCatalog} from '../src/equipment.mjs';
import {equipmentStarRow,equipmentStarPlan,equipmentStarMaterialError} from '../src/equipment-stars.mjs';
import {dragonAttributes} from '../src/battle.mjs';
const T=1800000000000;
function fixture(){const s=createGame(T);s.coins=10000000;s.equipment=Array.from({length:12},(_,i)=>createEquipmentInstance('eq-'+(i+1),301101));s.nextEquipId=13;return s}
test('all 192 star rows preserve source columns and lookup every upgrade tier',async()=>{
 const raw=JSON.parse(await fs.readFile(new URL('../assets/original/data/tables.json',import.meta.url),'utf8')),p=JSON.parse(await fs.readFile(new URL('../docs/reference/equipment-stars-provenance.json',import.meta.url),'utf8'));
 assert.deepEqual(rows.map(r=>p.columns.map(k=>r[k])),raw.equipinfostar);
 for(const d of equipmentCatalog({grade:null})){const row=equipmentStarRow({type:d.id,star:0});assert.equal(!!row,d.quality>=3);if(row)assert.equal(row.equipIDFix,Number(String(d.id).slice(0,3)))}
});
test('star feed spends actual coins/material instances, retains partial exp, and applies cumulative attributes',()=>{
 let s=fixture();s.equipment[0].dragonid=2;const before=dragonAttributes(s.dragons[0],s);
 s=action(s,'starEquipment',{equipmentId:'eq-1',ids:['eq-2','eq-3','eq-4']},T);assert.equal(s.equipment[0].star,1);assert.equal(s.equipment[0].exp,2);assert.equal(s.coins,10000000-3*28000);
 s=action(s,'starEquipment',{equipmentId:'eq-1',ids:['eq-5','eq-6','eq-7']},T);assert.equal(s.equipment[0].star,2);assert.equal(s.equipment[0].exp,0);assert.equal(s.equipment.length,6);assert.equal(s.equipment[0].dragonid,2);assert.equal(dragonAttributes(s.dragons[0],s).attack-before.attack,871);assert.equal(equipmentBonus([s.equipment[0]]).atk,equipmentBonus([{...s.equipment[0],star:0}]).atk+871);validate(JSON.parse(JSON.stringify(s)));
});
test('same quality and regular-part feed rules, special slots, worn protection and atomic insufficient payment',()=>{
 const s=fixture(),target=s.equipment[0],material=s.equipment[1];assert.equal(equipmentStarMaterialError(target,{...material,type:302101}),'');
 for(const v of [{...material,type:201101},{...material,type:315101},{...material,dragonid:2},target])assert(equipmentStarMaterialError(target,v));
 assert.equal(equipmentStarMaterialError({...target,type:315101},{...material,type:325101}),'');assert(equipmentStarMaterialError({...target,type:315101},{...material,type:316101}));
 for(const ids of [[],['eq-1'],['eq-2','eq-2'],['eq-99'],s.equipment.slice(1,7).map(v=>v.id)])assert.throws(()=>action(s,'starEquipment',{equipmentId:'eq-1',ids},T));
 const copy=JSON.stringify(s);s.coins=0;assert.throws(()=>action(s,'starEquipment',{equipmentId:'eq-1',ids:['eq-2']},T),/金币不足/);assert.equal(s.equipment.length,12);s.coins=10000000;assert.equal(JSON.stringify(s),copy);
});
test('starred fodder uses expHave, multiple levels are possible, cap refuses further consumption',()=>{
 const s=fixture();s.equipment[1].star=3;s.equipment[1].exp=999;
 let plan=equipmentStarPlan(s,'eq-1',['eq-2']);assert.equal(plan.gained,17);assert.equal(plan.star,3);assert.equal(plan.exp,1);assert.equal(plan.cost,28000);
 s.equipment[0].star=2;s.equipment[0].exp=9;plan=equipmentStarPlan(s,'eq-1',['eq-2']);assert.equal(plan.star,3);assert.equal(plan.exp,16);s.equipment[0].star=3;assert.throws(()=>equipmentStarPlan(s,'eq-1',['eq-2']),/最高/);
 assert.equal(equipmentStarRow({type:401101,star:5}).expCost,-1);assert.equal(equipmentStarRow({type:501101,star:5}).expCost,-1);
});
test('equipment critical and anti-critical use the actual DataManager fields in battle',()=>{
 const s=fixture(),d=equipmentCatalog({part:4,quality:3})[0],item=createEquipmentInstance('eq-1',d.id);item.star=1;item.dragonid=2;s.equipment=[item];const row=equipmentStarRow(item),base=dragonAttributes(s.dragons[0]),now=dragonAttributes(s.dragons[0],s);assert.equal(now.crit-base.crit,d.antResist+row.critAdd);assert.equal(now.uncrit-base.uncrit,d.resist+row.uncritAdd);
});
