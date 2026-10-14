import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {equipmentCatalog,equipmentDefinition,equipmentUpgradeTarget,equipmentDowngradeTarget,EQUIPMENT_SLOTS} from '../src/equipment.mjs';

test('equipment export preserves every source field and distinguishes resale from purchase',async()=>{
 const bytes=await fs.readFile(new URL('../assets/original/data/tables.json',import.meta.url));
 const tables=JSON.parse(bytes),report=JSON.parse(await fs.readFile(new URL('../assets/original/data/equipment-provenance.json',import.meta.url),'utf8'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),report.tablesSha256);
 assert.equal(equipmentCatalog({grade:null}).length,6000);
 assert.equal(report.rowsIncludingUpgradeTiers,tables.equipinfo.length);
 for(const row of tables.equipinfo){
  const definition=equipmentDefinition(row[1]);
  for(const [field,column] of Object.entries(report.columns)){
   assert.deepEqual(definition[field==='price'?'sellPrice':field],field==='prevView'?row[column-1]===1:row[column-1],`${row[1]}:${field}`);
  }
  assert(!Object.hasOwn(definition,'price'));
  assert(!Object.hasOwn(definition,'purchasePrice'));
 }
 for(const image of new Set(equipmentCatalog({grade:null}).map(record=>record.image))){assert(image);await fs.access(new URL('../'+image,import.meta.url));}
});

test('source equipment tiers retain reciprocal upgrade links and all six slots',()=>{
 assert.deepEqual(EQUIPMENT_SLOTS,['武器','鳞片','龙骨','龙角','羽翼','皇冠']);
 assert.equal(equipmentCatalog().length,60);
 for(let part=0;part<6;part++)assert(equipmentCatalog({part}).length>0);
 for(const current of equipmentCatalog({grade:null})){
  const next=equipmentUpgradeTarget(current.id),previous=equipmentDowngradeTarget(current.id);
  if(current.nextGradeID>0){assert(next);assert.equal(next.prevGradeID,current.id);assert.equal(next.grade,current.grade+1);assert.equal(next.part,current.part);assert.equal(next.quality,current.quality);}
  if(current.prevGradeID>0){assert(previous);assert.equal(previous.nextGradeID,current.id);}
 }
 assert.equal(equipmentDefinition('101101'),null);
 assert.equal(equipmentDefinition(-1),null);
 assert.equal(equipmentUpgradeTarget(-1),null);
});

test('equipment filtering has explicit tiers, cannot mutate definitions, and rejects invalid inputs',()=>{
 const first=equipmentDefinition(101101);
 assert.equal(first.sellPrice,10000);assert.equal(first.atk,331);
 assert.throws(()=>{first.atk=0},TypeError);
 const rows=equipmentCatalog({part:4,quality:5,grade:2});assert(rows.length>0);
 assert(rows.every(row=>row.part===4&&row.quality===5&&row.grade===2));
 rows.pop();assert.equal(equipmentDefinition(101101).atk,331);
 for(const options of [{part:6},{quality:0},{property:10},{grade:0},{grade:1.5},{part:'0'}])assert.throws(()=>equipmentCatalog(options),/筛选无效/);
});
