const assert=require('node:assert/strict'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.run=async w=>{
 const js=c=>w.webContents.executeJavaScript(c),read=()=>js("(()=>{const e=document.querySelector('.source-bag-equipment-list'),r=e.getBoundingClientRect();return {left:e.scrollLeft,max:e.scrollWidth-e.clientWidth,x:r.x,y:r.y,w:r.width,h:r.height}})()");
 let r=await read();assert(r.max>100,'fixture must overflow');const point={x:Math.round(r.x+r.w/2),y:Math.round(r.y+r.h/2)};
 w.webContents.sendInputEvent({type:'mouseMove',...point});w.webContents.sendInputEvent({type:'mouseWheel',...point,deltaY:-400,deltaX:0,canScroll:true});await wait(300);
 assert((await read()).left>20,'vertical mouse wheel must move the equipment row horizontally');
 w.webContents.sendInputEvent({type:'mouseWheel',...point,deltaY:2000,deltaX:0,canScroll:true});await wait(300);assert((await read()).left<1,'reverse wheel returns to first card');
 const start=await js("(()=>{const e=document.querySelector('[data-action=openEquipmentStar][data-id=\"eq-1\"]'),r=e.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()");
 w.webContents.sendInputEvent({type:'mouseMove',...start});w.webContents.sendInputEvent({type:'mouseDown',...start,button:'left',clickCount:1});
 for(let i=1;i<=8;i++){w.webContents.sendInputEvent({type:'mouseMove',x:start.x-i*20,y:start.y,button:'left',buttons:1});await wait(20);}
 w.webContents.sendInputEvent({type:'mouseUp',x:start.x-160,y:start.y,button:'left',clickCount:1});await wait(300);
 assert((await read()).left>20,'left-button drag must scroll the scaled equipment row');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceEquipmentBag','dragging across the star button must not open it');
 w.webContents.sendInputEvent({type:'mouseWheel',...point,deltaY:2000,deltaX:0,canScroll:true});await wait(300);assert((await read()).left<1);
 console.log('PASS real mouse wheel/reverse and card drag, no accidental star-button activation');
};
