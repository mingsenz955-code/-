"""Export named client habitat definitions without executing client code."""
from pathlib import Path
import json, zipfile
ROOT=Path(__file__).resolve().parents[1]
config=json.loads((ROOT/'assets/original/data/client-config.json').read_text(encoding='utf8'))
with zipfile.ZipFile(ROOT/'work/yulong-dcn.apk') as z:
    translations=json.loads(z.read('assets/res/config/textnew_cn.json'))['translation']
habitats=[]
for item in config['items']:
    if item['group_type']!='HABITAT': continue
    layout=json.loads((ROOT/'assets/original/layouts'/f"{item['img_name']}.json").read_text(encoding='utf8'))
    bg=next(c for c in layout['children'] if c['name']=='bg')
    habitats.append({**item,'nameCN':translations.get('HABITAT.'+item['name'],item['name']),
        'capacity':int(item['properties']['capacity']),'maxGold':int(item['properties']['max_gold']),
        'image':'assets/original/world/'+bg['img'].lstrip('#')})
output=ROOT/'assets/original/data/habitats.mjs'
output.write_text('export const ORIGINAL_HABITATS='+json.dumps(habitats,ensure_ascii=False)+';\nexport const HABITATS_PER_LEVEL='+json.dumps(config['globals']['HABITATS_PER_LEVEL'])+';\n',encoding='utf8')
print('Exported',len(habitats),'habitat definitions; names:',[h['nameCN'] for h in habitats])
