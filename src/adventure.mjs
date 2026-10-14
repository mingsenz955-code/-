import {ORIGINAL_ADVENTURE_MAPS,ORIGINAL_ADVENTURE_MAP_DETAILS,ORIGINAL_ADVENTURE_EVENTS} from '../assets/original/data/adventure.mjs';

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
