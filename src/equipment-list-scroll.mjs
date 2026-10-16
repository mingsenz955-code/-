// Scoped to the shared equipment/fragment row; do not intercept map gestures.
export function installEquipmentListScroll(root=document){
 const selector='.source-bag-equipment-list';let gesture=null,suppress=null;
 root.addEventListener('wheel',e=>{
  const list=e.target.closest?.(selector);if(!list||list.scrollWidth<=list.clientWidth||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
  const factor=e.deltaMode===1?16:e.deltaMode===2?list.clientWidth:1;
  list.scrollLeft+=e.deltaY*factor;e.preventDefault();
 },{passive:false});
 root.addEventListener('pointerdown',e=>{
  suppress=null;
  const list=e.target.closest?.(selector);if(!list||e.button!==0||!e.isPrimary||list.scrollWidth<=list.clientWidth)return;
  const r=list.getBoundingClientRect(),scale=r.width/list.offsetWidth;
  // Leave the browser scrollbar's own thumb/track interaction alone.
  if(e.clientY>=r.top+list.clientHeight*scale)return;
  gesture={list,id:e.pointerId,x:e.clientX,y:e.clientY,left:list.scrollLeft,scale,moved:false};
 });
 root.addEventListener('pointermove',e=>{
  const g=gesture;if(!g||g.id!==e.pointerId)return;if(!g.list.isConnected){gesture=null;return;}
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.moved){if(Math.abs(dx)<8)return;if(Math.abs(dy)>Math.abs(dx)){gesture=null;return;}g.moved=true;g.list.setPointerCapture(e.pointerId);g.list.classList.add('is-dragging');}
  g.list.scrollLeft=g.left-dx/g.scale;e.preventDefault();
 });
 const finish=e=>{const g=gesture;if(!g||g.id!==e.pointerId)return;gesture=null;g.list.classList.remove('is-dragging');if(g.list.hasPointerCapture(g.id))g.list.releasePointerCapture(g.id);if(g.moved&&e.type==='pointerup'){suppress={list:g.list,x:e.clientX,y:e.clientY,until:performance.now()+400};e.preventDefault();}};
 root.addEventListener('pointerup',finish);root.addEventListener('pointercancel',finish);
 root.addEventListener('click',e=>{const s=suppress;if(!s)return;suppress=null;if(performance.now()<=s.until&&s.list.contains(e.target)&&Math.hypot(e.clientX-s.x,e.clientY-s.y)<5){e.preventDefault();e.stopImmediatePropagation();}},true);
}
