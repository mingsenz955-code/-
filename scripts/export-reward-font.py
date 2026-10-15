"""Extract the original reward bitmap font without executing client code."""
from pathlib import Path
import zipfile,re,json,hashlib
root=Path(__file__).resolve().parents[1];z=zipfile.ZipFile(root/'work/yulong-dcn.apk');name='green_42';base='assets/res/fonts/'+name
raw=z.read(base+'.fnt');chars={}
for line in raw.decode().splitlines():
 if line.startswith('char id='):
  row={k:int(v) for k,v in re.findall(r'(\w+)=(-?\d+)',line)};chars[chr(row['id'])]=row
texture=z.read(base+'.png');out=root/'assets/original/fonts'
(out/(name+'.png')).write_bytes(texture);(out/(name+'.json')).write_text(json.dumps(chars,ensure_ascii=False),encoding='utf8')
(out/(name+'-provenance.json')).write_text(json.dumps({'archive':base,'fntSha256':hashlib.sha256(raw).hexdigest(),'textureSha256':hashlib.sha256(texture).hexdigest(),'characters':len(chars)},indent=2),encoding='utf8')
print('Imported',len(chars),'original reward glyphs')
