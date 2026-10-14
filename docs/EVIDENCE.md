# 原版证据登记

检查日期：2026-10-14。用户已同意先按“包含皇冠、羽翼等后期系统的手机版”推进；具体 Android/iOS 版本未确定。用户允许网上搜索全部素材。

## E01 — App Store 产品与版本记录（一级来源）
- 页面：https://apps.apple.com/in/app/育龙高手-龙之牧场官方版/id1072998335
- 标题：育龙高手--龙之牧场官方版。版权栏为 Sincetimes。
- 可支持：繁殖收集、种植、建筑、牧场、阵型战斗、副本的存在。2016 年记录含皇冠和羽翼装备；2021 年记录有活动及显示更新。
- 不能支持：最新安卓完整内容、所有龙种、皮肤、数值、抽奖概率或确切活动列表。不是 APK 数据。

## E02 — 华清飞扬署名养成文章（开发方署名，历史版本）
- 页面：https://www.taptap.cn/moment/15215226743948966
- 标题：《育龙高手》神龙养成攻略——战斗力篇；日期 2017-03-15，署名华清飞扬。
- 摘要：装备有六个槽位，涉及品质、强化及升星；龙升星消耗同种龙，历史规则提到五星及觉醒；三星后涉及星座。另有培养、地面/天空祭坛宝石、符文与技能等级。
- 槽位登记：龙爪、龙鳞、龙骨、龙角、皇冠、龙翼。
- 限制：只能用于该历史版本，不能推定后期变异/远古龙星级上限。未得到完整数值表。

## E03 — 当乐渠道游戏页与玩家截图（二级来源）
- 页面：https://ng.d.cn/longzhimuchang/
- 页面快照标示版本 2.9.35、日期 2025-06-12；只作为渠道线索，不认定为当前最新官方版本。
- 2018-01-30 玩家牧场截图：斜俯视浮空岛、边缘云层、栖息地平台、顶部资源条、两侧入口。页面另有 2019 宣传图。
- 截图地址：https://uus-ng-img.d.cn/snapshot/201801/335/image/8949/169078949/hd/20180130104929917.png
- 本地参考（成功获取后）：reference/dcn-20180130-ranch.png。仅作为视觉证据，不混入运行时图层。
- 注意：搜索引擎返回过 `uus-ng.img.d.cn` 旧域名，证书不匹配；未关闭 TLS 校验，改用页面链接的 `uus-ng-img.d.cn`。

## 不采用的来源
- 页游聚侠页面：属于不同客户端，不能作为手机版界面或数值标准。
- Dragon City、驯龙能手、我有一座育龙岛：名字或画面相近，不能混用。
- 部分“翅膀攻略”将本作描述为武侠游戏：内容明显可疑，不作为证据。
- 新站点泛化攻略与 E02 的星级描述存在差异，等待版本证据，暂不覆盖历史规则。

## 待搜集材料（优先顺序）
1. 确认目标版本：安装包版本号、主界面、设置、图鉴、装备/祭坛截图；需要用户合法持有或官方公开来源。
2. 原版完整栖息地、龙幼年/成年/进化外观、皮肤、图标、音效；每项记来源、日期、SHA256、用途与可用性。
3. 完整龙表：ID、八系属性、陆空类型、品质、繁殖条件/概率、技能、成长曲线、产金和栖息地限制。
4. 养成各阶段消耗、六槽装备/皇冠/羽翼、升星/觉醒、培养、星座、宝石/祭坛、符文的规则与数值。
5. 副本关卡、6v6阵型/技能/克制、掉落、AI行为；单机替代世界 BOSS 和竞技对手。
6. 各期活动入口、任务、奖励、抽奖奖池/概率/保底，版本时间。无证据的活动不编造为原版。

## 使用原则
“已确认”只描述证据覆盖的事实，不代表已完成开发。公开图片不自动等于独立可用的游戏素材；截图用于比对，临时素材独立登记。后续高保真验收按同场景截图、比例与交互逐项对照。

