import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {chargingQuote,chargingWindow,CHARGE_INSERT,CHARGE_ACCEPT,chargingSetup,validateSocketOffer,validateDriverEquipment} from '../lib/charging.ts';
test('outlet requests require the complete portable charger declaration and details',()=>{
 for(const connector of ['230 V AC outlet - 6 A','Manufacturer-approved two-wheeler outlet']){
  assert.throws(()=>validateDriverEquipment(connector,false,'Approved model 230 V 5 A'));
  assert.throws(()=>validateDriverEquipment(connector,true,''));
  assert.doesNotThrow(()=>validateDriverEquipment(connector,true,'Approved model 230 V 5 A'));
 }
 assert.doesNotThrow(()=>validateDriverEquipment('CCS2 DC',false,''));
});
test('outlet listings require electrical details and reject power beyond socket rating',()=>{
 assert.equal(chargingSetup('230 V AC outlet - 6 A'),'socket');
 assert.equal(chargingSetup('Manufacturer-approved two-wheeler outlet'),'socket');
 assert.equal(chargingSetup('Type 2 AC'),'ac');
 assert.equal(chargingSetup('CCS2 DC'),'dc');
 assert.equal(chargingSetup('Unknown plug'),'confirm');
 const details='230 V, 6 A plug, protected dedicated circuit inspected by an electrician';
 assert.doesNotThrow(()=>validateSocketOffer('230 V AC outlet - 6 A',0.9,details));
 assert.throws(()=>validateSocketOffer('230 V AC outlet - 6 A',7.2,details));
 assert.throws(()=>validateSocketOffer('230 V AC outlet - 16 A',7.2,details));
 assert.throws(()=>validateSocketOffer('230 V AC outlet - 6 A',0.9,''));
});
const c={price_basis:'kwh',rate_paise:2025,max_kwh:30,session_minutes:60,open_time:'08:00',close_time:'20:00'};
test('charging quotes use host rates with paise rounding, session fees stay fixed',()=>{
 assert.equal(chargingQuote(c,2.5),5063);assert.equal(chargingQuote({...c,price_basis:'session',rate_paise:6000},2),6000);
 for(const n of [0,-1,NaN,31,Infinity])assert.throws(()=>chargingQuote(c,n));
});
test('India charging slots reject impossible dates, past arrivals and closing overlaps',()=>{
 const now=Date.parse('2026-11-11T00:00:00Z');assert.equal(chargingWindow(c,'2026-11-12','08:00',now).start,Date.parse('2026-11-12T02:30:00Z'));
 for(const [d,t] of [['2026-11-31','09:00'],['2026-11-10','09:00'],['2026-11-12','07:59'],['2026-11-12','19:01'],['2027-11-12','09:00']])assert.throws(()=>chargingWindow(c,d,t,now));
});
function fixture(){const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_tranquil_scarlet_witch.sql',import.meta.url),'utf8'));db.exec(readFileSync(new URL('../drizzle/0001_striped_wither.sql',import.meta.url),'utf8'));db.prepare("INSERT INTO chargers VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run('port','host','Port','Chennai','Adyar','Address','Details','car','Type 2 AC',7.2,'Cable','kwh',2000,60,7,'08:00','20:00','image','published','',100);return db;}
function book(db,{id=crypto.randomUUID(),start=2000,end=3000,expiry=1900,rate=2000}={}){return db.prepare(CHARGE_INSERT).run(id,'port','guest','host','Port','Guest','Car','car',start,end,2,rate,'kwh',rate*2,expiry,1000,'{}','port',rate,'kwh','port',1000,end,start).changes;}
test('charging reserves its own port, excludes overlaps and permits adjacent sessions',()=>{const db=fixture();assert.equal(book(db,{id:'a'}),1);for(const [start,end] of [[2100,2500],[1500,2500],[2500,3500],[1500,3500]])assert.equal(book(db,{start,end}),0);assert.equal(book(db,{start:3000,end:4000}),1);assert.equal(db.prepare('SELECT count(*) n FROM bookings').get().n,0);db.close();});
test('expired holds release the charger and late acceptance cannot steal another reservation',()=>{const db=fixture();assert.equal(book(db,{id:'old',expiry:999}),1);assert.equal(book(db,{id:'new'}),1);assert.equal(db.prepare(CHARGE_ACCEPT).run('old','host',1000,1000).changes,0);assert.equal(db.prepare(CHARGE_ACCEPT).run('new','wrong-host',1000,1000).changes,0);assert.equal(db.prepare(CHARGE_ACCEPT).run('new','host',1000,1000).changes,1);assert.equal(book(db),0);db.close();});
test('rate edits preserve existing quotes, stale rates and paused chargers cannot be booked',()=>{const db=fixture();book(db,{id:'old'});db.exec("UPDATE chargers SET rate_paise=2500");assert.equal(db.prepare('SELECT quote_paise FROM charging_bookings WHERE id=?').get('old').quote_paise,4000);assert.equal(book(db,{start:3000,end:4000}),0);assert.equal(book(db,{start:3000,end:4000,rate:2500}),1);db.exec("UPDATE chargers SET status='paused'");assert.equal(book(db,{start:4000,end:5000,rate:2500}),0);assert.equal(db.prepare(CHARGE_ACCEPT).run('old','host',1000,1000).changes,0);db.close();});
