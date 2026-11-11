// Explicit local-only integration test. Never run against production.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
assert.ok(['localhost','127.0.0.1'].includes(new URL(base).hostname));
let cookie='';
async function req(path,method='GET',body,headers={}){const r=await fetch(base+'/api/'+path,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(body instanceof FormData?{}:body?{'Content-Type':'application/json'}:{}),...headers},body:body instanceof FormData?body:body?JSON.stringify(body):undefined});const raw=await r.text();let data;try{data=JSON.parse(raw);}catch{data={error:raw};}return {status:r.status,data};}
assert.equal((await req('charging/account')).status,401);
assert.equal((await req('charging/bookings','POST',{})).status,401);
const auth=await fetch(base+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});cookie=auth.headers.get('set-cookie')?.split(';')[0];assert.ok(cookie);
assert.equal((await req('charging/chargers','POST',{})).status,400);
assert.equal((await req('charging/chargers','POST',{},{Origin:'https://unrelated.example'})).status,403);
const form=new FormData();form.set('file',new File([await readFile(new URL('../public/images/covered-parking.jpg',import.meta.url))],'local-test.jpg',{type:'image/jpeg'}));
const photo=await req('uploads','POST',form);assert.equal(photo.status,201);
const offer={title:'Local charging QA',city:'Chennai',area:'Test area',address:'Private test address',description:'Local test only: dedicated charger, compatible test model.',vehicle_type:'car',connector:'Type 2 AC',power_kw:7.2,cable:'Type 2 cable included',price_basis:'kwh',rate:20,session_minutes:60,max_kwh:7,open_time:'08:00',close_time:'20:00',image:photo.data.url,rights:true};
const created=await req('charging/chargers','POST',offer);assert.equal(created.status,201,JSON.stringify(created.data));const id=created.data.id;
assert.equal((await req('charging/chargers/'+id,'PATCH',{action:'publish',checked:false})).status,400);
assert.equal((await req('charging/chargers/'+id,'PATCH',{action:'publish',checked:true})).status,200);
let catalog=await req('charging/chargers');assert.ok(catalog.data.chargers.some(c=>c.id===id));assert.equal(catalog.data.chargers.find(c=>c.id===id).address,undefined);
const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()+86400000));
const booking={chargerId:id,date,time:'09:00',vehicle_type:'car',vehicle_model:'Local test car',kwh:2,rate_paise:2000,price_basis:'kwh',compatibility:true};
assert.equal((await req('charging/bookings','POST',booking)).status,400,'Own charger rejected');
// Only this local fixture changes owner so the single portable identity can test guest access.
const dir=new URL('../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/',import.meta.url);const names=(await readdir(dir)).filter(n=>/^[a-f0-9]{64}\.sqlite$/.test(n));assert.equal(names.length,1);
const db=new DatabaseSync(new URL(names[0],dir));db.prepare('UPDATE chargers SET owner_id=? WHERE id=?').run('local_other_host',id);
assert.equal((await req('charging/bookings','POST',{...booking,vehicle_type:'bike'})).status,400);
assert.equal((await req('charging/bookings','POST',{...booking,rate_paise:100})).status,409);
assert.equal((await req('charging/bookings','POST',{...booking,kwh:8})).status,400);
const reserved=await req('charging/bookings','POST',booking);assert.equal(reserved.status,201,JSON.stringify(reserved.data));assert.equal(reserved.data.quote_paise,4000);
assert.equal((await req('charging/bookings','POST',booking)).status,409);
assert.equal((await req('charging/bookings/'+reserved.data.id,'PATCH',{action:'accept',compatibility:true})).status,403);
assert.equal((await req('charging/chargers/'+id,'PATCH',{action:'rate',rate:25})).status,403);
let account=(await req('charging/account')).data;assert.equal(account.bookings.find(b=>b.id===reserved.data.id).snapshot.address,undefined);
assert.equal((await req('charging/bookings/'+reserved.data.id,'PATCH',{action:'cancel'})).status,200);
const second=await req('charging/bookings','POST',booking);assert.equal(second.status,201);
// Switch just this fixture to a host-owned request from another local test guest.
db.prepare('UPDATE chargers SET owner_id=? WHERE id=?').run('local_seedy',id);
db.prepare('UPDATE charging_bookings SET host_id=?,guest_id=? WHERE id=?').run('local_seedy','local_test_guest',second.data.id);
assert.equal((await req('charging/bookings/'+second.data.id,'PATCH',{action:'accept'})).status,400);
assert.equal((await req('charging/bookings/'+second.data.id,'PATCH',{action:'accept',compatibility:true})).status,200);
assert.equal((await req('charging/bookings/'+second.data.id,'PATCH',{action:'complete'})).status,409);
assert.equal((await req('charging/chargers/'+id,'PATCH',{action:'rate',rate:25})).status,200);
account=(await req('charging/account')).data;assert.equal(account.bookings.find(b=>b.id===second.data.id).quote_paise,4000);
assert.equal((await req('charging/chargers/'+id,'PATCH',{action:'pause'})).status,200);
assert.ok(!(await req('charging/chargers')).data.chargers.some(c=>c.id===id));
assert.equal((await req('charging/bookings/'+second.data.id,'PATCH',{action:'cancel'})).status,200);
db.close();
console.log('PASS charging API: auth, origin, schema, upload ownership, review gate, public address privacy, own-port protection, vehicle/rate/energy validation, slot overlap, request ownership, cancellation, host acceptance, completion timing, price snapshot and pause. Test charger left paused locally.');