## E04 — 当乐公开客户端（本轮主要资产/配置基线）
- 下载来自 E03 页面“立即下载”链接，保存在 work/yulong-dcn.apk；未安装或执行 APK。
- 下载 URL：https://res5.d.cn/27c249cf9ac48d277a698b8e49f6e264e46b0c0049f05b0c7ef8caf2e4bf2d995beead580902ce9ff7b80e53da5d707d0049050184e0f9b2fdc1a84b05fc30fad66ba8cccea6d05d.apk
- 180106221 字节；SHA256 `6011e9026f35d3377edf6dae7ec7479fde82c058ad413a4f4327e31e1c2555c5`。
- AndroidManifest 静态解析确认：`com.sincetimes.dragonfarmii.dl`，versionName `2.9.35`，versionCode `70`。资源清单内版本 `202402271124`。
- 当前工程按这个已取得客户端逐项对照。不能代表所有渠道、所有历史活动或任意更晚热更新。
- 包含 6741 文件；已导入 1183 项图像/动画登记，来源和 SHA256 见 assets/original/manifest.json。
- 原 PNG/plist 直接拆图；PKM ETC1 颜色与独立 alpha 解码后拆图。旋转、源画布与偏移保留。骨骼首帧与动画为源部件重构，有单独转换说明。
- 三种基础龙的 3 阶段呼吸动画已烘焙，帧数 16–41；关键帧来自原 XML，当前采用线性插值，缓动仍需视频对照，不能宣称完全一致。
- 90 条龙的中文名直接通过物品表 name 与中文字典映射。水晶龙 1052、风龙 1053、镜龙 1054 在此包中缺少对应图鉴图，明确显示待补；不使用其他龙替代。图集中另有 2022 外观，和旧命名表差异待核对。
- 完整清单：reference/apk-inventory.json、assets/original/catalog.json。

## E05 — 静态配置与布局读取
- 客户端资源的固定签名/XXTEA 包装已通过静态读取处理，资源密钥来自同一公开客户端二进制。没有登录、访问游戏服务器、执行原版 Lua 或原生库。
- Lua 5.1 字节码只接受常量、建表、赋值、返回等白名单指令；可读 Lua 只接受 return 字面量表。不运行任意函数。已转换 212 / 214 张 pcf 表，剩余两表含非字面量内容，停止自动转换。
- 带字段名配置来源 `assets/res/config/config_cn_qq.json`（404 项物品）与 pcf items 表（408 行）并非同一完整集合，需要追踪差异；不把旧表自动认定为最新运行规则。
- 导出至 assets/original/data：client-config.json、tables.json、schemas.json、provenance.json。
- 原版种植依据：globals 的 COLLECT_PRICE/MINUTES/VALUES/XP；PlantsPanel.lua 用 cp 选择，分钟转秒。初级农场开放前三种：龙涎草 50 金币/30秒/10食物；三叶草 250金币/5分钟/50食物；含羞蕨 1000金币/30分钟/150食物。
- 原版喂养/成长依据：DragonManager.FOOD_PER_LEVEL=4；DragonElement.feedCost 为 Lv<10 时 `5*2^(level-1)`，否则 `2000+500*(level-10)`；外观在 4 级和 7 级切换。BreedSelectNewPanel 明确亲代不小于4级。
- 当前繁殖使用 coition 的后代基础权重和物品表的 breed/hatch 时间，结果只在开始时确定并入档。客户端还含品质筛选/加成逻辑；服务端实际概率尚未核验，界面明确标注基础池。
- ui_main 布局可安全读为字面量表，1022×749 参考坐标。已用于主 HUD，资源条运行时九宫格变化、字体位图、其他入口状态与自适应比例仍待逐屏核对。
- 读取工具、来源文件与输出哈希见 scripts/ 和 reference/decoded-config-inventory.json、config-table-report.json。

## E06 — 玩家实机视频（只作为已观看片段的证据）
- 链接：https://www.bilibili.com/video/BV1dz4y1A7gu/
- 作者：青春喂狗-；页面日期 2023-11-07；时长 02:57；具体客户端版本未知。
- 实际观看到约 00:19.7：主牧场斜俯视岛屿、顶部资源、两侧按钮与收金币浮字。
- 播放至约 01:01.3 出现登录弹窗，后续内容未核验，未绕过登录/付费限制。
- 页面合集包含装备、龙翼、祭坛、星座、副本、活动等后续条目；标题只能作为待看线索，不当作内部规则已验证。
- 后续按视频地址 + 时间点 + 版本可辨识信息登记；不同年份和渠道分开，避免混版。

