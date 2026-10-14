"""Extract only a bounded Lua literal table; no client code execution."""
from pathlib import Path
import runpy,json,hashlib
root=Path(__file__).resolve().parents[1]
m=runpy.run_path(str(root/'scripts/inspect-lua.py'))
source=root/'work/client-config/dragon/core/Constants.lua';f=m['READER']['parse'](source);lines=m['disassemble'](f)
i=next(i for i,line in enumerate(lines) if '"DRAGON_MOVE_AREA"' in line)
end=next(j for j in range(i+1,len(lines)) if 'SETTABLE r0[r1] r2' in lines[j])
# Only NEWTABLE/LOADK/SETTABLE/SETLIST allowed by evaluate_literal. Synthetic
# RETURN selects the constructed table, never invoking the original program.
code=f['code'][i+1:end]+[30|(2<<6)|(2<<23)]
table=m['READER']['normalize'](m['READER']['evaluate_literal']({'constants':f['constants'],'code':code}))
assert len(table)==21 and table['40']['x']==[-140,140]
(root/'assets/original/data/habitat-motion.mjs').write_text('export default '+json.dumps(table,ensure_ascii=False)+';\n',encoding='utf8')
(root/'docs/reference/habitat-motion-table.json').write_text(json.dumps({'source':str(source.relative_to(root)).replace('\\','/'),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'startPC':i+1,'endPC':end-1,'table':table},ensure_ascii=False,indent=2),encoding='utf8')
print('Verified source movement bounds:',len(table))

