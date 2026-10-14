const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),wait=ms=>new Promise(r=>setTimeout(r,ms));
exports.prepare=async store=>{assert.equal((await store.load()).state,null);const {createGame,action}=await import('../src/game.mjs'),{ORIGINAL_LEVELS}=await import('../src/data.mjs');let s=createGame();s.playerXp=ORIGINAL_LEVELS.find(l=>l.level===20).xp_required;s.coins=1e8;s.gems=1000;s=action(s,'build',{buildingId:40});s=action(s,'buyStructure',{itemId:90});await store.save(s)};
exports.run=async(w,store,verify=false)=>{
 const js=c=>w.webContents.executeJavaScript(c),click=async s=>{assert(await js(`!!document.querySelector(${JSON.stringify(s)})`),s);await js(`document.querySelector(${JSON.stringify(s)}).click();true`);await wait(350)};
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.ranch-world')"))break;await wait(100)}
 if(verify){const s=(await store.load()).state;assert.equal(s.habitats.at(-1).job,null);assert.equal(s.structures.at(-1).readyAt,undefined);assert.equal(s.expansion.plots,1);console.log('PASS building completion and expansion restart');return}
 const start=await js("Number(document.querySelector('.ranch-world').dataset.zoom)");await js("document.querySelector('.original-island').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:-220,clientX:650,clientY:380}));true");assert(await js("Number(document.querySelector('.ranch-world').dataset.zoom)")>start);
 await js("document.querySelector('.original-island').dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaY:220,clientX:650,clientY:380}));true");
 await fs.writeFile(path.join(__dirname,'..','work','world-camera-qa.png'),(await w.webContents.capturePage()).toPNG());
 const h=(await store.load()).state.habitats.at(-1);await click(`[data-action=habitat][data-id="${h.id}"]`);await click('[data-action=openBuildingSpeed]');assert.equal(await js("document.querySelector('#modal').dataset.mode"),'nativeBuildingSpeed');await fs.writeFile(path.join(__dirname,'..','work','building-speed-qa.png'),(await w.webContents.capturePage()).toPNG());await click('[data-action=speedBuilding]');assert.equal((await store.load()).state.habitats.at(-1).job,null);
 const st=(await store.load()).state.structures.at(-1);await click(`[data-action=structureInfo][data-id="${st.id}"]`);await click('[data-action=openBuildingSpeed]');await click('[data-action=speedBuilding]');assert.equal((await store.load()).state.structures.at(-1).readyAt,undefined);
 await click('[data-action=showMore]');await click('.original-hud [data-action=openHabitats]');await click('[data-action=expansionShop]');await click('[data-action=expandIsland]');assert.equal((await store.load()).state.expansion.plots,1);await click('#modal [data-action=close]');
 await click(`[data-action=habitat][data-id="${h.id}"]`);await click('[data-action=beginBuildingMove]');assert(await js("!!document.querySelector('.placement-tiles')"));await fs.writeFile(path.join(__dirname,'..','work','placement-grid-qa.png'),(await w.webContents.capturePage()).toPNG());await click('[data-action=cancelBuildingMove]');
 // Real Chromium mouse events exercise pointer capture and transformed coordinates.
 await click(`[data-action=habitat][data-id="${h.id}"]`);await click('[data-action=beginBuildingMove]');
 const current=(await store.load()).state,{habitatInfo,habitatPosition,FIXED_BUILDINGS,findBuildingPosition}=await import('../src/habitats.mjs'),{structureInfo,structurePosition}=await import('../src/structures.mjs');
 const objects=[...FIXED_BUILDINGS,...current.habitats.map((v,i)=>({key:`h:${v.id}`,info:habitatInfo(v),position:habitatPosition(v,i)})),...current.structures.map((v,i)=>({key:`s:${v.id}`,info:structureInfo(v),position:structurePosition(v,i)}))];
 const destination=findBuildingPosition(objects,habitatInfo(h),current.expansion.plots);assert(destination,'a second legal empty footprint');
 const coords=await js(`(()=>{const e=document.querySelector('[data-place-id="${h.id}"]'),a=e.querySelector('.habitat-art').getBoundingClientRect(),r=e.parentElement.getBoundingClientRect();return {x:a.x+a.width/2,y:a.y+a.height*.7,left:r.left,top:r.top,w:r.width,h:r.height}})()`);
 const mouse=async(type,x,y)=>{w.webContents.sendInputEvent({type,x:Math.round(x),y:Math.round(y),button:'left',clickCount:1});await wait(120)};
 await mouse('mouseDown',coords.x,coords.y);
 const sourcePos=current.habitats.find(v=>v.id===h.id).position,occupied=habitatPosition(current.habitats[0],0);
 const moveTo=async p=>mouse('mouseMove',coords.x+(p[0]-sourcePos[0])*coords.w/100,coords.y+(p[1]-sourcePos[1])*coords.h/100);
 await moveTo(occupied);assert(await js("!!document.querySelector('.placement-tiles.invalid')"),'overlap turns red after a native drag');
 await moveTo(destination);assert(await js("!!document.querySelector('.placement-tiles.valid')"),'empty cells become valid after a native drag');
 await mouse('mouseUp',coords.x+(destination[0]-sourcePos[0])*coords.w/100,coords.y+(destination[1]-sourcePos[1])*coords.h/100);await click('[data-action=confirmBuildingMove]');
 assert.deepEqual((await store.load()).state.habitats.find(v=>v.id===h.id).position,destination);
 // Pan the island only; HUD position must stay unchanged.
 const before=await js("document.querySelector('.ranch-world').style.transform");const empty=await js("(()=>{for(let y=220;y<innerHeight-100;y+=30)for(let x=200;x<innerWidth-200;x+=30){const e=document.elementFromPoint(x,y);if(e?.closest('.scene')&&!e.closest('[data-action],.original-hud,.placement-controls'))return {x,y}}})()");assert(empty);await mouse('mouseDown',empty.x,empty.y);await mouse('mouseMove',empty.x+70,empty.y+40);await mouse('mouseUp',empty.x+70,empty.y+40);assert.notEqual(await js("document.querySelector('.ranch-world').style.transform"),before);
 console.log('PASS wheel, original building art, speedup, expansion and placement preview');
};

