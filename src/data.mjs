// Source-backed data and legacy compatibility defaults are distinguished in docs/EVIDENCE.md.
import ORIGINAL_CATALOG from '../assets/original/catalog.mjs';
import {ORIGINAL_BREEDING} from '../assets/original/data/rules.mjs';
export const SPECIES = {
  ember: { name:'烈火龙', element:'火', color:'#f18c59', accent:'#ffc77c', rarity:'基础', income:2,original:'1020_dragon_fire_a' },
  leaf: { name:'草龙', element:'木', color:'#83bc71', accent:'#d1e99b', rarity:'基础', income:2,original:'1000_dragon_plant_b' },
  tide: { name:'深水龙', element:'水', color:'#6daedb', accent:'#c1e8ef', rarity:'基础', income:2,original:'1033_dragon_water_a' },
  bloom: { name:'绯花龙', element:'火 / 木', color:'#c87cba', accent:'#f5c7e5', rarity:'稀有', income:4 },
  mist: { name:'雾岚龙', element:'水 / 木', color:'#81c6b5', accent:'#c9f6dd', rarity:'稀有', income:4 },
  steam: { name:'流焰龙', element:'火 / 水', color:'#a59bd8', accent:'#eee0ff', rarity:'稀有', income:4 },
};
export {ORIGINAL_CROPS,ORIGINAL_LEVELS,ORIGINAL_FARMS} from '../assets/original/data/rules.mjs';
export const RULES = { cropCost:50, cropYield:10, cropMs:30000, breedCost:120, breedMs:20000, hatchMs:15000, habitatCost:300, habitatCapacity:3, maxHabitats:6, incomeCapMs:8*3600000, maxLevel:20,feedsPerLevel:4,breedMinLevel:4 };
export const RECIPES = { 'ember+leaf':'bloom', 'leaf+tide':'mist', 'ember+tide':'steam' };
export const speciesKey=id=>({1000:'leaf',1020:'ember',1033:'tide'})[id]||`original${id}`;
const elements={e:'岩土',f:'烈火',w:'深水',p:'草木',m:'金属',i:'寒冰',el:'闪电',d:'黑暗',l:'传奇'};
for(const record of ORIGINAL_CATALOG){const key=speciesKey(record.id);SPECIES[key]={...(SPECIES[key]??{color:'#8ba8ad',accent:'#d7e7e4',income:2}),name:record.name,quality:record.extended.quality??null,element:(record.original.attributes??[]).map(e=>elements[e]??e).join(' / '),rarity:`品质 ${record.extended.quality??'待核对'}`,original:record.base,originalId:record.id,isLegendHabitat:record.original.legen===1,attributes:record.original.attributes??[],stages:record.images,skeletal:[1000,1020,1033].includes(record.id),breedingMs:record.original.breeding_time*1000,hatchingMs:record.original.hatching_time*1000,coinStart:record.original.starting_coins,coinAdded:record.original.coins_added,sellGold:record.original.sell_price?.g??0};}
const breedIndex=new Map(ORIGINAL_BREEDING.map(row=>[[row[1],row[2]].sort((a,b)=>a-b).join('+'),row]));
export function breedingOptions(a,b){const sa=SPECIES[a],sb=SPECIES[b];if(!sa?.originalId||!sb?.originalId)return null;const row=breedIndex.get([sa.originalId,sb.originalId].sort((a,b)=>a-b).join('+'));if(!row||row[3]!==1)return [];const result=[];for(let i=4;i<row.length;i+=2)if(row[i]>0&&row[i+1]>0&&SPECIES[speciesKey(row[i])])result.push({species:speciesKey(row[i]),weight:row[i+1]});return result;}
export const ROADMAP = [
 ['龙种与皮肤','90 条原版记录、87 条三阶段模型与1734段动作；缺失模型、完整皮肤和特效继续核对'],
 ['牧场与养成','已接入原版农场、四次喂养、产金与18项元素巢定义；原版界面和地块继续还原'],
 ['繁殖与孵化','培育山与育龙塔独立并发；采用原版客户端基础池，服务器概率仍待核实'],
 ['皇冠 / 羽翼 / 升星','原版六槽和装备表已取得，穿戴、培养、星级与数值仍待实现'],
 ['装备与宝石','待建立装备、镶嵌、强化数据与原版界面对照'],
 ['战斗与副本','待核实阵型、属性克制、技能和副本关卡'],
 ['历史活动与抽奖','待取得活动时间、奖池、概率和保底证据；计划离线重放'],
 ['本地存档','版本化 JSON、自动保存、备份恢复、导入导出；不连接服务器'],
];
