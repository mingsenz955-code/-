import {test} from 'node:test';
import assert from 'node:assert/strict';
import {BATTLE_VIEWPORT,projectilePlan,projectilePoints} from '../src/battle-presentation.mjs';
import SKILLS from '../assets/original/data/battle-skill-art.mjs';
import fs from 'node:fs';

test('battle keeps source viewport, six projectile kinds and verified common columns',()=>{
 assert.deepEqual(BATTLE_VIEWPORT,{width:1024,height:768});
 const rows=JSON.parse(fs.readFileSync(new URL('../assets/original/data/tables.json',import.meta.url))).skill_info;
 for(const row of rows){assert.equal(SKILLS[row[0]].type,row[2]);assert.equal(SKILLS[row[0]].fireEff,row[4]);assert.equal(SKILLS[row[0]].hitEff,row[5])}
});
test('source normal projectile travels at 1800 units/sec, beam stretches rather than flies',()=>{
 const from={x:0,y:0},to={x:540,y:720},normal=projectilePlan(3,from,to);
 assert.equal(normal.distance,900);assert.equal(normal.duration,500);assert.equal(normal.scaleX,2);
 assert.equal(projectilePlan(3,to,from).scaleY,-1,'source overrides Y flip to -1 after initial scale(2)');
 const beam=projectilePlan(2,from,to);assert.equal(beam.scaleX,900/270*2);assert.equal(beam.keep,500);assert.equal(beam.fade,300);
 const chain=projectilePlan(4,from,to);assert.equal(chain.keep,300);assert.equal(chain.fade,150);
 assert.equal(projectilePlan(1,from,to).duration,0);assert.equal(projectilePlan(5,from,to).kind,'instant');
});
test('projectiles start at source mouth offsets and end at land/air target heights',()=>{
 const origin={x:300,y:600},destination={x:700,y:600};
 const p=projectilePoints({species:'leaf'},origin,{species:'leaf'},destination);
 assert.equal(p.from.x,367.6);assert.equal(p.from.y,529.2);assert.equal(p.to.y,523);
 const reverse=projectilePoints({species:'leaf'},origin,{species:'original1202'},destination,'enemy');
 assert.equal(reverse.from.x,232.4);assert.equal(reverse.to.y,600);
});
