"""Import the 2.9.35 client's original sound files and SoundManager mappings verbatim."""
from pathlib import Path
import zipfile,re,json,hashlib
root=Path(__file__).resolve().parents[1]
apk=root/'work/yulong-dcn.apk';manager=root/'work/client-config/dragon/core/dragonfarm/SoundManager.lua'
text=manager.read_text(encoding='utf-8');out=root/'assets/original/audio';out.mkdir(parents=True,exist_ok=True)
entries=[dict(id=int(i),type=t,path=p,length=int(n)) for i,t,p,n in re.findall(r'\{id = (\d+), type = "([^"]+)", path = "([^"]+)", length = (\d+)\}',text)]
z=zipfile.ZipFile(apk);records=[]
for e in entries:
 archive='assets/res/'+e['path'];raw=z.read(archive);name=Path(e['path']).name;(out/name).write_bytes(raw);e['path']='assets/original/audio/'+name
 records.append({'archive':archive,'file':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
tables=json.loads((root/'assets/original/data/tables.json').read_text(encoding='utf-8'))
data={'townGapMs':60000,'music':[e for e in entries if e['type'] in ['main','battle']],'sounds':{e['id']:e for e in entries if e['type'] in ['normal','skill']},'skills':{r[0]:{'fire':r[7],'hit':r[8]} for r in tables['skill_info']}}
(root/'assets/original/data/audio.mjs').write_text('export default '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(out/'manifest.json').write_text(json.dumps({'sourceApkSha256':hashlib.sha256(apk.read_bytes()).hexdigest(),'soundManagerSha256':hashlib.sha256(manager.read_bytes()).hexdigest(),'files':records},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Imported original audio:',len(records),'files,',sum(r['bytes'] for r in records),'bytes')
