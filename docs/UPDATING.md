# GitHub增量更新

玩家先正常退出游戏，解压GitHub Release的`Yulong-Update.zip`，双击`更新游戏.cmd`。首次选择包含`启动游戏.exe`与`dist`的原游戏总目录；成功后记住路径。已安装新版本的本工程可直接使用根目录`更新游戏.cmd`。

更新器读取本仓库`master/updates/latest.json`，程序下载固定到清单指向的40位Git提交。逐文件SHA-256和长度验证；优先复用已安装发行包、工程源文件和已下载缓存。文本CRLF/LF不同但内容相同可本地规范化，无需下载。只有缺失/变化文件联网，运行时也相同则不会重复下载约300MB的运行环境；缺失或损坏时使用Release运行时修复包。

所有程序文件先写入`dist/.update-v版本-随机值`，校验完整后才一次改名为新版本。旧发行包保留；不删除玩家文件、不导入开发者存档、不重置资源。正式存档仍在原`player-data/saves`；激活前复制到`player-data/recovery/before-update-*`并核对哈希。游戏未退出、网络错误、下载内容错误、非法路径、更新清单错误、降级或不兼容存档都会停止。重复点击最新版只验证，不下载游戏内容。下载缓存位于`.update-cache`。

开发发布流程：完成规则/原生UI/存档兼容检查，提交源代码后打包；`node scripts/build-update.cjs`对包内每个程序文件计算SHA-256，并验证与该提交的Git blob一致。`python scripts/publish-update.py --prepare`生成运行时修复包和便携更新入口；上传草稿Release、核对摘要后发布。最后把本次`latest.json`写入`updates/latest.json`并推送，让更新入口指向已发布版本。清单不含个人存档或登录凭据。发布脚本仅在开发机通过现有Git凭据认证，玩家不需要Git或账号令牌。

## v0.16.67 更新后奖励
更新保留原存档。进入左侧邮件领取版本更新礼物：神圣·中国龙龙蛋一枚，进入仓库，每份存档只领取一次，删除已读也不会重发；满仓时附件保留。旧误存于购买库存的四种觉醒石会迁回可用道具库存，不再扣费。

## 国内网络通道
Yulong-Update-China.zip优先GH-Proxy、再GHFast、最后直连；普通更新器Auto优先直连。无需GitHub登录，每份清单校验发布者RSA-SHA256签名，程序逐文件SHA256。公钥固定在更新器，私钥仅开发机LocalAppData/YulongRanchPublisher，不进入仓库或玩家包。传输通道不改变固定仓库/固定提交地址、路径校验、增量复用或存档备份。第三方加速是否可用依当地网络；失败不替换当前游戏。

后续发布时，签名工具用现有发布密钥签名，latest.json和latest.sig必须一起更新到updates/。prepare已自动签名并生成镜像分享包；现有Release追加镜像包可用scripts/publish-mirror-bootstrap.py，不覆盖已发布资产。
