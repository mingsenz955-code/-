const assert=require('node:assert/strict');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
exports.nativeClick=async(w,selector,{settle=true}={})=>{
 const js=c=>w.webContents.executeJavaScript(c);
 const p=await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled)return null;e.scrollIntoView({block:'nearest',inline:'nearest'});const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return {x,y,width:r.width,height:r.height,hit:hit===e||e.contains(hit),cover:hit?.outerHTML.slice(0,250)}})()`);
 assert(p&&p.width>0&&p.height>0,selector+' must be enabled and visible');assert(p.hit,selector+' covered by '+p.cover);
 for(const type of ['mouseMove','mouseDown','mouseUp']){w.webContents.sendInputEvent({type,x:Math.round(p.x),y:Math.round(p.y),button:'left',clickCount:1});await wait(25)}
 if(!settle)return;
 await wait(350);
 for(let i=0;i<300&&await js("document.querySelector('#modal').dataset.animating==='true'");i++)await wait(25);
};
