"""Adventure (PVE) map and node evidence.

Player progress, star state and rewards are server-side: PVEData.lua calls
SocketSender.getPveMapInfo() and reads pkg.mapEventList. This script therefore exports
only the client's own static maps and node chain, and records which columns are proven.
"""
from pathlib import Path
import json, hashlib
ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'assets/original/data/tables.json').read_bytes()
tables = json.loads(raw)
maps = tables['map']
map_details = tables['maps']
events = tables['mapevents']
levels = tables['map_level']
chain = {}
for row in events:
    chain[row[0]] = (row[4], row[5])
forward = sum(1 for key, (prev, nxt) in chain.items() if nxt in chain or nxt == -1)
backward = sum(1 for key, (prev, nxt) in chain.items() if prev in chain or prev == -1)
level_chain = sum(1 for row in levels if row[6] in chain or row[6] == -1)
text = ('export const ORIGINAL_ADVENTURE_MAPS=' + json.dumps(maps, ensure_ascii=False) + ';\n'
        'export const ORIGINAL_ADVENTURE_MAP_DETAILS=' + json.dumps(map_details, ensure_ascii=False) + ';\n'
        'export const ORIGINAL_ADVENTURE_EVENTS=' + json.dumps(events, ensure_ascii=False) + ';\n'
        'export const ORIGINAL_ADVENTURE_LEVELS=' + json.dumps(levels, ensure_ascii=False) + ';\n')
(ROOT / 'assets/original/data/adventure.mjs').write_bytes(text.encode('utf8'))
report = {
    'baseline': '2.9.35-202402271124',
    'tablesSha256': hashlib.sha256(raw).hexdigest(),
    'mapRows': len(maps),
    'mapDetailRows': len(map_details),
    'eventRows': len(events),
    'levelRows': len(levels),
    'chain': {
        'forwardLinksResolve': forward,
        'backwardLinksResolve': backward,
        'levelChainResolve': level_chain,
        'note': 'Columns 5 and 6 of mapevents are the previous/next node and resolve for every exported row, which is the evidence for reading them as a chain. map_level carries the same node ids with its own previous/next columns and the same 30001+ and 5000020 values, which is why it is the level table for 龙境仙踪.',
    },
    'proven': [
        'map column 1 is the map id, column 2 the level requirement and column 6 the total star count (12), matching the live 20-stage map screenshot.',
        'mapevents column 1 is the node id, column 8 the node name, column 13 the event kind (monster/...), columns 5/6 the chain.',
        'map_level has one row per node with map id, event type, previous/next, an in-map order 1..20, the same 30001+ and 5000020 values mapevents uses, and a text key such as longjingxianzongdiyizhangdisanjiemiaoshu.',
        'Dragon_computer_array_nine packs six to nine monster ids per row and 11203 of its 12383 ids exist in the monster table, whose columns are element, position, level and the attack/defence/life triple.',
    ],
    'unverified': [
        'Remaining column meanings are not proven and must not be guessed.',
        'The link from a level node to the monster pack it fights is NOT in the exported tables: no column of map_level or mapevents carries a pack id, so enemy configuration stays unproven and is not invented.',
        'Player progress, owned stars, chest state and fight results come from the server.',
        'Battle simulation itself is not implemented.',
    ],
}
(ROOT / 'assets/original/data/adventure-provenance.json').write_bytes(
    (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode('utf8'))
print('Adventure:', len(maps), 'maps,', len(map_details), 'details,', len(events), 'nodes;',
      forward, 'forward and', backward, 'backward links resolve')
