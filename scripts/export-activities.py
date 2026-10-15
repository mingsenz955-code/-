"""Recover separate historical activity tables. Never execute original Lua.

Column evidence: LibraryManager maps tables to their Info constructors. Numeric
server eligibility, live dates and unshipped activities are not reconstructed.
"""
from pathlib import Path
import json,zipfile,hashlib,runpy
ROOT=Path(__file__).resolve().parents[1]
t=json.loads((ROOT/'assets/original/data/tables.json').read_text(encoding='utf8'))
reader=runpy.run_path(str(ROOT/'scripts/lua-table-reader.py'))
defs=[]
def prize(typ,ident,n,q=None):
 result={'type':int(typ),'itemId':int(ident or -1),'amount':int(n)}
 if q is not None:result['quality']=int(q or 1)
 return result
def groups(r,start,width=4,count=3):return [prize(*r[b:b+3],r[b+3] if width==4 and b+3<len(r) else None) for b in range(start,min(len(r),start+width*count),width) if len(r)>b+2 and isinstance(r[b],(int,float)) and r[b]>0 and isinstance(r[b+2],(int,float)) and r[b+2]>0]
def add(key,title,kind,table,items,**kw):
 defs.append(dict(key=key,title=title,kind=kind,table=table,items=items,**kw))
def simple(r,p,**kw):return dict(id=r[0],rewards=p,**kw)
add('first','首充礼包','first','shouchong',[simple([1],[prize(r[1],r[2],r[4],r[3]) for r in t['shouchong']])],group='福利')
add('newcomer','新手礼包','purchase','xinshoulibao',[simple([1],[prize(r[1],r[2],r[3],r[4]) for r in t['xinshoulibao']],cost=prize(3,-1,t['xinshoulibaoxianzhi'][0][4]))],group='福利')
add('growth','成长计划','growth','growth_plan',[simple(r,groups(r,2,count=1),goal=r[1]) for r in t['growth_plan']],unlockCost=488,group='福利')
add('monthly-sign','每月签到','sign','qiandao_meiyue',[simple(r,[prize(r[3],r[4],r[6],r[5])],month=r[1],goal=r[2],double=r[7],vip=r[8]) for r in t['qiandao_meiyue']],group='福利')
add('legacy-sign','十五日签到','login','qiandao',[simple(r,[prize(r[5],r[6],r[7])],goal=r[4]) for r in t['qiandao']],group='福利')
add('seven-login','七日福利·登录','login','7dayfuli_denglu',[simple(r,[prize(r[1],r[2],r[3],r[7]),prize(r[4],r[5],r[6],r[8])],goal=r[0]) for r in t['7dayfuli_denglu']],group='七日')
add('seven-tasks','七日福利·任务','sevenTask','7dayfuli_renwu',[simple(r,[prize(r[2],r[3],r[4],r[5])],goal=r[1]) for r in t['7dayfuli_renwu']],group='七日')
add('seven-shop','七日福利·半价购','purchase','7dayfuli_shangpin',[simple(r,[prize(r[1],r[2],r[3],r[8])],cost=prize(3,-1,r[5]),limit=r[6],vip=r[7],day=r[0]) for r in t['7dayfuli_shangpin']],group='七日')
for table,key,title,width in [('7daybuy','seven-recharge','七日充值',4),('5daybuy','five-recharge','五日充值送豪礼',4)]:
 add(key,title,'rechargeDays',table,[simple(r,groups(r,2,count=3 if table=='5daybuy' else 2),day=r[1],goal=(5 if table=='5daybuy' else 7) if not r[1] else r[-1],paidGoal=200 if table=='5daybuy' and not r[1] else 0,super=not r[1]) for r in t[table]],group='七日')
for table,key,title,kind in [('xiaofeifanli','spend','消费返利','spent'),('chongzhifanli','recharge-rebate','充值返利','paid'),('dafuwengfanli','monopoly-rebate','大富翁充值返利','paid')]:
 add(key,title,kind,table,[simple(r,groups(r,2),goal=r[1]) for r in t[table]],group='返利')
add('limited-spend','限时消费','spent','xiaofeifanli2',[simple(r,groups(r,3),goal=r[2],day=r[1]) for r in t['xiaofeifanli2']],group='返利')
for i in range(1,5):
 table='tuhao_'+str(i);add('tycoon-'+str(i),'土豪节·第'+str(i)+'期','paid',table,[simple(r,[prize(r[1],r[2],r[3],r[6] if len(r)>6 else None)],goal=r[4]) for r in t[table]],group='返利')
