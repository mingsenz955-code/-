import SOURCE from '../assets/original/data/activities.mjs';
import {vipInfo} from './vip.mjs';
export const trainingRule=stage=>{const r=SOURCE.training.find(r=>r[0]===stage);if(!r)return null;return {stage:r[0],next:r[1],rate:r[2],pills:r[3],food:r[4],attack:r[8],defend:r[9],life:r[10]};};
export function trainingState(d){return d.training??{stage:0,attack:0,defend:0,life:0};}
export function validateTraining(d){if(d.training===undefined)return;const t=d.training,r=trainingRule(t?.stage);if(!r||!['attack','defend','life'].every(k=>Number.isSafeInteger(t[k])&&t[k]>=0&&t[k]<=r[k]))throw Error('龙培养属性无效。');}
// Costs, success rate, stage caps and VIP trainOdds come from the client. The
// server alone chooses gains/perfect rolls; this offline gain rule is labelled.
export function trainDragon(s,id,count=1,random=Math.random,now=s.updatedAt){const d=s.dragons.find(d=>d.id===id);if(!d||d.level<7)throw Error('请选择至少7级的龙进行培养。');if(s.breeding?.phase==='breeding'&&s.breeding.parents.includes(id)&&s.breeding.readyAt>now)throw Error('繁殖中的龙不能培养。');if(![1,10].includes(count))throw Error('请选择单次或十次培养。');if(count===10&&!vipInfo(s).onekeyTrain)throw Error('当前VIP尚未开放一键培养。');const t=d.training??={stage:0,attack:0,defend:0,life:0},roll=()=>{const v=random();if(!Number.isFinite(v)||v<0||v>=1)throw Error('培养随机值无效。');return v;};let done=0,success=0;
 for(let i=0;i<count;i++){let r=trainingRule(t.stage);if(['attack','defend','life'].every(k=>t[k]===r[k])){const next=trainingRule(r.next);if(!next||next.stage===r.stage)break;t.stage=next.stage;r=next;}
  if((s.items[6022]??0)<r.pills||s.food<r.food){if(!done)throw Error((s.items[6022]??0)<r.pills?'培养丹不足。':'龙粮不足。');break;}
  s.items[6022]-=r.pills;s.food-=r.food;done++;s.activities.history.counts['training-pills']=(s.activities.history.counts['training-pills']??0)+r.pills;s.activities.history.counts['training-attempts']=(s.activities.history.counts['training-attempts']??0)+1;s.activities.history.counts['source-training-points']=(s.activities.history.counts['source-training-points']??0)+4;
  if(roll()*10000<Math.min(10000,r.rate+vipInfo(s).trainOdds*100)){const perfect=roll()<.05;if(perfect)s.activities.history.counts['training-perfect']=(s.activities.history.counts['training-perfect']??0)+1;for(const k of ['attack','defend','life']){const before=t[k];t[k]=Math.min(r[k],t[k]+Math.max(1,Math.floor(r[k]*(.01+roll()*.02)*(perfect?10:1))));s.activities.history.counts['training-gains']=(s.activities.history.counts['training-gains']??0)+t[k]-before;}success++;}else s.activities.history.counts['training-failures']=(s.activities.history.counts['training-failures']??0)+1;
 }
 if(!done)throw Error('该龙培养已达上限。');return `完成 ${done} 次离线培养，成功 ${success} 次，获得 ${done*4} 培养活动积分。`;
}
