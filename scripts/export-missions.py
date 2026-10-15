"""Static task definitions, literal arguments and Chinese strings. Never runs Lua."""
from pathlib import Path
import runpy,re,json,zipfile,hashlib
ROOT=Path(__file__).resolve().parents[1];r=runpy.run_path(str(ROOT/'scripts/lua-table-reader.py'));base=ROOT/'work/client-config';fn=r['parse'](base/'dragon/core/Constants.lua');regs={};constants={};k=fn['constants']
def rk(v):return k[v-256] if v>=256 else regs.get(v)
for ins in fn['code']:
 op=ins&63;a=(ins>>6)&255;b=(ins>>23)&511;c=(ins>>14)&511;bx=ins>>14
 if op==1:regs[a]=k[bx]
 elif op==5:regs[a]=('global',k[bx])
 elif op==0:regs[a]=regs.get(b)
 elif op==6:regs[a]=constants.get(rk(c)) if regs.get(b)==('global','Constants') else None
 elif op==9 and regs.get(a)==('global','Constants'):constants[rk(b)]=rk(c)
 elif op not in [7,9,22,30]:regs.pop(a,None)
z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk');tr=json.loads(z.read('assets/res/config/textnew_cn.json'))['translation'];config=json.loads(z.read('assets/res/config/config_cn_qq.json'));rewards={row[0]:row for row in json.loads((ROOT/'work/config-json/goals.json').read_text('utf8'))};text=(base/'dragon/config/TranslationGoals.lua').read_text('utf8');literals={}
for line in text.splitlines():
 m=re.search(r'literals\[(\d+)\]\s*=\s*GoalsLiteral.new\((.*)\)',line)
 if not m:continue
 body=re.sub(r'Config_LocaleText.lang\(("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\')\)',lambda m:json.dumps(tr.get(r['evaluate_text_literal']('return '+m[1]),r['evaluate_text_literal']('return '+m[1])),ensure_ascii=False),m[2])
 try:literals[int(m[1])]=r['normalize'](r['evaluate_text_literal']('return {'+body+'}'))
 except Exception as e:raise ValueError((m[1],e))
rows=[];blocked=[]
for line in (base/'dragon/core/dragonfarm/GoalManager.lua').read_text('utf8').splitlines():
 if line.strip().startswith('--'):continue
 m=re.search(r'GoalManager.addGoal\((Goal\w+)\.new\((.*?)\)(.*?)\)\s*(?:--.*)?$',line)
 if not m:continue
 def conv(v):
  if v.startswith('PropertyManager.'):return json.dumps(v.split('.')[-1])
  key=v.split('.')[-1]
  if key not in constants or constants[key] is None:raise ValueError('Unresolved '+key)
  return json.dumps(constants[key],ensure_ascii=False)
 try:
  body=re.sub(r'(?:Constants|PropertyManager)\.\w+',lambda x:conv(x[0]),m[2]);args=r['normalize'](r['evaluate_text_literal']('return {'+body+'}'))
  extra=r['normalize'](r['evaluate_text_literal']('return {'+m[3].lstrip(', ')+'}')) if m[3].strip(', ') else []
  id=args[0];row=rewards.get(id);assert row is not None and id in literals
  rows.append({'id':id,'kind':m[1][4:],'args':args[1:],'linked':extra[1] if len(extra)>1 and isinstance(extra[1],list) else [],'text':literals[id],'reward':row[1:]})
 except Exception as e:blocked.append({'line':line.strip(),'reason':str(e)})
assert not blocked,blocked
out={'activeLimit':config['globals']['NUM_ACTIVE_MISSIONS'],'goals':rows,'upgrades':{str(i['id']):i.get('upgrades_to') for i in config['items'] if i.get('upgrades_to')},'obstacleIds':[i['id'] for i in config['items'] if i['group_type']=='OBSTACLE'],'baseline':'2.9.35-202402271124'}
(ROOT/'assets/original/data/missions.mjs').write_text('export default '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
(ROOT/'docs/reference/missions-source.json').write_text(json.dumps({'count':len(rows),'rewardRows':len(rewards),'activeLimit':out['activeLimit'],'kinds':sorted(set(x['kind'] for x in rows)),'sources':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [base/'dragon/core/dragonfarm/GoalManager.lua',base/'dragon/config/TranslationGoals.lua',ROOT/'work/config-json/goals.json']},'excluded':'Commented-out registrations are not enabled. Original tutorial-only goals absent from init are not fabricated.'},ensure_ascii=False,indent=2),encoding='utf8')
print('active registered goals',len(rows),'kinds',sorted(set(x['kind'] for x in rows)))
