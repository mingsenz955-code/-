"""Export literal loot rows and source item art; original Lua is never executed."""
from pathlib import Path
import json,zipfile,hashlib
root=Path(__file__).resolve().parents[1];raw=(root/'assets/original/data/tables.json').read_bytes();tables=json.loads(raw)
z=zipfile.ZipFile(root/'work/yulong-dcn.apk');config=json.loads(z.read('assets/res/config/config_cn_qq.json'));tr=json.loads(z.read('assets/res/config/textnew_cn.json'))['translation']
pools={r[10] for r in tables['map_level']}|{5000019,9000011}
rows=[dict(zip(['id','pool','type','itemId','weight','min','max'],r)) for r in tables['randgive'] if r[1] in pools]
propids={r['itemId'] for r in rows if r['type']==4 and r['weight']>0}|{6013,6014,6015,6016}
named={r['id']:r for r in config['items']};pcf={r[0]:r for r in tables['items']};props=[]
for id in sorted(propids):
 r=pcf[id];n=named.get(id,{});key=n.get('name',r[1]);group=n.get('group_type',r[2]);name=tr.get(group+'.'+key,tr.get(key,key));icon=n.get('img_name',key);image='thumbs_store_'+icon+'.png'
 if not (root/'assets/original/ui'/image).exists():image='thumbs_store_'+key+'.png'
 if not (root/'assets/original/ui'/image).exists():raise ValueError(f'Missing item art {id} {image}')
 props.append({'id':id,'name':name,'image':image,'quality':int(n.get('quality') or 1),'poolCandidate':r[60] if len(r)>60 else None,'keyId':r[39] if len(r)>39 else None})
fragments=[dict(zip(['index','id','equipType','mergeCost','quality','name','icon','price','part','equipID'],r)) for r in tables['equipinfofragment']]
d={'drops':rows,'props':props,'fragments':fragments,'boxes':[{'id':6013,'keyId':6014,'pool':9000011},{'id':6015,'keyId':6016,'pool':5000019}]}
(root/'assets/original/data/loot.mjs').write_text('export default '+json.dumps(d,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
files=['dragon/pconfig/librarys/pve/PveLevelInfo.lua','ui/UsePropPanel.lua','ui/pve/PvePanel.lua','ui/pve/PveRender.lua','ui/pve/PveAwardPanel.lua','dragon/utils/ItemUtil.lua','ui/UsePropListPanel.lua','ui/PVEBattleResultPanel.lua','dragon/pconfig/librarys/equip/EquipFragInfo.lua']
report={'tablesSha256':hashlib.sha256(raw).hexdigest(),'sourceSha256':{f:hashlib.sha256((root/'work/client-config'/f).read_bytes()).hexdigest() for f in files},'pools':len(pools),'rows':len(rows),'policy':'offline-source-loot-v1','directEvidence':['PveLevelInfo arr11 drops; powerCostWin arr17, powerCostLost literal0','UsePropPanel pairs6013/6014 and6015/6016; max=min(box,key)','NewEquipList.compose floor(count/mergeCost), NewFragItem uses info.equipID','Source result panel_battle_guanka_jiangli; source box panel_useprop and panel_useprop_list','PveRender threeHour=10800; box_num<3; PvePanel dceMapAward when guard absent','ItemUtil root enums19 stone,20 low ball,21 middle ball,22 high ball'],'unverified':['One weighted reward per completed win and per opened box, fifth column weights and inclusive amount bounds are offline interpretation','Box groups from raw items column61, match box contents; field name/server mapping unproven','First-kill definitions applied once; server maxAtkCnt/reset limits and dynamic pool/multi-drop correlation unverified','Special node count resets UTC+8 locally; initial post-guard reward ready and future guardian takeovers are offline policies','Box batch limit99 is a local bound; source use max equals matching inventory, not a proven99 limit','Epic box key6014 ordinary acquisition remains missing; lord box/key6015/6016 normal PVE route works','New equipment random traits and star rolls not fabricated; base definition instances only']}
(root/'docs/reference/loot-provenance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('Loot pools',len(pools),'rows',len(rows),'props',len(props),'fragments',len(fragments))
