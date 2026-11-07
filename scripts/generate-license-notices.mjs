import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const lock=JSON.parse(await readFile(path.join(root,'package-lock.json'),'utf8'));
const entries=[];const sections=[];
for(const [location,locked] of Object.entries(lock.packages||{})){
  if(!location)continue;
  let pkg={};let installed=false;
  try{pkg=JSON.parse(await readFile(path.join(root,location,'package.json'),'utf8'));installed=true;}catch{}
  const name=pkg.name||location.split('node_modules/').at(-1);
  const license=typeof pkg.license==='string'?pkg.license:typeof locked.license==='string'?locked.license:JSON.stringify(pkg.licenses||pkg.license||'UNKNOWN');
  const texts=[];
  if(installed){for(const file of await readdir(path.join(root,location),{withFileTypes:true})){
    if(!file.isFile()||!/^((licen[sc]e|copying|notice|copyright)([._-].*)?)$/i.test(file.name))continue;
    const text=await readFile(path.join(root,location,file.name),'utf8');texts.push({file:file.name,text});
  }}
  entries.push({name,version:locked.version,location,license,development:Boolean(locked.dev),optional:Boolean(locked.optional),installed,integrity:locked.integrity||null,licenseFiles:texts.map(t=>t.file)});
  if(texts.length)sections.push(`\n${'='.repeat(72)}\n${name}@${locked.version}\nDeclared licence: ${license}\n${texts.map(t=>`\n--- ${t.file} ---\n${t.text}`).join('\n')}`);
}
for(const file of ['vendor/shadcn-tailwind-4.13.0.LICENSE.md','scripts/vite/sites-vite-plugin.LICENSE'])sections.push(`\n${'='.repeat(72)}\nVendored material: ${file}\n${await readFile(path.join(root,file),'utf8')}`);
await mkdir(path.join(root,'docs'),{recursive:true});await mkdir(path.join(root,'public/legal'),{recursive:true});
const summary={project:'Parkniva',lockfileVersion:lock.lockfileVersion,scope:'Lockfile packages; licence texts from packages installed on the generating platform. Not a legal compatibility opinion.',packages:entries};
await writeFile(path.join(root,'docs/dependency-licenses.json'),JSON.stringify(summary,null,2)+'\n');
await writeFile(path.join(root,'public/legal/third-party-notices.txt'),'Parkniva — third-party software notices\n\nThese components retain their own licences. Parkniva\'s proprietary notice does not replace these terms. Includes development tools for transparency. Optional packages not installed on the generating platform are recorded in docs/dependency-licenses.json; review their upstream licence texts before distributing their binaries.\n'+sections.join('\n'));
const unknown=entries.filter(e=>e.license==='UNKNOWN');
console.log(JSON.stringify({lockedPackages:entries.length,installed:entries.filter(e=>e.installed).length,licenceTexts:sections.length,unknown:unknown.map(e=>e.name)},null,2));
if(unknown.length)process.exitCode=1;
