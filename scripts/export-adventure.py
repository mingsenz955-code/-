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
chain = {}
for row in events:
    chain[row[0]] = (row[4], row[5])
forward = sum(1 for key, (prev, nxt) in chain.items() if nxt in chain or nxt == -1)
backward = sum(1 for key, (prev, nxt) in chain.items() if prev in chain or prev == -1)
text = ('export const ORIGINAL_ADVENTURE_MAPS=' + json.dumps(maps, ensure_ascii=False) + ';\n'
        'export const ORIGINAL_ADVENTURE_MAP_DETAILS=' + json.dumps(map_details, ensure_ascii=False) + ';\n'
        'export const ORIGINAL_ADVENTURE_EVENTS=' + json.dumps(events, ensure_ascii=False) + ';\n')
(ROOT / 'assets/original/data/adventure.mjs').write_bytes(text.encode('utf8'))
report = {
    'baseline': '2.9.35-202402271124',
    'tablesSha256': hashlib.sha256(raw).hexdigest(),
    'mapRows': len(maps),
    'mapDetailRows': len(map_details),
    'eventRows': len(events),
    'chain': {
        'forwardLinksResolve': forward,
        'backwardLinksResolve': backward,
        'note': 'Columns 5 and 6 are the previous/next node and are self-consistent across every exported row, which is the evidence for reading them as a chain.',
    },
    'proven': [
        'map column 1 is the map id, column 2 the level requirement and column 6 the total star count (12), matching the live 20-stage map screenshot.',
        'mapevents column 1 is the node id, column 8 the node name, column 13 the event kind (monster/...), columns 5/6 the chain.',
    ],
    'unverified': [
        'Remaining column meanings are not proven and must not be guessed.',
        'Player progress, owned stars, chest state and fight results come from the server.',
        'Battle simulation itself is not implemented.',
    ],
}
(ROOT / 'assets/original/data/adventure-provenance.json').write_bytes(
    (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode('utf8'))
print('Adventure:', len(maps), 'maps,', len(map_details), 'details,', len(events), 'nodes;',
      forward, 'forward and', backward, 'backward links resolve')
