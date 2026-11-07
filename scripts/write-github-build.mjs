import { writeFile } from 'node:fs/promises';
const { GITHUB_REPOSITORY: repository, GITHUB_SHA: commit, GITHUB_RUN_ID: runId }=process.env;
if(repository!=='bhuvanbhuvi043/parkniva'||!commit||!/^[a-f0-9]{40}$/.test(commit)||!runId||!/^\d+$/.test(runId))throw new Error('Expected the private Parkniva GitHub Actions build.');
await writeFile(new URL('../dist/github-build.json',import.meta.url),JSON.stringify({repository,commit,runId,node:process.version},null,2)+'\n');
