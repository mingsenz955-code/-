const assert=require('node:assert/strict'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const{createGame,action}=await import('../src/game.mjs');let s=createGame();s.playerXp=2060310572;s.coins=1000000;s.expansion={plots:16};s=action(s,'buyStructure',{itemId:16});await store.save(s);};
exports.run=async(w,store)=>{
 const js=c=>w.webContents.executeJavaScript(c),click=s=>require('./smoke-input.cjs').nativeClick(w,s);
 for(let i=0;i<100&&!await js("!!document.querySelector('.ranch-world')");i++)await wait(100);
 const saved=JSON.stringify((await store.load()).state);
 const point=async selector=>js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect(),owner=e.closest('[data-place-id]');for(const ry of [.8,.95,.5,.3])for(const rx of [.5,.2,.8]){const x=Math.round(r.x+r.width*rx),y=Math.round(r.y+r.height*ry),hit=document.elementFromPoint(x,y);if(hit?.closest('[data-action]')===owner)return {x,y,hit:true};}return {hit:false,selector:${JSON.stringify(selector)}};})()`);
 const mouse=async(type,p,count=1)=>{w.webContents.sendInputEvent({type,x:p.x,y:p.y,button:'left',clickCount:count});await wait(30);};
 const farm='[data-place-kind=fixed][data-place-id="3"] .original-building';
 const p=await point(farm);assert(p.hit,JSON.stringify(p));await mouse('mouseMove',p);await mouse('mouseDown',p);await mouse('mouseMove',{x:p.x+50,y:p.y+30});await mouse('mouseUp',{x:p.x+50,y:p.y+30});await wait(400);
 assert(!await js("!!document.querySelector('.is-moving,.placement-controls,.placement-tiles')"),'ordinary drag cannot pick up a building');assert(!await js("document.querySelector('#modal').open||!!document.querySelector('#building-options')"),'map drag cannot open building actions');assert.equal(JSON.stringify((await store.load()).state),saved);
 // Reset map using the existing empty-scene shortcut, then check ordinary action selection.
 await js("document.querySelector('.scene').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));true");
 await click(farm);await wait(150);assert(await js("!!document.querySelector('#building-options [data-action=beginFixedMove][data-id=\"3\"]')"));assert(!await js("!!document.querySelector('.placement-tiles')"));
 await click('#building-options [data-action=beginFixedMove]');assert(await js("!!document.querySelector('.placement-tiles')"));await click('[data-action=cancelBuildingMove]');
 const structure=(await store.load()).state.structures[0];
 for(const selector of [farm,'[data-place-kind=fixed][data-place-id="1"] .original-building','[data-place-kind=fixed][data-place-id="2"] .original-building','[data-place-kind=habitat] .habitat-art',`[data-place-kind=structure][data-place-id="${structure.id}"] .habitat-art`]){
  const q=await point(selector);assert(q.hit,selector+' visible '+JSON.stringify(q));await mouse('mouseMove',q);await mouse('mouseDown',q);await mouse('mouseUp',q);await wait(60);await mouse('mouseDown',q,2);await mouse('mouseUp',q,2);await wait(420);
  assert(await js("!!document.querySelector('.is-moving .placement-tiles')&&!!document.querySelector('[data-action=confirmBuildingMove]')"),selector+' double click enters placement');assert(!await js("document.querySelector('#modal').open"));
  const unlocked=await point(selector),left=await js("document.querySelector('.is-moving').style.left");await mouse('mouseMove',unlocked);await mouse('mouseDown',unlocked);await mouse('mouseMove',{x:unlocked.x+60,y:unlocked.y+20});await mouse('mouseUp',{x:unlocked.x+60,y:unlocked.y+20});await wait(100);assert.notEqual(await js("document.querySelector('.is-moving').style.left"),left,'unlocked drag changes grid preview');assert.equal(JSON.stringify((await store.load()).state),saved,'drag preview cannot save before confirmation');
  // A click without movement must keep the unlocked placement mode, not reopen its info.
  const stationary=await point(selector);assert(stationary.hit);await mouse('mouseMove',stationary);await mouse('mouseDown',stationary);await mouse('mouseUp',stationary);await wait(350);assert(await js("!!document.querySelector('.placement-controls')"));assert(!await js("document.querySelector('#modal').open"));await click('[data-action=cancelBuildingMove]');
 }
 assert.equal(JSON.stringify((await store.load()).state),saved,'all cancelled moves preserve saved positions and resources');
 console.log('PASS native building input: ordinary drag pans only; single click keeps source actions; original farm Move works; double click unlocks farm/breeding/incubator/habitat/structure; click while placing stays in mode; cancel preserves save');
};
