// CocoStudio CCTween::setBetween holds a visible pose when the next display is
// hidden. Hidden keyframes contain zero transforms, not a destination at (0,0).
export function sample(track,t){
 const total=track.reduce((sum,f)=>sum+f[0],0);t=Math.min(t,Math.max(0,total-.00001));let start=0;
 for(let i=0;i<track.length;i++){const a=track[i],duration=a[0];if(t<start+duration){
  const b=track[(i+1)%track.length],ratio=(t-start)/duration,r=a.slice();
  if(a[1]<0||b[1]<0)return r;
  for(let k=3;k<=14;k++){if(k===9||k===10)continue;let delta=b[k]-a[k];if(k===5||k===6)delta=((delta+180)%360+360)%360-180+(b[10]??0)*360;r[k]=a[k]+delta*ratio}return r;
 }start+=duration}return track.at(-1).slice();
}
