import {formationPosition,formationDefinition} from './formation.mjs';
// BattleUI root position tables, confirmed by static disassembly.
const POS={ally:{land:[[337,144,213,164,89,145],[342,163,254,143,165,163,77,143],[340,145,215,165]],sky:[[380,500,255,438,131,500],[380,498,256,436],[384,500,295,438,207,500,118,438]]},enemy:{land:[[105,144,229,164,354,144],[125,145,213,165,302,145,390,165],[124,147,248,167]],sky:[[63,500,187,438,311,500],[66,500,191,438],[80,502,168,440,257,502,345,440]]}};
export function battlePositions(team,side='ally'){
 const land=team.filter(d=>formationPosition(d)===0).length,sky=team.length-land,kind=land===4?1:sky===4?2:0,counters={land:0,sky:0};
 return team.map(d=>{const type=formationPosition(d)===1?'sky':'land',i=counters[type]++,pairs=POS[side][type][kind],x=pairs[i*2]??(type==='sky'?118+i*80:89+i*80),y=pairs[i*2+1]??(type==='sky'?438:144);return {x:(side==='ally'?0:551)+x,y:type==='sky'?576-144-(y-144)*.62:576-y,type,scale:formationDefinition(d)?.scaleInBattle??.65}});
}
