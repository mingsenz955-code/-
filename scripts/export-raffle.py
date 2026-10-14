"""Later mobile raffle evidence; never reuse the old Dragonrand pool."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
raw=(ROOT/'assets/original/data/tables.json').read_bytes();tables=json.loads(raw)
rows=tables['choujiangyulan']
(ROOT/'assets/original/data/raffle.mjs').write_bytes(('export const RAFFLE_PREVIEW_ROWS='+json.dumps(rows,ensure_ascii=False)+';\n').encode('utf8'))
paths=['ui/dragonraffle/DragonRafflePanelNew.lua','ui/dragonraffle/DragonsPreviewPanel.lua','dragon/pconfig/librarys/dragon/DragonRandPreviewInfo.lua']
report={'baseline':'2.9.35-202402271124','tablesSha256':hashlib.sha256(raw).hexdigest(),'sources':{p:hashlib.sha256((ROOT/'work/client-config'/p).read_bytes()).hexdigest() for p in paths},'previewRows':len(rows),'previewColumns':['index','dragonId','quality'],'ticketIds':[6047,6048,6049],'paidGemPrices':{'middle':[100,900],'senior':[280,2500]},'notes':['Preview membership is not probability or per-machine pool evidence.','Free state, cooldown and current guaranteed-draw counters are supplied by _dragonRandData. They remain unknown offline.','Current modern page does not debit resources or sample the unrelated legacy Dragonrand table.']}
(ROOT/'assets/original/data/raffle-provenance.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf8'))
print('Later mobile raffle:',len(rows),'source preview entries; server result rules remain unverified.')
