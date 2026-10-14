import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGame,validate,action} from '../src/game.mjs';
import {equipmentDefinition,equipmentEnhancePlan} from '../src/equipment.mjs';
import {gemBonus,gemDefinition} from '../src/gems.mjs';
import {dragonAttributes} from '../src/battle.mjs';
const seed=()=>{const s=validate(createGame());s.equipment=[{id:'eq-1',type:101101,exp:0,star:0,randinfo:[],dragonid:2}];s.nextEquipId=2;s.equipmentMaterials={stone:1000,wing:0,crystal:0};s.gemInventory=[{id:'gm-1',type:810101,exp:0},{id:'gm-2',type:810201,exp:0},{id:'gm-3',type:820101,exp:0}];s.nextGemId=4;return s};
test('source equipment enhancement charges actual material, retains owner, improves stats and reloads',()=>{
 const s=seed(),before=dragonAttributes(s.dragons[0],s),plan=equipmentEnhancePlan(s.equipment[0],10);const next=action(s,'enhanceEquipment',{equipmentId:'eq-1',count:10});
 assert.equal(next.equipment[0].type,plan.type);assert.equal(next.equipmentMaterials.stone,1000-plan.cost);assert.equal(next.equipment[0].dragonid,2);assert.equal(equipmentDefinition(plan.type).grade,11);assert(dragonAttributes(next.dragons[0],next).attack>before.attack);
 assert.equal(validate(JSON.parse(JSON.stringify(next))).equipment[0].type,plan.type);
 const poor=seed();poor.equipmentMaterials.stone=0;assert.throws(()=>action(poor,'enhanceEquipment',{equipmentId:'eq-1'}),/强化石不足/);assert.equal(poor.equipment[0].type,101101);
 for(const [id,type,name] of [['eq-2',115101,'wing'],['eq-3',116101,'crystal']])assert.equal(equipmentEnhancePlan({id,type}).material,name);
});
test('gem sockets distinguish flying and crawling, replace same type, protect higher quality and reset on removal',()=>{
 let s=seed();const before=dragonAttributes(s.dragons[1],s);s=action(s,'insertGem',{gemId:'gm-1',tab:'land'});assert.equal(s.gemSockets[0],'gm-1');assert.equal(gemBonus(s,s.dragons[1]).attack,200);assert.equal(gemBonus(s,s.dragons[0]).attack,0);assert.equal(dragonAttributes(s.dragons[1],s).attack,before.attack+200);
 s=action(s,'insertGem',{gemId:'gm-3',tab:'land'});assert.equal(s.gemSockets[0],'gm-3');assert(!s.gemSockets.includes('gm-1'));assert.throws(()=>action(s,'insertGem',{gemId:'gm-1',tab:'land'}),/更高品质/);
 s=action(s,'removeGem',{gemId:'gm-3'});assert.deepEqual(dragonAttributes(s.dragons[1],s),before);
 assert.deepEqual(validate(JSON.parse(JSON.stringify(s))).gemSockets,Array(12).fill(null));
});
test('gem swallowing follows exported eat XP and next-level links without consuming equipped or duplicate materials',()=>{
 const s=seed(),current=gemDefinition(810101);assert.equal(current.levelupexp,10);const next=action(s,'fuseGem',{gemId:'gm-1',materials:['gm-2']});assert.equal(next.gemInventory[0].type,current.nextlevel);assert.equal(next.gemInventory.length,2);
 assert.throws(()=>action(s,'fuseGem',{gemId:'gm-1',materials:['gm-2','gm-2']}),/请选择/);
 const worn=action(s,'insertGem',{gemId:'gm-2',tab:'air'});assert.throws(()=>action(worn,'fuseGem',{gemId:'gm-1',materials:['gm-2']}),/背包/);
 assert.throws(()=>action(s,'fuseGem',{gemId:'gm-1',materials:['gm-3']}),/品质/);
 const bad=seed();bad.gemSockets[0]='gm-1';bad.gemSockets[6]='gm-1';assert.throws(()=>validate(bad),/重复/);
 const materials=seed();materials.equipmentMaterials.stone=-1;assert.throws(()=>validate(materials),/材料/);
});
