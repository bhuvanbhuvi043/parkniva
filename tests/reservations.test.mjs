import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../app/api/[...path]/route.ts',import.meta.url),'utf8');
const fields=source.match(/const fields="([^"]+)"/)[1];
const insertSql=source.match(/:`(INSERT INTO bookings\(\$\{fields\}\) SELECT[^`]+)`/)[1].replace('${fields}',fields);
const acceptSql=source.match(/prepare\("(UPDATE bookings SET status='accepted'[^"\n]+)"\)/)[1];
const blockSql=source.match(/prepare\("(INSERT INTO availability_blocks[^"\n]+)"\)/)[1];
function fixture(){const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_tranquil_scarlet_witch.sql',import.meta.url),'utf8'));return db;}
const now=1000;
function book(db,{id=crypto.randomUUID(),start=2000,end=3000,status='pending',expires=5000}={}){
  const values=[id,'space','guest','host','Space','Chennai','Guest','qa@example.test','TEST1','car','hourly',1,start,end,2500,status,'',expires,now];
  return db.prepare(insertSql).run(...values,'space',now,end,start,'space',end,start).changes;
}
test('SQL reservation insert rejects enclosing and partial overlaps, allowing adjacent slots',()=>{
  const db=fixture();assert.equal(book(db,{id:'first'}),1);
  for(const [start,end] of [[2100,2500],[1500,2500],[2500,3500],[1500,3500]])assert.equal(book(db,{start,end}),0);
  assert.equal(book(db,{start:3000,end:4000}),1);db.close();
});
test('expired and cancelled requests release inventory, accepted reservations keep it held',()=>{
  for(const prior of [{status:'pending',expires:999},{status:'cancelled'},{status:'declined'},{status:'demo'}]){
    const db=fixture();book(db,{id:'old',...prior});assert.equal(book(db),1);db.close();
  }
  const db=fixture();book(db,{status:'accepted',expires:999});assert.equal(book(db),0);db.close();
});
test('host blocks and booking reservations exclude each other',()=>{
  const db=fixture();assert.equal(db.prepare(blockSql).run('block','space','host',2000,3000,'Away','space',now,3000,2000).changes,1);
  assert.equal(book(db),0);assert.equal(book(db,{start:3000,end:4000}),1);
  assert.equal(db.prepare(blockSql).run('other','space','host',3500,4500,'Away','space',now,4500,3500).changes,0);db.close();
});
test('host acceptance is atomic and cannot revive cancelled, expired or past requests',()=>{
  for(const prior of [{status:'cancelled'},{status:'pending',expires:999}]){
    const db=fixture();book(db,{id:'old',...prior});assert.equal(db.prepare(acceptSql).run('old',now,now).changes,0);db.close();
  }
  const db=fixture();book(db,{id:'valid'});assert.equal(db.prepare(acceptSql).run('valid',now,now).changes,1);
  assert.equal(db.prepare(acceptSql).run('valid',now,now).changes,0);db.close();
});
test('a late acceptance cannot take a slot already claimed after expiry',()=>{
  const db=fixture();book(db,{id:'old',expires:999});book(db,{id:'replacement',status:'accepted'});
  assert.equal(db.prepare(acceptSql).run('old',now,now).changes,0);db.close();
});
