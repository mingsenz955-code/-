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

## E05 v0.15 原仓库与后期实例边界
- ui_warehouse原文本仅local颜色与layout；静态字面绑定安全读取，无原代码执行。原血战布局dragonY字面数组索引亦已安全读取，现661布局、4拒绝；哈希见layout-report。
- StorePanel使用ui_warehouse/item_warehouse、六类筛选；龙使用路径createEgg与育龙塔容量限制。当前仓库仅兼容旧抽奖pending，旧直接安置与后期龙蛋流程明确分开。
- 原后期装备实例/穿脱/来源提示审计见EQUIPMENT.md新增段，未伪造装备或总属性。

## E05 v0.16.7 抽奖券与开奖动作复核
- `work/client-config/ui/dragonraffle/DragonRafflePanelNew.lua` 的三个按钮分别使用券6047/6048/6049；中级/高级有券时按钮数量为1/10，券数为0时显示100/900、280/2500魔晶。确认弹窗按缺少抽数乘单抽cash计算，证明券是“每抽一张”，不是魔晶等值余额。
- 同客户端资源 `eff_choujiangji1/2/3` 均为30fps，动作2为32帧；运行时现用该动作作为三机开奖段，动作结束回动作1待机。保存先于动画，避免关闭页面后重复开奖。
- 服务器仍决定真实结果、免费/CD与部分折扣；当前 `offline-raffle-preview-v1` 只使用客户端53条预览和显式离线权重，不作为服务器概率证据。
- `map_level.lua` 的裸标识符例外严格限定为已见的 `juqing018`。新增拒绝测试证明其它未知标识符、全局与调用不会被静态读取器接受。

## E05 v0.16.8 抽奖结果页
- `DragonRaffleEffectPanel.lua` 明确加载 `layout.panel_dragon_lottery_effect`；单枚坐标为(0,0)，多枚坐标为 `((index-1)%5)*125-250` 与 `-floor((index-1)/5)*150+80`，龙名在蛋下55像素。结果页现直接复用该布局、原标题与原蛋图。
- 原响应路径先播放机台动作，`CCDelayTime:create(1.0)` 后打开结果页；运行时同步为1000ms。结果在动画前已持久化，这是离线防重复抽取处理。
- 原页还创建 `particle/cj_gaoji.plist` 并按品质执行额外效果；当前未导出该粒子运行时，不把CSS逐枚出现动画称为原粒子效果。

## E05 v0.16.9 孵化加速与出售
- `work/client-config/dragon/utils/CostUtil.lua` 的 `speedUpCost(time)` 返回 `math.ceil(math.pow(time / 3600, 0.7) * 15)`；`SpeedUpPanel.openEgg` 用剩余秒数显示该费用、扣除魔晶并立即完成孵化。运行时与测试使用同一函数，避免界面与结算价格漂移。
- `work/client-config/ui/RandDragonPanel.lua` 的出售路径取 `self.info_.sell_price.g`。运行时从已静态导出的每龙 `sell_price.g` 读取金币；没有该字段的龙拒绝出售，不补造价格。
- 客户端证据能证明抽中龙出售价格，尚不能证明后期服务器允许仓库龙蛋在孵化前出售；本地仓库按钮是用户要求下的离线适配，结算价格仍沿用该龙源配置。

## E05 v0.16.10 地块与商城
- `BuildingBaseDelegate.showTiles` 直接读取建筑 `width/height`，按行列创建 `width × height` 个格，源图为 `grid_yellow.png` 和 `grid_red.png`；格子坐标使用27像素半菱形投影。`BuildingMoveConfirmPanel` 调用 `moveBuildingCancel/moveBuildingConfirm` 并显示取消、确定两键。
- `assets/res/config/config_cn_qq.json` 共404项；筛选 `in_store=1` 后商城相关115项：47龙蛋、17龙巢、18建筑、33装饰。导出脚本、字段和两个源文件哈希见 `assets/original/data/shop-provenance.json`。

## E05 v0.16.13 冒险与布阵
- `mapevents`前后链用于真实解锁顺序，`map_level`用于节点类型；玩家进度由本地v12存档补足。客户端没有提供节点到`Dragon_computer_array_nine`怪物包的映射，故敌方战力和奖励仅为`offline-adventure-balance-v1`，界面中明确标注。
- 布阵采用原六格上限并使用牧场真实龙；基础战力继续遵循已证明的`attack + defend + maxblood/3`部分。符文、觉醒、秘宝等尚未计入。

## E05 v0.16.14 布阵规则与敌方模型
- 公开旧版玩法资料与客户端阵容布局共同支持：Lv.7以上可上阵、总数6、飞行/爬行各不超过4，使用左侧加号与更换龙流程。该资料版本较旧，后期2.9.35规则仍需实机逐项复核。
- 敌方显示直接读取客户端`monster`中的龙ID/等级/攻防血与`Dragon_computer_array_nine`六至九怪组合；关卡到组合的服务端映射缺失，离线版按组合战力顺序配对，不能称原关卡敌队。

## E05 v0.16.15 用户录像纠错
- 用户视频关键帧实际复查：1.6s无中央资料面板；13.2s彩色旋涡；16.5s白色冲击与橙红描边数字。战斗画面移除所有中央开发说明与通用CSS蓝球。
- 原APK的assets/res/skills/下169套attack_/magic_ XML+atlas已静态导出，直接播放bullistic与bomb动作；fonts/red_50原位图数字用于伤害。scripts/import-battle-effects.py可复现，manifest含转换产物哈希。
- BattleField.lua为明文，已确认使用Warrior/BulletNormal/BulletLightning/BulletChain/FloatingText，事件来自battleData；BattleUI.lua是字节码，已静态检查其飞行/地面坐标和setDragonsPos调用存在。完整坐标/事件/伤害/技能调度尚未复刻，当前播放为离线结果的表现过程。

## E05 v0.16.16 冒险实际布局纠正
- PvePanel.lua第64行实际调用layout.ui_battle_chuangguan_guanka；后续afterPageChange分别设置txt_name、star_num，体力独立，不是旧panel_pve叠加标题。现用实际布局及其原图，撤下旧缺图兜底纸卷。
- PveRender.lua第28–29行加载mapInfo.layoutName并向basenode添加map_N.jpg，未缩放为layout.width/height。节点采用源坐标，背景保留原1366x768，按视口裁切。
- PveRender小节点使用point1未到达/point2当前/point3已通过；大节点未通关隐藏星星，通过后ui_pve_s4填充。现按此规则展示本地进度。

