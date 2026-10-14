"""Static source skeletal export. No APK/client code is executed.

Exports decoded lossless texture atlases and numeric keyframes. Runtime easing,
crossfade, source blend modes and battle effects remain subject to comparison.
Use --ids 1000,1020,1033 for a bounded sample; omit for all catalog entries.
"""
from pathlib import Path
import sys,zipfile,json,plistlib,struct,re,io,math,hashlib,argparse
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'work/python-libs'))
from PIL import Image
import texture2ddecoder
import xml.etree.ElementTree as ET
parser=argparse.ArgumentParser();parser.add_argument('--ids');parser.add_argument('--effect-bases',nargs='+');args=parser.parse_args()
ids=set(map(int,args.ids.split(','))) if args.ids else None
out=ROOT/('assets/original/effects' if args.effect_bases else 'assets/original/models');out.mkdir(exist_ok=True)
z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk');names=set(z.namelist())
manifest_path=ROOT/'assets/original/manifest.json';manifest=json.loads(manifest_path.read_text(encoding='utf8'))
index_path=out/'index.mjs';index={}
if index_path.exists():index=json.loads(index_path.read_text(encoding='utf8').removeprefix('export default ').strip().removesuffix(';'))
catalog=json.loads((ROOT/'assets/original/catalog.json').read_text(encoding='utf8'));missing=[]
if args.effect_bases:catalog=[{'id':None,'base':Path(base).name,'archiveBase':base,'stages':[None]} for base in args.effect_bases]
def nums(s):return list(map(int,re.findall(r'-?\d+',s)))
def decode(base):
    if base+'.png' in names:return Image.open(io.BytesIO(z.read(base+'.png'))).convert('RGBA')
    raw=z.read(base+'.pkm');fmt,ew,eh,w,h=struct.unpack('>5H',raw[6:16])
    if fmt!=0:raise ValueError('Unsupported texture '+base)
    image=Image.frombytes('RGBA',(ew,eh),texture2ddecoder.decode_etc1(raw[16:],ew,eh),'raw','BGRA').crop((0,0,w,h))
    if base+'_alpha.pkm' in names:
        raw=z.read(base+'_alpha.pkm');_,ew,eh,w,h=struct.unpack('>5H',raw[6:16]);alpha=Image.frombytes('RGBA',(ew,eh),texture2ddecoder.decode_etc1(raw[16:],ew,eh),'raw','BGRA').crop((0,0,w,h)).getchannel('R');image.putalpha(alpha)
    return image
