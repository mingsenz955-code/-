"""Dragon combat baseline.

Dragon_atks carries one row per dragon and quality tier with the columns LibDragonAtksInfo
defines. Only the baseline growth columns are exported here: the client's own getPower also
adds crit, uncrit, awakening, treasure and rune terms that this build does not have, so the
power computed from this file is a documented baseline, not the original total.
"""
from pathlib import Path
import json, hashlib
ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'assets/original/data/tables.json').read_bytes()
tables = json.loads(raw)
rows = tables['Dragon_atks']
out = []
for row in rows:
    out.append({
        'dragonId': row[1], 'quality': row[2],
        'baseAttack': row[3], 'baseDefence': row[4], 'baseLife': row[5],
        'resistance': row[6], 'attackQuality': row[8], 'defenceQuality': row[9], 'lifeQuality': row[10],
    })
text = 'export const ORIGINAL_DRAGON_ATK=' + json.dumps(out, ensure_ascii=False) + ';\n'
(ROOT / 'assets/original/data/battle.mjs').write_bytes(text.encode('utf8'))
qualities = sorted({row[2] for row in rows})
report = {
    'baseline': '2.9.35-202402271124',
    'tablesSha256': hashlib.sha256(raw).hexdigest(),
    'rows': len(rows),
    'dragons': len({row[1] for row in rows}),
    'qualities': qualities,
    'columns': 'LibDragonAtksInfo defines all twenty-six columns; the export keeps the baseline growth set.',
    'evidence': [
        'DragonElement.updateAttributes computes floor(baseAttack + (level-1)*attackQuality + ...) for attack, with matching defence and life growth (static disassembly in docs/reference/dragon-attributes-disassembly.txt).',
        'DragonElement.getPower computes floor(attack + defend + maxblood/3 + crit + uncrit + getRunePower()).',
    ],
    'unverified': [
        'Crit, uncrit, awakening, treasure and rune terms are not implemented, so a power value here is below the original total.',
        'Enemy configuration for a PVE node is not resolvable from the exported tables.',
    ],
}
(ROOT / 'assets/original/data/battle-provenance.json').write_bytes(
    (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode('utf8'))
print('Dragon combat rows:', len(out), 'dragons', report['dragons'], 'qualities', qualities)
