# 玩家资料与任务养成依赖 — v0.16.56

基线：当乐2.9.35 / 202402271124；依据原客户端静态代码和布局，未执行Lua。

- 点击左上头像，原UserInfoPanelFromTopUI使用panel_user_name_info，显示昵称、头像、VIP、升级剩余经验、ID、体力、首领次数、竞技次数。原revise/btn打开改名，原bg_icon触摸打开头像选择。
- ChangeNickNamePanel使用panel_user_name；checklength在结束编辑时按UTF-8截到6字，renameCount=0免费，之后100魔晶并用ConfirmPanel确认。取消不扣费。离线名称格式接受1—6字母/数字/汉字，使用原zanghua表31961个去重字串做本地匹配；原外部敏感词服务和服务器重名判断未取得，不能称这部分和服务器完全一致。输入保留中文IME组合过程，原输入框使用#fce9c1文字色。
- HeadSelectPanel使用panel_userhead_change，原列表每行7列、列间距94/行间距96，只有图鉴曾拥有的龙可选。点击先预览TopUI头像，关闭再保存。本地将当前龙与已记录的discovered并集作为曾拥有记录，保留已选头像；旧档无法重建记录开始之前已经出售的全部龙种。头像显示同步HUD与竞技自身信息。关闭/X/Esc保存选择。
- 资料保存为可选profile字段，旧档不重置、不凭空修改昵称或资源；首次实际打开才创建LOCAL前缀ID，该ID是本地档案编号，非原服务器账号ID。原资料里等级、经验、ID等不能任意改数值，因此不增加编辑按钮。在线实名认证、QQ/微信头像和账号中心按离线范围隐藏；设置按钮仍进入现有本地存档管理，不把原音乐/在线账号页算作已恢复。
- 原DragonManager顶层BASE_MAX_DRAGON_LEVEL=10；函数29取所有完工dragonLevelAmplifiers的max_dragon_level最大值。APK建筑9/10/11/12分别为15/20/25/30。当前按完工祭坛解锁喂养，施工中不提前生效，已有20级旧龙保留，不回退等级；没有祭坛时新龙上限10，最高30。购买全开放的既有用户设置保留，不声称恢复全部原建筑购买前置。
- 原SpeedUpPanel.openBreed使用CostUtil.speedUpCost并先发送GoalSpeedBreed亲代类型事件；原GoalSpeedBreed要求两只类型都在_ids里，累加次数。本地只在真正成功的speedBreed扣费事务后推进；公式ceil((剩余秒/3600)^0.7*15)。panel_breed_speedup复用原左右亲代/心形背景/费用按钮，完成后领取蛋、再转育龙塔，不拿孵化加速冒充繁殖加速。
- 任务146/159原文分别要求“两条25级龙”和“两条30级龙”。测试只升一条不能完成，第二条完成后才发原奖励。147后教程任务定义/10活跃上限保持；原新手教程、障碍物和逐地块扩建一致性仍见MISSIONS.md，不称全链条已逐条实机验收。

导出脚本scripts/export-profile-growth.py和reference/profile-growth-source.json记录规则、源SHA和离线差异。236项规则测试通过，新增5项涵盖改名/头像/全部五条加速任务/各祭坛门槛/两条高等级龙的真实喂养；隔离源版及Windows包原生鼠标验收改名免费/付费/取消、头像预览与Esc保存、任务前往原繁殖加速、喂养至25和30、独立重启保留。正式存档不刷材料、任务完成或代替玩家改名。
