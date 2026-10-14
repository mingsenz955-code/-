"""Preserve raw source draw rows; inferred offline fields are explicitly named."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
raw=(ROOT/'assets/original/data/tables.json').read_bytes()
rows=json.loads(raw)['Dragonrand']
out=ROOT/'assets/original/data/lottery.mjs'
out.write_bytes(('export const ORIGINAL_LOTTERY_ROWS='+json.dumps(rows,ensure_ascii=False)+';\n').encode('utf8'))
sources={}
for name in ['ui/DragonRandPanel.lua','ui/RandDragonPanel.lua','dragon/pconfig/librarys/dragonrand/LibDragonRandInfo.lua','dragon/pconfig/librarys/dragonrand/DragonRandLibrary.lua']:
 sources[name]=hashlib.sha256((ROOT/'work/client-config'/name).read_bytes()).hexdigest()
report={'baseline':'2.9.35-202402271124','tablesSha256':hashlib.sha256(raw).hexdigest(),'sourceSha256':sources,'rawRows':len(rows),'verifiedClientRules':{'normalCost':30,'advancedCost':80,'tenTimesMultiplier':10,'pendingCapacity':30,'ticketShortageGemRatio':1},'offlinePolicy':'offline-cumulative-v1','unverified':['Original LibDragonRandInfo maps nummax to column 5 and weight to column 6; raw column 7 increases to 100000. The offline sampler interprets column 7 as cumulative thresholds and columns 5/6 as quantity bounds. These are explicit local inferences, not verified server probabilities or quantities.','No free draw, cooldown, pity, event pool, ticket acquisition or event rewards have been invented.']}
(ROOT/'assets/original/data/lottery-provenance.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf8'))
print('Preserved',len(rows),'original lottery rows; offline inference recorded separately.')