## E05 v0.16.17 原客户端布阵证据
- FormationData.lua函数10静态反汇编明确出现level<7返回-1、相同_info.id返回-2、position为1且数量>=4返回-3、position为0且数量>=4返回-4；替换时检查旧龙分类。全文与源SHA256在reference/formation-enlist-disassembly.txt，未执行字节码。
- FormationInfoPanel.lua静态检查实际加载ui_formation_info，左侧六阵位采用item_big_touxiang；FormationDragonListPanel.lua明文实际加载ui_dragon_list、按主属性筛选，操作1新增/2替换/3下阵。
- NewFormationPanel.lua明文按extended.position分组，并按queuePriority排序挂到ui_formation_new的sky/earth源节点，动作breathinbattle。本轮遵循这些源规则。
- 装备已知定义atk/def/hp按现有装备所有者累加到基础战斗属性，原getPower基础项继续attack+defend+life/3；未把未知随机、星级或符文数值加入。

## E05 v0.16.18 神圣龙巢分类
- DragonElement.lua构造器函数2将isLegen设置为config.legen==1，函数26 getFullType对标记龙补l；Base.lua函数57显示getFullType匹配龙巢element_type，且isLegen额外要求巢为l。两份静态反汇编和源SHA256保存至reference/dragon-habitat-type-disassembly.txt与habitat-acceptance-disassembly.txt。
- catalog.original.legen覆盖16条神圣/远古龙，包含extended.isLegend=0的神圣中国龙，因此不能用扩展表isLegend或品质色简单替代。building40原售价100魔晶、element_type=l、capacity=1、建造7200秒不变。

## E05 v0.16.19 强化与宝石
- NewEquipEnhancePanel函数1静态指令确认enhancedCost×请求次数及强化石/羽翼/水晶分类，全文见reference/equipment-strengthen-disassembly.txt。等级属性/升级目标来自equipinfo；多次实际服务器结算仍缺，离线逐行执行并扣源费用。
- RuneData/RuneInsertPanel/RuneMixPanel为明文，确认两组各6槽、背包150、同类型按品质覆盖、吞噬未镶嵌低/同品质宝石及eatexp+exp、levelupexp/nextlevel。导出源godfire/fuwen与图集复现脚本export-progression.py，数据哈希见progression-provenance.json。
- 符文fuwen与宝石godfire为不同系统，当前只接宝石运行时。获取概率和材料来源尚未取得完整服务器证据，不发假奖励。

## E05 v0.16.20 牧场摆放与加速证据
- work/client-config/dragon/core/isoengine/building/BuildingBaseDelegate.lua：ctor与setSkin明确_skin:scale(0.5)；showTiles使用width×height、TILE_H*(col-raw)/TILE_H*(col+raw)/2，原grid_yellow/grid_red。客户端layout建筑bg位置和原图集自然尺寸导出到data/building-art.mjs，保存layoutSha256，图片哈希见manifest.json。脚本scripts/export-building-art.py可复现64个布局。
- work/client-config/dragon/utils/CostUtil.lua明文公式ceil(((time/3600)^0.7)*15)；ui/SpeedUpPanel.lua openBuilding实际使用panel_building_speedup、FinishBuilding、showBuildingXp。实现覆盖建造/升级/商店建筑，实际剩余时间结算一次。
- 玩家截图证实移动占地格子和建筑比例失配。新实现将碰撞与格子共享等距坐标；真实鼠标输入已核验，而不是只程序调用按钮。
- 扩建价格表仍采用既有注明的推断列。原服务器各地块坐标/解锁顺序未获得，当前24×24基区、每购买+2行列和草地放大均是离线几何方案，不是原地图证据。不能据此宣称扩建完全一致。

## E05 v0.16.21 原牧场龙行为
- HabitatDelegate.lua SHA256 fd68a3b860c19fcfdf2322f72d0133be60ff8ad69b777af5e86a55c1f7bfa330，函数0/10/14/17完整静态指令见reference/habitat-dragon-motion-disassembly.txt。x源表×0.4、height公式、building40+54、随机y偏移、view scale0.45、breath2–5/walk5–15/especial循环完成返回有直接证据；没有使用zuobiao节点作为牧场固定驻点。
- Constants.lua源哈希与字面表PC范围在reference/habitat-motion-table.json。提取器仅允许已有字面表白名单指令，读取21项范围；不执行原字节码。
- 新场景原点渲染保持0.45源骨骼比例并将脚点放到对应行走平面；大/小龙不再统一适配卡片。骨骼easing/twR等原有渲染差异仍在，移动0.2/回调归一30Hz的速度仍需原实机时序核验。

## E05 v0.16.22 符文证据
- reference/fuwen-ownership-disassembly.txt：FuwenData按dragonid和equipType管理四槽；reference/fuwen-target-skill-disassembly.txt按defaultSkill_N选择龙对应技能。FuwenSelector原绿色品质门槛已核对。
- reference/fuwen-upgrade-disassembly.txt：候选仅排除目标及dragonid!=0，offerExp增量；needExp/levelUpID连续升级。材料已有exp没有加到吞噬预览，不能沿用宝石算法。
- reference/fuwen-skill-extension-disassembly.txt、fuwen-skill-level-schema.txt及fuwen-power-disassembly.txt确认品质2–6三元组、level-1增量、1/2槽addPower入战力及3/4槽addPower=0。源表哈希嵌入rune-skills.mjs，export-rune-skills.py复现。
- 原ui_FuwenSelector/ui_fuwen_info/ui_fuwen_levelup_panel与thumbs_fuwen图标用于操作页。原HUD寻访入口与完整getDes文案尚缺，暂不称整个界面流程一致；测试库存只存在隔离档。

