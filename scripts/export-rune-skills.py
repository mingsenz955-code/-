from pathlib import Path
import json,hashlib
p=Path('assets/original/data/tables.json');t=json.loads(p.read_bytes())
data={'dragonSkills':[{'dragonId':r[1],'quality':r[2],'skills':r[18:22]} for r in t['Dragon_atks']], 'skills':{str(r[1]):{'id':r[1],'kind':int(r[1]/1000),'type':r[2],'damageVector':r[5],'damageValue':r[6],'addPower':r[12],'runeColour':r[13],'runeLevel':r[14]} for r in t['skill_new']},'skillCommon':{str(r[0]):{'name':r[1],'icon':r[3]} for r in t['skill_info']},'runeColour':{str(r[0]):r[1:] for r in t['skill_new_colour']},'runeLevel':{str(r[0]):r[1:] for r in t['skill_new_lv']},'tablesSha256':hashlib.sha256(p.read_bytes()).hexdigest()}
Path('assets/original/data/rune-skills.mjs').write_text('export default '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
print('Rune target skills:',len(data['dragonSkills']),len(data['skills']))