add('gem-deals','宝石特惠','purchase','baoshitehui',[simple(r,[prize(r[1],r[2],r[3])],cost=prize(3,-1,r[4])) for r in t['baoshitehui']],group='特惠')
for i,title in enumerate(['强化石特惠','羽翼特惠','水晶特惠'],1):
 add('enhance-sale-'+str(i),title,'purchase','qianghuatehui',[simple(r,[prize(r[3],r[4],r[5])],cost=prize(3,-1,r[6])) for r in t['qianghuatehui'] if r[1]==i],group='特惠')
add('orange-sale','双十二·抢购橙装','purchase','qianggouchengzhuang',[simple(r,[prize(r[1],r[2],r[3])],cost=prize(3,-1,r[4]),limit=r[5]) for r in t['qianggouchengzhuang']],group='节日')
add('recharge-store','充值限购','rechargeShop','chongzhixiangou',[simple(r,groups(r,3),goal=r[2],day=r[1],cost=prize(3,-1,r[15])) for r in t['chongzhixiangou']],group='特惠')
add('recharge-points','充值积分兑换','pointShop','chongzhijifen',[simple(r,[prize(r[2],r[3],r[4],r[6])],goal=r[1],limit=r[5]) for r in t['chongzhijifen']],group='兑换')
add('dragon-exchange','神龙碎片兑换','exchange','duihuan',[simple(r,[prize(r[4],r[5],r[6])],cost=prize(r[1],r[2],r[3])) for r in t['duihuan']],group='兑换')
add('rose-date','七夕·玫瑰之约','exchange','love_duihuan',[simple(r,[prize(4,r[1],r[3])],cost=prize(r[4],r[5],r[6]),requires=r[7]) for r in t['love_duihuan']],group='节日')
add('chest-exchange','宝箱积分兑换','chestShop','baoxiang_duihuan',[simple(r,[prize(r[1],r[2],r[3],r[4])],goal=r[5],limit=r[6]) for r in t['baoxiang_duihuan']],group='兑换')
add('train-points','培养回馈·积分兑换','trainShop','peiyangjifenduihuan',[simple(r,[prize(r[1],r[2],r[3])],goal=r[4]) for r in t['peiyangjifenduihuan']],group='培养')
add('training-rank','培养回馈·排名奖励','trainingRank','peiyangpaihangjiangli',[simple(r,[prize(r[1],r[2],r[3],r[6])],rankMin=r[4],rankMax=r[5]) for r in t['peiyangpaihangjiangli']],group='培养',odds='原排名奖励目录；本地单人榜，至少完成一次培养可领取一次第一名奖励。没有原在线排行与结算日期，常驻领取属于本地适配。')
add('training-missions','培养回馈·任务','trainingMission','peiyangrenwu',[{'id':r[0],'goal':r[1],'points':r[2],'rewards':[]} for r in t['peiyangrenwu']],group='培养',odds='培养丹消耗、完美/失败次数及属性增量由本地培养记录。任务8～14采用累计属性增量，属于离线条件。')
add('train-tasks','培养送豪礼','trainTask','peiyangduihuan',[simple(r,groups(r,3,width=3,count=2),goal=r[1]) for r in t['peiyangduihuan']],group='培养')
for group in sorted({r[19] for r in t['longdan_jiangli']}):
 rows=[r for r in t['longdan_jiangli'] if r[19]==group];items=[]
 for r in rows:
  rewards=[prize(r[b],r[b+1],r[b+2],r[b+3]) for b in [9,14] if r[b]>0 and r[b+2]>0]
  dragons=[ident for ident in r[5:8] if ident!=-1];items.append(simple(r,rewards,mode=r[3],goal=r[4] if r[3]==1 else len(dragons),dragons=dragons,limit=r[8]))
 add('egg-event-'+str(group),'龙蛋培育·第'+str(group)+'期','eggEvent','longdan_jiangli',items,group='收集',odds='按本版本起实际完成的培育龙蛋记录计入各期；不同历史期同步开放并累计，属于本地常驻适配。')
