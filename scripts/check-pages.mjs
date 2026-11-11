import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
const root=new URL('../outputs/github-pages/',import.meta.url);
const files=await readdir(root,{recursive:true});
const html=await readFile(new URL('index.html',root),'utf8');
assert.match(html,/<title>ParkThara — Interactive project demo<\/title>/);
assert.match(html,/<meta name="viewport"/);
assert.match(html,/type="module"[^>]+src="\/parkthara\/assets\//);
assert.match(html,/https:\/\/parkthara\.sheerriver2\.chatgpt\.site/);
assert.doesNotMatch(html,/<(?:form|iframe)\b/i);
assert.equal(await readFile(new URL('explore/index.html',root),'utf8'),html);
for(const route of ['my-bookings','hosting','documents','getting-started','pricing','cancellations','service-status','charging','charging/host','charging/bookings','charging/guide','terms','privacy','safety','help']){
  assert.equal(await readFile(new URL(`${route}/index.html`,root),'utf8'),html,`Direct route ${route} must be deployed`);
}
assert.equal(await readFile(new URL('404.html',root),'utf8'),html);
assert.equal(files.filter(f=>/^spaces[\\/].*[\\/]index\.html$/.test(f)).length,12);
assert(!files.some(f=>/(^|[\\/])(?:\.env.*|\.dev\.vars.*|\.openai|server|worker|node_modules)([\\/]|$)/.test(f)));
const jsFiles=files.filter(f=>f.endsWith('.js'));
assert(jsFiles.length>0);
const js=(await Promise.all(jsFiles.map(f=>readFile(new URL(f.replaceAll('\\','/'),root),'utf8')))).join('\n');
assert.match(js,/PROJECT DEMO/);
assert.match(js,/Read-only demo/);
assert.match(js,/This GitHub demo is for exploring/);
assert.doesNotMatch(js,/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN .*PRIVATE KEY-----)/);
const logo=await readFile(new URL('images/parkthara-logo.png',root));
assert.equal(logo.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
console.log(`PASS: ${files.length} static demo files; repository-prefixed assets, 12 direct sample routes, honest demo labels and full-app links; no server/runtime files or detected credentials.`);
