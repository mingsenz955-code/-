const unit=random=>{const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw Error('骰子随机值无效。');return n;};
function weighted(pool,random){let n=unit(random)*pool.reduce((v,r)=>v+r.weight,0);for(const r of pool){n-=r.weight;if(n<0)return r;}return pool.at(-1);}
function cells(d,random){const index=d.entryType-31,templates=d.tiles.filter(r=>(r[9+index]??0)>0&&d.items.some(p=>p.pool===r[2+index*2])).map(r=>({pool:r[2+index*2],weight:r[9+index]}));return Array.from({length:48},()=>{const t=weighted(templates,random),r=weighted(d.items.filter(r=>r.pool===t.pool),random),p=r.rewards[0];return {...p,amount:p.amount+Math.floor(unit(random)*((r.max??p.amount)-p.amount+1)),sourceRow:r.id,pool:r.pool};});}
export const monopolyActive=b=>b?.active??(!!b?.rolls&&b.position>0&&b.position<48);
export function monopolyCost(b){return Math.min(20,(b?.entries??0)+1);}
export function monopolyAction(s,d,p,random,pay){const h=s.activities.history,b=h.boards[d.key]??={position:0,rolls:0,dice:0};if(!b.journeyVersion){b.journeyVersion=1;b.active=b.rolls>0&&b.position>0&&b.position<48;b.entries=b.active?1:0;b.cells=b.active?cells(d,random):[];b.collected=[];b.lastPath=[];}
 if(p.op==='exit'){if(b.position!==48)throw Error('本轮尚未到达终点，可关闭后继续。');b.active=false;b.lastPath=[];return [];}
 if(!b.active){const cost=monopolyCost(b);pay(s,{type:d.entryType,itemId:-1,amount:cost});b.position=0;b.entries++;b.cells=cells(d,random);b.collected=[];b.active=true;b.dice=0;}
 b.lastPath=[];if(p.op==='enter')return [];if(b.position===48)throw Error('本轮已完成，请领取汇总后返回。');const rewards=[];do{const from=b.position;b.dice=1+Math.floor(unit(random)*6);b.position=Math.min(48,from+b.dice);b.rolls++;for(let i=from+1;i<=b.position;i++)b.lastPath.push(i);if(!b.collected.includes(b.position)){const {sourceRow,pool,...prize}=b.cells[b.position-1];rewards.push(prize);b.collected.push(b.position);}}while(p.op==='full'&&b.position<48);return rewards;
}
