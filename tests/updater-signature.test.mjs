import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
test('mirror update manifest requires publisher signature; canonical LF/CRLF work and tampering fails',()=>{const ps=fs.readFileSync('scripts/update-game.ps1','utf8'),fn=ps.match(/function Verify-ManifestSignature\([\s\S]+?\n\}/)?.[0];assert(fn);const root=fs.mkdtempSync(path.resolve('work/signature-test-')),m=fs.readFileSync('updates/latest.json','utf8').replace(/\r\n/g,'\n'),sig=path.resolve('updates/latest.sig'),quote=v=>"'"+v.replaceAll("'","''")+"'";for(const [name,raw,expected]of [['lf',m,0],['crlf',m.replace(/\n/g,'\r\n'),0],['tampered',m.replace(/"schema":\s*1/,'"schema":2'),1]]){const f=path.join(root,name+'.json'),runner=path.join(root,name+'.ps1');fs.writeFileSync(f,raw);fs.writeFileSync(runner,'\ufeff'+fn+'\ntry{Verify-ManifestSignature '+quote(f)+' '+quote(sig)+';exit 0}catch{exit 1}');const r=spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',runner],{encoding:'utf8',timeout:10000});assert.equal(r.status,expected,r.stdout+r.stderr);}});
