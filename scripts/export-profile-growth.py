"""Export original data and static evidence; never execute client Lua."""
import json,zipfile,hashlib,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk');config=json.loads(z.read('assets/res/config/config_cn_qq.json'))
altars={str(r['id']):int(r['properties']['max_dragon_level']) for r in config['items'] if r.get('properties',{}).get('max_dragon_level')}
reader=runpy.run_path(str(ROOT/'scripts/lua-table-reader.py'));fn=reader['parse'](ROOT/'work/client-config/dragon/core/dragonfarm/DragonManager.lua');base=None
for ins in fn['code']:
 if ins&63==9:
  b=(ins>>23)&511;c=(ins>>14)&511
  if b>=256 and c>=256 and fn['constants'][b-256]=='BASE_MAX_DRAGON_LEVEL':base=fn['constants'][c-256]
assert base==10
words=json.loads((ROOT/'work/config-json/zanghua.json').read_text('utf8'))
words=list(dict.fromkeys('GM' if r[1] in ['', ' ', '\t'] else r[1] for r in words))
data={'baseLevel':int(base),'altarLevels':altars,'maxLevel':max(altars.values()),'nameLimit':6,'renameCost':100,'blockedWords':words}
(ROOT/'assets/original/data/profile-growth.mjs').write_text('export default '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
paths=['ui/userinfo/UserInfoPanelFromTopUI.lua','ui/userinfo/ChangeNickNamePanel.lua','ui/userinfo/HeadSelectPanel.lua','dragon/core/dragonfarm/DragonManager.lua','dragon/core/dragonfarm/goal/GoalSpeedBreed.lua','ui/SpeedUpPanel.lua','dragon/utils/CostUtil.lua']
report={'baseline':'2.9.35-202402271124','nameLimit':6,'firstRenameFree':True,'laterRenameCost':100,'avatarRule':'pokedex-owned dragons; selected head preview, commit when closing','baseLevel':base,'altarLevels':altars,'sources':{p:hashlib.sha256((ROOT/'work/client-config'/p).read_bytes()).hexdigest() for p in paths},'limits':'Local ID is not an online account ID. Server name uniqueness and external sensitive-word service unavailable; shipped literal words used locally.'}
(ROOT/'docs/reference/profile-growth-source.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('exported base/altars/name rules, blocked word count',len(words))