add('cdkeys','福利兑换码','cdkey','CDKlibao',[simple(r,[prize(r[2],r[3],r[4])],goal=r[1]) for r in t['CDKlibao']],group='福利',odds='原礼包奖励目录；没有原服务器兑换码数据库。本地档案码YULONG-CDK-1至31各限用一次，不冒充线上有效码。')
add('collection','神龙收集回馈','collection','Arpuhuodong',[simple(r,groups(r,4,width=3,count=2),conditionType=r[1],dragon=r[2],goal=r[3]) for r in t['Arpuhuodong']],group='收集')
add('purple-gift','紫装送礼','purple','huodong',[simple(r,[prize(r[3],r[4],r[5])],fragments=list(map(int,r[1].split('|'))),goal=r[2]) for r in t['huodong']],group='收集')
add('lucky-cat','招财猫','cat','money_cat',[simple(r,[prize(r[4],r[5],r[6])],max=r[7],cost=prize(r[1],r[2],r[3]),vip=r[8]) for r in t['money_cat']],group='抽奖')
for i,title in enumerate(['碎片','骷髅龙','中国龙','李小龙','金蛇龙','屎大龙']):
 table='Gaming_table3_'+str(i);add('wheel-'+str(i),'幸运转盘·'+title,'draw',table,[simple(r,[prize(r[2],r[3],r[4],r[9] if len(r)>9 else None)],weight=(r[5]-(t[table][n-1][5] if n else 0))) for n,r in enumerate(t[table])],price=8,tenPrice=76,fiftyPrice=350,freeDaily=1,group='抽奖',odds='原奖池保留；累计区间列的权重为离线解释。')
for i,title in enumerate(['爪','角','骨','鳞'],1):
 table='runehuodong_'+str(i);add('fire-'+str(i),'点燃圣火·橙装'+title,'draw',table,[simple(r,[prize(r[1],r[2],r[3],r[6] if len(r)>6 else None)],weight=r[4]-(t[table][n-1][4] if n else 0)) for n,r in enumerate(t[table])],price=30,group='抽奖',odds='原累计区间用于离线抽取；30魔晶单抽价格为离线设置。')
for i in [1,2,3]:
 add('recharge-wheel-'+str(i),'充值转盘·'+['普通','高级','豪华'][i-1],'rechargeDraw','Recharge_table1-1',[simple(r,[prize(r[2],r[3],r[4],r[6])],weight=r[5]) for r in t['Recharge_table1-1'] if r[1]==i],goal=[30,100,300][i-1],group='抽奖',odds='原奖池保留；每轮充值门槛30/100/300元为离线设置。')
for i,title in enumerate(['狂龙','高能威龙','大圣龙','蛋壳龙','大圣龙·复刻'],1):
 table='shenlong_'+str(i);add('limited-'+str(i),'限时神龙·'+title,'limited',table,[simple(r,groups(r,1),goal=r[0]) for r in t[table]],price=280,tenPrice=2800,featured=[1200,1202,1203,1204,1206][i-1],simulation=[simple(r,[prize(5,r[1],1,r[2])],weight={2:60,3:30,4:9,5:1}.get(r[2],1)) for r in t['choujiangyulan']],group='神龙',odds='该配置是排名奖励表，不是抽奖池。抽取使用客户端扭蛋预览池作离线模拟，不代表原限时奖池或概率；每抽10分，200分后可领一次本地第一名奖励，无真人排名。')
add('spring-wheel','春节·红包转盘','springDraw','chunjiezhuanpan',[simple(r,[prize(r[1],r[2],r[3],r[6])],weight=r[4]) for r in t['chunjiezhuanpan']],price=12,tenPrice=118,couponCosts={str(r[2]):r[3] for r in t['chunjiexiaohao'] if r[1]==1},group='节日',odds='原奖池及红包/魔晶消费配置：红包单抽1、十抽10，魔晶单抽12、十抽118。原奖池区间权重用于离线抽取；任务红包由本地实际操作获得。')
add('spring-tasks','春节·红包任务','springTask','chunjierenwu',[{'id':r[0],'goal':r[1],'limit':r[2],'coupons':r[3],'description':r[4],'rewards':[]} for r in t['chunjierenwu']],group='节日',odds='每日真实操作计数，按原任务次数与红包数量领取。HARD驯龙挑战尚未接通，不以其它战斗替代。')
add('children-eggs','儿童节·砸金蛋','eggs','zadanhuodong',[simple(r,[],prop=r[1],price=r[2],health=r[5],pools=[{'type':r[b],'itemId':r[b+1],'min':r[b+2],'max':r[b+3],'weight':r[b+4]} for b in [8,13,18,23]]) for r in t['zadanhuodong']],group='节日',odds='原血量、道具与奖励区间保留；每次击打一点，完成后离线抽取一份奖励。')
add('daily-sale','每日秒杀','dailySale','meirimiaosha',[simple(r,groups(r,2,width=3,count=4),category=r[1]) for r in t['meirimiaosha']],group='特惠')
for i,title in enumerate(['冒险岛','宝藏岛','金银岛'],1):
 points=reader['normalize'](reader['evaluate_literal'](reader['parse'](ROOT/f'work/client-config/ui/monopoly/map{i}.lua')))
 add('monopoly-'+str(i),'大富翁·'+title,'board','dafuweng_randgive',[simple(r,[prize(r[2],r[3],r[5],r[7])],pool=r[1],weight=r[4],max=r[6]) for r in t['dafuweng_randgive'] if i*100<=r[1]<(i+1)*100],points=points,tiles=t['dafuweng'],entryType=30+i,entryGems=[10,30,50][i-1],group='大富翁',odds='原路线、格子与奖池；每张入场券走一骰、魔晶补票价格为离线适配。')
