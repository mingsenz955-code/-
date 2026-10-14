"""Export every client-listed shop item without executing client code."""
from pathlib import Path
import json, zipfile, hashlib

ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'assets/original/data/client-config.json'
config=json.loads(source.read_text(encoding='utf8'))
apk=ROOT/'work/yulong-dcn.apk'
with zipfile.ZipFile(apk) as archive:
    raw=archive.read('assets/res/config/textnew_cn.json')
    translation=json.loads(raw)['translation']

groups={'DRAGON':'eggs','HABITAT':'habitats','BUILDING':'buildings','BOOSTER':'buildings','FARM':'buildings','LEGEND_FARM':'buildings','SOCIAL BUILDING':'buildings','DECO':'decorations'}
items=[]
for item in config['items']:
    category=groups.get(item.get('group_type'))
    if not category or item.get('in_store')!=1: continue
    prefix='DRAGON' if category=='eggs' else item['group_type'].replace(' ','_')
    name=translation.get(prefix+'.'+item['name'])
    if not name:
        for fallback in ('BUILDING','DECO','HABITAT','FARM','BOOSTER','DRAGON'):
            name=translation.get(fallback+'.'+item['name'])
            if name: break
    suffix='_0' if category=='eggs' else ''
    thumbnail=f"assets/original/ui/thumbs_store_{item['img_name']}{suffix}.png"
    items.append({key:item.get(key) for key in ('id','name','group_type','costs','sell_price','min_level','display_order','build_time','width','height','img_name','properties')}|{'category':category,'nameCN':name or item['name'],'thumbnail':thumbnail if (ROOT/thumbnail).exists() else None})
items.sort(key=lambda row:(row['category'],row.get('display_order') or 0,row['id']))
out=ROOT/'assets/original/data/shop.mjs'
out.write_text('export const ORIGINAL_SHOP_ITEMS='+json.dumps(items,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
(ROOT/'assets/original/data/shop-provenance.json').write_text(json.dumps({'source':'assets/res/config/config_cn_qq.json','sourceSha256':hashlib.file_digest(source.open('rb'),'sha256').hexdigest(),'translationSource':'assets/res/config/textnew_cn.json','translationSha256':hashlib.sha256(raw).hexdigest(),'items':len(items),'counts':{key:sum(x['category']==key for x in items) for key in sorted(set(x['category'] for x in items))},'note':'Only in_store=1 client rows. Export proves catalogue fields, not online purchase responses or building gameplay.'},ensure_ascii=False,indent=2),encoding='utf8')
print('Exported',len(items),'shop rows')
