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
