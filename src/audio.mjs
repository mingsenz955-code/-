import SOURCE from '../assets/original/data/audio.mjs';
export const AUDIO_PREF_KEY='yulong-original-audio-v1';
export class OriginalAudio{
 constructor({createAudio=path=>new Audio(path),storage=globalThis.localStorage,random=Math.random,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now}={}){
  Object.assign(this,{createAudio,storage,setTimer,clearTimer,now});this.preferences={music:true,sound:true};try{const p=JSON.parse(storage?.getItem(AUDIO_PREF_KEY)??'null');for(const k of ['music','sound'])if(typeof p?.[k]==='boolean')this.preferences[k]=p[k];}catch{}
  this.scene='town';this.unlocked=false;this.hidden=false;this.track=null;this.effects=new Set();this.previousTown=random()<.5?1:2;this.gapRemaining=0;this.gapDeadline=0;this.lastError='';
 }
 snapshot(){return {preferences:{...this.preferences},scene:this.scene,unlocked:this.unlocked,hidden:this.hidden,track:this.track?.src??null,playing:!!this.track&&!this.track.paused,effects:this.effects.size,lastError:this.lastError};}
 play(media){try{const result=media.play();result?.catch?.(e=>{this.lastError=e.name??'AudioError';});}catch(e){this.lastError=e.name??'AudioError';}}
 unlock(){this.unlocked=true;this.resume();}
 clearGap(){if(this.gapTimer!==undefined)this.clearTimer(this.gapTimer);this.gapTimer=undefined;this.gapRemaining=0;this.gapDeadline=0;}
 resume(){
  if(!this.unlocked||this.hidden||!this.preferences.music)return;
  if(this.track){if(this.track.paused)this.play(this.track);return;}
  if(this.gapRemaining>0){if(this.gapTimer===undefined){this.gapDeadline=this.now()+this.gapRemaining;this.gapTimer=this.setTimer(()=>{this.gapTimer=undefined;this.gapRemaining=0;this.startMusic();},this.gapRemaining);}return;}
  this.startMusic();
 }
 startMusic(){
  if(!this.unlocked||this.hidden||!this.preferences.music||this.track)return;
  const id=this.scene==='town'?(this.previousTown===1?2:1):this.scene==='battleAdvance'?3:4,info=SOURCE.music.find(v=>v.id===id);
  if(this.scene==='town')this.previousTown=id;
  let track;try{track=this.createAudio(info.path);}catch(e){this.lastError=e.name??'AudioError';return;}track.preload='auto';track.loop=this.scene!=='town';track.volume=this.scene==='town'?1:.6;this.track=track;
  track.onended=()=>{if(this.track!==track||track.loop)return;this.track=null;this.gapRemaining=SOURCE.townGapMs;this.resume();};
  track.onerror=()=>{if(this.track!==track)return;this.lastError='MusicLoadError';this.track=null;this.gapRemaining=SOURCE.townGapMs;this.resume();};this.play(track);
 }
 setScene(scene){if(!['town','battleNormal','battleAdvance'].includes(scene))throw Error('Unknown audio scene');if(this.scene===scene){this.resume();return;}this.scene=scene;this.track?.pause();this.track=null;this.clearGap();this.stopEffects();this.resume();}
 setEnabled(kind,enabled){
  if(!['music','sound'].includes(kind))throw Error('Unknown audio preference');this.preferences[kind]=!!enabled;try{this.storage?.setItem(AUDIO_PREF_KEY,JSON.stringify(this.preferences));}catch{}
  if(kind==='sound'&&!enabled)this.stopEffects();
  if(kind==='music'){if(!enabled){this.track?.pause();this.pauseGap();}else this.resume();}
 }
 pauseGap(){if(this.gapTimer!==undefined){this.gapRemaining=Math.max(0,this.gapDeadline-this.now());this.clearTimer(this.gapTimer);this.gapTimer=undefined;}}
 setHidden(hidden){this.hidden=!!hidden;if(hidden){this.track?.pause();this.pauseGap();this.stopEffects();}else this.resume();}
 stopEffects(){for(const effect of this.effects)effect.pause();this.effects.clear();}
 sound(id,rate=1){
  const info=SOURCE.sounds[id];if(!info||!this.unlocked||this.hidden||!this.preferences.sound)return false;
  // Keep rapid clicks and six-dragon effects from growing an unbounded audio pool.
  if(this.effects.size>=8){const oldest=this.effects.values().next().value;oldest.pause();this.effects.delete(oldest);}
  let effect;try{effect=this.createAudio(info.path);}catch(e){this.lastError=e.name??'AudioError';return false;}effect.volume=1;effect.playbackRate=rate===2?2:1;effect.preservesPitch=true;const done=()=>this.effects.delete(effect);effect.onended=done;effect.onerror=done;this.effects.add(effect);
  try{effect.play()?.catch?.(e=>{this.lastError=e.name??'AudioError';done();});}catch(e){this.lastError=e.name??'AudioError';done();}return true;
 }
 skill(kind,phase,rate=1){return this.sound(SOURCE.skills[kind]?.[phase],rate);}
 click(type,el){
  const id=/close|cancel|back|return|Close|Cancel|Back|Return/.test(type)?3:el?.matches?.('[data-place-id],.world-entrance')?1:el?.hasAttribute?.('data-tab')||/Tab$|Switch$/.test(type)?33:2;this.sound(id);
 }
 feedback(before,next,{levelUp=false}={}){
  if(!before)return;
  if(levelUp||next.dragons.some(d=>d.level>(before.dragons.find(v=>v.id===d.id)?.level??d.level)))this.sound(9);
  if(next.stats.feeds>before.stats.feeds)this.sound(12);
  if(next.stats.hatches>before.stats.hatches||(!before.breeding&&next.breeding))this.sound(10);
  if(next.stats.harvests>before.stats.harvests||next.food>before.food)this.sound(8);
  if(next.coins>before.coins||next.gems>before.gems)this.sound(7);
  if(next.habitats.length>before.habitats.length||next.structures.length>before.structures.length)this.sound(37);
  const farms=s=>[s.farm,...s.structures.map(v=>v.farm)].filter(Boolean).length;if(farms(next)>farms(before))this.sound(13);
  if(next.dragons.length<before.dragons.length||next.habitats.length<before.habitats.length||next.structures.length<before.structures.length)this.sound(4);
  if((next.missions?.done?.length??0)>(before.missions?.done?.length??0))this.sound(36);
 }
 destroy(){this.track?.pause();this.track=null;this.clearGap();this.stopEffects();}
}
export const gameAudio=new OriginalAudio();
export function installGameAudio(doc=document){
 const gesture=()=>gameAudio.unlock();doc.addEventListener('pointerdown',gesture,{capture:true});doc.addEventListener('keydown',gesture,{capture:true});
 const visibility=()=>gameAudio.setHidden(doc.hidden);doc.addEventListener('visibilitychange',visibility);visibility();
 const d=doc.querySelector('#modal'),sync=()=>{gameAudio.setScene(d.open&&d.dataset.mode==='sourceBattle'?(d.dataset.battleMusic==='advance'?'battleAdvance':'battleNormal'):'town');if(d.open&&d.dataset.mode==='sourceBattle'&&d.dataset.battleSkipped==='true')gameAudio.stopEffects();};
 const observer=new MutationObserver(sync);observer.observe(d,{attributes:true,attributeFilter:['open','data-mode','data-battle-music','data-battle-skipped']});sync();
 return ()=>{observer.disconnect();doc.removeEventListener('pointerdown',gesture,true);doc.removeEventListener('keydown',gesture,true);doc.removeEventListener('visibilitychange',visibility);gameAudio.destroy();};
}
export const audioSettingsHtml=()=>`<div class="native-audio-settings"><label><input type="checkbox" data-action="toggleMusic" ${gameAudio.preferences.music?'checked':''}> 音乐</label><label><input type="checkbox" data-action="toggleSound" ${gameAudio.preferences.sound?'checked':''}> 音效</label></div>`;
