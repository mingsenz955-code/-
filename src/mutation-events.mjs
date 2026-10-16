import SOURCE from '../assets/original/data/dragon-growth.mjs';
import {SPECIES} from './data.mjs';
export const mutationEvents=SOURCE.randomevent_nr.map(r=>Object.fromEntries('id evId evType weight seconds type itemId amount price monster name description'.split(' ').map((k,i)=>[k,r[i]])));
export const mutationEvent=id=>mutationEvents.find(r=>r.id===id);
// User-selected local policy; this is not a recovered server probability.
export const mutationChance=()=>.5;
export function validateMutations(s){s.mutations??={nextId:1,events:[]};const m=s.mutations;if(!m||!Number.isSafeInteger(m.nextId)||m.nextId<1||!Array.isArray(m.events)||m.events.length>5)throw Error('奇遇存档无效。');const ids=new Set();for(const e of m.events){if(!mutationEvent(e.tableId)||!Number.isSafeInteger(e.id)||e.id<1||e.id>=m.nextId||ids.has(e.id)||!Number.isSafeInteger(e.expiresAt)||e.expiresAt<0)throw Error('奇遇事件无效。');ids.add(e.id);}}
export function triggerMutation(s,job,now,random,observedAt=now){const variant=SOURCE.randomevent_cf.find(r=>r[3]===SPECIES[job.species].originalId),pool=variant&&SPECIES[job.species].quality>=4?mutationEvents.filter(r=>r.evId===variant[2]):(job.durationMs??job.readyAt-(job.startedAt??job.readyAt))>3600000?mutationEvents.filter(r=>r.evId===0):[];if(!pool.length)return false;const unit=()=>{const v=random();if(!Number.isFinite(v)||v<0||v>=1)throw Error('奇遇随机值无效。');return v;};if(unit()>=mutationChance(s))return false;let roll=unit()*pool.reduce((n,r)=>n+r.weight,0),row=pool.at(-1);for(const r of pool){roll-=r.weight;if(roll<0){row=r;break;}}if(now+row.seconds*1000<=observedAt)return false;s.mutations.events=s.mutations.events.filter(e=>e.expiresAt>observedAt);s.mutations.events.push({id:s.mutations.nextId++,tableId:row.id,expiresAt:now+row.seconds*1000});s.mutations.events=s.mutations.events.slice(-5);return true;}

export const activeMutations=(s,now=Date.now())=>(s.mutations?.events??[]).filter(e=>e.expiresAt>now);
export const mutationNeedsRefresh=(s,now=Date.now())=>!!(s.breeding?.phase==='breeding'&&!s.breeding.mutationChecked&&now>=s.breeding.readyAt)||!!s.mutations?.events.some(e=>e.expiresAt<=now);
export function refreshMutations(s,now,random=Math.random){
 const job=s.breeding;let found=false;
 if(job?.phase==='breeding'&&!job.mutationChecked&&now>=job.readyAt){
  // Completion is evaluated once, including across speedups, late collection and restart.
  found=triggerMutation(s,job,job.readyAt,random,now);job.mutationChecked=true;
 }
 s.mutations.events=s.mutations.events.filter(e=>e.expiresAt>now);
 return found&&s.mutations.events.some(e=>e.id===s.mutations.nextId-1);
}
