"""Export source equipment definitions without inventing acquisition or server rules.

The 6000 rows include upgrade tiers. `price` in EquipInfo is a resale price.
No original Lua code is executed; input is the previously read literal tables.
"""
from pathlib import Path
import hashlib, json, re

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/original/data'
TABLES = OUT / 'tables.json'
SCHEMA = ROOT / 'work/client-config/dragon/pconfig/librarys/equip/EquipInfo.lua'


def export():
    raw = TABLES.read_bytes()
    tables = json.loads(raw)
    schema_raw = SCHEMA.read_bytes()
    fields = {name: int(index) for name, index in re.findall(
        r'self\.([A-Za-z_0-9]+)\s*=\s*(?:(?:tonumber|tonum)\s*\(\s*)?arr\[(\d+)\]',
        schema_raw.decode('utf8'))}
    if len(fields) != 33 or fields.get('price') != 24 or fields.get('part') != 4:
        raise ValueError('Equipment schema changed; review before exporting.')
    records = []
    for row in tables['equipinfo']:
        if len(row) != 33:
            raise ValueError('Unexpected equipment row length.')
        record = {name: row[index - 1] for name, index in fields.items()}
        record['sellPrice'] = record.pop('price')
        record['prevView'] = record['prevView'] == 1
        image = 'assets/original/ui/thumbs_' + record['icon'] + '.png'
        record['image'] = image if (ROOT / image).is_file() else None
        records.append(record)
    ids = {r['id'] for r in records}
    if len(ids) != len(records):
        raise ValueError('Duplicate source equipment ID.')
    for record in records:
        if record['part'] not in range(6) or record['quality'] not in range(1, 6):
            raise ValueError('Unknown source equipment slot or quality.')
    records.sort(key=lambda record: record['id'])
    result = 'export const ORIGINAL_EQUIPMENT=' + json.dumps(records, ensure_ascii=False, separators=(',', ':')) + ';\n'
    (OUT / 'equipment.mjs').write_bytes(result.encode('utf8'))
    report = {
        'baseline': 'Android 2.9.35 / resources 202402271124',
        'table': 'equipinfo', 'rowsIncludingUpgradeTiers': len(records),
        'gradeOneRows': sum(r['grade'] == 1 for r in records),
        'uniqueIcons': len({r['icon'] for r in records}),
        'missingIcons': sorted({r['icon'] for r in records if r['image'] is None}),
        'slots': {str(part): sum(r['part'] == part for r in records) for part in range(6)},
        'tablesSha256': hashlib.sha256(raw).hexdigest(),
        'schemaSource': 'assets/scripts/dragon/pconfig/librarys/equip/EquipInfo.lua',
        'schemaSha256': hashlib.sha256(schema_raw).hexdigest(),
        'columns': fields,
        'missingNextIds': sorted({r['nextGradeID'] for r in records if r['nextGradeID'] > 0 and r['nextGradeID'] not in ids}),
        'missingPreviousIds': sorted({r['prevGradeID'] for r in records if r['prevGradeID'] > 0 and r['prevGradeID'] not in ids}),
        'notes': [
            'price column 24 is renamed sellPrice, never a purchase price.',
            'dropFrom and random attribute package IDs are source references, not verified probabilities.',
            'No items are granted to the player by this exporter.',
            'Slot numbering is 0 weapon, 1 scales, 2 bone, 3 horn, 4 wings, 5 crown.',
        ],
    }
    (OUT / 'equipment-provenance.json').write_bytes((json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode('utf8'))
    print('Equipment source rows:', len(records), 'grade-one rows:', report['gradeOneRows'], 'missing next IDs:', len(report['missingNextIds']))


if __name__ == '__main__':
    export()
