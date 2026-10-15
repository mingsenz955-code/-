import {test} from 'node:test';
import assert from 'node:assert/strict';
import {storage} from '../src/storage.mjs';
import {createGame} from '../src/game.mjs';
test('static preview cannot silently load or overwrite independent local progress',async()=>{
 const raw=JSON.stringify(createGame()),data=new Map([['yulong-ranch-v1',raw]]);
 globalThis.window={};globalThis.location={search:''};globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 await assert.rejects(storage.load(),e=>e.code==='PREVIEW_PROFILE');await assert.rejects(storage.save(createGame()),e=>e.code==='PREVIEW_PROFILE');assert.equal(data.get('yulong-ranch-v1'),raw);assert.equal(data.size,1);
});
test('explicit browser demo keeps its data separate; desktop always uses formal bridge',async()=>{
 const s=createGame(),data=new Map([['yulong-ranch-v1',JSON.stringify(s)]]);globalThis.window={};globalThis.document={title:''};globalThis.location={search:'?browserDemo=1'};globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 const preview=await storage.load();assert.equal(preview.state.playerXp,0);assert(document.title.includes('独立试玩'));
 const formal={state:{playerXp:2057823900,expansion:{plots:9}},location:'formal'};let written;globalThis.location.search='';window.ranch={load:async()=>formal,save:async v=>{written=v;return true}};
 assert.equal(await storage.load(),formal);await storage.save(s);assert(written);assert.equal(JSON.parse(data.get('yulong-ranch-v1')).playerXp,0);
});
