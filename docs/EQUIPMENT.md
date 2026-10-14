# 装备与战斗属性核对 — Android 2.9.35

资源基线202402271124。本页记录静态证据，不等于装备玩法已经完成。当前玩家程序仍v0.8，存档仍v4。

## 已确认的数据

- `equipinfo`有6000行，但只有60行grade=1；不能声称有6000种独立基础装备。所有升阶/降阶正ID均能在表内找到，且关联互逆、阶级相邻。
- EquipInfo.lua直接定义33列。槽编号：0武器、1鳞片、2龙骨、3龙角、4羽翼、5皇冠。品质1–5对应白、绿、蓝、紫、橙。
- 系别编号：1土、2火、3水、4植物、5金、6冰、7电、8暗、9无限制。9在该表不应被解释成传奇限定。
- atk/def/hp/resist/antResist是独立字段；保留原字段，不擅自映射成最终战斗总属性。
- **第24列price明确是出售价格**。导出时改名sellPrice；禁止把它拿来作为商店售价。
- 第27列enhancedCost为强化金币字段，第13列upgradeExpCost为升阶经验需求；单凭字段不能确认操作顺序、随机失败/降级/保护符、服务器额外扣费。
- 60条基础记录共用30个原图标，全部已存在于thumbs_equip图集中。未用AI图替代。各阶保留原name/icon/随机包ID/来源字符串，不生成额外词缀。
- `prevView`按原`arr[32] == 1`转换为布尔，其他33列字段逐值保留；image为基于实际原图文件存在性附加的路径，缺图应为null。

## 战斗属性证据与边界

原`dragon/core/dragonfarm/DragonElement.lua`为Lua 5.1字节码。只解析常量和指令，不运行客户端、网络协议或原生库。审计结果见`docs/reference/dragon-attributes-disassembly.txt`；函数编号和指令PC均从0开始。

- nested 1（updateAttributes）PC129–139：基础攻击片段为`floor(baseAttack + (level-1)*attackQuality + r7 + awakening.attactTotal)`。PC143–167同样包含防御/生命成长、其他加成和觉醒，不能只接前两项。
- 之后PC176–250分别取整计算进化倍数与秘宝加成。PC253–297以`_data`总属性减基础属性构成addedAttribute，证明基础成长表不是最终总属性来源。
- nested 32（getPower）PC35–55读`_data.attack/defend/maxblood/crit/uncrit`，计算`floor(attack + defend + maxblood/3 + crit + uncrit + getRunePower())`。该式也不能单凭基础装备值就保证原结算一致。
- nested 59（getAtksInfo）对quality=0回退1，并考虑wakestar。`Dragon_atks`580行按龙和品质区分，不能按龙ID只取第一行替代全部品质。
- nested 51（canDressEquip）存在无限制9和元素判断，但读取的是全局`_data.elementTypeList`；nested 49的重置分支只初始化四个false。它们与后期六槽定义不完全对应，须继续跟进EquipPanel/FormationEquipPanel及实际调用链，不能直接复制为六槽服务规则。

当前喂养页总属性继续显示“—”。原被动技能、符文、觉醒、装备随机属性、培养、服务端总值都还需接入/核验。

## 已新增的工程基础

- `scripts/export-equipment.py`：从已有安全读取表与原字段定义重导出6000行、字段映射、原始输入哈希及缺失关联报告。
- `src/equipment.mjs`：只读定义、六槽/品质/系别/阶级筛选、升降阶目标查询；默认只列grade=1。不发放物品，不改玩家档，不自行购买/合成/强化。
- `scripts/inspect-lua.py`：静态指令审计工具，区分RK常量与跳转/计数，避免误把FORPREP偏移解释为常量索引。

复现：先运行`python scripts/export-equipment.py`，再运行`npm test`及`python -m unittest discover -s tests -p 'test_*.py'`。

## 后续接入顺序

1. 核对EquipPanel/FormationEquipPanel的真实槽位/实例/背包模型；原页面包括panel_equip_info、item_equiplist_equip、ui_formation_equip_change，需继续补齐ui_equip/ui_equipformation/ui_bgpuzzle依赖及动态填充。
2. 确认一个有直接原证据的装备获取入口，再接玩家库存、穿脱、互换与存档迁移。不得用出售价格伪造商店，或给正常玩家档塞测试装备。
3. 原强化/升阶/升星/宝石/随机属性与战斗计算逐层接入。服务器概率和结算未核实前明确保留差异。

