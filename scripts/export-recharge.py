"""Recharge products (what the 充值 panel actually sells) plus the 单笔充值 activity tiers.

Recharge panel
    ui/vip/VipStoreRender.lua fills the client's own card (layout/item_recharge_data) like this:
        num   = data.amount .. " 魔晶"
        price = "¥" .. (data.price / 10)
        give  = "再送" .. data.amount .. "魔晶"   -- first purchase (itwice)
        give  = "再送" .. data.rebate .. "魔晶"   -- later purchases
    The card data comes from pcf/treasure_items, whose columns are named by
    dragon/pconfig/librarys/treasure/LibTreasureInfo.lua:
        id, name, amount, costtype, price, rebate, rebateMultiple, type, display_order, badge,
        abtest_a..d, xid, enable, des, shoptype, platform, img, irestype, iszhekou, zhekouIcon
    TreasureLibrary:getTreasureByPlatform filters shoptype == 2 and platform == 1 (android) or
    2 (ios), so the six android rows 95..100 are the panel's six tiers. They are not inferred:
    amount  50/300/500/1000/2000/5000  and  rebate 0/15/40/120/360/1250  equal icount/iback of
    payment/StoreController.productForAn element for element, and price 50/300/... is 角, i.e.
    the 5/30/50/100/200/500 元 of the same list (price/10 = 元).

单笔充值 activity
    pcf/danchong, columns named by LibDanbichongzhiInfo.lua:
        id, androidCost, iosCost, awardType_1, awardID_1, awardNum_1, awardQuality_1,
        awardType_2..3, costYuan, costIOS
    androidCost/iosCost are the 魔晶 handed to the account for costYuan/costIOS 元, which the
    recharge panel above sells; the awards are the separate 单笔充值 activity bonus. The two
    must not be merged: 充值 credits 魔晶, the activity hands out its own gift.

The real payment path is NOT implemented and must not be. This build grants a product locally
and labels itself as a test build.
"""
from pathlib import Path
import json, hashlib, zipfile
ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / 'assets/original/data/tables.json').read_bytes()
tables = json.loads(raw)
z = zipfile.ZipFile(ROOT / 'work/yulong-dcn.apk')
translation = json.loads(z.read('assets/res/config/textnew_cn.json'))['translation']
items = {row[0]: row[1] for row in tables['items']}

# --- recharge panel products: LibTreasureInfo columns, android platform -------------------
# Twenty-two of the twenty-three names are table columns: `irestype` is the literal string
# "魔晶" the library assigns to every row, so no column carries it.
TREASURE_COLUMNS = ['id', 'name', 'amount', 'costtype', 'price', 'rebate', 'rebateMultiple',
                    'type', 'display_order', 'badge', 'abtest_a', 'abtest_b', 'abtest_c',
                    'abtest_d', 'xid', 'enable', 'des', 'shoptype', 'platform', 'img',
                    'iszhekou', 'zhekouIcon']
products = []
for row in tables['treasure_items']:
    info = dict(zip(TREASURE_COLUMNS, row))
    if info['shoptype'] == 2 and info['platform'] == 1 and info['type'] == 'c' and info['costtype'] == 'r':
        products.append({
            'id': info['id'],
            'name': info['name'],
            'gems': info['amount'],
            'priceJiao': info['price'],
            'priceYuan': info['price'] / 10,
            'rebate': info['rebate'],
            'rebateMultiple': info['rebateMultiple'],
            'xid': info['xid'],
            'displayOrder': info['display_order'],
            'img': info['img'],
        })
products.sort(key=lambda product: product['displayOrder'])

# --- 单笔充值 activity tiers: LibDanbichongzhiInfo columns --------------------------------
TYPE_NAMES = {1: '金币', 2: '龙粮', 3: '魔晶'}
tiers = []
for row in tables['danchong']:
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
    tiers.append({'id': row[0], 'gems': row[1], 'gemsIOS': row[2], 'awards': awards,
                  'costYuan': row[15], 'costIOS': row[16]})

# --- VIP progress shown by panel_recharge: VipInfo columns --------------------------------
vip = [{'level': row[0], 'needExp': row[1]} for row in tables['vip']]

text = ('export const ORIGINAL_RECHARGE_PRODUCTS=' + json.dumps(products, ensure_ascii=False) + ';\n'
        + 'export const ORIGINAL_SINGLE_RECHARGE_TIERS=' + json.dumps(tiers, ensure_ascii=False) + ';\n'
        + 'export const ORIGINAL_VIP_LEVELS=' + json.dumps(vip, ensure_ascii=False) + ';\n')
(ROOT / 'assets/original/data/recharge.mjs').write_bytes(text.encode('utf8'))
report = {
    'baseline': '2.9.35-202402271124',
    'tablesSha256': hashlib.sha256(raw).hexdigest(),
    'productCount': len(products),
    'columnSource': {
        'treasure_items': 'LibTreasureInfo.lua names every column; none is inferred. (`irestype` is not a column: the library assigns the literal "魔晶".)',
        'danchong': 'LibDanbichongzhiInfo.lua names all seventeen columns; none is inferred.',
        'vip': 'VipInfo.lua: arr[1] id, arr[2] needExp (累计充值魔晶).',
    },
    'panelEvidence': [
        'ui/vip/VipStoreRender.lua: num = data.amount.." 魔晶", price = "¥"..(data.price/10), give = "再送"..amount.."魔晶" on a first purchase and "再送"..rebate.."魔晶" afterwards.',
        'TreasureLibrary:getTreasureByPlatform keeps shoptype == 2 and platform == 1 (android) / 2 (ios); the six android rows are 95, 96, 97, 98, 99, 100.',
        'layout/panel_recharge.lua shows "再充值 [魔晶] 魔晶，即可成为 VIPn", i.e. the bar counts recharged 魔晶.',
        'layout/item_recharge_data.lua carries num (魔晶 amount), give (再送), price (元) and the 首充 badge, matching VipStoreRender field for field.',
    ],
    'crossCheck': [
        'payment/StoreController.productForAn: ipricefen 500/3000/5000/10000/20000/50000 (= 5..500 元), icount 50/300/500/1000/2000/5000, iback 0/15/40/120/360/1250 - identical to this table.',
        'payment/StoreController.productForIOS: icount 60/300/980/1980/3280/6480 for 6..648 元, the ios rows of the same table.',
        'vip needExp 50/300/1000/3000/5000/10000/... 魔晶 lines up with the 5/30/100/... 元 tiers at ten 魔晶 per 元.',
    ],
    'unverified': [
        'Whether the server counts a 首充 double or a 再送 rebate towards 累计充值魔晶 is not proven; this build counts every 魔晶 delivered to the account.',
        'The real payment path is deliberately not implemented; no money can move in this build.',
        '每日秒杀/月卡 products (iid 103/104/105/106) exist in the client but are not part of the recharge panel list.',
    ],
}
(ROOT / 'assets/original/data/recharge-provenance.json').write_bytes(
    (json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode('utf8'))
print('Recharge products:', len(products), [(p['name'], p['gems'], p['priceYuan'], p['rebate']) for p in products])
print('Single-recharge activity tiers:', len(tiers), '; VIP levels', len(vip))
