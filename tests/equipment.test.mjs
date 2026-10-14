import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {equipmentCatalog,equipmentDefinition,equipmentUpgradeTarget,equipmentDowngradeTarget,EQUIPMENT_SLOTS,EQUIPMENT_SLOTS_LAYOUT,equipmentEmptyIcon,createEquipmentInstance,equipmentIcon,equipmentGradeText,equipmentOfDragon,equipmentInPart,equipmentBonus} from '../src/equipment.mjs';
import {createGame,validate,action} from '../src/game.mjs';
const T=1800000000000;

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

test('the 阵容 page draws six slots covering all six source parts',()=>{
 assert.deepEqual(EQUIPMENT_SLOTS,['武器','鳞片','龙骨','龙角','羽翼','皇冠']);
 assert.deepEqual(EQUIPMENT_SLOTS_LAYOUT.map(entry=>entry.node),['equip5','equip1','equip2','equip3','equip4','equip6']);
 assert.deepEqual(EQUIPMENT_SLOTS_LAYOUT.map(entry=>entry.part),[4,0,1,2,3,5]);
 for(let part=0;part<6;part++){assert(equipmentCatalog({part}).length>0);assert(equipmentEmptyIcon(part).endsWith('.png'),`part ${part} needs the client's own empty-slot art`)}
 assert.equal(equipmentEmptyIcon(9),'');
});

test('instances follow the source ExEquipData fields and reject malformed input',()=>{
 assert.deepEqual(createEquipmentInstance('eq-1',101101),{id:'eq-1',type:101101,exp:0,star:0,randinfo:[],dragonid:0});
 assert.throws(()=>createEquipmentInstance('1',101101),/编号无效/);
 assert.throws(()=>createEquipmentInstance('eq-0',101101),/编号无效/);
 assert.throws(()=>createEquipmentInstance('eq-1',999999),/定义不存在/);
 assert.equal(equipmentGradeText(equipmentDefinition(101101)),'');
 assert.equal(equipmentGradeText(equipmentUpgradeTarget(101101)),'+1');
 assert.equal(equipmentIcon(equipmentDefinition(101101)),'assets/original/ui/thumbs_equip_1_0.png');
});

test('wearing follows the instance dragonid and one part holds at most one item',()=>{
 const fixture=()=>{const s=createGame(T);s.equipment=[createEquipmentInstance('eq-1',101101),createEquipmentInstance('eq-2',201101),createEquipmentInstance('eq-3',102101)];s.nextEquipId=4;return s};
 let s=action(fixture(),'wearEquipment',{id:2,equipmentId:'eq-1'},T);
 assert.equal(equipmentOfDragon(s,2).length,1);
 assert.equal(equipmentInPart(equipmentOfDragon(s,2),0).id,'eq-1');
 assert.throws(()=>action(s,'wearEquipment',{id:2,equipmentId:'eq-1'},T),/已经穿在龙身上/);
 assert.throws(()=>action(s,'wearEquipment',{id:2,equipmentId:'eq-2'},T),/该部位已装备/);
 s=action(s,'wearEquipment',{id:2,equipmentId:'eq-3'},T);
 assert.equal(equipmentOfDragon(s,2).length,2);
 s=action(s,'wearEquipment',{id:3,equipmentId:'eq-2'},T);
 assert.equal(equipmentOfDragon(s,3).map(instance=>instance.id).join(),'eq-2');
 s=action(s,'unwearEquipment',{equipmentId:'eq-1'},T);
 assert.equal(equipmentOfDragon(s,2).map(instance=>instance.id).join(),'eq-3');
 assert.throws(()=>action(s,'unwearEquipment',{equipmentId:'eq-1'},T),/没有穿在龙身上/);
 assert.throws(()=>action(s,'wearEquipment',{id:2,equipmentId:'eq-9'},T),/找不到这件装备/);
});

test('wing and crown parts stay wearable and only definition values are summed',()=>{
 const s=createGame(T);s.equipment=[createEquipmentInstance('eq-1',115101),createEquipmentInstance('eq-2',116101)];s.nextEquipId=3;
 let worn=action(s,'wearEquipment',{id:2,equipmentId:'eq-1'},T);worn=action(worn,'wearEquipment',{id:2,equipmentId:'eq-2'},T);
 const list=equipmentOfDragon(worn,2);assert.equal(list.length,2);
 const wing=equipmentDefinition(115101),crown=equipmentDefinition(116101);
 assert.deepEqual(equipmentBonus(list),{atk:wing.atk+crown.atk,def:wing.def+crown.def,hp:wing.hp+crown.hp,resist:wing.resist+crown.resist,antResist:wing.antResist+crown.antResist});
 assert.deepEqual(equipmentBonus([]),{atk:0,def:0,hp:0,resist:0,antResist:0});
});

test('save validation rejects malformed equipment rows, unknown dragons and repeated parts',()=>{
 const rows=[
  [{id:'1',type:101101,exp:0,star:0,randinfo:[],dragonid:0}],
  [{id:'eq-1',type:999999,exp:0,star:0,randinfo:[],dragonid:0}],
  [{id:'eq-1',type:101101,exp:0,star:9,randinfo:[],dragonid:0}],
  [{id:'eq-1',type:101101,exp:0,star:0,randinfo:[{}],dragonid:0}],
  [{id:'eq-1',type:101101,exp:0,star:0,randinfo:[],dragonid:99}],
  [{id:'eq-1',type:101101,exp:0,star:0,randinfo:[],dragonid:2},{id:'eq-2',type:201101,exp:0,star:0,randinfo:[],dragonid:2}],
  [{id:'eq-9',type:101101,exp:0,star:0,randinfo:[],dragonid:0}],
 ];
 for(const equipment of rows){const s=createGame(T);s.equipment=equipment;s.nextEquipId=9;assert.throws(()=>validate(s))}
});

test('v5 saves migrate to v6 with an empty equipment list and untouched ranch data',()=>{
 const old=createGame(T);old.version=5;delete old.equipment;delete old.nextEquipId;
 const migrated=validate(old);
 assert.equal(migrated.version,10);
 assert.deepEqual(migrated.equipment,[]);
 assert.equal(migrated.nextEquipId,1);
 assert.deepEqual(migrated.dragons,old.dragons);
 assert.equal(old.version,5);
});
