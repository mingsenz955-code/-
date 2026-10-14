"""Recharge tiers and their rewards.

danchong has a full column definition (LibDanbichongzhiInfo): id, androidCost, iosCost,
three award groups of (type, id, num, quality), costYuan, costIOS. costYuan is the real
price in yuan and androidCost/iosCost are that price x10, which holds for every row. Award
names are resolved through the pcf items table plus the client's own Chinese translation,
so the panel can show real names instead of internal keys.
"""
from pathlib import Path
import json, zipfile, hashlib
ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'assets/original/data/tables.json').read_bytes()
tables = json.loads(raw)
z = zipfile.ZipFile(ROOT / 'work/yulong-dcn.apk')
translation = json.loads(z.read('assets/res/config/textnew_cn.json'))['translation']
items = {row[0]: row[1] for row in tables['items']}
TYPE_NAMES = {1: '金币', 2: '龙粮', 3: '魔晶'}
rows = tables['danchong']
tiers = []
for row in rows:
    awards = []
    for index in range(3):
        base = 3 + index * 4
        award_type, award_id, award_num, award_quality = row[base], row[base + 1], row[base + 2], row[base + 3]
        if award_type and award_type > 0 and award_num and award_num > 0:
            if award_type in TYPE_NAMES:
                name = TYPE_NAMES[award_type]
            else:
                key = items.get(award_id) or ''
                name = translation.get(key) or key or f'{award_id}'
            awards.append({'type': award_type, 'id': award_id, 'num': award_num, 'quality': award_quality, 'name': name})
    tiers.append({'id': row[0], 'costYuan': row[15], 'costIOS': row[16], 'awards': awards})
text = 'export const ORIGINAL_RECHARGE_TIERS=' + json.dumps(tiers, ensure_ascii=False) + ';\n'
(ROOT / 'assets/original/data/recharge.mjs').write_bytes(text.encode('utf8'))
report = {
    'baseline': '2.9.35-202402271124',
    'tablesSha256': hashlib.sha256(raw).hexdigest(),
    'tierCount': len(tiers),
    'columns': 'LibDanbichongzhiInfo defines all seventeen columns; nothing here is inferred.',
    'priceRelation': 'costYuan is the yuan price and androidCost/iosCost are exactly ten times it on every row.',
    'notes': [
        'These are the client\'s single-purchase recharge tiers. The real payment path is not implemented and must not be.',
        'Award names come from the client items table plus textnew_cn; one award (1074suipian) has no translation entry and keeps its internal key.',
    ],
}
(ROOT / 'assets/original/data/recharge-provenance.json').write_bytes(
    (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode('utf8'))
print('Recharge tiers:', len(tiers), '; prices', [tier['costYuan'] for tier in tiers])
print('First tier awards:', tiers[0]['awards'])
