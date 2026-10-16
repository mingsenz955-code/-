import json,zipfile,hashlib,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
items=json.loads((ROOT/'work/config-json/items.json').read_text('utf8'));rand=json.loads((ROOT/'work/config-json/randgive.json').read_text('utf8'));packs={};pools={}
for row in items:
 if row[0] in [6013,6015] or len(row)<=60 or not isinstance(row[60],str) or not row[60]:continue
 try:ids=[int(p) for p in row[60].split('|')]
 except ValueError:continue
 if not all(any(r[1]==p and r[4]>0 and r[5]>0 and r[6]>=r[5] for r in rand) for p in ids):continue
 packs[str(row[0])]={'pools':ids}
 for p in ids:pools[str(p)]=[{'row':r[0],'type':r[2],'itemId':r[3],'weight':r[4],'min':r[5],'max':r[6]} for r in rand if r[1]==p and r[4]>0 and r[5]>0 and r[6]>=r[5]]
z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk');c=json.loads(z.read('assets/res/config/config_cn_qq.json'));tr=json.loads(z.read('assets/res/config/textnew_cn.json'))['translation']
desc={str(r['id']):tr.get(r.get('description',''),r.get('description','')) for r in c['items'] if r['id']>=6000}
fragments={}
for r in c['items']:
 text=desc.get(str(r['id']),'');image=re.match(r'(\d+)_',r.get('img_name',''))
 if not image or not ('龙蛋碎片' in text or re.fullmatch(r'\d+suipian',r.get('name',''))):continue
 match=re.search(r'(?:收集|集齐)([0-9]+|十)',text);dragon=int(image[1])
 if match and any(d['id']==dragon and d['group_type']=='DRAGON' for d in c['items']):fragments[str(r['id'])]={'dragonId':dragon,'cost':10 if match[1]=='十' else int(match[1])}
# Ice-moon's shipped description is an untranslated key. Keep the uncertainty
# explicit while providing a usable offline recipe rather than a dead button.
fragments['7015']={'dragonId':1074,'cost':10,'offlineCost':True}
(ROOT/'assets/original/data/item-use.mjs').write_text('export default '+json.dumps({'packs':packs,'pools':pools,'descriptions':desc,'fragments':fragments},ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8');print('original usable pool packs',len(packs),'pools',len(pools))

report={'baseline':'2.9.35-202402271124','packs':len(packs),'pools':len(pools),'fragmentRecipes':len(fragments),'offlineFragmentCosts':{'7015':10},'sources':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT/'work/config-json/items.json',ROOT/'work/config-json/randgive.json',ROOT/'work/client-config/ui/UsePropPanel.lua',ROOT/'work/client-config/ui/UsePropListPanel.lua']},'note':'Each pipe-separated pool draws once per opened pack. Raw source weights normalized offline; server probabilities unverified. 31 fragment counts from explicit original Chinese descriptions, including alternate skeleton name. Ice-moon 7015 has an untranslated description and uses an explicitly marked offline cost 10. Dragon IDs use source images cross-checked as DRAGON.'}
(ROOT/'docs/reference/item-use-source.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
