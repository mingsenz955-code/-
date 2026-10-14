"""Export client gem/fuwen definitions and their original gem icon atlas. No Lua execution."""
from pathlib import Path
import json,re,hashlib,zipfile,sys,plistlib,io,struct
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'work/python-libs'))
from PIL import Image
import texture2ddecoder
out=ROOT/'assets/original/data';raw=(out/'tables.json').read_bytes();tables=json.loads(raw)
cols=['id','quality','type','attack','defend','blood','crit','uncrit','anti','unanti','eatexp','levelupexp','nextlevel','dismantleID','exChangeNeednum','name','icon','des','level','visible']
gems=[dict(zip(cols,r)) for r in tables['godfire']]
fcols=['id','quality','equipType','level','needExp','offerExp','levelUpID','exchangeID','exchangeNum','name','image','desc','exchangeVisible']
runes=[dict(zip(fcols,r)) for r in tables['fuwen']]
(out/'progression.mjs').write_text('export const ORIGINAL_GEMS='+json.dumps(gems,ensure_ascii=False,separators=(',',':'))+';\nexport const ORIGINAL_RUNES='+json.dumps(runes,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
(out/'progression-provenance.json').write_text(json.dumps({'tablesSha256':hashlib.sha256(raw).hexdigest(),'gems':len(gems),'runes':len(runes),'gemColumns':cols,'runeColumns':fcols,'schemas':['dragon/pconfig/librarys/holyfire/LibHolyFireInfo.lua','dragon/pconfig/librarys/fuwen/LibFuwenInfo.lua'],'unknown':['Server drop probabilities and actual acquisition responses','Server fusion settlement timing']},ensure_ascii=False,indent=2),encoding='utf8')
z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk');base='assets/res/godfireicon/godfireicon'
def decode():
 if base+'.png' in z.namelist():return Image.open(io.BytesIO(z.read(base+'.png'))).convert('RGBA')
 b=z.read(base+'.pkm');fmt,ew,eh,w,h=struct.unpack('>5H',b[6:16]);assert fmt==0
 im=Image.frombytes('RGBA',(ew,eh),texture2ddecoder.decode_etc1(b[16:],ew,eh),'raw','BGRA').crop((0,0,w,h))
 alpha=z.read(base+'_alpha.pkm');_,ew,eh,w,h=struct.unpack('>5H',alpha[6:16]);a=Image.frombytes('RGBA',(ew,eh),texture2ddecoder.decode_etc1(alpha[16:],ew,eh),'raw','BGRA').crop((0,0,w,h));im.putalpha(a.getchannel('R'));return im
sheet=decode();manifestpath=ROOT/'assets/original/manifest.json';manifest=json.loads(manifestpath.read_text(encoding='utf8'));nums=lambda s:list(map(int,re.findall(r'-?\d+',s)))
for key,f in plistlib.loads(z.read(base+'.plist'))['frames'].items():
 x,y,w,h=nums(f['frame']);rot=f.get('rotated',False);tile=sheet.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:tile=tile.transpose(Image.Transpose.ROTATE_90)
 sw,sh=nums(f['sourceSize']);rect=nums(f['sourceColorRect']);image=Image.new('RGBA',(sw,sh));image.paste(tile,(rect[0],rect[1]));p=ROOT/'assets/original/ui'/Path(key).name;image.save(p,optimize=True)
 manifest['assets']['ui/'+p.name]={'archive':base+'.plist','frame':key,'texture':base+'.pkm','width':sw,'height':sh,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
manifestpath.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8');print('Exported',len(gems),'gems,',len(runes),'runes')
