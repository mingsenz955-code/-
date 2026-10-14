import {test} from 'node:test';
import assert from 'node:assert/strict';
import {habitatMotionArea,createHabitatMotion,advanceHabitatMotion,habitatCanvasGeometry} from '../src/habitat-motion.mjs';
test('habitat walking plane and bounds follow source, including raised holy nest',()=>{
 assert.deepEqual(habitatMotionArea({id:24,width:5,height:5}),{minX:-65.2,maxX:65.2,y:81,ground:54});assert.equal(habitatMotionArea({id:25,width:5,height:5}).maxX,107.2);assert.equal(habitatMotionArea({id:40,width:5,height:5}).y,135);assert.equal(habitatMotionArea({id:41,width:5,height:5}).y,81);
 const area=habitatMotionArea({id:40,width:5,height:5}),m=createHabitatMotion(area,()=>.5);assert(m.x>=area.minX&&m.x<=area.maxX);assert(m.y>=110&&m.y<=130);
});
test('walking bounces inside source bounds, breath and special return to walking/idle',()=>{
 const area={minX:-1,maxX:1,y:81,ground:54},m={x:1,y:70,direction:1,clip:'walk',remaining:2,area};advanceHabitatMotion(m,.2,()=>0);assert.equal(m.direction,-1);assert.equal(m.x,1);advanceHabitatMotion(m,.2,()=>0);assert(m.x<1&&m.x>=-1);
 m.remaining=.01;advanceHabitatMotion(m,.2,()=>0);assert.equal(m.clip,'breath');assert.equal(m.remaining,2);m.remaining=0;advanceHabitatMotion(m,.1,()=>.9,1.5);assert.equal(m.clip,'especial');assert.equal(m.remaining,1.5);for(let i=0;i<7;i++)advanceHabitatMotion(m,.25,()=>0);assert.equal(m.clip,'breath');m.remaining=0;advanceHabitatMotion(m,.1,()=>.5);assert.equal(m.clip,'walk');assert.equal(m.remaining,10);
});
test('native habitat model scale anchors source origin rather than fitting every dragon equally',()=>{
 const g=habitatCanvasGeometry([-100,-200,80,10]);assert.equal(g.left,-45);assert.equal(g.top,-90);assert.equal(g.width,81);assert.equal(g.height,94.5);assert.equal(g.pixelWidth,162);assert.equal(g.pixelHeight,189);
});
