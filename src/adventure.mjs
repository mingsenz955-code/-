import {ORIGINAL_ADVENTURE_MAPS,ORIGINAL_ADVENTURE_MAP_DETAILS,ORIGINAL_ADVENTURE_EVENTS,ORIGINAL_ADVENTURE_LEVELS} from '../assets/original/data/adventure.mjs';

// Client-side static evidence only. Player progress, owned stars, chest state and fight
// results come from the server: PVEData.lua calls SocketSender.getPveMapInfo() and reads
// pkg.mapEventList, so nothing here invents progress or rewards.
//
// Only the columns with evidence are read:
//   map      [id, levelRequirement, ?, atlas, ?, totalStars]  - column 6 is 12 on every
//            row, matching the live 20-stage map screenshot's "12/12".
//   maps     [id, ?, ?, ?, chineseName, layoutName, ?, ?, ?, note]  - the client's own
//            Chinese map name and plot layout.
//   mapevents[nodeId, mapId, ?, ?, prevNodeId, nextNodeId, ?, nodeName, plot, ?, order,
//            ?, kind]  - columns 5/6 chain previous/next and resolve for all 400 rows.
export const ADVENTURE_MAP_IDS=Object.freeze(ORIGINAL_ADVENTURE_MAPS.map(row=>row[0]));

const maps=new Map(ORIGINAL_ADVENTURE_MAPS.map(row=>[row[0],Object.freeze({id:row[0],minLevel:row[1],atlas:row[3],totalStar:row[5]})]));
const details=new Map(ORIGINAL_ADVENTURE_MAP_DETAILS.map(row=>[row[0],Object.freeze({id:row[0],name:row[4],layout:row[5],note:row[9]})]));
const events=new Map(ORIGINAL_ADVENTURE_EVENTS.map(row=>[row[0],Object.freeze({id:row[0],mapId:row[1],prev:row[4],next:row[5],name:row[7],kind:row[12]})]));

export function adventureMap(id){return maps.get(id)??null}
export function adventureMapDetail(id){return details.get(id)??null}
export function adventureEvent(id){return events.get(id)??null}
// mapevents keys its rows 900 above the map id: the map table holds 101..120 and the node
// table holds 1001..1020, and subtracting 900 reproduces the map id list exactly for all
// twenty entries, which is the evidence for this offset.
const EVENT_MAP_OFFSET=900;
export const ADVENTURE_EVENT_MAP_OFFSET=EVENT_MAP_OFFSET;
export function adventureMapNodes(mapId){const key=mapId+EVENT_MAP_OFFSET;return ORIGINAL_ADVENTURE_EVENTS.filter(row=>row[1]===key).map(row=>events.get(row[0]))}
export function adventureMapName(id){return details.get(id)?.name??''}
// A node kind is either the literal 'monster' or a dragon body-atlas name, which is what
// separates the 320 regular fight nodes from the 80 dragon nodes (4 per map).
export function adventureEventKind(node){return node?.kind==='monster'?'monster':node?'dragon':'unknown'}

// map_level is the 龙境仙踪 level table: one row per node with the map id, an event type,
// its own previous/next, the in-map order, and the same 30001+ and 5000020 values mapevents
// uses. Only the columns with evidence are read; the last column carries a locale key such as
// longjingxianzongdiyizhangdisanjiemiaoshu.
const levels=new Map(ORIGINAL_ADVENTURE_LEVELS.map(row=>[row[0],Object.freeze({id:row[0],mapId:row[1],kind:row[2],prev:row[6],next:row[7],order:row[8],fragmentId:row[9],dropGroup:row[10],note:row[25]??''})]));

export function adventureLevel(nodeId){return levels.get(nodeId)??null}
export function adventureLevelsOf(mapId){return ORIGINAL_ADVENTURE_LEVELS.filter(row=>row[1]===mapId).map(row=>levels.get(row[0]))}
// Kinds 1 and 2 line up with the client's own 普通/精英 buttons on panel_pve. Types 3 and 6
// appear once per map and have no proven meaning, so they keep a neutral label.
export function adventureLevelKindName(kind){return {1:'普通',2:'精英'}[kind]??`类型 ${kind}`}
export const ADVENTURE_LEVEL_COUNT=ORIGINAL_ADVENTURE_LEVELS.length;
