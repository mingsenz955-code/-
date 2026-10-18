const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),version=require('../package.json').version;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
async function walk(dir,prefix=''){const result=[];for(const f of await fs.readdir(dir,{withFileTypes:true})){const rel=prefix+f.name;if(f.isSymbolicLink())throw Error('Release contains symlink');if(f.isDirectory())result.push(...await walk(path.join(dir,f.name),rel+'/'));else result.push(rel);}return result;}
async function build(){
 const commit=process.argv.find(a=>a.startsWith('--commit='))?.slice(9)??execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();if(!/^[a-f0-9]{40}$/.test(commit))throw Error('Invalid immutable source commit');
 const release=path.join(root,'dist',`御龙高手-v${version}-win32-x64`),out=path.join(root,'work',`update-v${version}`);await fs.mkdir(out,{recursive:true});
 const gitFiles=new Map(execFileSync('git',['ls-tree','-r',commit],{cwd:root,encoding:'utf8',maxBuffer:10e6}).trim().split('\n').map(line=>{const m=line.match(/^\d+ blob ([a-f0-9]+)\t(.+)$/);return m?[m[2],m[1]]:['',null]}));
 const files=[];for(const rel of (await walk(release)).sort()){
  // QA profiles and screenshot outputs are never publisher content.
  if(rel.startsWith('resources/app/work/'))continue;
  const kind=rel.startsWith('resources/app/')?'app':'runtime';
  if(kind==='app'&&!/^(desktop\/|src\/|assets\/|index\.html$|package\.json$)/.test(rel.slice(14)))continue;
  const b=await fs.readFile(path.join(release,rel));const f={path:rel,kind,bytes:b.length,sha256:digest(b)};
  if(kind==='app'){
   const source=rel.slice(14),blob=crypto.createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
   if(gitFiles.get(source)!==blob){
    const original=execFileSync('git',['show',`${commit}:${source}`],{cwd:root,maxBuffer:50e6});
    if(!/\.(mjs|cjs|json|html|css|txt|svg|xml|md)$/.test(source)||!Buffer.from(original.toString('utf8').replace(/\r\n/g,'\n')).equals(b))throw Error('Packaged file differs from pinned GitHub source: '+source);
   }
   f.url=`https://raw.githubusercontent.com/mingsenz955-code/-/${commit}/${source}`;f.text=/\.(mjs|cjs|json|html|css|txt|svg|xml|md)$/.test(source);
  }
  files.push(f);
 }
 const runtimeZip=path.join(out,'runtime-win32-x64.zip');
 // The publisher creates this ZIP from runtime-only records; app files come from pinned GitHub sources.
 await fs.writeFile(path.join(out,'runtime-files.json'),JSON.stringify(files.filter(f=>f.kind==='runtime')));
 const manifest={schema:1,version,commit,files,runtime:{url:`https://github.com/mingsenz955-code/-/releases/download/v${version}/runtime-win32-x64.zip`,bytes:0,sha256:'pending'}};
 if(await fs.stat(runtimeZip).catch(()=>null)){const b=await fs.readFile(runtimeZip);manifest.runtime.bytes=b.length;manifest.runtime.sha256=digest(b);}
 await fs.writeFile(path.join(out,'latest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({version,commit,files:files.length,app:files.filter(f=>f.kind==='app').length,out}));
}
build().catch(e=>{console.error(e);process.exitCode=1});
