"""Export raw candidate pools without executing original client Lua."""
import json,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'assets/original/data/tables.json';t=json.loads(p.read_bytes())
d=[dict(zip(['id','pool','type','itemId','weight','min','max'],r)) for r in t['randgive'] if r[1] in [9000001,9000002,9000003]]
(root/'assets/original/data/gem-explore.mjs').write_text('export default '+json.dumps(d,separators=(',',':'))+';\n',encoding='utf8')
files=['ui/rune/RuneLotteryPanel.lua','ui/rune/RuneLotteryEffectPanel.lua','dragon/data/clientdatas/RuneData.lua']
sources={f:hashlib.sha256((root/'work/client-config'/f).read_bytes()).hexdigest() for f in files}
(root/'docs/reference/gem-explore-provenance.json').write_text(json.dumps({'tablesSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'sources':sources,'policy':'offline-source-weighted-gem-v1','directEvidence':['RuneData costs20/200,80/720,200/1800; CDs600/86400/259200; capacity150','RuneLotteryPanel free low count display5, token-first mixed ten cost, server getRune type0/1/2','ui_rune_lottery + item_rune_lottery world y=-50; result panel_rune_lottery_effect','Middle/high ten-draw source labels guarantee blue/purple'],'unverified':['9000001/2/3 mapped to low/normal/high by matching quality ranges, not proven server mapping','randgive fifth column interpreted as weight; each candidate pool sums1000000','Ten guarantee implemented by conditional weighted final draw, original server guarantee algorithm unknown','Offline initial free cooldown ready; five low freebies reset UTC+8 midnight; server initial/daily boundary unknown','Dragon ball normal earning and server dynamic pool overrides remain missing']},ensure_ascii=False,indent=2),encoding='utf8')
print('Exported',len(d),'raw gem candidate rows')
