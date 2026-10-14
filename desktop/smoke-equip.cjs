const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
// QA-only seed. The original sources (龙境仙踪, 宝箱抽取, 活动获得) are not implemented
// yet, so instances are injected into the isolated test profile and never into a player
// save. They exist to exercise the original 阵容 panel, the 装备更换 page and the wear rules.
const SEED=[
 {id:'eq-1',type:101101,exp:0,star:0,randinfo:[],dragonid:0},
 {id:'eq-2',type:102101,exp:0,star:0,randinfo:[],dragonid:0},
 {id:'eq-3',type:115101,exp:0,star:0,randinfo:[],dragonid:0},
 {id:'eq-4',type:116101,exp:0,star:0,randinfo:[],dragonid:0},
];
exports.prepare=async store=>{
 const loaded=await store.load();if(loaded.state)return;
 const {createGame}=await import('../src/game.mjs');
 const s=createGame();s.equipment=SEED.map(instance=>({...instance}));s.nextEquipId=5;
 s.log=['装备验收隔离档：装备实例由测试注入，不代表正常获取途径。'];
 await store.save(s);
};
exports.run=async(window,store,verify)=>{
 const js=code=>window.webContents.executeJavaScript(code),state=async()=>(await store.load()).state;
 for(let i=0;i<80;i++){if(await js("!!document.querySelector('.original-hud')"))break;await wait(100)}
 const click=async selector=>{assert(await js(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e&&!e.disabled&&e.getBoundingClientRect().height>0})()`),selector);await js(`document.querySelector(${JSON.stringify(selector)}).click();true`);await wait(420)};
 const openPanel=async()=>{await click('[data-action=showMore]');await click('.original-hud [data-action=openEquip]');await wait(800);assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceEquip')};
 const shot=async name=>fs.writeFile(path.join(__dirname,'..','work',name),(await window.webContents.capturePage()).toPNG());

 if(verify){
  const restored=await state(),item=(restored.equipment??[]).find(entry=>entry.id==='eq-1');
  assert(item,'seeded equipment must survive a restart');
  assert.equal(item.dragonid,2,'worn equipment must keep its dragon across processes');
  await openPanel();
  assert(await js("!!document.querySelector('#modal [data-action=openEquipInfo][data-id=\"eq-1\"]')"),'the filled slot must render the equipped instance after restart');
  console.log('PASS 阵容 six-slot wear state survives an independent restart');
  return;
 }

 const before=await state();
 assert.equal((before.equipment??[]).length,4,'seeded instances must be present');
 await openPanel();
 assert(await js("document.querySelector('#modal').textContent.includes('阵容')"),'the original page title is 阵容');
 assert.equal(await js("document.querySelectorAll('#modal .source-equip-slot').length"),6,'the shipped ui_formation_info draws six equipment slots');
 assert.equal(await js("document.querySelectorAll('#modal .source-equip-dragon').length"),before.dragons.length);
 assert(await js("Array.from(document.querySelectorAll('#modal img')).every(i=>i.complete&&i.naturalWidth>0)"),'original slot, part and portrait art must load');
 await shot('equip-ranch-qa.png');

 // The 羽翼 slot is the left-most one (equip5) and is empty in the seed.
 assert(await js("!!document.querySelector('#modal [data-action=equipChange][data-id=\"4\"]')"),'the wing slot must offer the change page');
 await click('#modal [data-action=equipChange][data-id="0"]');
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceEquipChange');
 assert(await js("document.querySelector('#modal').textContent.includes('闪电龙爪')"),'the change page lists only this part, unworn');
 assert(await js("!document.querySelector('#modal').textContent.includes('冰封龙鳞')"),'other parts must not leak into the list');
 await shot('equip-change-qa.png');
 await click('#modal [data-action=wearEquipment]');
 let s=await state();
 assert.equal(s.equipment.find(entry=>entry.id==='eq-1').dragonid,2,'wearing must bind the instance dragonid to the chosen dragon');

 await click('#modal [data-action=openEquipInfo][data-id="eq-1"]');
 assert.equal(await js("document.querySelector('#modal').dataset.mode"),'sourceEquipInfo');
 assert(await js("document.querySelector('#modal').textContent.includes('闪电龙爪')"),'the sheet must name the instance');
 assert(await js("!!document.querySelector('#modal img[src*=\"thumbs_equip_1_0.png\"]')"),'the sheet must render the equipment icon');
 assert(await js("!!document.querySelector('#modal [data-action=unwearEquipment]')"));
 await shot('equip-info-qa.png');

 await click('#modal [data-action=unwearEquipment]');
 s=await state();
 assert.equal(s.equipment.find(entry=>entry.id==='eq-1').dragonid,0,'taking an item off must clear dragonid');

 await click('#modal [data-action=equipChange][data-id="0"]');
 await click('#modal [data-action=wearEquipment]');
 s=await state();
 assert.equal(s.equipment.find(entry=>entry.id==='eq-1').dragonid,2,'re-wearing must leave state for the restart check');
 assert.deepEqual(s.dragons,before.dragons,'equipping must not alter the dragons themselves');
 assert.equal(s.coins,before.coins,'equipping must not move resources');
 assert.deepEqual(s.equipment.filter(entry=>entry.id!=='eq-1'),before.equipment.filter(entry=>entry.id!=='eq-1'));
 console.log('PASS 阵容 six slots, part-scoped change page, wear/unwear and sheet; no dragons or resources touched');
};