## E05 后续已核对
- HabitatManager.getCurrentRevenues 以经过秒数除60乘当前rate，读取已有ar并按MAX_GOLD封顶；getCurrentRate排除繁殖状态亲代。DragonElement.rate 的Lv1–10为starting_coins+coins_added*(Lv-1)，之后每两级增加coins_added（向下取整）。当前已接入该分钟公式与暂停区间积分，未接入增益建筑。
- 牧场等级使用levels.xp_required累计阈值，种植经验使用COLLECT_XP，逐级奖励按reward_type/reward_amount发放。
- 饲料农场升级：16→17需牧场Lv8、25000金币、10秒，17→18需Lv18、500000金币、30秒，完成后授予对应xp并开放6/9作物。已接入这些已读字段。
- 658/665份界面布局已转换，7份含动态内容保留阻止原因。125组直接字段列映射已登记；映射不自动执行条件/派生属性。

## E05 元素栖息地补充 — v0.4
- 静态来源仍为同APK中的 assets/res/config/config_cn_qq.json、textnew_cn.json；导出脚本 scripts/export-habitats.py 仅读取JSON和已安全提取的布局，不执行客户端脚本。
- HABITAT条目24–41共18项，为9类元素的建筑定义（不等于18种元素）。容量2/4，传奇1；例如岩土500/10000、深水10000/50000金币上限；草/火基础7500。名称直接用HABITAT翻译键。
- costs中g→金币、c→魔晶；build_time按秒，min_level为建造/升级目标门槛，xp在手动完成施工时发放。新建和升级均读取目标定义。41号in_store=0，40号upgrades_to=-1，不臆造40→41升级。
- 原布局指定的18个栖息地背景均已从原图集导出，新增15张；manifest逐张登记图集路径、尺寸和SHA256。登记总数1198。
- HABITATS_PER_LEVEL的1–30级上限数组已接入，施工位计入数量。30级以上暂用最后一项29作为离线保守上限，原版高等级覆盖/热更新待核对。
- 属性适配采用龙attributes包含栖息地element_type。尚缺服务器例外/活动龙巢证据；旧混合通用巢保留兼容。
- **未确认**：升级施工期间收入、原版同类建筑额外限制/服务端覆盖、地块合法区域与碰撞。本地升级保留旧容量和产金直至完成；拖动保存百分比位置，是离线操作实现，不能声明与原版等距网格一致。

## E05 独立繁殖孵化补充 — v0.5
- 原版包含独立0019_breeding_cave_a、0001_incubator图像与布局，以及BreedDelegate/IncubatorDelegate。当前离线模型拆分为breeding和incubator，不执行原脚本/网络协议。
- 繁殖/孵化时长与后代基础池仍用原记录。忙塔阻止转入、蛋在山保留、单槽并发为本地实现；完整蛋仓库/高级育龙塔数量及服务器转移边界继续核实。
- 父母收入延续此前时间区间计算。模型在readyAt恢复父母；原版实际state改变可能依赖领取/服务器响应，暂不能保证时刻完全一致。
- scripts/export-dragon-eggs.py按照原base或唯一原id关联76/90条原图集蛋缩略图；14条不存在则null，不用别的蛋替代。

## E05 原版模型扩展 — v0.6
- 静态扫描原APK assets/res/dragons/{原base}_{1/2/3}.xml及同名plist/ETC1纹理：90条目录龙中87条具有三阶段，共261个模型；1052/1053/1054三条的9阶段XML缺失，没有改用他龙。
- 动作计数1734，全部模型具有breath/walk/especial；还包含成年战斗各动作和少量特殊动作。frameRate直接读XML，当前资源为30fps。
- scripts/export-dragon-models.py导出35MB量级的无损WebP图集和数值轨道；manifest增加522个模型/纹理记录，共1720项登记。不运行原APK脚本或原生库。
- src/dragon-models.mjs本地播放原纹理与轨道，忽略0×0占位display，支持RGBA颜色/透明度与普通twR。暂未复刻数值缓动、twR_、动作衔接、粒子/部分混合效果，不能因“可绘制”认定原版运行时一致。
- 对照参考引擎源码（不是已确认本APK原生引擎版本）：https://github.com/cocos2d/cocos2d-x/blob/cocos2d-x-2.2.6/extensions/CocoStudio/Armature/utils/CCDataReaderHelper.cpp 与 datas/CCDatas.cpp（同目录树）。其中读取颜色、tweenRotate和缓动的逻辑说明只恢复坐标不足以保证动作一致。具体原生库版本还要确认。
- 骨骼XML包含colorTransform子项；颜色按M百分比与通道偏移保留到数值轨道。完整源色彩/原生混合仍需截图比对。

