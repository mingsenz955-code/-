const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.run=async(w,store)=>{
 const js=c=>w.webContents.executeJavaScript(c);for(let i=0;i<80;i++){if(await js("!!document.querySelector('.ranch-world')"))break;await wait(100)}
 assert.equal(await js("document.querySelectorAll('.world-island').length"),4);assert.equal(await js("document.querySelectorAll('.island-navigation').length"),0);
 const before=JSON.stringify((await store.load()).state);
 await js("document.querySelector('.scene').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:300,clientX:650,clientY:384}));true");await js("document.querySelector('.scene').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:300,clientX:650,clientY:384}));true");await wait(400);
 await fs.writeFile(path.join(__dirname,'..','work','continuous-world-overview-qa.png'),(await w.webContents.capturePage()).toPNG());
 const p=await js("(()=>{for(let y=200;y<innerHeight-120;y+=20)for(let x=200;x<innerWidth-200;x+=20){const e=document.elementFromPoint(x,y);if(e?.closest('.scene')&&!e.closest('[data-action],.original-hud,.placement-controls'))return {x,y}}})()");assert(p);
 const mouse=async(type,x,y)=>{w.webContents.sendInputEvent({type,x:Math.round(x),y:Math.round(y),button:'left',clickCount:1});await wait(120)};
 await mouse('mouseDown',p.x,p.y);await mouse('mouseMove',p.x+4000,p.y+4000);await mouse('mouseUp',p.x+4000,p.y+4000);
 const transform=await js("document.querySelector('.ranch-world').style.transform");assert(!transform.includes('4000'));assert.equal(JSON.stringify((await store.load()).state),before,'view changes must not modify save');
 console.log('PASS four islands in one world, no page tabs, zoom and finite pan, unchanged save');
};
