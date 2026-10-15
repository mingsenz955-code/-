"""Export client SkillUtils.getDes input tables without executing Lua."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1];raw=(root/'assets/original/data/tables.json').read_bytes();t=json.loads(raw)
data={'descriptions':{r[0]:{'type':r[1],'text':r[2]} for r in t['skilltypes']},'common':{r[0]:r[13] for r in t['skill_info']},'skills':{r[1]:dict(zip('activeProb activeTargetType damageVector damageValue suckBloodPercent buff1ID buff1ActiveProb buff2ID buff2ActiveProb'.split(),r[3:12])) for r in t['skill_new']},'buffs':{r[0]:dict(zip('group rounds target type arg1 arg2'.split(),r[1:7])) for r in t['buff_new']}}
(root/'assets/original/data/skill-descriptions.mjs').write_text('export default '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
(root/'docs/reference/skill-descriptions-provenance.json').write_text(json.dumps({'tablesSha256':hashlib.sha256(raw).hexdigest(),'templates':len(data['descriptions']),'skills':len(data['skills']),'buffs':len(data['buffs']),'format':'SkillUtils.getDes function2; buffID=base*1000+(quality*100+level when rune equipped)','boundary':'Describes source skills; does not claim those buffs are already implemented in offline combat'},indent=2),encoding='utf8')
