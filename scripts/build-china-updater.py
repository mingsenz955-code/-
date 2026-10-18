"""Build a shareable mirror-first bootstrap without bundling any player data."""
from pathlib import Path
import zipfile,json,subprocess
root=Path(__file__).resolve().parents[1]
version=json.loads((root/'package.json').read_text(encoding='utf8'))['version']
out=root/'work'/('update-v'+version);out.mkdir(parents=True,exist_ok=True)
target=out/'Yulong-Update-China.zip'
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
 z.write(root/'scripts/update-game.ps1','update-game.ps1')
 z.writestr('更新游戏.cmd',b'@echo off\r\nchcp 65001 >nul\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-game.ps1" -DownloadSource China -Launch\r\nif errorlevel 1 pause\r\n')
 z.writestr('直连更新.cmd',b'@echo off\r\nchcp 65001 >nul\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-game.ps1" -DownloadSource Direct -Launch\r\nif errorlevel 1 pause\r\n')
 z.writestr('使用说明.txt',('退出游戏后解压此包，双击更新游戏.cmd，首次选择原游戏总目录（有启动游戏.exe和dist）。\r\n默认优先使用GH-Proxy和GHFast公共加速通道，无需登录GitHub；失败切换下一通道。仍逐文件校验，只下载变化文件，原存档原位保留并备份。\r\n更新清单必须通过发布者RSA签名，第三方通道不能仅靠修改清单哈希替换程序。发布者私钥不在包里。\r\n这些是第三方加速通道，不是GitHub官方中国镜像，是否可达取决于当地网络。所有通道失败时保留旧游戏，可稍后重试或用直连更新.cmd。\r\n无需更换游戏文件夹，不要删除player-data。\r\n').encode('utf-8-sig'))
print(json.dumps({'zip':str(target),'bytes':target.stat().st_size}))
