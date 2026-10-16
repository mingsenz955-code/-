import SOURCE from '../assets/original/data/profile-growth.mjs';
export const MAX_DRAGON_LEVEL=SOURCE.maxLevel;
export function dragonLevelCap(s){return Math.max(SOURCE.baseLevel,...s.structures.filter(o=>!o.readyAt).map(o=>SOURCE.altarLevels[o.itemId]??0));}
export function dragonLevelHint(s){const cap=dragonLevelCap(s);return cap===MAX_DRAGON_LEVEL?`已达到龙等级上限${cap}。`:`当前龙等级上限${cap}，请建造更高级祭坛。`;}
