"""Read static original UI layout tables, including local layout + return wrappers.
Only literal numeric arithmetic is permitted; all dynamic game code is rejected.
"""
from pathlib import Path
import runpy,json,hashlib
ROOT=Path(__file__).resolve().parents[1];reader=runpy.run_path(str(ROOT/'scripts/lua-table-reader.py'));out=ROOT/'assets/original/layouts';out.mkdir(exist_ok=True);records=[];blocked=[]
for path in sorted((ROOT/'work/client-config/layout').glob('*.lua')):
 try:
  raw=path.read_bytes();literal=reader['evaluate_literal'](reader['parse'](path)) if raw.startswith(b'\x1b') else reader['evaluate_text_literal'](raw.decode('utf-8-sig'));value=reader['normalize'](literal)
  if not isinstance(value,dict):raise ValueError('Not a layout object')
  dest=out/(path.stem+'.json');dest.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf8');records.append({'file':path.name,'sourceSha256':hashlib.sha256(raw).hexdigest(),'outputSha256':hashlib.file_digest(dest.open('rb'),'sha256').hexdigest()})
 except Exception as error:blocked.append({'file':path.name,'reason':str(error)})
(ROOT/'docs/reference/layout-report.json').write_text(json.dumps({'converted':len(records),'files':records,'blocked':blocked},ensure_ascii=False,indent=2),encoding='utf8')
print('Safe layouts converted:',len(records),'blocked:',len(blocked))
