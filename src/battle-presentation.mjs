import {formationDefinition,formationPosition} from './formation.mjs';

export const BATTLE_VIEWPORT={width:1024,height:768};
// BattleField:onFire_ / getTargetsIXY_: native coordinates have positive Y up.
export function projectilePoints(attacker,origin,target,destination,side='ally'){
 const def=formationDefinition(attacker)??{};
 return {from:{x:origin.x+(def.bulletOffsetX??0)*(side==='ally'?1:-1),y:origin.y-(def.bulletHeight??0)},to:{x:destination.x,y:destination.y-(formationPosition(target)===0?77:0)}};
}
export function projectilePlan(type,from,to){
 const distance=Math.hypot(to.x-from.x,to.y-from.y),angle=Math.atan2(to.y-from.y,to.x-from.x)*180/Math.PI;
 if(type===3)return {kind:'normal',distance,angle,duration:distance/1800*1000,scaleX:2,scaleY:from.x>to.x?-1:2};
 if(type===2||type===4)return {kind:type===2?'lightning':'chain',distance,angle,scaleX:distance/270*2,scaleY:2,keep:type===2?500:300,fade:type===2?300:150};
 return {kind:'instant',distance,angle,duration:0};
}
