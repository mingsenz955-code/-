"""Read original 47-step keys, arrow literals and Chinese text; never execute Lua."""
from pathlib import Path
import runpy,json,zipfile,hashlib
ROOT=Path(__file__).resolve().parents[1];r=runpy.run_path(str(ROOT/'scripts/lua-table-reader.py'));p=ROOT/'work/client-config/dragon/managers/TutorialManager.lua';f=r['parse'](p);k=f['constants'];regs={}
def rk(v):return k[v-256] if v>=256 else regs[v]
for ins in f['code'][40:274]:
 op=ins&63;a=(ins>>6)&255;b=(ins>>23)&511;c=(ins>>14)&511
 if op==10:regs[a]={}
 elif op==9:regs[a][rk(b)]=rk(c)
 elif op==34:
  assert c==1
  for i in range(1,b+1):regs[a][i]=regs[a+i]
 else:raise ValueError(op)
arrows=list(regs[20]['arrowsPos_1024'].values());keys=[k[ins>>14] for ins in f['code'][285:334] if ins&63==1];assert len(keys)==47 and len(arrows)==46
z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk');tr=json.loads(z.read('assets/res/config/textnew_cn.json'))['translation'];data=[{'step':i+1,'key':key,'text':tr[key],'title':tr.get(key.split('.')[0],''),'arrow':arrows[i] if i<46 else None,'layout':None if i+1 in [11,12,41,44,45] else 'UI_XinShou_YinDao_'+str(i+1)} for i,key in enumerate(keys)]
for row in data:
 if row['layout']:assert (ROOT/'assets/original/layouts'/ (row['layout']+'.json')).exists()
(ROOT/'assets/original/data/tutorial.mjs').write_text('export default '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
(ROOT/'docs/reference/tutorial-source.json').write_text(json.dumps({'baseline':'2.9.35-202402271124','sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'steps':47,'noLayoutSteps':[11,12,41,44,45],'literalPCs':[[40,273],[285,333]],'limits':'Original initial server resources/obstacles unavailable; offline opening resources preserved, earth level 4 based on original tutorial parent requirement.'},indent=2)+'\n',encoding='utf8');print('Exported 47 original steps and 46 arrows')
