import AREAS from '../assets/original/data/habitat-motion.mjs';
// HabitatDelegate ctor/addDragonView: x*0.4, y=(height+1)*13.5,
// building 40 raises the walking plane by another 54; each dragon gets a 5..25 y offset.
export function habitatMotionArea(info){const row=AREAS[info.id??24],height=info.height??5;return {minX:(row?.x[0]??-163)*.4,maxX:(row?.x[1]??163)*.4,y:(height+1)*13.5+(info.id===40?54:0),ground:((info.width??5)+height-2)*6.75}}
const integer=(min,max,random)=>min+Math.floor(Math.min(.999999999,Math.max(0,random()))*(max-min+1));
export function createHabitatMotion(area,random=Math.random){return {x:integer(Math.ceil(area.minX),Math.floor(area.maxX),random),y:area.y-integer(1,5,random)*5,direction:1,clip:'breath',remaining:integer(2,5,random),area}}
export function advanceHabitatMotion(motion,seconds,random=Math.random,specialSeconds=1){
 const dt=Math.max(0,Math.min(.25,seconds));motion.remaining-=dt;
 if(motion.clip==='walk'){
  if(motion.remaining<=0){motion.clip='breath';motion.remaining=integer(2,5,random)}
  else {const x=motion.x+6*dt*motion.direction;if(x<motion.area.minX||x>motion.area.maxX)motion.direction*=-1;else motion.x=x}
 }else if(motion.remaining<=0){
  if(motion.clip==='especial'){motion.clip='breath';motion.remaining=integer(2,5,random)}
  else if(random()>.8){motion.clip='especial';motion.remaining=Math.max(.1,specialSeconds)}
  else {motion.clip='walk';motion.remaining=integer(5,15,random)}
 }
 return motion;
}
// Anchor the skeletal model's source origin at the feet, preserving native 0.45
// habitat scale; other dialogs and battle retain their existing render contract.
export function habitatCanvasGeometry(bounds){const [x,y,r,b]=bounds;return {left:x*.45,top:y*.45,width:(r-x)*.45,height:(b-y)*.45,pixelWidth:Math.max(1,Math.ceil((r-x)*.9)),pixelHeight:Math.max(1,Math.ceil((b-y)*.9))}}
export function startHabitatMotion(){
 const states=new Map();let last=performance.now(),refresh=0,nodes=[];
 function frame(now){requestAnimationFrame(frame);if(now-last<1000/30)return;const dt=(now-last)/1000;last=now;
  if(now>refresh){nodes=[...document.querySelectorAll('.world-resident[data-motion-id]')];refresh=now+250;const ids=new Set(nodes.map(n=>n.dataset.motionId));for(const id of states.keys())if(!ids.has(id))states.delete(id)}
  for(const el of nodes){if(!el.isConnected)continue;const id=el.dataset.motionId,area=JSON.parse(el.dataset.motionArea);let m=states.get(id);if(!m||m.area.minX!==area.minX||m.area.maxX!==area.maxX||m.area.y!==area.y){m=createHabitatMotion(area);states.set(id,m)}
   const canvas=el.querySelector('canvas[data-model]');if(!document.querySelector('#modal')?.open&&!el.closest('.is-moving'))advanceHabitatMotion(m,dt,Math.random,Number(canvas?.dataset.specialDurationMs??1000)/1000);
   el.style.left=m.x+'px';el.style.top=(area.ground-m.y)+'px';el.style.zIndex=Math.round(1000-m.y);
   if(canvas){canvas.dataset.worldScale='.45';canvas.dataset.nativeSize='true';canvas.dataset.clip=m.clip;canvas.style.transform=`scaleX(${m.direction})`}
  }
 }
 requestAnimationFrame(frame);
}
