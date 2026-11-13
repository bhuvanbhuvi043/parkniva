import {database,json,toSpace} from './server';
import {bookingWindow,quoteParking} from './parking';
import {chargingWindow} from './charging';
import {reservationStatus,type MapAvailability} from './map-availability';
export async function mapAvailability(request:Request){
 const p=new URL(request.url).searchParams,kind=p.get('kind'),date=p.get('date')||'',time=p.get('time')||'',mode=p.get('mode')||'hourly',units=Number(p.get('units')||1),now=Date.now();
 const start=Date.parse(`${date}T${time}:00+05:30`);
 if(!['parking','charging'].includes(kind||'')||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!Number.isFinite(start)||new Date(start+19800000).toISOString().slice(0,10)!==date||start<now-60000||start>now+90*86400000||!['hourly','daily','monthly'].includes(mode)||!Number.isInteger(units)||units<1||units>12)return json({error:'Choose a future arrival within 90 days and a valid duration.'},400);
 const db=database(),parking=kind==='parking';
 const rows=await db.prepare(`SELECT * FROM ${parking?'listings':'chargers'} WHERE status='published' ORDER BY created_at DESC LIMIT 500`).all<Record<string,any>>();
 const statuses:Record<string,MapAvailability>={},windows=new Map<string,{start:number;end:number}>();
 for(const r of rows.results||[]){try{let w;if(parking){const s=toSpace(r);quoteParking(s,mode,units);const v=bookingWindow(s,mode,date,time,units);w={start:v.startAt,end:v.endAt};if(w.start<now-60000)throw Error('This parking plan starts earlier today. Choose a later date.');}else w=chargingWindow(r as any,date,time,now);windows.set(r.id,w);}catch(e){statuses[r.id]={status:'unavailable',reason:e instanceof Error?e.message:'Outside host availability.'};}}
 if(windows.size){
 const first=Math.min(...[...windows.values()].map(w=>w.start)),last=Math.max(...[...windows.values()].map(w=>w.end));
 const bookings=await db.prepare(`SELECT ${parking?'listing_id':'charger_id'} AS resource_id,start_at,end_at,status,expires_at FROM ${parking?'bookings':'charging_bookings'} WHERE (status='accepted' OR (status='pending' AND expires_at>?)) AND start_at<? AND end_at>?`).bind(now,last,first).all<any>();
 const blocks=parking?await db.prepare('SELECT listing_id AS resource_id,start_at,end_at FROM availability_blocks WHERE start_at<? AND end_at>?').bind(last,first).all<any>():{results:[]};
 for(const [id,w] of windows)statuses[id]=reservationStatus(w.start,w.end,(bookings.results||[]).filter(b=>b.resource_id===id),(blocks.results||[]).filter(b=>b.resource_id===id),now);
 }
 return json({statuses,checkedAt:now,limit:500});
}