## E05 v0.16.23 符文寻访与神符
- LibFuwenDiaoluoInfo静态常量列为id/name/costType/costID/costNum/suc/dropID；LibShenfuInfo为id/cd/costType/costNum/awardType/awardID/awardNum。原NPC五档成本与神符53档表保存在data/rune-hunt.mjs，export-rune-hunt.py复现，源表哈希和未知项见reference/rune-hunt-provenance.json。
- shenfu-purchase-disassembly.txt确认免费3次、freecnt+1冷却、paid buycnt+4价格、五次buycnt+4..+8逐档相加及每次150；fuwen-npc-disassembly.txt确认余额不足/待拾取20上限与NPC点亮显示。FuwenPanel.initialize函数1 PC143–146会覆盖node_head为(-40,35)，不是保留layout初始坐标。
- 五randgive池各合计1000000、86行、观察到数量列全为1/1。第五列权重、suc为点亮百分比、下一NPC推进/消耗与日界仍是离线解释，服务器行为不能从表合计推成完全核实。没有把这些抽样声明为原服务器概率。
- 实机UI及保存验收从空货币/空符文起步，正常免费领取/寻访/拾取/装备路径实际完成；测试龙与固定RNG只在隔离档，正式玩家未发测试物品。

## E05 v0.16.24 宝石探索证据
- 原RuneData.lua明文常量CD_LOW/NORMAL/HIGH=600/86400/259200、COST_LOW20/200、NORMAL80/720、HIGH200/1800；RuneLotteryPanel _canLottery确认容量优先、免费单抽、令牌优先和不足10令牌按单价补差。原服务端getRune接收type0/1/2与次数，没有直接给出randgive组。
- item_rune_lottery客户端附加y=-50；结果图使用RuneData.getRuneIconRes(big=true)的_b；RuneLotteryEffectPanel结果单抽(0,0)，十抽x=((index-1)%5)*125-250、y=80-floor((index-1)/5)*150、名字(15,-55)、品质(-35,-55)。已使用这些原坐标/图，尚缺原粒子和落下动画。
- 9000001/2/3为明确注明的候选池映射。三池各50行且合计1000000，品质范围与三扇门吻合属于推断依据，不能据此当服务器已验证。source hash/150原行和全部政策边界在reference/gem-explore-provenance.json，scripts/export-gem-explore.py可复现。

## E05 v0.16.25 装备分解与龙珠商店
- equipment-decompose-disassembly.txt中函数13 PC16–41确认part4→wing、part5→crystal、其它→stone，数值直接加info.decomposePkgID；函数4原过滤formationData.onBattleDragon。离线保护范围为所有已穿戴装备，已标差异。原表分解cost全0。
- 原item_equiplist_decompose/item_equiplist_equip_decompose和ApplyOrCancelPanel确认布局接入；组框/原图依据ui_tab_group/EquipStrengthenGroupPanel，但顶部完整tab顺序与字距未做实机一比一核验，不称已全部视觉相同。
- 原treasure_items启用l1/l2 rows111/112：5颗龙珠分别120/300魔晶，现实际发放至宝石探索中/高级余额。旧es/yy/sj材料商品源enable=0，继续不出售。resource-shop-provenance及可复现脚本更新为14个可消费资源商品。

## E05 v0.16.26 冒险掉落、宝箱与碎片
- 原PveLevelInfo明文enemys=arr10、drops=arr11、首杀arr13–16、powerCostWin=arr17和powerCostLost字面0；修正此前把arr10称碎片ID的错误。包ID不是服务器怪队完整定义，不能说敌队映射已解决。
- 原UsePropPanel明文四箱/钥匙配对、max=min库存；宝箱候选组来自raw items第61列9000011/5000019，确有对应装备/碎片/强化石等，但字段名/服务器实际映射仍未取到。每次一项和权重/数量抽样标明离线政策。
- equipment-fragment-compose-disassembly.txt确认floor(count/mergeCost)；equipment-fragment-card-disassembly.txt确认现代equipID。48原碎片定义/1283原掉落行/16原道具图及来源哈希见loot.mjs与reference/loot-provenance.json，export-loot.py复现。
- ItemUtil root反汇编明确19强化石、20低级龙珠、21中级、22高级；PvePanel.onCheckClick守卫已清且可领取时dceMapAward，PveRender threeHour10800与box_num<3。UTC+8日界、首领重新占领与初始可领仍非服务器证据。
- green_42原字形/图及哈希独立导出，panel_map_act数字与文字均用原字形。原结果panel_battle_guanka_jiangli.bg.alpha0在本页隐藏视觉木板；stars3与原领取/开箱粒子没有被静态星图替代后宣称相同。

## v0.16.27 装备升星证据
- EquipStarInfo构造21列/192行与库查表键由静态反汇编确认；装备ID前三位分羽翼/皇冠族系。quality3 cap3、quality4/5 cap5来自EquipStarUpInfo根常量表，预览函数2、选材函数8、DataManager函数87累计属性、FormationEquipPanel函数3逐星激活标签均保留reference/equipment-star-*.txt。
- 费用=当前星级行cost×材料件数；累计目标exp+各材料星级expHave，逐级扣expCost。服务器Socket响应未取得，离线执行预览量，不伪造随机词条/条件属性。
- 原布局item_star_up_zuo_equip_up/item_star_up_you_equip_up已接入；132项Node及Electron操作/独立读档验证通过。源哈希/列名/差异：reference/equipment-stars-provenance.json。

## v0.16.28 图鉴数值与远古赠送
- 数值来自已有dragonAttributes/dragonPower客户端成长、装备累计星级、宝石和符文战力；未拥有Lv1，已拥有当前最高等级。原PVEBattleResultPanel第71行仅isWin才开奖励面板，本轮未改胜负算法。
- catalog中文name以远古开头的5种ID1200/1202/1203/1205/1206有证据，用户授权赠送每种1枚；独立giftEggs，记录防重，不纳入原版奖池证据。

## v0.16.30 战斗阵位及技能表现
- Warrior.positionType=info.position==0 land否则air，scaleInBattle直接传DragonDelegate；BattleUI根数字阵位与函数6/8、SkillNewCommonInfo构造字段反汇编已保留。技能字图/效果由源表独立导出，93字图在原UI目录存在。

## v0.16.31 原技能完整说明
- SkillUtils.getDes函数2、SkillNewInfo字段及BuffNewInfo plain ctor确认描述格式与参数；skilltypes为SkillDes模板42行。buffID=baseID*1000，装符文时加品质*100+等级；来源SHA与条数在reference/skill-descriptions-provenance.json。所有目标/持续/吸血与被动数字使用源表，不凭名称猜。

