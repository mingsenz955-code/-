"""Export shipped boss achievement rows; do not execute Lua or infer rewards."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
tables=root/'assets/original/data/tables.json'
rows=json.loads(tables.read_text(encoding='utf8'))['world_boss_chengjiu']
result=[dict(id=r[0],dragonId=r[1],damage=r[2],rewards=[dict(type=r[i],itemId=r[i+1],quality=r[i+2],amount=r[i+3]) for i in [3,7]]) for r in rows]
(root/'assets/original/data/boss-achievements.mjs').write_text('export default '+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
rankings=json.loads(tables.read_text(encoding='utf8'))['world_boss_paiming']
rank=[dict(id=r[0],dragonId=r[1],top=r[2],bottom=r[3],rewards=[dict(type=r[i],itemId=r[i+1],quality=r[i+2],amount=r[i+3]) for i in [4,8,12,16]]) for r in rankings]
(root/'assets/original/data/boss-ranking.mjs').write_text('export default '+json.dumps(rank,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
sources=['pcf/world_boss_paiming.lua','dragon/pconfig/librarys/worldboss/LibWorldBossRewardInfo.lua','ui/worldboss/WorldBossRewardPanel.lua','pcf/world_boss_chengjiu.lua','dragon/pconfig/librarys/worldboss/LibWorldBossAchievementInfo.lua','ui/worldboss/WorldBossAchievementPanel.lua','ui/worldboss/WorldBossAchievementItem.lua','dragon/data/clientdatas/WorldBossData.lua']
proof=dict(baseline='2.9.35-202402271124',rows=len(rows),tablesSha256=hashlib.sha256(tables.read_bytes()).hexdigest(),sources={f:hashlib.sha256((root/'work/client-config'/f).read_bytes()).hexdigest() for f in sources},rules=['Original UI says single-day total damage; WorldBossData uses per-boss historydamage and persistent flag bits. Keep highest daily total and a permanent claimed ledger.','Type 13 resolves through lib_holyfire; these six IDs are exactly the existing gem definitions, not generic unusable props.','Offline 10 daily attempts, damage solver and UTC+8 reset are existing local policy; real server rankings and schedules are not invented.','Old saves retain known todayDamage as minimum peak; cannot reconstruct past daily peak from cumulative damage.'])
(root/'docs/reference/boss-achievements-provenance.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
