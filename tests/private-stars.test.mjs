import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,validate} from '../src/game.mjs';
import {dragonAttributes} from '../src/battle.mjs';
import {dragonDisplayStars} from '../src/dragon-awakening.mjs';
import {equipmentBonus,createEquipmentInstance} from '../src/equipment.mjs';
import {equipmentStarRow} from '../src/equipment-stars.mjs';
import {PRIVATE_TEN_STAR_POLICY as policy} from '../src/private-stars.mjs';
test('private equipment ten stars are opt-in, affect real attributes and survive reload',()=>{
 const s=createGame(1000),item=createEquipmentInstance('eq-1',501200);item.star=5;s.equipment=[item];s.nextEquipId=2;
 const before=equipmentBonus(s.equipment).atk;item.star=10;assert.throws(()=>validate(s));item.privateStars=policy;
 assert.equal(equipmentBonus(s.equipment).atk,before*2);assert.equal(equipmentStarRow(item).expCost,-1);
 assert.equal(validate(JSON.parse(JSON.stringify(s))).equipment[0].star,10);
});
test('private dragon scales intrinsic and trained stats without changing ordinary dragons',()=>{
 const s=createGame(1000),d=s.dragons[0];d.star=5;d.level=30;const before=dragonAttributes(d);
 d.privateStars=policy;const after=dragonAttributes(d);assert.equal(dragonDisplayStars(d),10);
 assert.equal(after.attack,before.attack*2);assert.equal(after.life,before.life*2);
 assert.equal(dragonDisplayStars(validate(s).dragons[0]),10);
 d.privateStars='unknown';assert.throws(()=>validate(s),/自定义/);
});
test('private low-quality ten-star equipment doubles base stats without adding fake source rows',()=>{
 const item=createEquipmentInstance('eq-1',103200),before=equipmentBonus([item]);
 assert.equal(equipmentStarRow(item),null);item.star=10;item.privateStars=policy;
 assert.equal(equipmentBonus([item]).hp,before.hp*2);
 assert.equal(equipmentStarRow({...item,privateStars:undefined}),null);
});
