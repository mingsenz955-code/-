"""Static APK asset inventory and atlas unpacker. Does not execute APK code.
Usage: python scripts/import-original-assets.py work/yulong-dcn.apk
Dependencies installed only in work/python-libs: Pillow, texture2ddecoder.
"""
from pathlib import Path
import sys, zipfile, plistlib, struct, re, json, hashlib, io, xml.etree.ElementTree as ET, math
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'work/python-libs'))
from PIL import Image, ImageOps
import texture2ddecoder
ARCHIVE=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'work/yulong-dcn.apk'
OUT=ROOT/'assets/original';OUT.mkdir(parents=True,exist_ok=True)
z=zipfile.ZipFile(ARCHIVE);names=set(z.namelist())
source_hash=hashlib.file_digest(ARCHIVE.open('rb'),'sha256').hexdigest()
manifest={'source':{'page':'https://ng.d.cn/longzhimuchang/','package':'com.sincetimes.dragonfarmii.dl','version':'2.9.35','versionCode':70,'sha256':source_hash,'resourceVersion':json.loads(z.read('assets/pack_list.json'))['version']},'assets':{}}
if (OUT/'manifest.json').exists():
 previous=json.loads((OUT/'manifest.json').read_text(encoding='utf8'))
 if previous['source']['sha256']==source_hash:manifest['assets']=previous['assets']
def numbers(value):return list(map(int,re.findall(r'-?\d+',value)))
def decode(base):
 if base+'.png' in names:return Image.open(io.BytesIO(z.read(base+'.png'))).convert('RGBA')
 data=z.read(base+'.pkm');fmt,ew,eh,w,h=struct.unpack('>5H',data[6:16])
 if fmt!=0:raise ValueError('Only ETC1 supported: '+base)
 image=Image.frombytes('RGBA',(ew,eh),texture2ddecoder.decode_etc1(data[16:],ew,eh),'raw','BGRA').crop((0,0,w,h))
 if base+'_alpha.pkm' in names:
  data=z.read(base+'_alpha.pkm');_,ew,eh,w,h=struct.unpack('>5H',data[6:16]);alpha=Image.frombytes('RGBA',(ew,eh),texture2ddecoder.decode_etc1(data[16:],ew,eh),'raw','BGRA').crop((0,0,w,h)).getchannel('R');image.putalpha(alpha)
 return image
def unpack(base,folder):
 sheet=decode(base);pl=plistlib.loads(z.read(base+'.plist'))
 for key,frame in pl['frames'].items():
  x,y,w,h=numbers(frame['frame']);rot=frame.get('rotated',False)
  tile=sheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
  if rot:tile=tile.transpose(Image.Transpose.ROTATE_90)
  sw,sh=numbers(frame.get('sourceSize','{%d,%d}'%(w,h)))
  color=numbers(frame.get('sourceColorRect','{{0,0},{%d,%d}}'%(w,h)))
  canvas=Image.new('RGBA',(sw,sh));canvas.paste(tile,(color[0],color[1]))
  safe=Path(key).name;dest=OUT/folder/safe;dest.parent.mkdir(parents=True,exist_ok=True);canvas.save(dest,optimize=True)
  manifest['assets'][folder+'/'+safe]={'archive':base+'.plist','frame':key,'texture':base+('.png' if base+'.png' in names else '.pkm'),'width':sw,'height':sh,'sha256':hashlib.file_digest(dest.open('rb'),'sha256').hexdigest()}
for name in ['ui_evolution','ui_star','ui_daojukuang','ui_mydragon','ui_FunctionIcons1','ui_FunctionIcons2','ui_FramesNormal','ui_FramesAlpha','ui_ButtonNormal','ui_activitybutton','ui_Book','ui_Breed','thumbs_dragon','thumbs_egg','thumbs_equip','ui_AttributeIcon','ui_Map','ui_mapland','ui_mapshadow','ui_Plant','ui_egg','ui_world','ui_entrance','ui_mail']:
 base='assets/res/ui/'+name
 if base+'.plist' in names:unpack(base,'ui')
habitat_atlases=[g.split('/')[-1] for p in (OUT/'layouts').glob('00*_habitat_*.json') for g in json.loads(p.read_text(encoding='utf8'))['group']]
for name in ['islandbg','islandtop_g','islandbottom_g','islandleft_g','islandright_g','0001_incubator_g','0016_farm_1_g','0017_farm_2_g','0019_breeding_cave_a_g',*habitat_atlases]:
 unpack('assets/res/buildings/'+name,'world')