## v0.16.32 龙出售、星级与变异取证
- reference/dragon-sale-rules.txt、dragon-star-rules.txt、dragon-star-selection.txt、dragon-star-attributes.txt保存原函数，不执行原Lua。580行星级表及源SHA/本地政策在dragon-stars-provenance.json；属性和技能以显式星级查表，旧档保持原数值。
- 原RandEvPanel.help直接说明>1小时/紫龙/变异奇遇/VIP/5事件；cf10行/nr14行与完整价格时间在mutation-events.json，非成年龙一键变身证据。没有触发概率响应，不自行给概率并声称一致。

## v0.16.33 原动作/地图/商店证据
- 明文ui/battle/Warrior.lua:67–83确认attack→attackend、end/hurt完成回stand。渲染按原模型frames/fps处理，取消固定出字后才恢复动作。
- islandleft/right/top/bottom原图/布局均已读取，独立PC地图接入；原地块遮罩、解锁顺序与统一坐标没取得，不冒充原服务器逻辑。
- source shop115项含47龙蛋，treasure_items110项c商品保留sourceEnabled字段；49原关闭项是按用户授权开放。export-resource-shop.py可复现。获取条件minLevel更正为原lvl兼容min_level，不再显示未知破折号。

## v0.16.34 存档入口核验
- 正式SaveStore路径APPDATA/YulongRanch/saves/ranch-v1.json保有plots9；v34实画HUD99且4岛无锁。截图1级与正式档不符，具体预览URL未取得。storage.mjs已有默认localStorage独立分支是已确认代码隐患，已改显式试玩才可用。


