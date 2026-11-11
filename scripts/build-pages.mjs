import { build } from 'vite';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { EXAMPLE_SPACES } from '../lib/examples.ts';

await build({configFile:fileURLToPath(new URL('../pages.vite.config.ts',import.meta.url))});
const output=new URL('../outputs/github-pages/',import.meta.url);
const routes=['explore','host','about','help','privacy','terms','safety','saved','bookings','profile','dashboard','admin',...EXAMPLE_SPACES.map(s=>`spaces/${s.id}`)];
for(const route of routes){const dir=new URL(`${route}/`,output);await mkdir(dir,{recursive:true});await copyFile(new URL('index.html',output),new URL('index.html',dir));}
await copyFile(new URL('index.html',output),new URL('404.html',output));
await writeFile(new URL('.nojekyll',output),'');
console.log(`Built the read-only GitHub Pages project demo and ${routes.length} direct routes. Accounts and writes remain on the full app.`);