translation=json.loads(z.read('assets/res/config/textnew_cn.json'))['translation']
(OUT/'skeletons').mkdir(exist_ok=True)
for dragon in ['1000_dragon_plant_b','1020_dragon_fire_a','1033_dragon_water_a']:
 for stage in [1,2,3]:
  base='assets/res/dragons/'+dragon+'_'+str(stage)
  root=ET.fromstring(z.read(base+'.xml'));sheet=decode(base);pl=plistlib.loads(z.read(base+'.plist'));bones=root.findall('armatures/armature/b')
  clips={m.attrib['name']:{'attributes':m.attrib,'bones':{b.attrib['name']:[f.attrib for f in b.findall('f')] for b in m.findall('b')}} for m in root.findall('animations/animation/mov')}
  (OUT/'skeletons'/f'{dragon}_{stage}.json').write_text(json.dumps({'source':base+'.xml','bones':[{'attributes':b.attrib,'displays':[d.attrib for d in b]} for b in bones],'animations':clips},ensure_ascii=False),encoding='utf8',newline='\n')
  layers=[]
  for bone in bones:
   display=bone.find('d')
   if display is None:continue
   frame=pl['frames'].get(display.attrib['name']+'.png')
   if not frame:continue
   x,y,w,h=numbers(frame['frame']);rot=frame.get('rotated',False);tile=sheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
   if rot:tile=tile.transpose(Image.Transpose.ROTATE_90)
   animation_bones=clips.get('breath',{}).get('bones',{})
   if bone.attrib['name'] not in animation_bones:continue
   attr=animation_bones[bone.attrib['name']][0]
   if int(attr.get('dI',0))<0:continue
   val=lambda k,default=0:float(attr.get(k,default))
   a=math.cos(math.radians(val('kY')))*val('cX',1);b=math.sin(math.radians(val('kY')))*val('cX',1);c=-math.sin(math.radians(val('kX')))*val('cY',1);d=math.cos(math.radians(val('kX')))*val('cY',1)
   px=float(display.attrib.get('pX',0));py=float(display.attrib.get('pY',0))
   tx=val('cocos2d_x') if 'cocos2d_x' in attr else val('x')-a*val('pX')-c*val('pY')
   ty=val('cocos2d_y') if 'cocos2d_y' in attr else val('y')-b*val('pX')-d*val('pY')
   e=tx-a*px-c*py;f=ty-b*px-d*py
   layers.append((val('z'),tile,(a,b,c,d,e,f)))
  bounds=[(a*x+c*y+e,b*x+d*y+f) for _,tile,(a,b,c,d,e,f) in layers for x,y in [(0,0),(tile.width,0),(0,tile.height),(tile.width,tile.height)]]
  minx=math.floor(min(v[0] for v in bounds))-3;miny=math.floor(min(v[1] for v in bounds))-3;maxx=math.ceil(max(v[0] for v in bounds))+3;maxy=math.ceil(max(v[1] for v in bounds))+3
  canvas=Image.new('RGBA',(maxx-minx,maxy-miny))
  for _,tile,(a,b,c,d,e,f) in sorted(layers,key=lambda v:v[0]):
   det=a*d-b*c
   if abs(det)<.00001:continue
   e-=minx;f-=miny
   coefficients=(d/det,-c/det,(c*f-d*e)/det,-b/det,a/det,(b*e-a*f)/det)
   canvas.alpha_composite(tile.transform(canvas.size,Image.Transform.AFFINE,coefficients,resample=Image.Resampling.BICUBIC))
  dest=OUT/'skeletons'/f'{dragon}_{stage}.png';canvas.save(dest)
  manifest['assets'][str(dest.relative_to(OUT)).replace('\\','/')]={'archive':base+'.xml','texture':base+'.pkm','conversion':'skeletal breath first-frame reconstruction; transform needs motion validation','width':canvas.width,'height':canvas.height,'sha256':hashlib.file_digest(dest.open('rb'),'sha256').hexdigest()}
(OUT/'dragon-labels.json').write_text(json.dumps({k[7:]:v for k,v in translation.items() if k.startswith('DRAGON.')},ensure_ascii=False,indent=2),encoding='utf8',newline='\n')
labels={k[7:]:v for k,v in translation.items() if k.startswith('DRAGON.')}
normalize=lambda s:re.sub(r'[^a-z0-9]','',s.lower().replace('dargon','dragon').replace('dragon',''))
translations={normalize(k):(k,v) for k,v in labels.items()}
bases=sorted({re.sub(r'_\d\.png$','',f.name[len('thumbs_'):]) for f in (OUT/'ui').glob('thumbs_*.png') if re.match(r'thumbs_\d+_(?:dragon|dargon)_.*_[0-3]\.png$',f.name)})
catalog=[]
for base in bases:
 original_id=int(base.split('_')[0]);slug=re.sub(r'_[ab]$','',re.sub(r'^\d+_','',base));key=normalize(slug)
 if 2000<=original_id<3000:key='variation'+key
 match=translations.get(key)
 catalog.append({'id':original_id,'base':base,'name':match[1] if match else '名称待核对 '+str(original_id),'english':match[0] if match else None,'nameVerified':bool(match),'images':[f'assets/original/ui/thumbs_{base}_{stage}.png' for stage in range(4)]})
if not (OUT/'data/client-config.json').exists():
 (OUT/'catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding='utf8',newline='\n')
 (OUT/'catalog.mjs').write_text('export default '+json.dumps(catalog,ensure_ascii=False)+';\n',encoding='utf8',newline='\n')
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8',newline='\n')
(ROOT/'docs/reference/apk-inventory.json').write_text(json.dumps({'source':manifest['source'],'archiveBytes':ARCHIVE.stat().st_size,'entries':len(names),'files':[{'name':n,'size':z.getinfo(n).file_size} for n in sorted(names) if n.startswith('assets/res/')]},ensure_ascii=False,indent=2),encoding='utf8',newline='\n')
print('Imported',len(manifest['assets']),'provenance records; original source is recorded in assets/original/manifest.json')
