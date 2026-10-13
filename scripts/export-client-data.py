"""Export provenance-linked client configuration; server-side behavior remains unverified."""
from pathlib import Path
import zipfile,json,hashlib,runpy,re
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/original';z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk')
raw=z.read('assets/res/config/config_cn_qq.json');config=json.loads(raw);translation=json.loads(z.read('assets/res/config/textnew_cn.json'))['translation'];reader=runpy.run_path(str(ROOT/'scripts/lua-table-reader.py'))
data_dir=OUT/'data';data_dir.mkdir(exist_ok=True)
tables={p.stem:json.loads(p.read_text(encoding='utf8')) for p in (ROOT/'work/config-json').glob('*.json')}
schemas={}
for p in (ROOT/'work/client-config/dragon/pconfig/librarys').rglob('Lib*.lua'):
 data=p.read_bytes()
 if not data.startswith(b'\x1bLua'):continue
 try:
  fn=reader['parse'](p)['nested'][0];regs={0:('self',),1:('arr',)};k=fn['constants'];fields={}
  rk=lambda v:k[v&255] if v&256 else regs.get(v)
  for ins in fn['code']:
   op=ins&63;a=ins>>6&255;c=ins>>14&511;b=ins>>23&511
   if op==1:regs[a]=k[ins>>14]
   elif op==0:regs[a]=regs.get(b)
   elif op==6:regs[a]=('index',regs.get(b),rk(c))
   elif op==9 and regs.get(a)==('self',):
    field=rk(b);value=rk(c)
    if isinstance(value,tuple) and value[:2]==('index',('arr',)) and isinstance(field,str):fields[field]=value[2]
  if fields:schemas[p.stem]={'source':str(p.relative_to(ROOT/'work/client-config')).replace('\\','/'),'columns':fields}
 except (IndexError,ValueError):continue
catalog=[];dragon_rows={r[0]:r for r in tables['dragon_extend']};schema=schemas['LibDragonExtendInfo']['columns']
for item in config['items']:
 if item['group_type']!='DRAGON':continue
 base=item['img_name'];images=[f'assets/original/ui/thumbs_{base}_{stage}.png' for stage in range(4)]
 for stage,s in enumerate(images):
  if not (ROOT/s).exists():
   candidates=list((OUT/'ui').glob(f'thumbs_{item["id"]}_*_{stage}.png'))
   if len(candidates)==1:images[stage]=str(candidates[0].relative_to(ROOT)).replace('\\','/')
 name=translation.get('DRAGON.'+item['name']);row=dragon_rows.get(item['id']);extended={key:row[index-1] if index<=len(row) else None for key,index in schema.items()} if row else {}
 catalog.append({'id':item['id'],'base':base,'name':name or '名称待核对 '+str(item['id']),'english':item['name'],'nameVerified':bool(name),'images':[s if (ROOT/s).exists() else None for s in images],'original':item,'extended':extended})
catalog.sort(key=lambda d:d['id']);(OUT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf8');(OUT/'catalog.mjs').write_text('export default '+json.dumps(catalog,ensure_ascii=False)+';\n',encoding='utf8')
(data_dir/'client-config.json').write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf8');(data_dir/'tables.json').write_text(json.dumps(tables,ensure_ascii=False,indent=2),encoding='utf8');(data_dir/'schemas.json').write_text(json.dumps(schemas,ensure_ascii=False,indent=2),encoding='utf8')
(data_dir/'provenance.json').write_text(json.dumps({'package':'com.sincetimes.dragonfarmii.dl','version':'2.9.35','resourceVersion':'202402271124','namedConfigSource':'assets/res/config/config_cn_qq.json','namedConfigSha256':hashlib.sha256(raw).hexdigest(),'namedItems':len(config['items']),'pcfItems':len(tables['items']),'literalTables':len(tables),'note':'Named legacy config and pcf config may differ. Server updates, actual pool probabilities and battle simulation require comparison.'},ensure_ascii=False,indent=2),encoding='utf8')
crop_names=['Dragon Bell','Hot Dragon Chili','Caterpillar Lily','Unicorn Horns','Ladybird Blossom','Rainbow Flower','Spike Balls','Flesh Eaters','Star Shines','Cenarius Fruit','Ignir Saliva','Grandinee Fall'];g=config['globals'];crops=[{'id':i+1,'name':translation[n],'cost':g['COLLECT_PRICE'][i]['g'],'ms':int(float(g['COLLECT_MINUTES'][i])*60000),'yield':g['COLLECT_VALUES'][i],'xp':g['COLLECT_XP'][i],'image':f'assets/original/ui/plant_{i+1}.png'} for i,n in enumerate(crop_names)]
(data_dir/'rules.mjs').write_text('export const ORIGINAL_CROPS='+json.dumps(crops,ensure_ascii=False)+';\nexport const ORIGINAL_BREEDING='+json.dumps(tables['coition'],ensure_ascii=False)+';\n',encoding='utf8')
print('Original dragon records',len(catalog),'verified names',sum(d['nameVerified'] for d in catalog),'missing images',sum(s is None for d in catalog for s in d['images']),'literal data tables',len(tables),'column schemas',len(schemas))
