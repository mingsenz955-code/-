"""Export named original expansion config and literal land tables, never execute Lua."""
from pathlib import Path
import json,hashlib,zipfile,runpy
ROOT=Path(__file__).resolve().parents[1]
z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk');raw=z.read('assets/res/config/config_cn_qq.json');c=json.loads(raw)
r=runpy.run_path(str(ROOT/'scripts/lua-table-reader.py'));source=ROOT/'work/client-config/dragon/core/dragonfarm/ExpansionManager.lua';fn=r['parse'](source);regs={};globals_={};k=fn['constants']
def rk(v): return k[v-256] if v>=256 else regs[v]
# Only the literal initialization prefix; stop before first closure. No CALL/branch accepted.
for ins in fn['code']:
 op=ins&63;a=(ins>>6)&255;b=(ins>>23)&511;cc=(ins>>14)&511;bx=ins>>14
 if op==36:break
 if op==10:regs[a]={}
 elif op==7:globals_[k[bx]]=regs[a]
 elif op==5:regs[a]=globals_[k[bx]]
 elif op==1:regs[a]=k[bx]
 elif op==9:regs[a][rk(b)]=rk(cc)
 elif op==34:
  assert cc==1
  for i in range(1,b+1):regs[a][i]=regs[a+i]
 else:raise ValueError(('Unexpected nonliteral opcode',op))
e=globals_['ExpansionManager'];lands=list(e['big_tiles_data'].values());islands=[list(v.values()) for v in e['lands_in_island'].values()]
assert len(lands)==16 and [len(v) for v in islands]==[8,4,6,2]
rows=json.loads((ROOT/'assets/original/data/tables.json').read_text('utf8'))['expansion_prices']
text='export const ORIGINAL_EXPANSION_PRICES='+json.dumps(rows,separators=(',',':'))+';\n'
for key,value in [('EXPANSION_PRICES_NAMED',c['expansion_prices']),('ORIGINAL_LANDS',lands),('LANDS_IN_ISLAND',islands),('FIRST_ISLAND_LANDS',e['first_land']),('ISLAND_COSTS',c['globals']['ISLANDS_COSTS'])]:text+='export const '+key+'='+json.dumps(value,separators=(',',':'))+';\n'
(ROOT/'assets/original/data/expansion.mjs').write_text(text,encoding='utf8')
report={'baseline':'2.9.35-202402271124','namedConfigSha256':hashlib.sha256(raw).hexdigest(),'landSourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'rows':len(rows),'lands':len(lands),'columns':{'1':'pcf row index','2':'cash price, NOT ranch level','3':'coins','4':'neighbors, NOT cash price','5':'inventory_qte, NOT plot ID'},'islandCosts':c['globals']['ISLANDS_COSTS'],'verified':['ExpandShopPanel.initData uses #expansions + 1 and prices.coins/prices.cash, independent currency offers','getIslandCost reads globals.ISLANDS_COSTS','ExpansionManager literal land rectangles and 8/4/6/2 grouping','ExpandShopPanel requires existing island fully owned before next island'], 'unverified':['Initial server obstacle distribution absent; do not fabricate original placements','Offline placement coordinate plane and prior saves differ from source tile plane; legacy islands grandfathered','neighbors is unused/commented in this client; real multiplayer excluded']}
(ROOT/'assets/original/data/expansion-provenance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('Exported named prices, 16 exact lands, four island costs')
