from pathlib import Path
p=Path('scripts/import-original-assets.py').read_text(encoding='utf8')
ns={'__file__':str(Path('scripts/import-original-assets.py').resolve())}
exec(p.split("for name in ['common")[0] if "for name in ['common" in p else p[:p.index('for name in [',p.index('def unpack'))],ns)
import json,re
out=Path('assets/original')
# Catalog exported as JS; read its JSON RHS through a node-created file.
import subprocess
items=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {ORIGINAL_HABITATS as h} from './src/habitats.mjs';import {ORIGINAL_SHOP_ITEMS as s} from './assets/original/data/shop.mjs';console.log(JSON.stringify([...h,...s.filter(v=>['buildings','decorations'].includes(v.category))]));"],text=True,encoding='utf8'));result={}
for item in items:
 name=item.get('img_name');path=Path('work/client-config/layout')/(str(name)+'.lua')
 if not name or not path.exists():continue
 layout=path.read_text(encoding='utf8');groups=re.search(r'group\s*=\s*\{([^}]+)',layout)
 for group in re.findall(r'"([^"]+)"',groups.group(1) if groups else ''):
  base='assets/res/'+group
  if base+'.plist' in ns['names']:ns['unpack'](base,'world')
 match=re.search(r'name\s*=\s*"bg"[^}]*img\s*=\s*"#([^"]+)"([^}]*)',layout)
 if not match:continue
 image=match.group(1);meta=ns['manifest']['assets'].get('world/'+image)
 if not meta:continue
 attrs=match.group(2);num=lambda key:float((re.search(r'\b'+key+r'\s*=\s*([-\d.]+)',attrs) or [None,0])[1])
 result[str(item['id'])]={'image':'assets/original/world/'+image,'width':meta['width']*.5,'height':meta['height']*.5,'x':num('x')*.5,'y':num('y')*.5,'layout':str(path).replace('\\','/'),'layoutSha256':__import__('hashlib').sha256(path.read_bytes()).hexdigest()}
(out/'data/building-art.mjs').write_text('export default '+json.dumps(result,ensure_ascii=False)+';\n',encoding='utf8')
(out/'manifest.json').write_text(json.dumps(ns['manifest'],ensure_ascii=False,indent=2),encoding='utf8')
print('world building layouts:',len(result))
