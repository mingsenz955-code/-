"""Read static Cocos XXTEA resources from the publicly downloaded client.
No login, server access, original script execution or purchase checks are involved.
The embedded resource key is read from the client's public binary adjacent to its signature.
Decoded code remains an ignored research intermediate, not the game's runtime.
"""
from pathlib import Path
import zipfile,struct,re,hashlib,json
ROOT=Path(__file__).resolve().parents[1];z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk')
binary=z.read('lib/x86/libgame.so');signature=b'sincetimes';at=binary.index(b'\0'+signature+b'\0');end=at;start=binary.rfind(b'\0',0,end)+1;key=binary[start:end]
if len(key)!=16:raise ValueError('Unrecognized resource key layout; stop rather than guess.')
def decode(data):
 if not data.startswith(signature):return data
 data=data[len(signature):];v=list(struct.unpack('<%dI'%(len(data)//4),data));k=struct.unpack('<4I',key);n=len(v);delta=0x9e3779b9;total=((6+52//n)*delta)&0xffffffff;y=v[0]
 while total:
  e=(total>>2)&3
  for p in range(n-1,0,-1):
   other=v[p-1];mx=(((other>>5^y<<2)+(y>>3^other<<4))^((total^y)+(k[(p&3)^e]^other)));y=v[p]=(v[p]-mx)&0xffffffff
  other=v[-1];mx=(((other>>5^y<<2)+(y>>3^other<<4))^((total^y)+(k[e]^other)));y=v[0]=(v[0]-mx)&0xffffffff;total=(total-delta)&0xffffffff
 raw=struct.pack('<%dI'%n,*v);size=v[-1]
 if not len(raw)-7<=size<=len(raw)-4:raise ValueError('Invalid decoded resource length.')
 return raw[:size]
out=ROOT/'work/client-config';out.mkdir(parents=True,exist_ok=True);records=[]
for name in z.namelist():
 if not name.startswith('assets/scripts/') or not name.endswith('.lua'):continue
 raw=z.read(name);plain=decode(raw);dest=out/name[len('assets/scripts/'):];dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(plain)
 records.append({'file':name,'bytes':len(plain),'sha256':hashlib.sha256(plain).hexdigest(),'encoded':raw.startswith(signature)})
(ROOT/'docs/reference/decoded-config-inventory.json').write_text(json.dumps({'sourceApkSha256':hashlib.file_digest((ROOT/'work/yulong-dcn.apk').open('rb'),'sha256').hexdigest(),'method':'static resource XXTEA; key read from client binary; no original code executed','files':records},ensure_ascii=False,indent=2),encoding='utf8')
print('Static resources decoded:',len(records))