## E05 原版喂养布局 — v0.7
- 直接读取已安全导出的layout/ui_dragon.lua→assets/original/layouts/ui_dragon.json（1024×768），未运行原脚本。名称、产出、等级、属性、食物、喂养/移动与四格进度来自该布局的命名节点。
- src/source-layout.mjs复用原坐标：标签/九宫格左锚点，普通精灵/按钮中心锚点，子节点使用父原点。文字仍用系统字体，九宫格CSS切片和模型视觉锚点需与同分辨率原实况继续核验。
- 补入原ui_evolution/ui_star/ui_daojukuang/ui_mydragon四图集所需资源，新增64条原图登记，manifest共1784项（含模型JSON，不等于1784张图）。
- 喂食仍用已有原四次/级与价格公式，原进度图以feedsInLevel/4裁切，Lv4模型阶段变化仍按既有源规则。UI产出明确显示每分钟本地rate，原运行时单位格式待对照。
- 战斗生命/攻击/防御/抗性/暴击/战斗力当前显示“—”，不从未核对成长公式伪造数字。原进化、一键喂食和出售入口保留禁用；出售不会删除玩家龙。

## E05 原版我的龙族 — v0.8
- 使用已安全导出的ui_mydragon（1024×768）和item_mydragon（287×459）原坐标、背景、标题、等级盾牌、未点亮星槽与元素位置。横向间距/模型视觉锚点仍待同分辨率实机核对。
- 源ui_mydragon的ckb节点包含img_on/img_off和all/e/f/w/p/el/i/m/d/l，图像实际在ui_ButtonProp.plist，而非同名ui_shop图集中；新增30条原图登记，manifest共1814项。
- scripts/export-ui-sizes.py导出1225条原UI图集尺寸，补全源布局省略的按钮宽高；未再假定所有缺省按钮均85×85。
- 本地筛选只从已拥有龙读取attributes，混合龙的次要属性也参与。旧版3测试混合龙有明确兼容属性映射，未将未拥有目录龙塞入列表。
- 当前排序按本地实例编号；源品质底板/星级点亮/运行时排序规则尚未接入，不把空星槽当作已实现升星系统。字体仍为系统字体。

## E05 本轮额外静态核对
- DragonUI.lua的已安全读取常量在levelUp更新路径包含Config_LocaleText.lang('#0#/MIN')和rate；APK textnew_cn.json中该键明确译为“#0#/分钟”。喂养页产出已改为数值/分钟，单位文案不再仅凭本地习惯。
- APK含15套.fnt和同名PNG位图字库，无TTF/OTF/WOFF文件；ui_main只有少数节点显式bmp=1/font，ui_dragon/item_mydragon当前绑定文字大多是普通label。不能据“存在字库”就给全部普通标签换成任意位图字体；动态new text helper及原系统默认字体仍须核对。

## E05 装备与属性静态审计 — v0.8后续
- EquipInfo.lua明文33列，equipinfo安全读取表6000行、grade=1为60行；六槽定义和30个已取得原图标已逐一核对。第24列price是出售价格，导出命名sellPrice；详细来源/哈希与映射在assets/original/data/equipment-provenance.json。
- DragonElement.lua静态解析常量/指令，不执行原字节码。审计文本含源SHA256；updateAttributes包含成长、被动及觉醒并继续应用进化/秘宝，getPower读取_data总值并加符文。因此未将基础成长冒充总战斗属性。
- 后期六槽与旧setEquip四槽重置存在差异；元素校验还有全局_data依赖。实际后期装备调用链、获取与随机结算尚未确认。完整分析与复现见docs/EQUIPMENT.md。

