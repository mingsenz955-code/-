"""Publish this repository's verified updater assets using the existing Git credential.
No credential is logged, saved in the package, or passed to a player.
"""
from pathlib import Path
import argparse, hashlib, json, subprocess, urllib.request, urllib.error, zipfile

ROOT=Path(__file__).resolve().parents[1]
REPO='mingsenz955-code/-'
VERSION=json.loads((ROOT/'package.json').read_text(encoding='utf8'))['version']
OUT=ROOT/'work'/('update-v'+VERSION)

def credential():
    result=subprocess.run(['git','credential','fill'],cwd=ROOT,input='protocol=https\nhost=github.com\n\n',text=True,capture_output=True,check=True)
    values=dict(line.split('=',1) for line in result.stdout.splitlines() if '=' in line)
    if not values.get('password'):raise RuntimeError('GitHub credential not available')
    return values['password']

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--publish',action='store_true');parser.add_argument('--prepare',action='store_true');args=parser.parse_args()
    manifest=json.loads((OUT/'latest.json').read_text(encoding='utf8'))
    if manifest['version']!=VERSION:raise RuntimeError('Release version mismatch')
    release_dir=ROOT/'dist'/('御龙高手-v'+VERSION+'-win32-x64')
    if args.prepare:
        runtime=OUT/'runtime-win32-x64.zip'
        with zipfile.ZipFile(runtime,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as archive:
            for row in manifest['files']:
                if row['kind']=='runtime':archive.write(release_dir/row['path'],row['path'])
        blob=runtime.read_bytes();manifest['runtime'].update(bytes=len(blob),sha256=hashlib.sha256(blob).hexdigest())
        (OUT/'latest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
        bootstrap=OUT/'Yulong-Update.zip'
        with zipfile.ZipFile(bootstrap,'w',compression=zipfile.ZIP_DEFLATED) as archive:
            archive.write(ROOT/'scripts/update-game.ps1','update-game.ps1')
            archive.writestr('更新游戏.cmd',b'@echo off\r\nchcp 65001 >nul\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-game.ps1" -Launch\r\nif errorlevel 1 pause\r\n')
            archive.writestr('使用说明.txt',('先退出游戏，解压本目录，双击更新游戏.cmd。首次选择原游戏总文件夹（内含启动游戏.exe和dist）。\r\n以后双击同一入口自动检查GitHub，只下载缺失或变化的文件，保留存档，并备份到player-data/recovery。\r\n请勿在下载中关闭窗口；中断可再次运行继续。无需Node、Git或管理员权限。\r\n源码与版本说明：https://github.com/'+REPO+'\r\n').encode('utf-8-sig'))
        print(json.dumps({'prepared':True,'runtimeBytes':len(blob),'bootstrapBytes':bootstrap.stat().st_size}))
        return
    token=credential()
    def request(url,body=None,method='GET',content_type='application/json'):
        if not (url.startswith('https://api.github.com/repos/'+REPO+'/') or url.startswith('https://uploads.github.com/repos/'+REPO+'/')):raise RuntimeError('Unexpected publishing host or repository')
        data=json.dumps(body).encode() if isinstance(body,dict) else body
        req=urllib.request.Request(url,data=data,method=method,headers={'Authorization':'Bearer '+token,'User-Agent':'Yulong-Update-Publisher','Content-Type':content_type,'Accept':'application/vnd.github+json'})
        with urllib.request.urlopen(req,timeout=300) as response:return json.load(response)
    api='https://api.github.com/repos/'+REPO
    releases=request(api+'/releases?per_page=100')
    release=next((r for r in releases if r['tag_name']=='v'+VERSION),None)
    if not release:
        release=request(api+'/releases',{'tag_name':'v'+VERSION,'target_commitish':manifest['commit'],'name':'御龙高手 v'+VERSION+' · 觉醒与首领奖励','draft':True,'body':(OUT/'release-notes.md').read_text(encoding='utf8')},'POST')
    if not release['draft'] and not args.publish:raise RuntimeError('Published release is immutable to this tool; choose a new version')
    if args.publish:
        names={a['name'] for a in release['assets']}
        if not {'runtime-win32-x64.zip','Yulong-Update.zip','latest.json'}<=names:raise RuntimeError('Release assets missing')
        release=request(api+'/releases/'+str(release['id']),{'draft':False,'make_latest':'true'},'PATCH')
        print(json.dumps({'published':True,'url':release['html_url']}));return
    if manifest['runtime']['sha256']=='pending':raise RuntimeError('Prepare runtime ZIP before uploading')
    for name in ['runtime-win32-x64.zip','Yulong-Update.zip','latest.json']:
        local=OUT/name;digest='sha256:'+hashlib.sha256(local.read_bytes()).hexdigest()
        existing=next((a for a in release['assets'] if a['name']==name),None)
        if existing:
            if existing.get('digest')!=digest:raise RuntimeError('Different asset already exists: '+name)
            continue
        upload=release['upload_url'].split('{')[0]+'?name='+name
        asset=request(upload,local.read_bytes(),'POST','application/octet-stream')
        if asset.get('digest') and asset['digest']!=digest:raise RuntimeError('GitHub asset digest mismatch')
        print(json.dumps({'uploaded':name,'bytes':asset['size']}))
    print(json.dumps({'draft':True,'url':release['html_url']}))

if __name__=='__main__':main()
