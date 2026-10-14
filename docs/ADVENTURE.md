# 冒险模式（PVE）证据 — Android 2.9.35

用户第二项任务。本页记录客户端**能证明**的东西，与实际已实现的部分分开。

## 数据在哪

`dragon/data/clientdatas/PVEData.lua` 调用 `SocketSender.getPveMapInfo()` 并读取 `pkg.mapEventList`（`MapEvent_pb`）。因此**玩家进度、已得星数、宝箱状态与战斗结果都在服务器**；客户端只有静态表。

`work/config-json`（pcf 214 张）里**没有** `pvelevelinfo`/`tollgateinfo`/`chaptersinfo` —— 它们只以 `*Info.lua`（Lua 字节码）存在，用于推导列映射（见 `schemas.json`），本身不含表体。真正带数据的是：

| 表 | 行数 | 已证明的列 |
|---|---|---|
| `map` | 20 | 1=地图 id（101–120）、2=等级要求、6=总星数（全为 12，与实机「12/12」一致） |
| `maps` | 20 | 1=地图 id、5=中文名（"神秘的背影"等）、6=剧情布局名（`plot01`）、10=备注（"BOSS点掉落白色龙骨装备"） |
| `mapevents` | 400 | 1=节点 id、2=所属地图（=地图 id + 900）、5/6=前/后节点、8=节点名、13=事件类型 |
| `monster` | 9976 | 敌人 |
| `Boss` / `world_boss` / `BloodWarLevel` / `gonghui_fuben*` | 30 / 22 / 50 / … | 其它战斗玩法 |

## 已证明的结构

- **20 张地图 × 20 节点 = 400**，每图正好 20 个。
- 前后链**自洽**：400 行的第 5/6 列互相指认，导出报告 `adventure-provenance.json` 记录 forward/backward 均为 400。
- 节点表的地图列**减 900 可完全复现**地图 id 列表（20/20），这是偏移 900 的依据。
- 400 个节点是**一条贯穿 20 图的长链**：只有 1 个节点没有前驱、1 个没有后继，其余首尾相接跨图。
- 节点类型：`monster` 320 个（每图 16），龙节点 80 个（每图 4）。

## 仍未证明 / 未实现

- 除上表列出的列以外，其余列含义**未证明**，不得臆测。
- 战斗结算、属性克制、体力、星级、宝箱与奖励均在服务器；客户端表不能保证与之相同。
- **战斗程序尚未实现**，因此冒险目前只到「地图与节点数据可读、界面待接」。
- 实机参考：用户提供过的第 20 关地图（星数 12/12、体力、满星奖励、路径圆节点、事件、宝箱、占领标记）与本表的 12 星总数吻合。

## 工程

- `scripts/export-adventure.py` → `assets/original/data/adventure.mjs` + `adventure-provenance.json`（含 `tables.json` 哈希与列证据说明）。
- `src/adventure.mjs`：只按**已证明的列**读取，提供地图 / 节点 / 链查询。
- `tests/adventure.test.mjs` 3 项：逐行保留与哈希一致、20×20 与链完整性、节点类型分布。

## 界面（v0.19）

冒险面板用原版 `panel_pve`（1138×640）：`huadong` 地图滚动区、`map_ctrl` 的左右翻页与普通/精英按钮、标题 `tx_biaoti`。地图用 `item_pve_map_1..12`，每张布局里正好 `check1..check20`，与 `mapevents` 每图 20 个节点**一一对应**（checkN = 第 N 个节点）。小节点用 `point2`、大节点用 `diban`，两者都包成可点按钮；点节点报告名称与类型。入口是主界面「战斗」。

**这个 APK 缺图**：`panel_pve` 引用 11 个 frame，遍历全部 152 个 ui 图集与 APK 内所有 plist 都找不到 —— `ui_bg_960_640bg`、`ui_common_bg_t_0..5`、`ui_common_btn_fanye_l/r_1`、`ui_common_biaoqian_01/02`、`ui_pve_title2`。界面改为加载失败即隐藏，底板暂用同源 `ui_common_DiBan_YangBiZhi.png` 兜底；翻页按钮仍可点，但没有箭头图。

**导入策略变更**：`scripts/import-original-assets.py` 由手写白名单改为**全量导入** `assets/res/ui/*.plist`（152 个图集，外加 7 张 `pve_map`）。手写列表已两次漏图（`ui_formationinfo`、`ui_common_bg_t_*`），全量后登记 4427 条、`assets/original/ui` 3832 个文件；同时修复图集内 `.jpg` 条目无法以 RGBA 保存导致整批中断的问题。

**进度仍是服务器权威**：节点一律按中性状态绘制，不伪造通关/星级/宝箱。战斗、体力与结算未实现。
