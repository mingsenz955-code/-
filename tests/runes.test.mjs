import {test} from 'node:test';import assert from 'node:assert/strict';
import {createGame,action,validate} from '../src/game.mjs';import {runeSkill,runeDefinition,runePower,runeUpgradePlan,defaultRuneDragon} from '../src/runes.mjs';import {dragonPower} from '../src/battle.mjs';
const T=1800000000000;
function fixture(){const s=createGame(T);s.dragons.push({id:4,species:'original1041',level:20,habitatId:1});s.nextId=5;s.runes=[{id:'fw-1',type:20101,exp:35,dragonid:0},{id:'fw-2',type:20110,exp:999,dragonid:0},{id:'fw-3',type:20501,exp:0,dragonid:0}];s.nextRuneId=4;return validate(s)}
test('source rune slots enforce matching skills, quality, ownership and replace without destroying inventory',()=>{
 let s=fixture();assert.throws(()=>action(s,'wearRune',{id:2,runeId:'fw-1'},T),/蓝色品质/);const power=dragonPower(s.dragons[2],s);s=action(s,'wearRune',{id:4,runeId:'fw-1'},T);assert.equal(s.runes[0].dragonid,4);assert.equal(runePower(s,s.dragons[2]),330);assert.equal(dragonPower(s.dragons[2],s),power+330);assert.throws(()=>action(s,'wearRune',{id:4,runeId:'fw-3'},T),/碎片/);s=action(s,'wearRune',{id:4,runeId:'fw-2'},T);assert.equal(s.runes[0].dragonid,0);assert.equal(s.runes[1].dragonid,4);s=action(s,'unwearRune',{runeId:'fw-2'},T);assert.equal(runePower(s,s.dragons[2]),0);assert.equal(s.runes.length,3);
});
test('rune fusion uses source offerExp only, supports worn target, rejects worn material atomically',()=>{
 let s=fixture();const plan=runeUpgradePlan(s,'fw-1',['fw-2']);assert.equal(plan.type,20102);assert.equal(plan.exp,4,'material stored experience is not offered by the original client');s=action(s,'wearRune',{id:4,runeId:'fw-1'},T);s=action(s,'upgradeRune',{runeId:'fw-1',materials:['fw-3']},T);assert.equal(s.runes[0].type,20102);assert.equal(s.runes[0].dragonid,4);assert.equal(s.runes[0].exp,5);assert.equal(s.runes.length,2);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);s.runes[1].type=20101;s.runes[1].exp=0;const before=structuredClone(s);assert.throws(()=>action(s,'upgradeRune',{runeId:'fw-2',materials:['fw-1']},T),/未装备/);assert.deepEqual(s,before);
});
test('rune validation rejects duplicated instances, duplicate slot owners and bad saved references',()=>{
 const s=fixture();for(const change of [v=>v.runes.push({...v.runes[0]}),v=>v.runes[0].dragonid=99,v=>v.runes[0].type=999,v=>v.runes[0].exp=-1,v=>{v.runes[0].dragonid=4;v.runes[1].dragonid=4}]){const bad=structuredClone(s);change(bad);assert.throws(()=>validate(bad))}const old=createGame(T);delete old.runes;delete old.nextRuneId;assert.deepEqual(validate(old).runes,[]);
});
test('rune skill extension follows original colour and level triples without fake passive power',()=>{
 const dragon={species:'original1041'};const one=runeSkill(dragon,runeDefinition(20101)),two=runeSkill(dragon,runeDefinition(20102));assert.equal(two.damageVector-one.damageVector,13);assert.equal(two.damageValue-one.damageValue,175);assert.equal(two.addPower-one.addPower,99);assert.equal(runeSkill(dragon,runeDefinition(20301)).addPower,0);
});

// Source FuwenSelector explicitly rejects quality <=2. Existing green equipment
// from earlier builds must still load, so the correction cannot destroy old saves.
test('source blue rarity gate preserves existing green owners without granting new green equips',()=>{
 const s=fixture();s.dragons.find(d=>d.id===4).species='original1008';
 assert.throws(()=>action(s,'wearRune',{id:4,runeId:'fw-1'},T),/蓝色品质/);
 s.runes[0].dragonid=4;assert.equal(validate(structuredClone(s)).runes[0].dragonid,4);
 const next=action(s,'unwearRune',{runeId:'fw-1'},T);assert.throws(()=>action(next,'wearRune',{id:4,runeId:'fw-1'},T),/蓝色品质/);
});

test('source one-click inlay picks higher quality then level, leaves other owners and unsuitable slots alone',()=>{
 let s=fixture();s.runes.push({id:'fw-4',type:30101,exp:0,dragonid:0},{id:'fw-5',type:20201,exp:0,dragonid:0});s.nextRuneId=6;
 s=action(s,'wearBestRunes',{id:4},T);assert.equal(s.runes.find(v=>v.id==='fw-4').dragonid,4);assert.equal(s.runes.find(v=>v.id==='fw-5').dragonid,4);assert.equal(s.runes[2].dragonid,0);assert.equal(s.runes[1].dragonid,0);
 const before=structuredClone(s);assert.throws(()=>action(s,'wearBestRunes',{id:4},T),/更合适/);assert.deepEqual(s,before);assert.deepEqual(validate(JSON.parse(JSON.stringify(s))),s);
});

test('hunt entry selects an eligible owner while preserving an eligible explicit selection and all data',()=>{
 const s=fixture(),before=structuredClone(s);
 assert.equal(defaultRuneDragon(s,2).id,4);
 assert.equal(defaultRuneDragon(s,999).id,4);
 assert.equal(defaultRuneDragon(s,4).id,4);
 assert.equal(defaultRuneDragon(createGame(T),2).id,2);
 assert.deepEqual(s,before);
});
