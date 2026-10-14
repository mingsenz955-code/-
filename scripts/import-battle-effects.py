"""Import source battle skeletal effects and bitmap damage fonts without executing Lua."""
from pathlib import Path
import zipfile,subprocess,sys,re,json,hashlib
root=Path(__file__).resolve().parents[1]
z=zipfile.ZipFile(root/'work/yulong-dcn.apk')
bases=[n[:-4] for n in z.namelist() if n.startswith('assets/res/skills/') and n.endswith('.xml')]
subprocess.run([sys.executable,str(root/'scripts/export-dragon-models.py'),'--effect-bases',*bases],cwd=root,check=True)
out=root/'assets/original/fonts';out.mkdir(exist_ok=True)
report={'source':'work/yulong-dcn.apk','sha256':hashlib.file_digest((root/'work/yulong-dcn.apk').open('rb'),'sha256').hexdigest(),'effects':bases,'fonts':{}}
for name in ['red_50','yellow_30']:
 raw=z.read('assets/res/fonts/'+name+'.fnt');chars={}
 for line in raw.decode().splitlines():
  if line.startswith('char id='):
   row={k:int(v) for k,v in re.findall(r'(\w+)=(-?\d+)',line)};chars[chr(row['id'])]=row
 texture=z.read('assets/res/fonts/'+name+'.png')
 (out/(name+'.png')).write_bytes(texture)
 (out/(name+'.json')).write_text(json.dumps(chars),encoding='utf8')
 report['fonts'][name]={'fntSha256':hashlib.sha256(raw).hexdigest(),'textureSha256':hashlib.sha256(texture).hexdigest()}
(out/'provenance.json').write_text(json.dumps(report,indent=2),encoding='utf8')
