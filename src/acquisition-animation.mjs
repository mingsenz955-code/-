import {sourceParticles} from './source-particles.mjs';

// Cocos rate=2 and BACKIN, sampled for the Web Animations timeline.
// Reference engine: cocos2d-x 2.2.6 CCActionEase.cpp; exact APK engine build unknown.
const easeInOut=t=>t<.5?2*t*t:1-2*(1-t)*(1-t);
const backIn=t=>t*t*(2.70158*t-1.70158);
const frames=fn=>Array.from({length:61},(_,i)=>({...fn(i/60),offset:i/60}));

export async function sourceAnimate(el,keyframes,options){
 if(!el?.isConnected)return;
 const animation=el.animate(keyframes,{fill:'both',...options});
 try{await animation.finished}finally{animation.cancel()}
}

export async function revealRuneDrops(dialog,ids=null){
 const drops=[...dialog.querySelectorAll('.source-hunt-drop')].filter(e=>!ids||ids.includes(e.dataset.id));
 dialog.dataset.animating='true';
 try{
  await Promise.all(drops.map(async(el,i)=>{
   const label=el.querySelector('span');label.style.visibility='hidden';
   if(ids){
    const board=dialog.querySelector('.source-artboard').getBoundingClientRect(),r=el.getBoundingClientRect(),scale=Number(dialog.style.getPropertyValue('--source-scale'));
    const dx=(board.left+board.width/2+35*scale-(r.left+r.width/2))/scale,dy=(board.top+board.height/2-375*scale-r.top)/scale;
    await sourceAnimate(el,[{opacity:0,translate:`${dx}px ${dy}px`},{opacity:1,translate:`${dx}px ${dy}px`}],{duration:50,delay:i*100});
    if(el.dataset.quality>1)void sourceParticles(el,'cj_putong');
    await sourceAnimate(el,[{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:150});
   }else{
    await sourceAnimate(el,[{opacity:0},{opacity:1}],{duration:150,delay:i*80});
    if(el.dataset.quality>1)void sourceParticles(el,'cj_putong');
   }
   label.style.visibility='';
  }));
 }finally{delete dialog.dataset.animating}
}

export async function pickRuneDrops(dialog,id){
 const drops=[...dialog.querySelectorAll('.source-hunt-drop')].filter(e=>!id||e.dataset.id===id),button=dialog.querySelector('[data-action=runeEquipment]');
 if(!button||!drops.length)return;
 const destination=button.getBoundingClientRect(),scale=Number(dialog.style.getPropertyValue('--source-scale'));
 void sourceParticles(button.parentElement,'cj_niudan02',{scale:.5,duration:1.3+(drops.length-1)*.15});
 dialog.dataset.animating='true';
 try{
  await Promise.all(drops.reverse().map(async(el,i)=>{
   await sourceAnimate(el,[{scale:1},{scale:1.2}],{duration:300,delay:i*150});
   el.querySelector('span').style.visibility='hidden';
   const r=el.getBoundingClientRect(),x=(destination.left+destination.width/2-r.left-r.width/2)/scale,y=(destination.top+destination.height/2-r.top-45*scale)/scale;
   await sourceAnimate(el,frames(t=>({translate:`${x*backIn(t)}px ${y*backIn(t)}px`,opacity:t<.9?1:Math.max(0,(1-t)*10)})),{duration:1000});
   el.style.visibility='hidden';
  }));
 }finally{delete dialog.dataset.animating}
}

export async function revealGems(dialog){
 const items=[...dialog.querySelectorAll('.source-gem-source-results button')],quit=dialog.querySelector('[data-source="quit"]');
 if(quit)quit.style.visibility='hidden';
 dialog.dataset.animating='true';
 try{
  for(const el of items){
   if(!dialog.open||!el.isConnected)break;
   const quality=Number(el.dataset.quality),x=512-parseFloat(el.style.left),y=184-parseFloat(el.style.top);
   el.style.visibility='visible';
   const gem=el.querySelector('.gem-result-icon');
   void sourceParticles(gem,quality===5?'cj_gaoji':'cj_putong',quality===5?{}:{fadeAfter:1.4,fadeDuration:.8});
   if(quality===5){
    const mask=document.createElement('div');mask.className='source-gem-reveal-mask';dialog.querySelector('.source-artboard').append(mask);
    void sourceAnimate(mask,[{opacity:200/255},{opacity:1/255}],{duration:400}).finally(()=>mask.remove());
    void sourceParticles(gem,'cj_gaojichuxian01');void sourceParticles(gem,'cj_gaojichuxian02');
   }
   const duration=quality===5?600:400,hold=duration-200;
   await Promise.all([
    sourceAnimate(el,frames(t=>{const progress=Math.sqrt(Math.max(0,(t*duration-hold)/200));return {translate:`${x*(1-progress)}px ${y*(1-progress)}px`}}),{duration}),
    sourceAnimate(el.querySelector('.gem-result-icon'),frames(t=>({scale:1-.3*easeInOut(t)})),{duration:400})
   ]);
   el.querySelector('.gem-result-icon').style.scale='.7';
  }
 }finally{if(quit)quit.style.visibility='';delete dialog.dataset.animating}
}
