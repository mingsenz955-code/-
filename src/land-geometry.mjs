import MASKS from '../assets/original/data/land-masks.mjs';
import {ORIGINAL_LANDS,ownedLands} from './expansion.mjs';
export function unownedLandAt(state,island,x,y){
 const owned=ownedLands(state);
 return ORIGINAL_LANDS.find(l=>{
  if(l.island!==island+1||owned.includes(l.id))return false;
  const m=MASKS[l.id],px=Math.floor((x-650-l.x*.5)*2+m.width/2),py=Math.floor((y-384+l.y*.5)*2+m.height/2);
  if(px<0||py<0||px>=m.width||py>=m.height)return false;
  const runs=m.rows[py];for(let i=0;i<runs.length;i+=2)if(px>=runs[i]&&px<runs[i+1])return true;
  return false;
 })?.id??null;
}
export function landFootprintAllowed(state,island,rect){
 const owned=ownedLands(state),locked=ORIGINAL_LANDS.filter(l=>l.island===island+1&&!owned.includes(l.id));
 for(let r=rect.row-Math.floor(rect.height/2);r<rect.row+Math.ceil(rect.height/2);r++)
 for(let c=rect.column-Math.floor(rect.width/2);c<rect.column+Math.ceil(rect.width/2);c++){
  const x=650+(c-r)*27,y=50+(c+r)*13.5;
  for(const l of locked){
   const m=MASKS[l.id],cx=(x-650-l.x*.5)*2+m.width/2,cy=(y-384+l.y*.5)*2+m.height/2;
   if(cx+54<0||cx-54>=m.width||cy+27<0||cy-27>=m.height)continue;
   // Intersect every alpha scanline with this complete placement diamond.
   for(let row=Math.max(0,Math.floor(cy-27));row<Math.min(m.height,Math.ceil(cy+27));row++){
    const distance=Math.max(0,Math.abs(row+.5-cy)-.5),span=54*(1-distance/27),left=cx-span,right=cx+span,runs=m.rows[row];
    for(let i=0;i<runs.length;i+=2)if(left<runs[i+1]&&right>runs[i])return false;
   }
  }
 }
 return true;
}
export function landMasksHtml(state,island){const owned=ownedLands(state);return ORIGINAL_LANDS.filter(l=>l.island===island+1&&!owned.includes(l.id)).map(l=>{const m=MASKS[l.id];return `<img class="original-land-mask" data-unowned-land="${l.id}" src="assets/original/ui/ui_mapland_land${l.id}.png" style="left:${650+l.x*.5}px;top:${384-l.y*.5}px;width:${m.width*.5}px;height:${m.height*.5}px" alt="未扩建地块">`}).join('')}