## v0.16.35 本机冻结与原版获取动作
- 在本机真实 Electron 环境复现 `matchMedia('(prefers-reduced-motion: reduce)').matches === true`，旧 `paint(..., reduced ? 0 : elapsed)` 和牧场 `!reduced.matches` 使角色永久静止。修复后同环境完成实时帧变化和走动边界检查。
- `ui/battle/BattleUI.lua` SHA256/PC30–33 明确把外观等级提升到至少7级；原 `Warrior:setMotion` 在抬手完成回调进入相应 end 动作，再发出攻击。本地战斗已使用该成年外观与完成事件。尚未改变离线胜负/伤害策略。
- `ui/fuwen/FuwenPanel.lua` 直接证实：原 NPC `eff_huodongkuang` 边框、掉落首次0.15秒/0.08秒间隔；新增掉落0.05秒显现+0.15秒移位；拾取0.3秒放大至1.2/0.15秒间隔，随后BACKIN飞行1秒，最后0.1秒淡出；源粒子为 cj_putong / cj_niudan02。
- `EquipStrengthenGroupPanel` 原三栏坐标 (-430,0)、(-130,0)、(300,-10)；源 FuwenSelector 条件 `quality <= 2` 拒绝，文字为蓝色以上；原一键镶嵌按品质/等级比较空闲符文。门槛原记录的“绿色”已纠正，并兼容已有旧版装备关系。
- `RuneLotteryEffectPanel.lua` 原图标从 (0,200) 依次揭晓，0.4秒缩到0.7；普通0.2秒等待+0.2秒位移，橙色0.4秒等待+0.2秒位移；原屏幕暗幕、普通/高级粒子与品质标识均使用原资源。原方法与文件哈希见 gem-reveal-source.json。
- 动作缓动使用 [Cocos2d-x 2.2.6 CCActionEase.cpp](https://github.com/cocos2d/cocos2d-x/blob/cocos2d-x-2.2.6/cocos2dx/actions/CCActionEase.cpp) 的数学曲线采样；尚未确认APK精确原生引擎构建，不能称逐帧一致。Canvas 粒子参数/纹理由原 plist 导出，仍需原机画面比较。
- 真实鼠标回归发现：原符文槽缺 pointer-events，宝石结果按钮零尺寸。已修复，并由原生鼠标输入验证完整获得—拾取—镶嵌—卸下—一键镶嵌；153项规则检查通过。原生Windows包也验证，不以 DOM .click() 代替真实点选。


## v0.16.36 战斗表现继续对照
- 静态阅读原客户端明文 `BattleField.lua`、`Warrior.lua`、`HpBar.lua`、三种 Bullet 实现及 `EffectDelegate.lua`，各文件 SHA256 和对照参数保存在 `reference/battle-presentation-source.json`；没有执行原 Lua。
- 恢复 ui_battlenormal 1024×768 画板，不再压缩天空阵位。所有角色 movein 完成后等待0.1秒开战；源头部高度和嘴部偏移决定弹道端点。
- 普通弹道速度1800单位/秒、原始缩放与方向翻转；闪电/链段采用距离伸缩并等待 bullistic 完成再命中，分别保留0.5/0.3秒后用0.3/0.15秒淡出。hitEff 的 bomb2/bomb3 分前后景并保留原0.1秒完成延迟；死亡播完再延迟0.1秒退场。血条使用原尺寸图和0.3秒追赶/0.5秒延迟/0.5秒淡出。
- 源技能公共表 type 列已由构造函数字段序核实并导出，349行逐项检查。156项Node测试通过；源Electron和v0.16.36实际Windows包均通过动作实时帧、完整冒险、奖励/退出取消检查；重启恢复关卡状态通过。Windows包真实鼠标符文和宝石获取—应用回归通过，均使用独立测试存档。
- 剩余差异明确保留：现有离线胜负、伤害、行动顺序、选取目标和buff并非服务端战报；完整闪电链和群体目标规则未接入，群体命中特效仍使用单目标位置；普通伤害字尚未按 FloatingText 的 orange_36 和原完整上浮曲线恢复。当前成果是战斗表现修复，不能宣称原版战斗已完美一致。


## v0.16.38 扭蛋奖品透明问题
- 本机 Windows `prefers-reduced-motion: reduce` 为 true；`.raffle-result-egg` 基础 opacity=0，而全局 reduce 规则使用 animation:none!important，导致结果DOM/奖品存档已存在但完全不可见。
- 修复前实际Electron原生鼠标单抽后，新增可见性检查明确失败；修复基础 opacity=1 后，单抽/十连各项实际计算透明度、图片成功载入、仓库数量和单次扣费检查通过。装饰淡入关闭时结果仍直接可见。
- 扭蛋机播放使用实际源32帧/30fps片段完成事件；不再因reduce跳过游戏动作，也不再固定1秒切走。关闭页面仍保留先行落盘的奖品。
- 157项Node规则测试通过；源运行时独立重启确认十枚奖品、券消耗和已出售条目不复活。未向玩家存档注入测试资源。


## v0.16.39 装备功能继续对照
- FormationInfoPanel函数7跳过非空装备槽；FormationData函数19按quality再grade推荐。新一键装备据此填空，保留已穿戴项；保护全部其他龙的装备是既有本地保护政策，较源出战阵容过滤严格。
- DataManager函数88装备评分为 atk+def+round(hp/3)+crit+uncrit，函数87先累计星级值。原界面直接使用definition.evaluate漏掉星级，现详情、更换、背包评分统一；强化预览显示累计星级总量，不把此信息补充冒称原生基础表预览。
- NewEquipEnhancePanel函数6明确播放原equip_strengthen，DragonInfor明文有effect_dress_equip。仅静态导出这两组原纹理/骨骼，保留manifest来源与SHA；沿用现有骨骼渲染器，精确原生缓动/混合仍是已知差异。
- 真实鼠标新检查发现：source-equipment-bag-body透明容器遮住组标签；source-star-remove受通用button:hover影响位移，导致click不产生。已分别修复事件穿透与稳定定位，并验证升星材料移除/重新添加/确认/详情激活值。
- 规则检查159项通过；独立profile验证一键穿戴、手动替换、他龙装备保护、带星装备评分、单次/十次强化/星级保留、分解按可见分类全选/确认取消与碎片合成。不写入玩家测试装备或资源。
- 仍缺随机词条的原服务端生成、条件属性完整应用、强化失败/保护符/降阶服务器规则、装备页完整原分组组合/已装备未装备切换/帮助与音效。当前为本地功能对照推进，不称完美复刻完成。
## v0.16.35 原连续世界证据
- work/client-config/app/scenes/MainScene.lua第135–197行，initIslands实际positions与z-order；left/top/right/bottom同一islandLayer，不是四页面。原背景第86行island_bg_day.png。
- assets/original/layouts/islandleft/right/top/bottom.json各自尺寸及世界图。WORLD_ISLANDS统一比例/翻转Y，保存岛ID不变。旧建筑板缩放为兼容适配，未当作原等距网格证据。

## v0.16.36 中央首领与圣树证据
- MainScene.lua第192–235/302–375/602–618行确认圣树、血战、冒险、竞技、首领入口坐标、层次、等级与模块名；中央首领是额外功能岛，不是省略的一块普通放置板。
- 原APK buildings/{bossdao_dao,bossdao_shitou,shengshu_eff,feiting,yandong_eff,jingjichang_eff}导出numeric骨骼/原纹理，manifest保留来源。原ui_world_boss、ui_holy_tree布局接实际点击。
- world-encounters-provenance.json记录原种子/首领/NPC表与静态字段来源。work/worldboss-main-static.txt、holytree-main-static.txt记录只读反汇编。原源码label与条件有不同开放星期表述，因此本轮不猜精确服务器周历，单机常驻。

## v0.16.39 修正圣树NPC原证据
- seedrobot的第二列与Dragon_computer_array_nine的包ID关联：30001包为30001/30002/30003；30011包为30031/30032/30033；30024包为30070/30071/30072/30032。旧文档中把第二列当同号单怪的描述已被此证据推翻，现导出字段packId+groups+完整monster。
- 原NPC包人数3/3/4已用于预览与实际战斗，属性仍按用户动态难度90/110/120整队缩放，不能称为原服务端属性。圣树控件因source-node继承pointer-events:none漏接，已真实鼠标复现并修正。

## v0.16.40 圣树种植入口依据
- item_holy_tree_hint_kezhongzhi.json原btn90×90使用ui_main_icon_kezhongzhi.png/2，con_name位于y-29；t_kezhongzhi_cn.png为原文字图。HolyTree_seeds静态函数onSeedClicked调用getEmptyGrowPos和godTreePlantSeed，证实底部托盘选种。现UI恢复托盘交互，指定槽位为PC适配，不将v39通用选择弹窗记为原界面。

## v0.16.42 获取动画与装备目标核验
- gem-reveal-source.json保留原RuneLotteryEffectPanel缩放1→0.7/0.4秒与三类S粒子记录。此次只纠正DOM居中随scale发生位移及粒子宿主锚点，不改原导出plist。
- 原FuwenSelector蓝品质以上门槛继续保留；寻访默认选合格已有龙是PC交互修正，不宣称是已证明的客户端默认选龙顺序。实际正式档id2烈火龙不符合门槛且排第一，解释用户截图灰色装备按钮。真实鼠标隔离测试确认合格龙装备/卸下/重启保持有效。

## v0.16.43 永久被动属性证据
- docs/reference/dragon-attributes-disassembly.txt FUNCTION1 PC38–40筛type3被动，PC48–65按buff1ID/符文颜色等级算buffID，PC94–122以arg1=0/1/2/3/4把arg2加入攻/防/生命/暴击/免暴，之后加入baseAttribute。skill-descriptions.mjs原buff表10101000=攻击300、10101302=攻击1091，10401000=暴击750、10401301=暴击1519。
- fuwen-skill-extension-disassembly.txt PC63–86仍证明攻击/特技加addPower，被动addPower=0且另有addPowerDisplay；被动收益来自实际属性，不能用显示评分再重复加一遍。当前修复与此分工一致。

## v0.16.44 圣树目标栏与奖励
- HolyTreePanelNew静态函数5引用layout.ui_holy_tree、layout.panel_holy_tree_mubiao与HolyTree_players；ui_holy_tree包含home/backToMyTree与mubiao入口。目标栏原背景684×220、huadong617.5×134，item_holy_tree_target_player包含原头像框/等级星/玩家名；本次用这些资源替换通用建筑详情纸框。战力/抢夺奖励/按钮在原目标栏内为离线适配排列，未逐像素证明其服务器列表内容。
- world-encounters原seeds 1/2/33/34/35的propNum分别20000/10000/200/4/4，plantTime均28800；新增结算测试核验无倍率。用户最终要求原奖励，10倍设想未实施。

## v0.16.45 启动存档证据
- computer-use用户实际v44窗口及游戏主进程6548的fs/bridge读取，均为1级xp0/5815692金币/11770魔晶；同时Codex读同名AppData为99级xp2057825400/19728054金币/13348魔晶。这是实际跨进程读取证据，推翻此前仅凭Codex侧last-launch认定用户入口正常的判断。
- v45通过资源管理器真实双击根exe后，实际UI与工程player-data/last-launch同为99级；源与发行目录共用工程存档，不依赖可能重定向的Roaming路径。恢复副本在Git忽略的player-data/recovery，个人数据未提交。


## v0.16.40 龙翼、竞技、VIP与首批活动
- 翼片漂移定位：1201_dragon_golden_3 的 breath/b35 等轨道从可见帧切到 display=-1；旧采样器把隐藏帧占位坐标0插值进可见翼片。现在按 CCTween::setBetween 保持可见姿态到切换帧。参考官方源码 https://github.com/cocos2d/cocos2d-x/blob/cocos2d-x-2.2.6/extensions/CocoStudio/Armature/animation/CCTween.cpp 。非针对某条龙的偏移补丁。
- `tests/arena-vip.test.mjs` 遍历该龙所有动作的可见→隐藏段，在99%帧验证保持源坐标；原生Canvas连续帧见 work/golden-wing-fixed-qa.png。261模型1734动作均正常渲染。
- 竞技：源ui_arena_new四NPC位置；源PVPjiangli前14列奖章/魔晶，PVPduihuan前6列价格和物品。10魔晶购买和50魔晶清冷却来自NewArenaPanel；VIP上限/免冷却来自VipInfo。源字段和哈希在 arena-vip-source.json。
- 单机NPC对战：复用成年骨骼战斗动画；按当前出战战力结算。排名、匹配强度、每日5次/10分钟冷却/每日领奖为明确离线规则。竞技奖励不改写已有战斗或真人服务器资料。
- VIP0—10的原门槛/源百分比已接入经验、产金、农场龙粮、繁殖/孵化/施工新任务计时和竞技权限；充值前结清既有产金，避免新等级追溯加成。
- 单笔充值：复用原panel_danbichongzhi/item_danbichongzhi_reward，六档奖励与品质保持源danchong。离线按对应商品金额达成，每档一次，无真实支付。道具入库存、装备碎片入装备碎片库存，6048/6049进入可实际消费的召唤券库存。
- 所有QA均在work隔离档。规则测试175项通过，原生挑战/兑换/充值领奖/重启保留状态已验证。

## 历史活动 v0.16.41

原2.9.35的LibraryManager、各Info构造函数与活动Lua/原表导出76个活动版本，详见[ACTIVITIES.md](ACTIVITIES.md)及[活动来源清单](reference/activities-source.json)。这证明客户端保留相关配置，不证明服务器实际采用日期、概率、资格，也不证明覆盖全部历史版本。

## v0.16.46 PR #2 集成验证
- 接入作者静态活动/竞技/VIP导出与出处，保留docs/ACTIVITIES.md中的原表和离线模拟区别。现有world机器人packId必须经groups解析，原monsters字段已不适用；集成时修正竞技取怪映射，圣树3/3/4原整包不变。
- 永久被动符文属性与新培养属性共同进入dragonAttributes，原getRunePower分工不变；新增叠加测试防止冲突解决时丢失被动。正式路径继续工程player-data，原字段迁移比对无变化。

## v0.16.47 农场原流程
- 原ui/PlantsPanel.lua明确普通cp范围1至(id-15)*3、LEGEND_FARM为10—12，所用COLLECT价格/时间/产量/经验与现ORIGINAL_CROPS对应；FarmDelegate.lua区分普通粮食和进化果实并含VIPfoodExtro/expExtro。
- 原ui/SpeedUpPanel.lua的openFarm调用CostUtil.speedUpCost(time)，原dragon/utils/CostUtil.lua给出ceil((time/3600)^0.7*15)。加速使FarmDelegate:collectable(true)，收获另外执行；按此恢复离线扣费/成熟/收获。
- 原FarmDelegate:setPlantStep(1/2/3)与现有world三态图一一对应，地图已接。完整功能建筑核对及剩余缺口见BUILDINGS.md。源版/正式包真实鼠标与重启通过，未操作正式存档作测试。

## v0.16.48 原版农场界面依据
- BuildingOptPanel.lua SHA256 fc5f0c7786fa53ecabc98312d8237a2e2d2a37d566ec39ae3714efa2cd186114；函数30 PC376—484为农场操作项，1036—1061对所有cp按间隔200×__scaleRatio居中排列，复用原cp_*静态布局/图标。
- BuildingInfoPanel.lua函数4 PC145—171通过Literal.lang(buildingId)设置原描述并置顶；Literal.lua的FARM_1/2/3描述键在APK assets/res/config/textnew_cn.json取得原中文，未改写描述内容。
- 使用原panel_building_info，不再往农场页面插入通用管理按钮。真实鼠标点原图标、种植/升级及重启验证通过；截图与尚未逐像素核验的区别保留。

## v0.16.51 原任务与活动道具
- 原任务源：GoalManager.init、Goal各子类、TranslationGoals、goals表、LibGoalsRewardInfo。147实际注册、10活跃限制均静态取得；原接口服务器状态由本地事务存档替代。详细出处/限制见MISSIONS.md与reference/missions-source.json。
- 原列表奖励/说明是互斥状态：GoalListPanel函数3 PC209—244与nested1；UI复用对应原布局和两张查看字图，未将重叠排版留给用户。GoalAwardPanel的领取回调只关闭窗口，原checkComplete先发送completeGoal；本地奖励也一次入库、通知单独保存。
- 原items第61列奖池串及randgive表235奖池导出116种可开启包，新增42随机包；30种碎片的成本来自APK原中文说明，目标ID优先原图名并校验为DRAGON。例如7042名称误为7042suipian，图名1093及中文开泰龙相符，取1093，不将道具ID当龙ID。SHA和解释见reference/item-use-source.json。

## v0.16.52 碎片与战斗修复证据
- APK原items 7026 name=kuLouDragonSuiPian、img_name=1076_dragon_skeleton_0，textnew_cn中7026miaoshu明确10片骷髅龙，不能用数字suipian正则排除。7015对应1074冰月龙但description未翻译且未查到数量；其10片仅离线配方，reference/item-use-source.json单独列offlineFragmentCosts。
- 原UsePropPanel明文按持有量选择数量，确定传回id/count；StorePanel静态反汇编显示兑换结果后initData/list.reset。原BattleField使用服务器battleData驱动Warrior/Bullet，未在本客户端取得服务器轮次算法；本轮修正的是本地动画错误，不把三轮表现称原计算规则。
- 原RAFFLE_PREVIEW_ROWS没有远古1200/1202/1203/1205/1206。新增池/20%及10次保底是用户授权单机可玩性调整，原品种/形象沿用；策略v2与旧v1存档明确兼容，原服务器概率仍未核实。

## v0.16.53 符文寻访定位
- 本地原ui_fuwen_panel和现有NPC条坐标未修改。本地CSS通用button:hover覆盖头像中心transform造成真实悬停x偏移48.488px，修前原生鼠标验收断言失败；修后hover/focus/active均保持translate(-50%,-50%)，源版与包内原生鼠标坐标及完整寻访/穿戴流程通过，不以DOM.click替代鼠标验收。

## v0.16.54 活动目录策划调整
- 原assets/original/data/activities.mjs的76份版本数据保持。根据用户最新精简指令，仅通过activity-catalog展示层折叠九类多期/多奖池入口为43项，减少33张顶层卡片；这是用户授权单机目录整理，不称原版全部历史版本曾同时采用该目录。
- 展开系列后保留原key与原奖励页、费用和领取记录；目录覆盖测试确认全部76版本各可达一次，未因同奖励图标删除独立奖池或把多个领取key合成一个。

## v0.16.55 装备滚动输入
- 原装备分组/列表布局和原卡片未更改。本地source-bag-equipment-list不在原有wheel适配选择器内，也没有拖动输入，原生mouseWheel修前失败；现共用列表补PC滚轮横移与按实际缩放比例左键拖动，源版及正式包真实鼠标回归通过。属于桌面输入适配，不把鼠标滚轮称为原手机交互。


## v0.16.56 玩家资料与等级依据
- UserInfoPanelFromTopUI静态确认实际布局是panel_user_name_info，昵称revise/btn和bg_icon触摸分别打开ChangeNickNamePanel/HeadSelectPanel。改名6字、第一次免费/之后100魔晶、ConfirmPanel使用panel_msg，均取原客户端；HeadSelectPanel明文确认7列94/96间距、图鉴曾拥有列表、预览后关闭保存。
- DragonManager根字节码BASE_MAX_DRAGON_LEVEL=10，函数29遍历已完工dragonLevelAmplifiers取max；APK建筑9—12上限15/20/25/30。SpeedUpPanel.openBreed及GoalSpeedBreed明文确认费用公式和两亲代类型白名单事件。源SHA/提取规则见reference/profile-growth-source.json，可重跑scripts/export-profile-growth.py。
- 资料在线重名/敏感词服务、平台账号不可离线证明；LOCAL ID与本地原表词串检查明确属于适配。236规则测试及源/最终Windows包真实鼠标、独立重启通过，仅证明所列流程，不等于所有任务/界面逐像素验收。


## v0.16.57 原具名扩建配置纠正
- APK config_cn_qq.expansion_prices明确定义cash/coins/neighbors/inventory_qte；原pcf列2是cash，旧minLevel推断错误，列4为neighbors，不能拿它扣魔晶。原Config_CN_QQ.getExpansionPrices与ExpandShopPanel.initData具名字段直接佐证；onBtnBuy只扣costs[cost]=price，金币/魔晶独立商品。
- ExpansionManager SHA256 36e41972dadd2f0342e0697e54d55313d06334497cbd5ed3fd992e2e20ff85bc根初始化字面量提供16待购矩形、20地块分组8/4/6/2及first_land 22/31/42；getTotalLandsNumber累加全部分组。未执行Lua，导出拒绝非字面量指令，详情见expansion-provenance.json/scripts/export-expansion.py。
- globals.ISLANDS_COSTS为g0/g100000/c125/c500，ExpandShopPanel及LandBoardDelegate恢复地图牌/选币/选择地块流程。原地图牌偏移有来源，初始障碍物服务器分布及原建筑全局tile平面未取得，分别记录，不能用离线碰撞范围冒充原精确地块。


## v0.16.58 教学与原地块遮罩
- TutorialManager SHA256 71cc1e48fe962392e3328f54e40ba1d572e7940f976f298772baad2b36c8d007；根初始化PC40—273为46个箭头，PC285—333为47文本键。函数20按原step前缀译标题，描述TOP；11/12/41/44/45不加载独立UI_XinShou布局。export-tutorial.py只读取字面量，配置及SHA见reference/tutorial-source.json。
- 原Base SHA256 2e49418576b4d2902610a9dbd2dc6c9bf6a2e5fccf1294b92434c643b4923655；函数9 PC35—64把未购地的ui_mapland_land<ID>按各岛中心加x/y叠加，购买后移除。export-land-masks.py从原PNG逐行导出alpha及源SHA，不用近似矩形替代曲边遮罩。
- 地块遮罩和已用27/13.5菱形在同一画板相交；不是声称已恢复Base全局rects/白格原平面。教学1800预算、4级岩土开局与教学固定熔岩是有来源文本支撑的离线教学方案，原服务器初始包/教程结果协议仍未知，TUTORIAL.md单独记录，不修改普通繁殖概率。

## v0.16.59 木牌坐标与岛屿编号纠正
- 原 MainScene:initIslands 的 orders={1,2,3,4}、names={left,top,right,bottom}；source2 为火山 top、source3 为荒漠 right。旧实现把2/3反配，导致原 land32—36 的购买木牌画在火山/血战前线上。恢复源编号/中心/尺寸/z次序，不改地块购买记录。
- Base.setLandBoard 函数63 PC56—78取(tx+w/2,ty+h/2)，根 upvalue r2=r3=27，生成 x=27*(tx-ty), y=27-27*(tx+ty)/2；MainScene buildingLayer=(0,0)、islandLayer.y=-2500。木牌应在全局 buildingLayer，不应使用遮罩的x/y，也不应困在各岛的stacking context。
- LandBoardDelegate 原sprite132×194、anchor(.5,0)、delegate.scale(.5)、原文字50在y120；PC世界统一缩放.5，因此木牌33×48.5、字12.5。血战前线原(-30,2010)入口保留，未用搬动原入口掩盖木牌错误。静态反汇编见work/base-board-v59.txt，未执行原Lua。

## v0.16.60 血战与活动入口
- 静态BloodBattlePanel SHA256 5f177ae1bfecd20a032ad81ccdc7abfd3c9145bdec0c74f17a415dbe9a1e63b1，函数0载入ui_battle_blood；函数6/23对应下一波/失败重来/满纪录扫荡；LibBloodWarLevelInfo SHA256 25623bed96372947237bdbc2862d27641906f0eeef1ebe44a6d63ac43fc2362c恢复16字段。BloodWarLibrary与NextWavePanel明示三档原怪物组、积分x1/2/3；ResultPanel按关卡/score/itemnum显示结算。未执行Lua。
- BloodWar/BloodWarLevel原表50关485波，全部1455组4365怪物及原属性导出；源VIP血战次数bloodTime=VipInfo arr[15]。原字段/源SHA/离线适配在reference/blood-front-provenance.json；BLOOD-FRONT.md明确钱包/判胜/每日刷新等证据边界。
- 用户要求去掉过多相似活动，活动菜单43→19，保留不同玩法代表版本。76份源定义和旧claims/inventory保留，57个重复或近似历史版本不再展示，不删除已获道具或重置领奖进度。

## v0.16.61 血量与伤害跳变修复
- 原rune-skills数据damageVector万分比及damageValue固定值接入实际伤害；怪物配置skill1/skill2优先，显示与伤害技能ID一致。原属性成长/装备/宝石/符文/升星/培养继续复用现有提取，不虚构已恢复服务器防御/暴击/怒气规则。
- 旧3回合脚本finishing不是原版证据，已删除运行模块及其镜像测试。新增确定性逐击HP求解和守恒/真实死亡/30回合不强杀验证，防御公式等本地适配完整列COMBAT.md。冒险旧40%离线强度改在真实攻防血执行，血战原怪物属性保持独立。

## v0.16.64 移动入口
- 静态检查原BuildingOptPanel.lua函数20的Base.moveBuildingBegin与函数30的cp_move/移动；完整指令和SHA见reference/building-move-entry-disassembly.txt，未运行原Lua。原版独立移动操作得到确认，原手机版双击手势未得到证据；本轮双击为用户指定PC防误触改动，原按钮仍可用。


## v0.16.66 进化与远古获取
- DragonEvolutionUI SHA256 e8542e253911e525533763ab89937fabd3b71a06c2322daded3023be80958c4c 的函数1/5/8确认15/25级、20/50条、原三材料位置和两阶段；DragonElement SHA256 558a78516ea4fdf94157c0e569f50a9ab617837548923c1624481eb66ae86880 函数56/57确认总倍率1/1.15/1.3224999999999998。EvolutionLibrary明文按品质/阶段首行取成本，列7—10具名，列4—6无具名消费，区间概率仅离线解释。
- 原限时神龙1—4排名首奖分别1200/1202/1203/1205；第5仍1205重复，不改为1206。春节chunjiezhuanpan原7171火凤凰碎片20片合成，四期活动与春节兑换/背包共用原记录。原扭蛋预览不含这五种远古；本轮撤回旧单机新增池，保留旧奖品兼容。
- 原13种觉醒完整配置与8个开放标志的差异继续记录；本机开放另外5种完整数据不等于恢复原服排期，缺失三种不补造原成本。详EVOLUTION.md。

## v0.16.67 觉醒石与首领原奖品
- 原宝藏商店119—122为风林火山7111—7114，各1颗20魔晶且sourceEnabled=true；原JueXingPanel.lua的onWakeUp检查enought，数量不足红字。获取页、商店直接定位及旧已付费库存迁移为本机接通。
- world_boss_chengjiu 8行由LibWorldBossAchievementInfo列定义，原WorldBossAchievementItem写单日总伤害，WorldBossData以historydamage及flag位判定；保存每日峰值和永久领取记录。
- world_boss_paiming 5行由LibWorldBossRewardInfo定义；7044是神圣·冰域皇龙蛋碎片，原item-use配置10片合成1201。原排名第一5片，非直接龙蛋。原13类通过lib_holyfire取图/等级，820601等六种均能对应现有宝石配置，已接可用实例。所有SHA与源列记录见reference/boss-achievements-provenance.json。
- 本轮新增镜像通道传输实测，两份下载清单规范换行后与GitHub完全一致。镜像升级的发布者签名校验、逐文件哈希、真实小文件下载/复用及旧档SHA均通过；镜像不是原游戏内容证据。

## v0.16.68 冒险与体力
原PvePanel明文确认加号、50魔晶补满、VIP容量与pveBuyPowerTime；PveRender显示普通图节点与星级。原农场17建造10秒、18建造30秒，既有VIP缩短保留。原装备最高grade100显示+99，六部位均有橙色五星属性行。SHA/参数见reference/update-v68-provenance.json。

- v71：pcf/tuhao_2与duihuan原导出确认喵星碎片7043奖励、10换1100；ErTongPart.lua根常量1204/7141确认儿童节棒棒糖展示与碎片，SHA256 1aabcbf29bc3b6f252a21066c4c30a2cf4834c8b0f60227b87c7f570e1d64f27；20%每击1片由用户明确指定，不是原服务器证据。

- v76龙巢出售价来自现有18行ORIGINAL_HABITATS.sell_price.g，40/41为50000；原GoalSellBuilding.lua监听Event_SellBuilding，Base字节码亦含该事件符号。确认界面复用原panel_apply_or_cancel。出售顺带收取存金、旧原型巢0金币回收及最少留一巢为本地兼容规则。

## v0.16.81 原音频与设置证据
- assets/original/audio/manifest.json逐文件记录来自APK assets/res/sound/的39个原始MP3，未重新合成/转码；SoundManager.lua SHA256 a296fd21074c5e5b5d40b352463e4ffd9418e72518e8290cd18a6a18c3227a3f，音乐id1/2 town、3/4 battle，MAIN_MUSIC_GAP=60。
- SkillNewCommonInfo.lua SHA256 6676cd61c3289138036988c0dfa64116dd6c9ce9c11f84fcf2d708bcfa06bbdd，函数0常量fireSoundID=8、hitSoundID=9；BattleField onFire_/onHit_实际读取两字段；BattleUI函数5 PC27—41选择血战advance/其它normal，音量0.6。
- 原panel_userinfo.json SHA256 56b2049d03319c382a7fa5fc973bdb351d269ab2afd1f3d9c5dfdc090fa51bf8，567×482；UserInfoPanel函数0开/关同时切music+sound，函数13/14切图/勾和触摸开关。实现沿用这些原节点，不重排主设置页。
