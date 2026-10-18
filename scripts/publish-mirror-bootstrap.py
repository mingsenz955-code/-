"""Add the mirror bootstrap to an existing verified release; never replace assets."""
from pathlib import Path
import json,hashlib,runpy,urllib.request
root=Path(__file__).resolve().parents[1]
pub=runpy.run_path(str(root/'scripts/publish-update.py'));token=pub['credential']()
version=json.loads((root/'package.json').read_text(encoding='utf8'))['version']
api='https://api.github.com/repos/mingsenz955-code/-'
def req(url,body=None,method='GET'):
 if not(url.startswith(api+'/') or url.startswith('https://uploads.github.com/repos/mingsenz955-code/-/')):raise RuntimeError('Unexpected host')
 data=json.dumps(body).encode() if isinstance(body,dict) else body
 headers={'User-Agent':'Yulong-Updater-Publisher','Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','Content-Type':'application/json' if isinstance(body,dict) else 'application/octet-stream'}
 with urllib.request.urlopen(urllib.request.Request(url,data=data,method=method,headers=headers),timeout=60) as r:return json.load(r)
release=req(api+'/releases/tags/v'+version);name='Yulong-Update-China.zip';blob=(root/'work'/('update-v'+version)/name).read_bytes();digest='sha256:'+hashlib.sha256(blob).hexdigest();old=next((a for a in release['assets'] if a['name']==name),None)
if old:
 if old.get('digest')!=digest:raise RuntimeError('Existing bootstrap differs; will not replace it')
else:req(release['upload_url'].split('{')[0]+'?name='+name,blob,'POST')
url='https://github.com/mingsenz955-code/-/releases/download/v'+version+'/'+name
if name not in release['body']:req(api+'/releases/'+str(release['id']),{'body':release['body']+'\n\n国内网络更新入口：['+name+']('+url+')，优先公共加速通道；也可让朋友直接转发此ZIP。无须登录GitHub，清单签名及逐文件哈希校验，保留存档。'},'PATCH')
print(json.dumps({'asset':url,'bytes':len(blob),'sha256':digest}))