## E05 v0.9进化条件与逐龙来源
- ui_dragon_evolution.lua只包含字面表及固定字符串拼接；安全读取器新增字符串CONCAT，未执行原Lua。原布局659个可读，余6个仍拒绝。导出脚本及哈希：scripts/export-evolution.py、assets/original/data/evolution-provenance.json。
- EvolutionLibrary.lua按quality_phase取首行成本；原UI常量15/25、valueCaps20/50；DseEvolution协议含result/bperfect/总属性，实际成功与进化值增量未核实，因此当前只读条件页。
- 90条获取途径来自原config_cn_qq.json和coition正权重候选源行。其他来源未核实，不等价真实服务端完整获取图。docs/reference/dragon-acquisition.json还逐条列目录图片/身体模型并标皮肤不完整。
- ui_PowerUp补22图，资源登记1836；尺寸1247。原left/right缺省坐标已接入，精确原界面/锚点仍需同分辨率实机。
- 网页补充证据与冒险模式/抽奖视频线索见docs/FULL-FIDELITY-CHECKLIST.md；不混用页游、iOS、Android版本。

## E05 基础抽奖与用户实机证据 — v0.10/v0.11
- DragonRandPanel明文确认普通30/高级80、十连×10、对应票券优先/不足魔晶补齐和待领取30格；RandDragonPanel确认抽中龙直接Lv1安置。代码哈希见lottery-provenance。
- Dragonrand43行基础池保留；第7列累计解释和第5/6数量范围是offline-cumulative-v1推断，非已确认服务器算法。原LibDragonRandInfo存在字段偏差，展示随机不是实际开奖。活动/后期翻牌另作系统，不混用基础高级池。
- 用户8截图/战斗视频为新的原界面证据，版本未知。详见USER-VISUAL-REFERENCE.md、reference/user-visual-references.json；视频只采样16时点，不宣称完整逐帧/结算已核实。
- ui_RandDragon/ui_dragonrand_bg1补13图，manifest1849，尺寸1260。原ui_main更多图标/邮件/充值已接；右侧活动/字体/完整转盘及奖励页仍不一致。

## E05 v0.12 后期三台扭蛋机版本纠正
- 已实际观看BV1zM41167SU约13秒三台机与40秒附近升星片段，视频2022-12-03，版本未知。三机、100/900和280/2500、奖品预览/基因中心/免费保底提示可见。不是全程观看，不把其状态当本地初始化。
- APK原DragonRafflePanelNew.lua/UI/3个eff_choujiangji动画与画面对应。此前DragonRandPanel为另一旧系统；旧Dragonrand43行不能直接解释后期三个池。
- 原LibraryManager将lib_dragonPreview指向choujiangyulan；DragonRandPreviewInfo三列index/Id/quality，共53行，原五列预览。输入及三个脚本哈希见assets/original/data/raffle-provenance.json；导出脚本可复现。不是概率表。
- 新增23原UI图和3FX的JSON/WebP，manifest1878。FX30fps两动作，固定联合边界保留相对大小；Canvas数值插值/粒子等差异仍在。
- 免费/CD/CurCnt来自_dragonRandData，实际开奖通过服务器；新页面不伪造状态、不扣款、不沿用旧表。神圣叠框、仓库完整领取/活动池尚未接入。

## E05 v0.13 主界面入口与运行时布局边界
- 原ui_main act_btn包含首充/福利/活动/大富翁；使用其原图与源坐标，不新增假活动奖励。首充等原图已含中文，避免重复标签。
- LayoutLoader静态指令确认边缘字段优先于x/y、双边扩展尺寸、btn/普通节点锚点差别。BottomUI/ModulesPanel/MorePanel动态重排更多。当前仅改静态图标仍不足证明一比一；审计文件在work，仅数据解析无原代码执行。

## E05 v0.14 原牧场操作页面
- 用户提供旧网页栖息地管理截图并明确禁止旧界面；删除运行时三栏/网页管理与图鉴，全部入口留在原牧场底图和原窗口。
- 原ShopPanel明文ui_shop六分类、PlantsPanel明文panel_zhongzhi_info/item_zhongzhi；PokedexPanel/PokedexItem明文ui_book_new/item_book_show、六列gap7。图鉴加成来自服务端pokedexData，仍留未知。
- 新原图集与thumbs_store补齐，manifest2176、UI尺寸1581。龙巢、种植、选亲代、繁殖中、育龙塔/幼龙/图鉴均使用对应原布局；详尽适配差异见UI-PARITY.md。
