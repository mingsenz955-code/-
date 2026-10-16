"""Export already statically extracted original client rows; never execute Lua."""
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
tables = json.loads((root / 'assets/original/data/tables.json').read_bytes())
waves = tables['BloodWar']
pack_ids = {r[i] for r in waves for i in (4, 7, 10)}
groups = [{'id': r[0], 'monsterIds': [x for x in r[1:10] if x]}
          for r in tables['Dragon_computer_array_nine'] if r[0] in pack_ids]
monster_ids = {x for g in groups for x in g['monsterIds']}
wave_cols = ['id', 'actId', 'nextMissionId', 'isFirst', 'pack1', 'drop1', 'star1',
             'pack2', 'drop2', 'star2', 'pack3', 'drop3', 'star3', 'prevMissionId', 'nextActId']
level_cols = ['id', 'autoPassNeed', 'passAward', 'buff1', 'cost1', 'desc1',
              'buff2', 'cost2', 'desc2', 'buff3', 'cost3', 'desc3',
              'prevID', 'nextID', 'costMojing', 'getScore']
monster_cols = ['id', 'element1', 'element2', 'level', 'attack', 'defend', 'life',
                'resistance', 'penetration', 'hit', 'dodge', 'crit', 'uncrit', 'anger',
                'skill1', 'skill2', 'skill3', 'skill4', 'star', 'dragonId', 'name',
                'ai', 'isGround', 'speed']
data = {'waves': [dict(zip(wave_cols, r)) for r in waves],
        'levels': [dict(zip(level_cols, r)) for r in tables['BloodWarLevel']],
        'groups': groups,
        'monsters': [dict(zip(monster_cols, r)) for r in tables['monster'] if r[0] in monster_ids]}
target = root / 'assets/original/data/blood-front.mjs'
target.write_text('export default ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf8')
print('Exported', len(waves), 'waves,', len(data['levels']), 'stages,', len(groups), 'packs')
