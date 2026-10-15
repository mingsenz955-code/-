"""Export literal arena/VIP tables; no source Lua is executed."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
raw=(ROOT/'assets/original/data/tables.json').read_bytes();t=json.loads(raw)
cols='id pvpLevel maxRank minRank maxRandom minRandom awardForRank awardNumForRank goldForRank awardNumWin goldWin awardNumLost goldLost boxIcon'.split()
vcols='level needExp expExtro goldExtro foodExtro onekeyFeed onekeyTrain oneHavest pvePower pveBuyPowerTime bossNoCD bossBuyTime pvpNoCD pvpBuyTime bloodTime godTreeNumPlunde godTreeNumFruit worldBossFreeTime buyVipPack trainOdds vipPackPrice packType1 packID1 packNum1 packType2 packID2 packNum2 packType3 packID3 packNum3 desc descTitle unknown33 packEffect1 packEffect2 packEffect3 packQuality1 packQuality2 packQuality3 reducebreed reducehatch reducebuilding'.split()
data={'awards':[dict(zip(cols,r)) for r in t['PVPjiangli']],'exchange':[dict(zip('id exchangeType exNeedNum itemType itemID itemNum'.split(),r)) for r in t['PVPduihuan']],'vip':[{k:v for k,v in dict(zip(vcols,r)).items() if k not in ['desc','descTitle','unknown33']} for r in t['vip']]}
(ROOT/'assets/original/data/arena-vip.mjs').write_text('export default '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf8')
paths=['dragon/pconfig/librarys/arena/LibArenaAwardInfo.lua','dragon/pconfig/librarys/arena/LibArenaExchangeInfo.lua','dragon/pconfig/librarys/vip/VipInfo.lua','ui/arena/NewArenaPanel.lua']
report={'tablesSha256':hashlib.sha256(raw).hexdigest(),'sourceSha256':{p:hashlib.sha256((ROOT/'work/client-config'/p).read_bytes()).hexdigest() for p in paths},'counts':{k:len(v) for k,v in data.items()},'verified':['Four target slots; buy 10 gems; cooldown reset 50 gems','ArenaAwardInfo first14 columns; ExchangeInfo first6 columns','VipInfo percentages, reductions, arena caps and no-CD'], 'offlineRules':['NPC ranks and power are local, not original server ranks','5 daily attempts; 10-minute cooldown; one rank reward per local UTC+8 day','Source reward rows10-13 are zero; no invented per-fight reward','Exact-price single recharge eligibility; one claim per tier for this offline activity','Other VIP systems, source server battle and live activity schedule remain unimplemented']}
(ROOT/'docs/reference/arena-vip-source.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print('Arena/VIP export:',{k:len(v) for k,v in data.items()})
