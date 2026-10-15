import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
test('Windows launcher chooses numeric latest package without starting game or touching saves',{skip:process.platform!=='win32'},async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'yulong-launcher-'));
 await fs.copyFile(new URL('../启动游戏.exe',import.meta.url),path.join(root,'启动游戏.exe'));
 for(const v of ['0.16.9','0.16.29','0.16.3']){const dir=path.join(root,'dist',`御龙高手-v${v}-win32-x64`);await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,'御龙高手.exe'),'fixture')}
 await run(path.join(root,'启动游戏.exe'),['--inspect'],{windowsHide:true});const report=await fs.readFile(path.join(root,'work','launcher-target.txt'),'utf8');assert(report.includes('御龙高手-v0.16.29-win32-x64'));assert(report.includes(path.join(root,'player-data','saves','ranch-v1.json')));
});