def digest(p):return hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
for record in catalog:
    if ids and record['id'] not in ids:continue
    for stage in record.get('stages',[1,2,3]):
        key=f"{record['base']}_{stage}" if stage is not None else record['base'];base=record.get('archiveBase','assets/res/dragons/'+key)
        if base+'.xml' not in names:missing.append({'id':record['id'],'stage':stage,'reason':'XML missing from baseline APK'});continue
        root=ET.fromstring(z.read(base+'.xml'));frames=plistlib.loads(z.read(base+'.plist'))['frames'];bones={};clips={}
        for bone in root.findall('armatures/armature/b'):
            displays=[]
            for d in bone.findall('d'):
                f=frames.get(d.attrib['name']+'.png')
                displays.append({'rect':nums(f['frame']),'rotated':bool(f.get('rotated',False)),'pivot':[float(d.attrib.get('pX',0)),float(d.attrib.get('pY',0))]} if f else None)
            bones[bone.attrib['name']]=displays
        for clip in root.findall('animations/animation/mov'):
            tracks={};corners=[]
            for b in clip.findall('b'):
                track=[]
                for frame in b.findall('f'):
                    a=frame.attrib;v=lambda k,default=0:float(a.get(k,default));kx,ky,cx,cy=v('kX'),v('kY'),v('cX',1),v('cY',1)
                    aa=math.cos(math.radians(ky))*cx;bb=math.sin(math.radians(ky))*cx;cc=-math.sin(math.radians(kx))*cy;dd=math.cos(math.radians(kx))*cy
                    tx=v('cocos2d_x') if 'cocos2d_x' in a else v('x')-aa*v('pX')-cc*v('pY');ty=v('cocos2d_y') if 'cocos2d_y' in a else v('y')-bb*v('pX')-dd*v('pY')
                    di=int(a.get('dI',0));color=frame.find('colorTransform');rgba=[1,1,1,1] if color is None else [max(0,min(1,(float(color.attrib.get(k+'M',100))*2.55+float(color.attrib.get(k,0)))/255)) for k in ['r','g','b','a']]
                    row=[max(1,int(a.get('dr',1))),di,v('z'),tx,ty,kx,ky,cx,cy,0 if a.get('twE','NaN')=='NaN' else v('twE'),v('twR'),*rgba]
                    track.append(row)
                    ds=bones.get(b.attrib['name'],[]);display=ds[di] if 0<=di<len(ds) else None
                    if display:
                        _,_,w,h=display['rect'];px,py=display['pivot']
                        corners.extend((aa*(x-px)+cc*(y-py)+tx,bb*(x-px)+dd*(y-py)+ty) for x,y in [(0,0),(w,0),(0,h),(w,h)])
                if track:tracks[b.attrib['name']]=track
            if not corners:continue
            bounds=[math.floor(min(p[0] for p in corners))-8,math.floor(min(p[1] for p in corners))-8,math.ceil(max(p[0] for p in corners))+8,math.ceil(max(p[1] for p in corners))+8]
            clips[clip.attrib['name']]={'frames':int(clip.attrib['dr']),'attributes':clip.attrib,'bounds':bounds,'tracks':tracks}
        sheet_path=out/(key+'.webp');data_path=out/(key+'.json');sheet=decode(base);sheet.save(sheet_path,lossless=True,quality=100,method=4)
        model={'source':base+'.xml','fps':int(root.attrib.get('frameRate',30)),'bones':bones,'clips':clips,'limitations':['Numeric easing strength retained; runtime interpolation currently linear pending exact native engine match','twR_ alternate flag not applied','Crossfade, particles, blend and transitions require original-runtime comparison'],'keyframeColumns':['duration','display','z','x','y','rotationX','rotationY','scaleX','scaleY','sourceEasing','tweenRotate','red','green','blue','alpha']}
        if args.effect_bases:
            bs=[clip['bounds'] for clip in clips.values()];model['fixedBounds']=[min(b[0] for b in bs),min(b[1] for b in bs),max(b[2] for b in bs),max(b[3] for b in bs)]
        data_path.write_bytes(json.dumps(model,ensure_ascii=False,separators=(',',':')).encode('utf8'))
        for p,kind in [(sheet_path,'original ETC1 atlas decoded to lossless WebP'),(data_path,'static numeric source skeleton and all clips; easing pending comparison')]:
            manifest['assets'][p.relative_to(ROOT/'assets/original').as_posix()]={'archive':base+'.xml','texture':base+('.png' if base+'.png' in names else '.pkm'),'conversion':kind,'sha256':digest(p)}
        index[key]={'data':data_path.relative_to(ROOT).as_posix(),'texture':sheet_path.relative_to(ROOT).as_posix(),'clips':list(clips),'fps':model['fps'],**({'bounds':model['fixedBounds']} if args.effect_bases else {})}
        index_path.write_bytes(('export default '+json.dumps(index,ensure_ascii=False,separators=(',',':'))+';\n').encode('utf8'))
        manifest_path.write_bytes(json.dumps(manifest,ensure_ascii=False,indent=2).encode('utf8'))
        print('Exported',key,len(clips),'clips',flush=True)
(out/'missing.json').write_bytes(json.dumps(missing,ensure_ascii=False,indent=2).encode('utf8'))
print('Indexed',len(index),'stage models;',len(missing),'missing stages',flush=True)
