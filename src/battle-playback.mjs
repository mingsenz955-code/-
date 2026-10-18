// Playback changes presentation only; battle plans and reward actions are computed separately.
const controls=new WeakMap();let preferredSpeed=1;
export const battleSpeed=el=>Number(el?.closest?.('[data-battle-speed]')?.dataset.battleSpeed)===2?2:1;
export const advancePlayback=(elapsed,delta,speed)=>elapsed+Math.max(0,delta)*(speed===2?2:1);
export function installBattleControls(d){
 let resolveSkip;const c={skipped:false,skip:new Promise(resolve=>{resolveSkip=resolve;})};controls.set(d,c);d.dataset.battleSpeed=preferredSpeed;delete d.dataset.battleSkipped;
 const speed=document.createElement('button');speed.className='native-game-button battle-speed-button';speed.type='button';speed.dataset.battleControl='speed';speed.textContent=preferredSpeed+'倍速';speed.setAttribute('aria-label','切换战斗速度');speed.setAttribute('aria-pressed',String(preferredSpeed===2));d.append(speed);const exit=document.createElement('button');exit.type='button';exit.className='native-game-button battle-exit-button';exit.dataset.action='close';exit.textContent='退出';d.append(exit);
 speed.addEventListener('click',e=>{e.stopPropagation();if(controls.get(d)!==c||c.skipped)return;preferredSpeed=preferredSpeed===1?2:1;d.dataset.battleSpeed=preferredSpeed;speed.textContent=preferredSpeed+'倍速';speed.setAttribute('aria-pressed',String(preferredSpeed===2));for(const a of d.getAnimations({subtree:true}))a.updatePlaybackRate(preferredSpeed);});
 const skip=d.querySelector('[data-action=battleSkip]');skip?.addEventListener('click',e=>{e.stopPropagation();if(controls.get(d)!==c||c.skipped)return;c.skipped=true;d.dataset.battleSkipped='true';skip.disabled=true;resolveSkip(true);for(const a of d.getAnimations({subtree:true})){try{a.finish()}catch{}}});
 return c;
}
export async function runBattlePlayback(d,run){const c=controls.get(d);return c?Promise.race([c.skip,Promise.resolve().then(run)]):run();}
export function battleWait(el,ms){return new Promise(resolve=>{let remaining=ms,last=performance.now();const step=()=>{const now=performance.now();remaining-=Math.max(0,now-last)*battleSpeed(el);last=now;if(remaining<=0||!el?.isConnected||el.closest?.('[data-battle-skipped=true]'))resolve();else setTimeout(step,16);};step();});}
