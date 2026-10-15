"""Export verified SkillNewCommonInfo columns; do not execute original Lua."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1];raw=(root/'assets/original/data/tables.json').read_bytes();rows=json.loads(raw)['skill_info'];data={}
for r in rows:
 d={k:r[i] for k,i in [('fireEff',4),('hitEff',5),('groundEff',6),('nameImg',14)]}
 d['nameImage']=d['nameImg']+'.png' if d['nameImg'] and (root/'assets/original/ui'/(d['nameImg']+'.png')).exists() else None
 data[r[0]]=d
(root/'assets/original/data/battle-skill-art.mjs').write_text('export default '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
report={'tablesSha256':hashlib.sha256(raw).hexdigest(),'rows':len(rows),'nameImages':sum(bool(d['nameImage']) for d in data.values()),'source':'SkillNewCommonInfo ctor columns5/6/7/15, BattleField attack/playSkillName','limits':['Presentation only; server action targeting, skill schedule, damage, buffs and settlement remain unverified','BattleUI source native768-high sky gaps compressed by0.62 for existing576-high PC battle artboard; not original viewport equality']}
(root/'docs/reference/battle-skill-art-provenance.json').write_text(json.dumps(report,indent=2),encoding='utf8')
