import {z} from 'zod';
import {database,identity,json} from './server';
import {chargingQuote,chargingWindow,CHARGE_INSERT,CHARGE_ACCEPT,CONNECTORS,type Charger} from './charging';
const text=(n:number)=>z.string().trim().min(1).max(n);
const clock=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const schema=z.object({title:text(100),city:text(70),area:text(100),address:text(250),description:text(1800),vehicle_type:z.enum(['car','bike']),connector:z.enum(CONNECTORS as [string,...string[]]),power_kw:z.number().positive().max(500),cable:text(200),price_basis:z.enum(['session','kwh']),rate:z.number().min(0.01).max(10000),session_minutes:z.number().int().min(15).max(720),max_kwh:z.number().positive().max(300),open_time:clock,close_time:clock,image:z.string().regex(/^\/api\/photos\/[a-f0-9-]+$/),rights:z.literal(true)}).refine(d=>d.open_time<d.close_time,'Choose closing time after opening time.').refine(d=>{const m=(s:string)=>Number(s.slice(0,2))*60+Number(s.slice(3));return d.session_minutes<=m(d.close_time)-m(d.open_time);},'Session duration must fit opening hours.');
export async function chargingApi(request:Request,p:string[],user:Awaited<ReturnType<typeof identity>>,body:(r:Request)=>Promise<any>){
 const db=database(),method=request.method,now=Date.now();
 if(p[1]==='chargers'&&method==='GET'){
  const rows=await db.prepare("SELECT id,owner_id,title,city,area,description,vehicle_type,connector,power_kw,cable,price_basis,rate_paise,session_minutes,max_kwh,open_time,close_time,image,status FROM chargers WHERE status='published' ORDER BY created_at DESC LIMIT 500").all();return json({chargers:rows.results||[]});
 }
 if(!user)return json({error:'Sign in to use charging bookings.'},401);
 if(p[1]==='account'&&method==='GET'){
  const [owned,bookings,review]=await Promise.all([db.prepare('SELECT * FROM chargers WHERE owner_id=? ORDER BY created_at DESC').bind(user.userId).all(),db.prepare('SELECT * FROM charging_bookings WHERE guest_id=? OR host_id=? ORDER BY created_at DESC LIMIT 300').bind(user.userId,user.userId).all<Record<string,unknown>>(),user.isAdmin?db.prepare("SELECT * FROM chargers WHERE status='pending' ORDER BY created_at").all():Promise.resolve({results:[]})]);
  const safe=(bookings.results||[]).map(b=>{const snap=JSON.parse(String(b.snapshot));if(b.status!=='accepted'&&b.status!=='completed'&&b.host_id!==user.userId)delete snap.address;return {...b,snapshot:snap,status:b.status==='pending'&&Number(b.expires_at)<=now?'expired':b.status};});
  return json({chargers:owned.results||[],bookings:safe,review:review.results||[]});
 }
 if(p[1]==='chargers'&&!p[2]&&method==='POST'){
  const d=schema.parse(await body(request));
  const count=await db.prepare('SELECT COUNT(*) AS n FROM chargers WHERE owner_id=?').bind(user.userId).first<{n:number}>();if((count?.n||0)>=50)return json({error:'Please contact support before adding more charging ports.'},429);
  const uploaded=await db.prepare('SELECT id FROM uploads WHERE id=? AND owner_id=?').bind(d.image.split('/').pop(),user.userId).first();if(!uploaded)return json({error:'Upload your own equipment photograph.'},400);
  const id=crypto.randomUUID();await db.prepare("INSERT INTO chargers(id,owner_id,title,city,area,address,description,vehicle_type,connector,power_kw,cable,price_basis,rate_paise,session_minutes,max_kwh,open_time,close_time,image,status,review_note,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending','',?)").bind(id,user.userId,d.title,d.city,d.area,d.address,d.description,d.vehicle_type,d.connector,d.power_kw,d.cable,d.price_basis,Math.round(d.rate*100),d.session_minutes,d.max_kwh,d.open_time,d.close_time,d.image,now).run();return json({id,status:'pending'},201);
 }
 if(p[1]==='chargers'&&p[2]&&method==='PATCH'){
  const d=z.object({action:z.enum(['pause','submit','publish','reject','rate']),rate:z.number().positive().max(10000).optional(),checked:z.boolean().default(false),note:z.string().trim().max(500).default('')}).parse(await body(request));
  const c=await db.prepare('SELECT * FROM chargers WHERE id=?').bind(p[2]).first<Charger>();if(!c)return json({error:'Charger not found.'},404);
  if(d.action==='rate'){
   if(c.owner_id!==user.userId)return json({error:'This charger belongs to another host.'},403);
   if(d.rate===undefined||Math.round(d.rate*100)<1)return json({error:'Choose a positive rate.'},400);
   await db.prepare('UPDATE chargers SET rate_paise=? WHERE id=?').bind(Math.round(d.rate*100),c.id).run();return json({success:true});
  }
  if(d.action==='publish'||d.action==='reject'){
   if(!user.isAdmin)return json({error:'Only a reviewer can publish chargers.'},403);
   if(d.action==='publish'&&!d.checked)return json({error:'Review equipment, installation, permission, pricing and dedicated bay before publishing.'},400);
  }else if(c.owner_id!==user.userId)return json({error:'This charger belongs to another host.'},403);
  const status=d.action==='publish'?'published':d.action==='reject'?'rejected':d.action==='pause'?'paused':'pending';
  await db.prepare('UPDATE chargers SET status=?,review_note=? WHERE id=?').bind(status,d.note,p[2]).run();return json({status});
 }
 if(p[1]==='bookings'&&!p[2]&&method==='POST'){
  const d=z.object({chargerId:text(80),date:text(10),time:text(5),vehicle_type:z.enum(['car','bike']),vehicle_model:text(100),kwh:z.number().positive().max(300),rate_paise:z.number().int().positive(),price_basis:z.enum(['session','kwh']),compatibility:z.literal(true)}).parse(await body(request));
  const c=await db.prepare("SELECT * FROM chargers WHERE id=? AND status='published'").bind(d.chargerId).first<Charger>();if(!c)return json({error:'This charger is not accepting bookings.'},404);
  if(c.owner_id===user.userId)return json({error:'You cannot book your own charger.'},400);
  if(c.vehicle_type!==d.vehicle_type)return json({error:'Choose a charger for this vehicle type.'},400);
  if(c.rate_paise!==d.rate_paise||c.price_basis!==d.price_basis)return json({error:'The rate changed. Refresh and review the new price.'},409);
  const count=await db.prepare('SELECT COUNT(*) AS n FROM charging_bookings WHERE guest_id=? AND created_at>?').bind(user.userId,now-86400000).first<{n:number}>();if((count?.n||0)>=20)return json({error:'Daily charging request limit reached.'},429);
  const {start,end}=chargingWindow(c,d.date,d.time,now),quote=chargingQuote(c,d.kwh),id=crypto.randomUUID(),expiry=Math.min(start,now+2*3600000);
  const snapshot=JSON.stringify({address:c.address,city:c.city,area:c.area,connector:c.connector,power_kw:c.power_kw,cable:c.cable,description:c.description,session_minutes:c.session_minutes,max_kwh:c.max_kwh});
  const r=await db.prepare(CHARGE_INSERT).bind(id,c.id,user.userId,c.owner_id,c.title,user.displayName||'Driver',d.vehicle_model,d.vehicle_type,start,end,d.kwh,c.rate_paise,c.price_basis,quote,expiry,now,snapshot,c.id,c.rate_paise,c.price_basis,c.id,now,end,start).run();
  if(!r.meta.changes)return json({error:'This slot or rate is no longer available. Choose another time or refresh.'},409);
  return json({id,quote_paise:quote,status:'pending'},201);
 }
 if(p[1]==='bookings'&&p[2]&&method==='PATCH'){
  const d=z.object({action:z.enum(['accept','decline','cancel','complete']),compatibility:z.boolean().default(false)}).parse(await body(request));const b=await db.prepare('SELECT * FROM charging_bookings WHERE id=?').bind(p[2]).first<Record<string,any>>();if(!b)return json({error:'Charging request not found.'},404);
  const host=b.host_id===user.userId,guest=b.guest_id===user.userId;
  if((d.action!=='cancel'&&!host)||(d.action==='cancel'&&!host&&!guest))return json({error:'You cannot change this charging request.'},403);
  if(d.action==='accept'&&!d.compatibility)return json({error:'Confirm vehicle compatibility and a working, dedicated port before accepting.'},400);
  const valid=d.action==='accept'||d.action==='decline'?b.status==='pending'&&b.expires_at>now&&b.start_at>now:d.action==='complete'?b.status==='accepted'&&b.end_at<=now:['pending','accepted'].includes(b.status)&&b.start_at>now;
  if(!valid)return json({error:'This request can no longer be changed with that action.'},409);
  const status=d.action==='accept'?'accepted':d.action==='decline'?'declined':d.action==='complete'?'completed':'cancelled';
  const r=d.action==='accept'?await db.prepare(CHARGE_ACCEPT).bind(b.id,user.userId,now,now).run():await db.prepare('UPDATE charging_bookings SET status=? WHERE id=? AND status=?').bind(status,b.id,b.status).run();if(!r.meta.changes)return json({error:'Request changed. Refresh and try again.'},409);return json({status});
 }
 return json({error:'Charging endpoint not found.'},404);
}
