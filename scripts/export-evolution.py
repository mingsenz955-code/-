"""Export original evolution layout, costs and translations as static data."""
from pathlib import Path
import runpy, json, zipfile, hashlib
ROOT=Path(__file__).resolve().parents[1]
reader=runpy.run_path(str(ROOT/'scripts/lua-table-reader.py'))
layout_path=ROOT/'work/client-config/layout/ui_dragon_evolution.lua'
raw=layout_path.read_bytes()
layout=reader['normalize'](reader['evaluate_literal'](reader['parse'](layout_path)))
(ROOT/'assets/original/layouts/ui_dragon_evolution.json').write_bytes((json.dumps(layout,ensure_ascii=False,indent=2)+'\n').encode('utf8'))
tables=json.loads((ROOT/'assets/original/data/tables.json').read_text(encoding='utf8'))
schema=json.loads((ROOT/'assets/original/data/schemas.json').read_text(encoding='utf8'))['LibEvolutionInfo']['columns']
costs={}
for row in tables['Evolution']:
 record={field:row[index-1] for field,index in schema.items()}
 # Mirrors EvolutionLibrary: first row for each quality/phase provides costs.
 costs.setdefault(str(record['evotype'])+'_'+str(record['evorank']),record)
with zipfile.ZipFile(ROOT/'work/yulong-dcn.apk') as archive:
 translations=json.loads(archive.read('assets/res/config/textnew_cn.json'))['translation']
 translations={key:value for key,value in translations.items() if key.startswith('ev.')}
output='export const EVOLUTION_COSTS='+json.dumps(costs,ensure_ascii=False)+';\nexport const EVOLUTION_TEXT='+json.dumps(translations,ensure_ascii=False)+';\n'
(ROOT/'assets/original/data/evolution.mjs').write_bytes(output.encode('utf8'))
report={'layoutSource':'assets/scripts/layout/ui_dragon_evolution.lua','layoutSha256':hashlib.sha256(raw).hexdigest(),'method':'static literal CONCAT only; no Lua execution','costRows':len(costs),'note':'Columns 4–6 have not been used as a verified offline success algorithm. Server response controls result.'}
(ROOT/'assets/original/data/evolution-provenance.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf8'))
layout_report_path=ROOT/'docs/reference/layout-report.json'
layout_report=json.loads(layout_report_path.read_text(encoding='utf8'))
layout_report['files']=[record for record in layout_report['files'] if record['file']!=layout_path.name]
layout_report['files'].append({'file':layout_path.name,'sourceSha256':hashlib.sha256(raw).hexdigest(),'outputSha256':hashlib.sha256((ROOT/'assets/original/layouts/ui_dragon_evolution.json').read_bytes()).hexdigest()})
layout_report['files'].sort(key=lambda record:record['file'].casefold())
layout_report['converted']=len(layout_report['files'])
layout_report['blocked']=[record for record in layout_report['blocked'] if record['file']!=layout_path.name]
layout_report_path.write_bytes((json.dumps(layout_report,ensure_ascii=False,indent=2)+'\n').replace('\n','\r\n').encode('utf8'))
print('Original evolution layout and',len(costs),'quality/phase cost records exported.')
