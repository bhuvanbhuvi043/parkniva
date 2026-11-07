import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
const files=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const rules=[['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],['github-token',/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/],['aws-access-id',/AKIA[0-9A-Z]{16}/],['openai-secret',/\bsk-(?:proj-)?[A-Za-z0-9_-]{40,}/],['credential-url',/https?:\/\/[^\s/@:]+:[^\s/@]+@/]];
const forbidden=/(^|\/)(\.env(\..+)?|\.dev\.vars.*|\.wrangler|\.sites-runtime|node_modules|dist|outputs|coverage)(\/|$)/;
const findings=[];
for(const file of files){if(file!=='.env.example'&&forbidden.test(file))findings.push({file,rule:'private-runtime-artifact'});if(/\.(png|jpg|jpeg|webp|ico|woff2?|lock)$/i.test(file))continue;const bytes=await readFile(file);if(bytes.includes(0))continue;const text=bytes.toString('utf8');for(const [rule,pattern]of rules)if(pattern.test(text))findings.push({file,rule});}
console.log(JSON.stringify({checkedFiles:files.length,findings},null,2));if(findings.length)process.exitCode=1;
