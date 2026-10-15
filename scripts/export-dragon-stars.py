"""Export source Dragon_atks fields; never execute original client Lua."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
raw=(root/'assets/original/data/tables.json').read_bytes()
fields='index dragonId star baseAttack baseDefence baseLife resistance spellPenetration attackQuality defenceQuality lifeQuality element1 element2 anger hit dodge critical resilience skill1 skill2 skill3 skill4 xp perxp'.split()
table=json.loads(raw)['Dragon_atks']
rows=[dict(zip(fields,r)) for r in table]
assert all(len(r)>=24 for r in table)
(root/'assets/original/data/dragon-stars.mjs').write_text('export default '+json.dumps(rows,separators=(',',':'))+';\n',encoding='utf8')
files=['ui/strengthen/DragonStarUpInfo.lua','ui/StarUpPanel.lua','dragon/pconfig/librarys/dragon/LibDragonAtksInfo.lua','dragon/core/dragonfarm/DragonElement.lua','ui/DragonUI.lua','ui/randev/RandEvPanel.lua']
report={'rows':len(rows),'columns':fields,'tablesSha256':hashlib.sha256(raw).hexdigest(),'sources':{f:hashlib.sha256((root/'work/client-config'/f).read_bytes()).hexdigest() for f in files},'confirmed':['Level >=7 for target, same species materials; variant target ID>=2000 at star>=5 may also eat ID-1000','Rune-bearing materials/sales blocked; sale price from item.sell_price.g','Dragon_atks xp and perxp columns; saved quality selects star attribute and skill row','StarUpPanel consumes server olddragonlist; no authoritative server response available','RandEvPanel.help: breeding duration >1 hour, purple offspring may trigger mutant event; retain max5; probability depends on VIP'],'offlinePolicies':['Local fusion adds material row xp, subtracts target row perxp; residual retained at cap, server carry-over unavailable','Legacy saves preserve former rarity-based numeric row until explicit upgrade; fresh hatched/placed dragons start star1','Protect worn equipment and all pending parent references until egg leaves tower; stricter than source busy/rune guard','Do not consume materials past star5 using old 90000 perxp placeholder: awakening separate and not implemented','No invented mutation trigger probability or adult transformation; ten distinct catalog variants remain separate species']}
(root/'docs/reference/dragon-stars-provenance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('Exported',len(rows),'source dragon star rows')

rawTables=json.loads(raw)
mutation={'clientVersion':'Android2.9.35 resource202402271124','source':'ui/randev/RandEvPanel.lua:help and RandEvInfo.lua','help':['Breeding duration >1 hour may trigger event','Purple offspring may trigger mutant event','Probability increases with VIP','Keep5; sixth replaces oldest'],'triggers':rawTables['randomevent_cf'],'events':[dict(zip('id evId evType weight timeLeft awardType itemId itemNum price monster itemName evDoc'.split(),row)) for row in rawTables['randomevent_nr']],'unknown':['VIP trigger probability and server scheduling','Event-trigger selection correlation; reward response','No adult one-click mutation observed in this client'],'sourceSha256':hashlib.sha256((root/'work/client-config/ui/randev/RandEvPanel.lua').read_bytes()).hexdigest()}
(root/'docs/reference/mutation-events.json').write_text(json.dumps(mutation,ensure_ascii=False,indent=2),encoding='utf8')
