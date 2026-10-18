import RANKING from '../assets/original/data/boss-ranking.mjs';
import SOURCE from '../assets/original/data/boss-achievements.mjs';
export const BOSS_ACHIEVEMENTS=SOURCE;
export function validateBossAchievements(b){b.highestDailyDamage??=b.todayDamage;b.achievementClaimed??=[];if(!Number.isSafeInteger(b.highestDailyDamage)||b.highestDailyDamage<0||!Array.isArray(b.achievementClaimed)||new Set(b.achievementClaimed).size!==b.achievementClaimed.length||b.achievementClaimed.some(id=>!SOURCE.some(r=>r.id===id)))throw Error('首领成就记录无效。');b.highestDailyDamage=Math.max(b.highestDailyDamage,b.todayDamage);}
export const bossAchievementRows=s=>SOURCE.map(r=>({...r,claimed:s.encounters.boss.achievementClaimed.includes(r.id),eligible:s.encounters.boss.highestDailyDamage>=r.damage}));
export function bossAchievementPlan(s,id){const r=bossAchievementRows(s).find(r=>r.id===id);if(!r||r.claimed)throw Error('该首领成就奖励已领取或不存在。');if(!r.eligible)throw Error('单日最高伤害尚未达到要求。');return r;}

export const BOSS_RANKING=RANKING;
export const bossRankingRow=rank=>RANKING.find(r=>rank>=r.top&&rank<=r.bottom)??null;
export function validateBossSettlement(b){if(b.rankSettlement===undefined)return;const r=b.rankSettlement;if(!r||r.rank!==1||r.rowId!==bossRankingRow(1).id||!Number.isSafeInteger(r.kill)||r.kill<1||r.kill>b.kills)throw Error('首领排名结算无效。');}