## v0.15 后期装备实例调用链补证
- EquipPanel.lua源SHA256 581388adaa9fa2b3e7e59a53e61229dc1cbe51efdf010f3d41a37e561cf564f5。静态函数3/4通过dceWearEquip/dceUnWearEquip传龙_data.id和装备data；函数12按data.dragonid过滤未穿戴装备，库存是实例，不是6000条静态定义。
- FormationEquipPanel.lua源SHA256 6b2c2157eeb74b948f854fbb93c1dd2a7562fd0c1356daf2714a3fd57ef82d42。panel_equip_info取DataManager.getEquipByID、实例grade/star和curAtk/curHp/curDef/curUnCrit/curCrit；星属性来自lib_equipStarInfo。不能把定义基础值冒充穿戴后实例属性。
- EquipPanel空槽提示通过原Locale键You can obtain the equipment in the Dragon Wildland；须继续核对对应龙境/野外模式的原掉落，再接装备获取，不凭这句提示编造关卡/概率或免费装备。
- 本轮只完成此调用链补证，没有新增装备库存/穿脱/战斗属性功能。优先真实来源和玩家实例，再穿脱/养成；旧四槽DragonElement分支不能替代此后期流程。

## v0.16 实机对照：装备住在「阵容」页，而且是六个槽

用户要求先看原版实际画面再动手。本轮据此纠正了上一轮自行拼装的装备界面。实机证据：B站《【龙之牧场（育龙高手）】喜提小龙哥和前两件紫装》（BV1kV4y157K，Century洛龙兰，2022-10-07），逐帧抓取后与客户端静态布局逐节点对照。

- 装备主界面是 **`ui_formation_info`（标题「阵容」）**，不是早期四槽的 `item_equipPart`。它含 `equip1`~`equip6` 六个槽，每槽有 `anon`(道具框)/`quality`/`icon`/`star`/`txt_name`(槽下装备名)/`txt_num`(图标上强化等级)/`hint`/`biaoji_pinzhi`。
- 六槽从左到右的 x 顺序是 `equip5, equip1, equip2, equip3, equip4, equip6`。实机画面里第一个空槽显示 `ui_starup_zb5.png`（翅膀），其余依次是幽灵龙爪、邪风龙鳞、诅咒龙骨、残酷龙角、珍珠皇冠，即**部位 4,0,1,2,3,5**，六个部位齐全。
- 空槽部位图：武器 `zb1`、鳞片 `zb2`、龙骨 `zb4`、龙角 `zb3`、羽翼 `zb5`、皇冠 `zb6`。zb5、zb6 已肉眼确认为翅膀与皇冠。
- 穿戴流程：点空槽进入 **`ui_formation_equip_change`（装备更换）**，卡片是 **`item_formation_equip_change`**（`tx_name`/`icon_long`/`node_star`/`tx_lv`/`shuxing1~3`/`pingding`/`hint`「装备于XX龙」/`biaoji`「已装备」/`btn_zhuangbei`）。列表只给该部位且未被其他龙穿着的装备。
- 强化入口是 **`panel_formation_equip_strengthen`（装备强化）**：实机画面为「暗影之翼-D」，显示「防御 1014>>>1049」「暴击 506>>>523」、消耗 22、按钮「强化」「强化10次」。
- 龙信息卡 `dragong_info` 自带属性节点 `hp`/`atk`/`def`/`critical`/`resist`（各含 `miaoshu`+`num`）与 `power`（战斗力），另有 `text_type`/`type_sky`/`type_land` 系别。上一轮自行添加的属性块是错的，已删除。
- 左侧龙列表、`上阵/飞行龙/爬行龙` 统计、`阵型`/`更换龙`/`一键装备`/`详情` 都是原布局已有节点。注意布局的 label 查找会回退到节点名，因此页面标题 `txt_name` 会覆盖所有按钮文字，每个 `txt_name` 必须显式赋值。

仍未接入：技能行（`skill1~4`）、系别数据、一键装备规则、强化与升星结算、装备实际获取。属性只累计装备定义基础值，**不是**原版战斗总属性。

`scripts/import-original-assets.py` 的图集白名单此前没有 `ui_formationinfo` 与 `ui_equipformation`，所以 `ui_formationinfo_*`（含 `lvbg`、`zhuangbeibg`、`type_land`、`type_sky`）从未导入；本轮补入，登记数 2176 → 2203。

## v0.16.17 更新
左侧布阵现有六阵位、原加号/选择龙卡、更换和下阵；分类和同种限制采用FormationData原指令规则。装备定义atk/def/hp已连到基础战斗属性和离线结算，不再只显示装备自身加成。强化、升星、随机词条、技能、符文与宝石仍未实现；一键装备仍不可用，正常装备获取尚未闭合。
