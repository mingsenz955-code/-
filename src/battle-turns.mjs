// Offline presentation of the existing result, not the server battle solver.
// Each living slot gets a turn before the final round resolves the losing side.
export function battleTurnPlan(winnerCount,loserCount){
 if(!Number.isInteger(winnerCount)||!Number.isInteger(loserCount)||winnerCount<1||loserCount<1||winnerCount>6||loserCount>6)throw Error('战斗阵容数量无效。');
 const turns=[],alive=Array.from({length:loserCount},(_,i)=>i);
 for(let round=1;round<=3;round++)for(let i=0;i<Math.max(winnerCount,loserCount);i++){
  if(i<loserCount&&alive.includes(i))turns.push({round,winning:false,actor:i,target:i%winnerCount,finishing:false});
  if(i<winnerCount&&alive.length){const target=alive[i%alive.length],finishing=round===3;turns.push({round,winning:true,actor:i,target,finishing});if(finishing)alive.splice(alive.indexOf(target),1);}
 }
 // When the losing side is larger, finish the remaining slots in formation order.
 for(let i=0;alive.length;i++)turns.push({round:3,winning:true,actor:i%winnerCount,target:alive.shift(),finishing:true});
 return turns;
}
