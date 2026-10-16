"""Export exact alpha scanlines of original unowned-land sprites (no geometry guess)."""
import json,hashlib
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];data={}
for p in sorted((ROOT/'assets/original/ui').glob('ui_mapland_land*.png')):
 im=Image.open(p).convert('RGBA');a=im.getchannel('A');rows=[]
 for y in range(im.height):
  runs=[];start=None
  for x in range(im.width+1):
   filled=x<im.width and a.getpixel((x,y))>0
   if filled and start is None:start=x
   elif not filled and start is not None:runs.extend([start,x]);start=None
  rows.append(runs)
 data[int(p.stem.replace('ui_mapland_land',''))]={'width':im.width,'height':im.height,'rows':rows,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(ROOT/'assets/original/data/land-masks.mjs').write_text('export default '+json.dumps(data,separators=(',',':'))+';\n',encoding='utf8');print('Exported exact alpha masks',len(data))