# Monthly cards use the original TreasureInfo price and daily amount. Durations
# are explicit local 30-day policies; no external payment is invoked.
for key,title,ids in [('month-card','月卡',[115,116,117]),('lucky-bag','每日福袋',[123,124,125])]:
 add(key,title,'card','treasure_items',[simple(r,[prize(3,-1,r[2])],priceYuan=r[4]/10,days=30) for r in t['treasure_items'] if r[0] in ids],group='福利')
add('red-packets','新春红包','packet','hongbao',[simple(r,[prize(r[1],r[2],r[3])],min=r[6],max=r[7],cost=prize(3,-1,r[3])) for r in t['hongbao']],group='节日',odds='本地拆自己的红包，余款保留，可一次取回；不发送给其它玩家。')
add('double-eleven','双十一·消费红包','cashback','ui/carnival/DoubleEvelen.lua',[{'id':i,'rewards':[],'goal':10} for i in range(1,5)],group='节日',odds='前四个活动日分别记录消费，四日后返还当日消费的10%。依据原DoubleEvelen的4行、345600秒和costlist/10；本地开始时间替代原服务器活动日期。')
add('single','单笔充值','single','danchong',[],group='返利')
z=zipfile.ZipFile(ROOT/'work/yulong-dcn.apk');config=json.loads(z.read('assets/res/config/config_cn_qq.json'));tr=json.loads(z.read('assets/res/config/textnew_cn.json'))['translation'];meta={}
for n in config['items']:
 ident=n['id'];name=n.get('name','');group=n.get('group_type','');label=tr.get(group+'.'+name,tr.get(name,name));icon=n.get('img_name',name)
 image=next((f for f in ['thumbs_store_'+icon+'.png','thumbs_'+icon+'_0.png','thumbs_'+icon+'.png'] if (ROOT/'assets/original/ui'/f).exists()),None)
 meta[str(ident)]={'name':label,'image':image,'quality':int(n.get('quality') or 1)}
for d in defs:
 if d['key'].startswith('wheel-'):
  preview=[1092,1076,1041,1073,1071,1093][int(d['key'].split('-')[1])];d['preview']=preview;d['title']='幸运抽奖·'+meta[str(preview)]['name']
fixed_packs={}
for row in t['items']:
 if row[0] in [6013,6015] or len(row)<=60 or not row[60] or not isinstance(row[60],str):continue
 try:pools=[int(p) for p in row[60].split('|')]
 except ValueError:continue
 rewards=[]
 for pool in pools:
  rows=[r for r in t['randgive'] if r[1]==pool and r[4]>0]
  if len(rows)!=1 or rows[0][5]!=rows[0][6] or rows[0][5]<=0:break
  r=rows[0];rewards.append(prize(r[2],r[3],r[5]))
 else:
  if rewards:fixed_packs[str(row[0])]={'pools':pools,'rewards':rewards}
data={'fixedPacks':fixed_packs,'eggPoints':t['longdan_zhonglei'],'training':t['Dragon_peiyang'],'trainingPoints':t['peiyanghuodongjifen'],'activities':defs,'items':meta,'baseline':'2.9.35-202402271124','scope':'活动资料来自该APK，不能证明涵盖所有历史发布版本。'}
(ROOT/'assets/original/data/activities.mjs').write_text('export default '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
report={'baseline':data['baseline'],'tablesSha256':hashlib.sha256((ROOT/'assets/original/data/tables.json').read_bytes()).hexdigest(),'activityCount':len(defs),'rewardRows':sum(len(d['items']) for d in defs),'scope':data['scope'],'activities':[{k:v for k,v in d.items() if k not in ['items','points','tiles']} for d in defs],'limitations':['历史活动永久开放属于用户要求的离线适配','未声称恢复真人排行、服务器开奖、外部兑换码、所有历史发行版本','客户端库未保存的周期、资格与概率在活动说明中标出本地政策']}
(ROOT/'docs/reference/activities-source.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print('Activities:',len(defs),'source reward rows:',report['rewardRows'])
