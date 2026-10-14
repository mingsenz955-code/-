"""Island expansion price evidence.

expansion_prices is a pcf table with no *Info.lua column definition, so the reading below
is an explicit inference from the values themselves and is recorded as such. The table is
what the client uses for the 扩建 (island expansion) entries in the shop.
"""
from pathlib import Path
import json, hashlib
ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'assets/original/data/tables.json').read_bytes()
tables = json.loads(raw)
rows = tables['expansion_prices']
valid = [row for row in rows if row[4] > 0]
coins = [row[2] for row in valid]
levels = [row[1] for row in valid]
gems = [row[3] for row in valid]
text = 'export const ORIGINAL_EXPANSION_PRICES=' + json.dumps(rows, ensure_ascii=False) + ';\n'
(ROOT / 'assets/original/data/expansion.mjs').write_bytes(text.encode('utf8'))
report = {
    'baseline': '2.9.35-202402271124',
    'tablesSha256': hashlib.sha256(raw).hexdigest(),
    'rows': len(rows),
    'stepsWithCost': len(valid),
    'inferredColumns': {
        '1': 'row index',
        '2': 'required ranch level (rises 2 -> 100 and stops at the level cap)',
        '3': 'gold price (rises 4000 -> 370000, never decreases)',
        '4': 'gem price (small integers 0..50, non-decreasing)',
        '5': 'plot number (1..N, the expansion slot the client unlocks)',
    },
    'evidence': [
        'Columns 3 and 2 are monotonically non-decreasing across the whole table, which is what a price and a level gate look like.',
        'The first four rows are all zero and carry plot 0, i.e. the starting island the player already owns.',
        'The client ships islandtop/islandbottom/islandleft/islandright layouts with an entry sprite, lock sprites (nine on the top side) and islandtop_g_top_btn, plus thumbs_store_expansion_island_2/3/4 in the shop atlas, which is the expansion feature this table prices.',
    ],
    'unverified': [
        'The literal column meanings are not proven by any client column definition and must not be presented as the original rule.',
        'Whether the server consumes this table unchanged, and how plots map onto ui_mapland_land<N> art, is unknown.',
    ],
}
(ROOT / 'assets/original/data/expansion-provenance.json').write_bytes(
    (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode('utf8'))
print('Expansion:', len(rows), 'rows,', len(valid), 'priced steps; gold', coins[0], '->', coins[-1],
      '; level', levels[0], '->', levels[-1], '; gems max', max(gems))
