# GitHub增量更新

玩家先正常退出游戏，解压GitHub Release的`Yulong-Update.zip`，双击`更新游戏.cmd`。首次选择包含`启动游戏.exe`与`dist`的原游戏总目录；成功后记住路径。已安装新版本的本工程可直接使用根目录`更新游戏.cmd`。

更新器读取本仓库`master/updates/latest.json`，程序下载固定到清单指向的40位Git提交。逐文件SHA-256和长度验证；优先复用已安装发行包、工程源文件和已下载缓存。文本CRLF/LF不同但内容相同可本地规范化，无需下载。只有缺失/变化文件联网，运行时也相同则不会重复下载约300MB的运行环境；缺失或损坏时使用Release运行时修复包。

所有程序文件先写入`dist/.update-v版本-随机值`，校验完整后才一次改名为新版本。旧发行包保留；不删除玩家文件、不导入开发者存档、不重置资源。正式存档仍在原`player-data/saves`；激活前复制到`player-data/recovery/before-update-*`并核对哈希。游戏未退出、网络错误、下载内容错误、非法路径、更新清单错误、降级或不兼容存档都会停止。重复点击最新版只验证，不下载游戏内容。下载缓存位于`.update-cache`。

开发发布流程：完成规则/原生UI/存档兼容检查，提交源代码后打包；`node scripts/build-update.cjs`对包内每个程序文件计算SHA-256，并验证与该提交的Git blob一致。`python scripts/publish-update.py --prepare`生成运行时修复包和便携更新入口；上传草稿Release、核对摘要后发布。最后把本次`latest.json`写入`updates/latest.json`并推送，让更新入口指向已发布版本。清单不含个人存档或登录凭据。发布脚本仅在开发机通过现有Git凭据认证，玩家不需要Git或账号令牌。
