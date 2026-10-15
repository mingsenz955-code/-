from pathlib import Path
import json,hashlib
root=Path('.');raw=Path('assets/original/data/tables.json').read_bytes();t=json.loads(raw)
cols=['id','minLvl','maxLvl','minScore','maxScore','propType','propID','propNum','plantTime','percent','seedName','seedIcon','plunderNum1','plunderNum2','plunderNum3','start','end']
seeds=[dict(zip(cols,r)) for r in t['seed']]
moncols=['id','element1','element2','level','attack','defend','life','resistance','penetration','hit','dodge','crit','uncrit','anger','skill1','skill2','skill3','skill4','star','dragonId','name','ai','isGround','speed']
robot_ids={r[1] for r in t['seedrobot']}
groups=[{'id':r[0],'monsterIds':[i for i in r[1:10] if i is not None]} for r in t['Dragon_computer_array_nine'] if r[0] in robot_ids]
ids={r[1] for r in t['world_boss']}|{i for g in groups for i in g['monsterIds']}
d={'seeds':seeds,'groups':groups,'robots':[dict(zip(['id','packId','level','name','head'],r)) for r in t['seedrobot']],'monsters':[dict(zip(moncols,r)) for r in t['monster'] if r[0] in ids],'bossStages':[dict(zip(['previous','id','dragonId','rewardType','rewardId','rewardCount','prior'],r)) for r in t['world_boss']]}
Path('assets/original/data/world-encounters.mjs').write_text('export default '+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
Path('docs/reference/world-encounters-provenance.json').write_text(json.dumps({'tablesSha256':hashlib.sha256(raw).hexdigest(),'source':['MainScene:initIslands:positions and level gates','LibHolyInfo:seed columns','seedrobot second column is a Dragon_computer_array_nine pack ID, not a single monster ID','LibMonsterInfo static ctor:monster fields','HolyTreePanelNew static:plant,plunder,manualharvest and NPC flag','WorldBossMainPanel static:bossid,damage,totaldamage,battlecnt and attempt price ladder'],'offlinePolicies':['No human opponents or server rankings; source seedrobot NPCs only','Three growing slots; five daily active seed rows one each; UTC+8 reset; VIP fourth slot pending','Always open worldboss in offline mode, 10 daily attempts and static per-dragon damage formula','Boss kill reward uses world_boss row reward; server schedule, combat AI, rankings and achievement rewards pending']},ensure_ascii=False,indent=2),encoding='utf8')
