import SOURCE from '../assets/original/data/profile-growth.mjs';
import {SPECIES,speciesKey} from './data.mjs';
export const profileOf=s=>s.profile??{id:'本地档案',name:'御龙高手',avatar:1020,renameCount:0};
export const createProfile=now=>({id:'LOCAL-'+now.toString(36).toUpperCase(),name:'御龙高手',avatar:1020,renameCount:0});
export const renameCost=s=>profileOf(s).renameCount===0?0:SOURCE.renameCost;
export const avatarImage=id=>`assets/original/ui/thumbs_${SPECIES[speciesKey(id)].original}_1.png`;
export function profileAvatars(s){return [...new Set([...s.dragons.map(d=>d.species),...(s.activities?.history?.discovered??[]),speciesKey(profileOf(s).avatar)])].map(k=>SPECIES[k]).filter(sp=>sp?.originalId).map(sp=>({id:sp.originalId,name:sp.name,image:avatarImage(sp.originalId)}));}
export function nicknameError(name){if(typeof name!=='string'||[...name].length<1||[...name].length>SOURCE.nameLimit)return '昵称长度须为1至6个字。';if(!/^[\p{L}\p{N}]+$/u.test(name))return '名字中不能包含特殊符号或空格。';if(SOURCE.blockedWords.some(w=>name.includes(w)))return '你的名字包含不合规的词汇，请尝试其他名字。';return null;}
export function validateProfile(s){const p=s.profile;if(p===undefined)return;if(!p||typeof p.id!=='string'||!/^LOCAL-[0-9A-Z]+$/.test(p.id)||typeof p.name!=='string'||[...p.name].length<1||[...p.name].length>6||!Number.isSafeInteger(p.avatar)||!SPECIES[speciesKey(p.avatar)]||!Number.isSafeInteger(p.renameCount)||p.renameCount<0)throw Error('玩家资料存档无效。');}
