import EFFECTS from '../assets/original/effects/index.mjs';
import {projectilePlan} from './battle-presentation.mjs';
import {waitForSourceMotion} from './source-motion.mjs';
import {sourceAnimate} from './acquisition-animation.mjs';

export function sourceBattleEffect(layer,key,name,point,{scaleX=2,scaleY=2,angle=0,depth=20,once=false}={}){
 const entry=EFFECTS[key];if(!entry?.clips.includes(name))return null;
 const anchor=document.createElement('div');anchor.className='battle-effect-anchor';anchor.style.cssText=`left:${point.x}px;top:${point.y}px;rotate:${angle}deg;z-index:${depth}`;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1;canvas.className='battle-source-effect dragon';canvas.dataset.model=key;canvas.dataset.clip=name;canvas.dataset.nativeSize='true';canvas.dataset.battleScale='1';canvas.dataset.playOnce=String(once);canvas.style.transform=`scale(${scaleX},${scaleY})`;
 anchor.append(canvas);layer.append(anchor);
 layer.dispatchEvent(new CustomEvent('battle-source-effect',{bubbles:true,detail:{key,clip:name,x:point.x,y:point.y,scaleX,scaleY,angle}}));
 return {anchor,canvas,remove:()=>anchor.remove()};
}

export async function playSourceProjectile(layer,key,type,from,to,live){
 const plan=projectilePlan(type,from,to);if(plan.kind==='instant')return live();
 const fx=sourceBattleEffect(layer,key,'bullistic',from,{...plan,once:plan.kind!=='normal'});if(!fx)return live();
 try{
  if(plan.kind==='normal'){
   await sourceAnimate(fx.anchor,[{left:from.x+'px',top:from.y+'px'},{left:to.x+'px',top:to.y+'px'}],{duration:plan.duration});return live();
  }
  const hit=await waitForSourceMotion(fx.canvas,'bullistic',live);
  if(hit){void sourceAnimate(fx.anchor,[{opacity:1},{opacity:0}],{delay:plan.keep,duration:plan.fade}).finally(fx.remove);return true}
  return false;
 }finally{if(plan.kind==='normal'||!live())fx.remove()}
}

export async function playSourceHit(layer,key,name,point,live,{direction=1,depth=20}={}){
 const fx=sourceBattleEffect(layer,key,name,point,{scaleX:2*direction,depth,once:true});if(!fx)return live();
 try{if(!await waitForSourceMotion(fx.canvas,name,live))return false;await new Promise(resolve=>setTimeout(resolve,100));return live()}finally{fx.remove()}
}
