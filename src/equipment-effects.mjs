import EFFECTS from '../assets/original/effects/index.mjs';
import {sourceBattleEffect} from './battle-effects.mjs';
import {waitForSourceMotion} from './source-motion.mjs';

// Original DragonInfor dress effect and NewEquipEnhancePanel success effect.
// The game clip continues with Windows reduced motion, like other game actions.
export async function playEquipmentEffect(dialog,key,selector,offset={x:0,y:0}){
 const board=dialog.querySelector('.source-artboard'),target=dialog.querySelector(selector),entry=EFFECTS[key];
 if(!board||!target||!entry)return;
 const b=board.getBoundingClientRect(),r=target.getBoundingClientRect(),scale=b.width/1024;
 const fx=sourceBattleEffect(board,key,entry.clips[0],{x:(r.x+r.width/2-b.x)/scale+(offset.x??0),y:(r.y+r.height/2-b.y)/scale+(offset.y??0)},{scaleX:1,scaleY:1,once:true,depth:30});
 if(!fx)return;fx.canvas.dataset.equipmentEffect=key;
 const live=()=>dialog.open&&fx.canvas.isConnected;
 try{await waitForSourceMotion(fx.canvas,entry.clips[0],live)}finally{fx.remove()}
}
