import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ADVENTURE_MAP_IDS,adventureMap,adventureMapDetail,adventureMapNodes,adventureEvent,adventureMapName,adventureEventKind} from '../src/adventure.mjs';

test('adventure export keeps every source row and records how the chain was proven',async()=>{
 const bytes=await fs.readFile(new URL('../assets/original/data/tables.json',import.meta.url));
 const tables=JSON.parse(bytes),report=JSON.parse(await fs.readFile(new URL('../assets/original/data/adventure-provenance.json',import.meta.url),'utf8'));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),report.tablesSha256);
 assert.equal(report.mapRows,tables.map.length);
 assert.equal(report.eventRows,tables.mapevents.length);
 assert.equal(report.chain.forwardLinksResolve,tables.mapevents.length);
 assert.equal(report.chain.backwardLinksResolve,tables.mapevents.length);
});

test('the client ships 20 adventure maps of 20 chained nodes each',()=>{
 assert.equal(ADVENTURE_MAP_IDS.length,20);
 assert.deepEqual(ADVENTURE_MAP_IDS.slice(0,3),[101,102,103]);
 const first=adventureMap(101);
 assert.equal(first.totalStar,12,'column 6 is the 12-star total shown in the live screenshot');
 assert.equal(first.minLevel,7);
 assert.equal(first.atlas,'item_pve_map_1');
 assert.equal(adventureMapName(101),'神秘的背影');
 assert.equal(adventureMapDetail(101).layout,'plot01');
 assert.equal(adventureMap(999),null);
 assert.equal(adventureEvent(999999),null);
 for(const id of ADVENTURE_MAP_IDS){
  const nodes=adventureMapNodes(id);
  assert.equal(nodes.length,20,`map ${id} must have 20 nodes`);
  for(const node of nodes){
   assert(node.name,`node ${node.id} must keep its name`);
   if(node.next!==-1)assert(adventureEvent(node.next),`node ${node.id} next must exist`);
   if(node.prev!==-1)assert(adventureEvent(node.prev),`node ${node.id} prev must exist`);
  }
 }
 // The 400 nodes are one continuous line: only the very first node has no previous and
 // only the very last has no next, so the chain runs across all twenty maps.
 const all=ADVENTURE_MAP_IDS.flatMap(id=>adventureMapNodes(id));
 assert.equal(all.filter(node=>node.prev===-1).length,1,'exactly one entry node');
 assert.equal(all.filter(node=>node.next===-1).length,1,'exactly one terminal node');
});

test('every node is either a monster fight or a dragon node, four dragons per map',()=>{
 const all=ADVENTURE_MAP_IDS.flatMap(id=>adventureMapNodes(id));
 assert.equal(all.length,400);
 assert.equal(all.filter(node=>adventureEventKind(node)==='monster').length,320);
 assert.equal(all.filter(node=>adventureEventKind(node)==='dragon').length,80);
 for(const id of ADVENTURE_MAP_IDS)assert.equal(adventureMapNodes(id).filter(node=>adventureEventKind(node)==='dragon').length,4);
 assert.equal(adventureEventKind(null),'unknown');
});
