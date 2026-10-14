import {test} from 'node:test';
import assert from 'node:assert/strict';
import CATALOG from '../assets/original/catalog.mjs';
import {speciesKey} from '../src/data.mjs';
import {createGame,action,validate} from '../src/game.mjs';
import {configuredLineup} from '../src/battle.mjs';
import {formationError,formationPosition,formationReplacement} from '../src/formation.mjs';
const dragon=(id,species,level=7)=>({id,species,level,habitatId:1});
test('source enlist gates enforce level, distinct species, six total and four per position',()=>{
 assert.match(formationError([dragon(2,'leaf',6)]),/7级/);
 assert.match(formationError([dragon(2,'leaf'),dragon(3,'leaf')]),/同一龙种/);
 for(const position of [0,1]){
  const team=CATALOG.filter(v=>v.extended.position===position).slice(0,5).map((v,i)=>dragon(i+2,speciesKey(v.id)));
  assert.equal(formationPosition(team[0]),position);assert.equal(formationError(team.slice(0,4)),null);
  assert.match(formationError(team),position===0?/爬行龙/:/飞行龙/);
 }
 assert.match(formationError(Array.from({length:7},(_,i)=>dragon(i+2,'leaf'))),/6条/);
});
test('replace and remove preserve source six-list ordering and never mutate on refusal',()=>{
 const state=createGame();state.dragons.forEach(d=>d.level=7);state.dragons.push(dragon(4,'tide'));state.nextId=5;
 const original=structuredClone(state);
 assert.throws(()=>formationReplacement(state,0,3),/同一龙种/);assert.deepEqual(state,original);
 const ids=formationReplacement(state,0,4);assert.deepEqual(ids,[4,3]);
 const next=action(state,'setFormation',{ids});assert.deepEqual(next.formation,[4,3]);
 assert.deepEqual(validate(JSON.parse(JSON.stringify(next))).formation,[4,3]);
 assert.deepEqual(formationReplacement(next,0,null),[3]);
 const empty=action(next,'setFormation',{ids:[]});assert.deepEqual(configuredLineup(empty),[]);
 assert.throws(()=>action(empty,'battleResolve',{nodeId:100101}),/布置出战龙/);
});
test('wearing actual owned gear changes combat attributes and taking it off restores them',async()=>{
 const {dragonAttributes,lineupPower}=await import('../src/battle.mjs');
 const {equipmentDefinition}=await import('../src/equipment.mjs');
 const s=createGame();s.dragons.forEach(d=>d.level=7);s.equipment=[{id:'eq-1',type:101101,exp:0,star:0,randinfo:[],dragonid:0}];s.nextEquipId=2;
 const original=dragonAttributes(s.dragons[0],s),power=lineupPower(configuredLineup(s),s),definition=equipmentDefinition(101101);
 const equipped=action(s,'wearEquipment',{id:2,equipmentId:'eq-1'}),actual=dragonAttributes(equipped.dragons[0],equipped);
 assert.equal(actual.attack,original.attack+definition.atk);assert.equal(actual.defend,original.defend+definition.def);assert.equal(actual.life,original.life+definition.hp);
 assert(lineupPower(configuredLineup(equipped),equipped)>power);
 const removed=action(equipped,'unwearEquipment',{equipmentId:'eq-1'});assert.deepEqual(dragonAttributes(removed.dragons[0],removed),original);
});
