import test from 'node:test';import assert from 'node:assert/strict';
import {advancePlayback,installBattleControls,runBattlePlayback} from '../src/battle-playback.mjs';
import {createGame} from '../src/game.mjs';import {simulateCombat} from '../src/combat.mjs';
const button=()=>({dataset:{},setAttribute(){},addEventListener(k,f){this[k]=f;}});
const dialog=()=>{const skip=button();return {dataset:{},children:[],skip,append(v){this.children.push(v)},querySelector(){return skip},getAnimations(){return []}};};
test('2x playback accumulates twice the source time and mid-clip toggling preserves progress',()=>{assert.equal(advancePlayback(0,500,2),1000);let t=advancePlayback(0,100,1);t=advancePlayback(t,100,2);assert.equal(t,300);assert.equal(advancePlayback(t,-1,2),300);});
test('skip resolves playback immediately and never changes computed victory, defeat or player state',async()=>{
 globalThis.document={createElement:button};try{for(const win of [true,false]){const s=createGame(),before=structuredClone(s),enemies=[{species:'ember',level:7,life:win?1:1e8,attack:win?1:1e8,defend:0}],combat=simulateCombat(s,enemies),d=dialog();assert.equal(combat.won,win);installBattleControls(d);const result=runBattlePlayback(d,()=>new Promise(()=>{}));d.skip.click({stopPropagation(){}});assert.equal(await result,true);assert.equal(d.dataset.battleSkipped,'true');assert.deepEqual(s,before);assert.equal(combat.won,win);}}finally{delete globalThis.document;}
});
