"""Resource shop rows: what 魔晶 buys in the client's own shop (ui_shop 的「资源」分类).

ui/ResourceShopPanel.lua builds every card from LibraryManager.lib_treasure (pcf/treasure_items)
and shouts "not enough gems" when the player cannot pay, so this category is paid in 魔晶. Its
columns come from LibTreasureInfo.lua (twenty-three named columns, see export-recharge.py).
costtype 'c' is 魔晶 - the same letter the habitat and expansion tables use for 魔晶 - and
type 'g'/'f'/'ef' are 金币/食物/进化果实.

Only rows the client itself leaves enabled (enable ~= 0) and that pay in 魔晶 are exported. The
game's own resource shop shows the ones this build can actually deliver; the remaining rows
(强化石, 保护符, 龙珠, 培养丹, 龙魂, 觉醒石, 宝箱, 玫瑰花 ...) are still listed here so the
evidence is complete.
"""
from pathlib import Path
import json, hashlib
ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'assets/original/data/tables.json').read_bytes()
tables = json.loads(raw)
COLUMNS = ['id', 'name', 'amount', 'costtype', 'price', 'rebate', 'rebateMultiple', 'type',
           'display_order', 'badge', 'abtest_a', 'abtest_b', 'abtest_c', 'abtest_d', 'xid',
           'enable', 'des', 'shoptype', 'platform', 'img', 'iszhekou', 'zhekouIcon']
rows = []
for row in tables['treasure_items']:
    info = dict(zip(COLUMNS, row))
    if info['costtype'] != 'c' or not info['enable']:
        continue
    rows.append({
        'id': info['id'],
        'name': info['name'],
        'type': info['type'],
        'amount': info['amount'],
        'priceGems': info['price'],
        'xid': info['xid'],
        'displayOrder': info['display_order'],
        'zhekouIcon': info.get('zhekouIcon') or '',
        'img': info['img'],
    })
rows.sort(key=lambda row: row['id'])
text = 'export const ORIGINAL_RESOURCE_SHOP=' + json.dumps(rows, ensure_ascii=False) + ';\n'
(ROOT / 'assets/original/data/resource-shop.mjs').write_bytes(text.encode('utf8'))
resources = [row for row in rows if row['type'] in ('g', 'f', 'ef')]
report = {
    'baseline': '2.9.35-202402271124',
    'tablesSha256': hashlib.sha256(raw).hexdigest(),
    'rows': len(rows),
    'resourceRows': len(resources),
    'columnSource': 'LibTreasureInfo.lua names every column; none is inferred. (`irestype` is not a column: the library assigns the literal "魔晶".)',
    'policy': 'original-treasure-items-resource-v1',
    'evidence': [
        'ui/ResourceShopPanel.lua reads LibraryManager.lib_treasure, prints info.costtype and refuses the sale with "not enough gems".',
        'The same table sells 魔晶 for costtype "r" (元) in the recharge panel list, so "c" is the in-game 魔晶 and "r" is money.',
        'layout/ui_shop lists the six shop categories; layout/ui_shop_lv2 plus layout/item_shop is the card view the other categories already use.',
    ],
    'unverified': [
        'The 折扣 badge (zhekouIcon, e.g. z7zhe) is displayed as the client names it; this build does not apply a discount formula it cannot prove.',
        'Daily purchase limits are not proven for these rows, so this build does not invent any.',
    ],
}
(ROOT / 'assets/original/data/resource-shop-provenance.json').write_bytes(
    (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode('utf8'))
print('Resource shop rows:', len(rows), '; resources', len(resources))
for row in resources:
    print(' ', row['name'], row['amount'], row['type'], '<-', row['priceGems'], '魔晶')
