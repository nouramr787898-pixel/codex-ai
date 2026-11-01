import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import net from 'node:net';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';

const root=fileURLToPath(new URL('../',import.meta.url));

test('HTTP server serves public assets and keeps internal files private',async t=>{
 const socket=net.createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');
 const port=socket.address().port;await new Promise(resolve=>socket.close(resolve));
 const dataDir=await fs.mkdtemp(path.join(os.tmpdir(),'codexa-http-test-'));
 const fixtureDir=path.join(root,'data');
 const created=await fs.mkdir(fixtureDir,{recursive:true});
 const fixtureName=`http-test-${randomUUID()}.sqlite`;
 const fixture=path.join(fixtureDir,fixtureName);
 await fs.writeFile(fixture,'NON-SENSITIVE ACCESS CONTROL TEST',{flag:'wx'});
 const child=spawn(process.execPath,['server.js'],{cwd:root,stdio:'ignore',env:{...process.env,PORT:String(port),NODE_ENV:'development',DATA_DIR:dataDir,SESSION_SECRET:randomUUID(),ADMIN_EMAIL:'test@localhost',ADMIN_PASSWORD:randomUUID(),TRUST_PROXY:'0'}});
 const base=`http://127.0.0.1:${port}`;
 try{
  let ready=false;
  for(let attempt=0;attempt<80;attempt++){
   if(child.exitCode!==null)throw new Error('Test server exited before readiness');
   try{ready=(await fetch(base+'/api/content')).ok}catch{}
   if(ready)break;
   await new Promise(resolve=>setTimeout(resolve,50));
  }
  assert.ok(ready,'Server must start with real SQLite dependencies');
  await t.test('existing internal files and a database-path fixture cannot be downloaded',async()=>{
   for(const file of ['server.js','package.json','README.md','node_modules/express/package.json',`data/${fixtureName}`,'tests/server-public-files.test.js']){
    await fs.access(path.join(root,file));
    assert.equal((await fetch(base+'/'+file)).status,404,file);
   }
  });
  await t.test('public pages, scripts, images and content remain available',async()=>{
   for(const route of ['/','/admin','/privacy.html','/app.js','/navigation.js','/site-data.js','/style.css','/client-logo-01.webp'])assert.equal((await fetch(base+route)).status,200,route);
   const content=await (await fetch(base+'/api/content')).json();assert.ok(content.services.length>0);
   assert.equal((await fetch(base+'/api/admin/inquiries')).status,401);
  });
  await t.test('missing assets and API routes return honest 404 responses',async()=>{
   assert.equal((await fetch(base+'/assets/portfolio/missing.webp')).status,404);
   const response=await fetch(base+'/api/not-a-route');assert.equal(response.status,404);assert.ok((await response.json()).error);
  });
 }finally{
  if(child.exitCode===null){const exited=once(child,'exit');child.kill('SIGTERM');await exited}
  await fs.rm(fixture,{force:true});
  if(created)await fs.rmdir(fixtureDir).catch(error=>{if(error.code!=='ENOTEMPTY')throw error});
  await fs.rm(dataDir,{recursive:true,force:true});
 }
});
