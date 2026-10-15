import {test} from 'node:test';
import assert from 'node:assert/strict';
import {battlePositions} from '../src/battle-positions.mjs';
import {dragonSkillSlots} from '../src/dragon-skill-ui.mjs';
import {createGame} from '../src/game.mjs';
test('battle uses source position rather than ranch flying age and keeps both teams separate',()=>{
 const team=['original1200','leaf','original1202','original1203','original1205','original1206'].map(species=>({species,level:20})),left=battlePositions(team),right=battlePositions(team,'enemy');
 assert.deepEqual(left.map(p=>p.type),['land','land','sky','sky','sky','sky']);assert.equal(left[0].y,623);assert.equal(left[0].x,340);assert.equal(left[0].scale,.66);assert(left.every(p=>p.x<512));assert(right.every(p=>p.x>512));assert(left[0].y>left[2].y+150);assert.equal(new Set(left.map(p=>`${p.x}:${p.y}`)).size,6);
});
test('native dragon skill slots show both active and passive source skills',()=>{
 const s=createGame(),html=Object.values(dragonSkillSlots(s,{id:0,species:'original1200'})).join('');for(const name of ['狂妄之眼','黑暗剧毒','暗影之力','自然庇护'])assert(html.includes(name));assert(html.includes('skillicon_1200_magic.png'));assert(!Object.values(dragonSkillSlots(s,{id:0,species:'leaf'})).join('').includes('undefined'));
});
