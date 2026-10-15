"""Export literal equipment star data without executing original Lua."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
raw=(root/'assets/original/data/tables.json').read_bytes()
fields='id quality part star expCost expHave enhAtk enhDef enhHp enhExt decomposeReward starQuality cost atkAdd defAdd hpAdd uncritAdd critAdd enhUnCrit enhCrit equipIDFix'.split()
rows=[dict(zip(fields,r)) for r in json.loads(raw)['equipinfostar']]
assert len(rows)==192 and all(len(r)==21 for r in json.loads(raw)['equipinfostar'])
(root/'assets/original/data/equipment-stars.mjs').write_text('export default '+json.dumps(rows,separators=(',',':'))+';\n',encoding='utf8')
files=['dragon/pconfig/librarys/equip/EquipStarInfo.lua','dragon/pconfig/librarys/equip/EquipStarInfoLibrary.lua','dragon/data/clientdatas/DataManager.lua','ui/strengthen/EquipStarUpInfo.lua']
report={'tablesSha256':hashlib.sha256(raw).hexdigest(),'columns':fields,'rows':len(rows),'sourceSha256':{f:hashlib.sha256((root/'work/client-config'/f).read_bytes()).hexdigest() for f in files},'confirmed':['Lookup by star,quality,part and first three digits of equipment definition id','Quality 3 cap3; quality4/5 cap5; up to5 same-quality materials; regular parts0..3 cross-compatible, wings/crowns same part','Preview adds material star-row expHave to target exp; subtracts each expCost; coin cost=current target row cost times material count','DataManager function87: curAtk/Def/Hp=definition+star cumulative Add; curCrit=antResist+critAdd; curUnCrit=resist+uncritAdd'],'offlinePolicies':['Settlement performed locally from client preview; authoritative server response unavailable','Protect all worn material equipment, stricter than source deployed-dragon filter','Retain residual exp at cap; no fabricated random traits or extType/extAtom conditional bonuses']}
(root/'docs/reference/equipment-stars-provenance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('Exported',len(rows),'equipment star rows')
