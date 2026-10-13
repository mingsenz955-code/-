"""Bake original skeletal breath keyframes to transparent WebP, without APK execution.
Interpolation is linear pending video timing comparison. Keyframes retain original transforms.
"""
from pathlib import Path
import runpy,math,json,hashlib
env=runpy.run_path(str(Path(__file__).with_name('import-original-assets.py')))
Image,decode,numbers,z,OUT,manifest=[env[k] for k in ['Image','decode','numbers','z','OUT','manifest']]
import plistlib,xml.etree.ElementTree as ET
def sample(frames,t):
 total=sum(int(f.get('dr',1)) for f in frames);t=t%total;start=0
 for i,current in enumerate(frames):
  duration=int(current.get('dr',1))
  if t<start+duration:
   result=dict(current);following=frames[(i+1)%len(frames)];ratio=(t-start)/duration
   if current.get('twE')=='NaN':ratio=0
   for key in ['x','y','cocos2d_x','cocos2d_y','kX','kY','cX','cY','pX','pY']:
    if key not in current or key not in following:continue
    a,b=float(current[key]),float(following[key]);delta=b-a
    if key in ['kX','kY']:delta=(delta+180)%360-180
    result[key]=a+delta*ratio
   return result
  start+=duration
 return frames[-1]
for dragon in ['1000_dragon_plant_b','1020_dragon_fire_a','1033_dragon_water_a']:
 for stage in [1,2,3]:
  name=f'{dragon}_{stage}';data=json.loads((OUT/'skeletons'/f'{name}.json').read_text(encoding='utf8'));base='assets/res/dragons/'+name;sheet=decode(base);pl=plistlib.loads(z.read(base+'.plist'));clip=data['animations']['breath'];length=int(clip['attributes']['dr']);tiles={}
  for bone in data['bones']:
   if bone['attributes']['name'] not in clip['bones']:continue
   d=bone['displays'][0];frame=pl['frames'][d['name']+'.png'];x,y,w,h=numbers(frame['frame']);rot=frame.get('rotated',False);tile=sheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
   if rot:tile=tile.transpose(Image.Transpose.ROTATE_90)
   tiles[bone['attributes']['name']]=(tile,d)
  all_layers=[];bounds=[]
  for t in range(length):
   layers=[]
   for bone_name,(tile,display) in tiles.items():
    attr=sample(clip['bones'][bone_name],t)
    if int(attr.get('dI',0))<0:continue
    val=lambda k,default=0:float(attr.get(k,default))
    a=math.cos(math.radians(val('kY')))*val('cX',1);b=math.sin(math.radians(val('kY')))*val('cX',1);c=-math.sin(math.radians(val('kX')))*val('cY',1);d=math.cos(math.radians(val('kX')))*val('cY',1)
    px=float(display.get('pX',0));py=float(display.get('pY',0));tx=val('cocos2d_x') if 'cocos2d_x' in attr else val('x')-a*val('pX')-c*val('pY');ty=val('cocos2d_y') if 'cocos2d_y' in attr else val('y')-b*val('pX')-d*val('pY');e=tx-a*px-c*py;f=ty-b*px-d*py
    layers.append((val('z'),tile,(a,b,c,d,e,f)));bounds.extend((a*x+c*y+e,b*x+d*y+f) for x,y in [(0,0),(tile.width,0),(0,tile.height),(tile.width,tile.height)])
   all_layers.append(layers)
  minx=math.floor(min(p[0] for p in bounds))-3;miny=math.floor(min(p[1] for p in bounds))-3;size=(math.ceil(max(p[0] for p in bounds))-minx+3,math.ceil(max(p[1] for p in bounds))-miny+3);frames=[]
  for layers in all_layers:
   canvas=Image.new('RGBA',size)
   for _,tile,(a,b,c,d,e,f) in sorted(layers,key=lambda v:v[0]):
    det=a*d-b*c
    if abs(det)<.00001:continue
    e-=minx;f-=miny;inverse=(d/det,-c/det,(c*f-d*e)/det,-b/det,a/det,(b*e-a*f)/det)
    canvas.alpha_composite(tile.transform(size,Image.Transform.AFFINE,inverse,resample=Image.Resampling.BICUBIC))
   frames.append(canvas)
  dest=OUT/'skeletons'/f'{name}-breath.webp';frames[0].save(dest,save_all=True,append_images=frames[1:],duration=[round((i+1)*1000/30)-round(i*1000/30) for i in range(length)],loop=0,lossless=True,quality=100,method=4)
  manifest['assets'][str(dest.relative_to(OUT)).replace('\\','/')]={'archive':base+'.xml','texture':base+'.pkm','conversion':'original breath keyframes; linear interpolation; easing pending comparison','frames':length,'fps':30,'width':size[0],'height':size[1],'sha256':hashlib.file_digest(dest.open('rb'),'sha256').hexdigest()}
  print('Baked',name,length,'frames',flush=True)
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
