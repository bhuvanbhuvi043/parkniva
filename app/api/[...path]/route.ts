import { env } from "cloudflare:workers";
import { z } from "zod";
import { database, identity, json, sameOrigin, toSpace } from "../../../lib/server";
import { EXAMPLE_SPACES } from "../../../lib/examples";
import { bookingWindow, quoteParking } from "../../../lib/parking";
export const dynamic = "force-dynamic";
const short = (max = 160) => z.string().trim().max(max);
const listingSchema = z.object({ title: short(100).min(3), city: short(70).min(2), state: short(70).min(2), area: short(100).default(""), address: short(250).default(""), description: short(1800).default(""), lat: z.number().min(6).max(38), lng: z.number().min(68).max(98), parkingType: z.enum(["open", "covered", "garage"]), vehicles: z.array(z.enum(["car","suv","bike"])).min(1).max(3), amenities: z.array(z.enum(["cctv","guard","gated","lighting","ev","accessible"])).max(6), images: z.array(z.string().regex(/^\/api\/photos\/[a-f0-9-]+$/)).max(6), hourlyPrice: z.number().min(1).max(10000).nullable(), dailyPrice: z.number().min(1).max(100000).nullable(), monthlyPrice: z.number().min(1).max(1000000).nullable(), openTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), closeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), days: z.array(z.number().int().min(0).max(6)).min(1).max(7), length: z.number().min(1).max(30), width: z.number().min(0.8).max(20), height: z.number().min(1).max(10).nullable(), instructions: short(800).default(""), rightsConfirmed: z.boolean(), submit: z.boolean().default(false) }).refine(d => d.openTime < d.closeTime, "Closing time must be after opening time.").refine(d => d.hourlyPrice !== null || d.dailyPrice !== null || d.monthlyPrice !== null, "Add at least one parking price.");
async function body(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 40000) throw new Error("This request is too large.");
  const reader=request.body?.getReader();if(!reader)throw new Error("Choose a valid JSON request.");
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>40000){await reader.cancel();throw new Error("This request is too large.");}chunks.push(chunk.value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Error("Choose a valid JSON request.");}
}
async function handle(request: Request) {
  const url = new URL(request.url); const p = url.pathname.replace(/^\/api\//, "").split("/").filter(Boolean); const method = request.method;
  if (method !== "GET" && !sameOrigin(request)) return json({ error: "This request is not permitted." }, 403);
  const user = await identity();
  if (p[0] === "session" && method === "GET") return json({ user });
  if (p[0] === "health" && method === "GET") return json({ status: "ok", paymentsEnabled: false });
  const db = database();
  if (p[0] === "listings" && method === "GET") {
    if (p[1]) {
      const example = EXAMPLE_SPACES.find(s => s.id === p[1]); if (example) return json({ listing: example });
      const row = await db.prepare("SELECT * FROM listings WHERE id = ?").bind(p[1]).first<Record<string, unknown>>();
      const accepted = user && await db.prepare("SELECT id FROM bookings WHERE listing_id = ? AND guest_id = ? AND status = 'accepted' AND end_at > ? LIMIT 1").bind(p[1], user.userId, Date.now()).first();
      if (!row || (row.status !== "published" && row.owner_id !== user?.userId && !user?.isAdmin && !accepted)) return json({ error: "This space is unavailable." }, 404);
      return json({ listing: toSpace(row, Boolean(accepted || row.owner_id === user?.userId || user?.isAdmin)) });
    }
    const rows = await db.prepare("SELECT * FROM listings WHERE status = 'published' ORDER BY created_at DESC LIMIT 500").all<Record<string, unknown>>();
    return json({ listings: [...(rows.results || []).map(r => toSpace(r)), ...EXAMPLE_SPACES] });
  }
  if (p[0] === "photos" && p[1] && method === "GET") {
    const upload = await db.prepare("SELECT * FROM uploads WHERE id = ?").bind(p[1]).first<Record<string, unknown>>();
    if (!upload || !env.BUCKET) return json({ error: "Photo not found." },404);
    const published = await db.prepare("SELECT id FROM listings WHERE status = 'published' AND images LIKE ? LIMIT 1").bind(`%/api/photos/${p[1]}%`).first();
    const guestAccess = user && await db.prepare("SELECT l.id FROM listings l JOIN bookings b ON b.listing_id=l.id WHERE l.images LIKE ? AND b.guest_id=? AND b.status='accepted' AND b.end_at>? LIMIT 1").bind(`%/api/photos/${p[1]}%`,user.userId,Date.now()).first();
    if (!published && upload.owner_id !== user?.userId && !user?.isAdmin && !guestAccess) return json({ error: "Photo not found." },404);
    const object = await env.BUCKET.get(String(upload.object_key)); if (!object) return json({ error: "Photo not found." },404);
    return new Response(object.body, { headers: { "Content-Type": String(upload.content_type), "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff" } });
  }
  if (!user) return json({ error: "Sign in to continue.", signIn: "/signin-with-chatgpt?return_to=/dashboard" }, 401);
  if (p[0] === "account" && method === "GET") {
    const [owned, requested, hosted, saved, profile, blocked] = await Promise.all([ db.prepare("SELECT * FROM listings WHERE owner_id = ? ORDER BY created_at DESC").bind(user.userId).all<Record<string, unknown>>(), db.prepare("SELECT * FROM bookings WHERE guest_id = ? ORDER BY created_at DESC LIMIT 200").bind(user.userId).all(), db.prepare("SELECT * FROM bookings WHERE host_id = ? ORDER BY created_at DESC LIMIT 200").bind(user.userId).all(), db.prepare("SELECT listing_id FROM favorites WHERE user_id = ?").bind(user.userId).all<{listing_id:string}>(), db.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(user.userId).first(), db.prepare("SELECT * FROM availability_blocks WHERE owner_id = ? ORDER BY start_at").bind(user.userId).all() ]);
    return json({ listings: (owned.results||[]).map(r=>toSpace(r,true)), bookings: requested.results||[], hostedBookings: hosted.results||[], favorites: (saved.results||[]).map(s=>s.listing_id), profile, blocks: blocked.results||[] });
  }
  if (p[0] === "profile" && method === "POST") {
    const data = z.object({ displayName: short(70).min(2), phone: z.string().trim().regex(/^(\+?[0-9 -]{8,18})?$/), city: short(70), bio: short(500) }).parse(await body(request));
    await db.prepare("INSERT INTO profiles(user_id,display_name,phone,city,bio,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name,phone=excluded.phone,city=excluded.city,bio=excluded.bio,updated_at=excluded.updated_at").bind(user.userId,data.displayName,data.phone,data.city,data.bio,Date.now()).run(); return json({ success: true });
  }
  if (p[0] === "favorites" && method === "POST") {
    const data=z.object({ listingId: short(80).min(3), saved:z.boolean() }).parse(await body(request)); const exists=EXAMPLE_SPACES.some(s=>s.id===data.listingId) || await db.prepare("SELECT id FROM listings WHERE id = ? AND status = 'published'").bind(data.listingId).first(); if(!exists)return json({error:"This space is unavailable."},404);
    if(data.saved) await db.prepare("INSERT OR IGNORE INTO favorites(user_id,listing_id,created_at) VALUES(?,?,?)").bind(user.userId,data.listingId,Date.now()).run(); else await db.prepare("DELETE FROM favorites WHERE user_id = ? AND listing_id = ?").bind(user.userId,data.listingId).run(); return json({ success:true, saved:data.saved });
  }
  if (p[0] === "uploads" && method === "POST") {
    if(!env.BUCKET)return json({error:"Photo uploads are temporarily unavailable."},503);
    const recent=await db.prepare("SELECT COUNT(*) AS n FROM uploads WHERE owner_id = ? AND created_at > ?").bind(user.userId,Date.now()-86400000).first<{n:number}>(); if((recent?.n||0)>=30)return json({error:"You have reached today's photo upload limit."},429);
    if(Number(request.headers.get("content-length")||0)>5*1024*1024)return json({error:"Use a photo smaller than 4 MB."},400);
    const form=await request.formData(); const file=form.get("file"); if(!(file instanceof File)||file.size===0||file.size>4*1024*1024)return json({error:"Choose a JPEG, PNG or WebP photo under 4 MB."},400);
    const bytes=new Uint8Array(await file.arrayBuffer()); const type=bytes[0]===255&&bytes[1]===216&&bytes[2]===255?"image/jpeg":bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71?"image/png":String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP"?"image/webp":null; if(!type)return json({error:"This file is not a supported photograph."},400);
    const id=crypto.randomUUID(),key=`photos/${user.userId}/${id}`; await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:type}}); await db.prepare("INSERT INTO uploads(id,owner_id,object_key,content_type,created_at) VALUES(?,?,?,?,?)").bind(id,user.userId,key,type,Date.now()).run(); return json({url:`/api/photos/${id}`},201);
  }
  if (p[0] === "listings" && (method === "POST" || method === "PUT") && !p[2]) {
    const data=listingSchema.parse(await body(request)); const id=p[1] || crypto.randomUUID();
    if(method==="PUT") { const prior=await db.prepare("SELECT owner_id FROM listings WHERE id = ?").bind(id).first<{owner_id:string}>(); if(!prior||prior.owner_id!==user.userId)return json({error:"You cannot edit this space."},403); }
    else { const count=await db.prepare("SELECT COUNT(*) AS n FROM listings WHERE owner_id = ?").bind(user.userId).first<{n:number}>(); if((count?.n||0)>=30)return json({error:"Please contact support to add more than 30 spaces."},429); }
    if(data.submit&&(!data.rightsConfirmed||!data.images.length||!data.address||!data.area||data.description.length<30))return json({error:"Add a photo, full address, area, description and permission confirmation before submitting."},400);
    for(const image of data.images) { const own=await db.prepare("SELECT id FROM uploads WHERE id = ? AND owner_id = ?").bind(image.split("/").pop(),user.userId).first();if(!own)return json({error:"Use photographs uploaded from your account."},400); }
    const profile=await db.prepare("SELECT display_name FROM profiles WHERE user_id = ?").bind(user.userId).first<{display_name:string}>(); const publicName=profile?.display_name||user.fullName||"Parkniva host";
    const values=[publicName,data.title,data.city,data.state,data.area,data.address,data.description,data.lat,data.lng,data.parkingType,JSON.stringify(data.vehicles),JSON.stringify(data.amenities),JSON.stringify(data.images),data.hourlyPrice===null?null:Math.round(data.hourlyPrice*100),data.dailyPrice===null?null:Math.round(data.dailyPrice*100),data.monthlyPrice===null?null:Math.round(data.monthlyPrice*100),data.openTime,data.closeTime,JSON.stringify(data.days),data.length,data.width,data.height,data.instructions,data.rightsConfirmed?1:0,data.submit?"pending":"draft",Date.now()];
    if(method==="PUT")await db.prepare("UPDATE listings SET owner_name=?,title=?,city=?,state=?,area=?,address=?,description=?,lat=?,lng=?,parking_type=?,vehicles=?,amenities=?,images=?,hourly_paise=?,daily_paise=?,monthly_paise=?,open_time=?,close_time=?,days=?,length=?,width=?,height=?,instructions=?,rights_confirmed=?,status=?,review_note='',updated_at=? WHERE id=? AND owner_id=?").bind(...values,id,user.userId).run();
    else await db.prepare("INSERT INTO listings(owner_name,title,city,state,area,address,description,lat,lng,parking_type,vehicles,amenities,images,hourly_paise,daily_paise,monthly_paise,open_time,close_time,days,length,width,height,instructions,rights_confirmed,status,updated_at,id,owner_id,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(...values,id,user.userId,Date.now()).run(); return json({success:true,id,status:data.submit?"pending":"draft"},201);
  }
  if(p[0]==="listings"&&p[1]&&p[2]==="pause"&&method==="POST") { const row=await db.prepare("SELECT owner_id FROM listings WHERE id = ?").bind(p[1]).first<{owner_id:string}>();if(!row||row.owner_id!==user.userId)return json({error:"You cannot change this space."},403);await db.prepare("UPDATE listings SET status='paused',updated_at=? WHERE id=?").bind(Date.now(),p[1]).run();return json({success:true}); }
  if(p[0]==="bookings"&&method==="POST"&&!p[1]) {
    const data=z.object({listingId:short(80),mode:z.enum(["hourly","daily","monthly"]),date:short(12),time:short(5),units:z.number().int(),vehicleType:z.enum(["car","suv","bike"]),vehiclePlate:z.string().trim().toUpperCase().regex(/^[A-Z0-9 -]{4,15}$/),message:short(500).default("")}).parse(await body(request)); const example=EXAMPLE_SPACES.find(s=>s.id===data.listingId);
    const row=example?null:await db.prepare("SELECT * FROM listings WHERE id = ? AND status = 'published'").bind(data.listingId).first<Record<string,unknown>>(); if(!example&&!row)return json({error:"This space is no longer available."},404);
    const space=example || toSpace(row!,true);if(space.ownerId===user.userId)return json({error:"You cannot request your own space."},400);if(!space.vehicles.includes(data.vehicleType))return json({error:"The host does not offer this vehicle category."},400);
    const total=quoteParking(space,data.mode,data.units);const {startAt,endAt}=bookingWindow(space,data.mode,data.date,data.time,data.units);if(startAt<Date.now()-60000||startAt>Date.now()+183*86400000||endAt<=startAt)return json({error:"Choose a future arrival within the next six months."},400);
    const recent=await db.prepare("SELECT COUNT(*) AS n FROM bookings WHERE guest_id=? AND created_at > ?").bind(user.userId,Date.now()-86400000).first<{n:number}>();if((recent?.n||0)>=20)return json({error:"You have reached today's booking request limit."},429);
    const id=`PN-${crypto.randomUUID().slice(0,8).toUpperCase()}`,now=Date.now(),status=example?"demo":"pending";const values=[id,space.id,user.userId,space.ownerId,space.title,space.city,user.displayName,user.email,data.vehiclePlate,data.vehicleType,data.mode,data.units,startAt,endAt,total,status,data.message,now+86400000,now];
    const fields="id,listing_id,guest_id,host_id,listing_title,city,guest_name,guest_email,vehicle_plate,vehicle_type,mode,units,start_at,end_at,total_paise,status,message,expires_at,created_at";
    const query=example?`INSERT INTO bookings(${fields}) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`:`INSERT INTO bookings(${fields}) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM bookings WHERE listing_id=? AND (status='accepted' OR (status='pending' AND expires_at>?)) AND start_at<? AND end_at>?) AND NOT EXISTS(SELECT 1 FROM availability_blocks WHERE listing_id=? AND start_at<? AND end_at>?)`;
    const result=await db.prepare(query).bind(...values,...(example?[]:[space.id,now,endAt,startAt,space.id,endAt,startAt])).run();if(!result.meta.changes)return json({error:"These dates were just reserved or blocked. Please choose another time."},409);return json({success:true,id,status,totalPaise:total},201);
  }
  if(p[0]==="bookings"&&p[1]&&method==="PATCH") {
    const {action}=z.object({action:z.enum(["accept","decline","cancel"])}).parse(await body(request));const b=await db.prepare("SELECT * FROM bookings WHERE id=?").bind(p[1]).first<Record<string,unknown>>();if(!b)return json({error:"Booking not found."},404);
    const host=b.host_id===user.userId;const guest=b.guest_id===user.userId;if(action==="cancel"&&!guest&&!host)return json({error:"You cannot change this booking."},403);if(action!=="cancel"&&!host)return json({error:"Only the host can respond to this request."},403);
    if(["cancelled","declined","expired"].includes(String(b.status))||(action!=="cancel"&&(b.status!=="pending"||Number(b.expires_at)<Date.now())))return json({error:"This request can no longer be changed."},409);
    const status=action==="accept"?"accepted":action==="decline"?"declined":"cancelled";
    const result=action==="accept"
      ? await db.prepare("UPDATE bookings SET status='accepted' WHERE id=? AND status='pending' AND expires_at>? AND start_at>? AND NOT EXISTS(SELECT 1 FROM bookings other WHERE other.listing_id=bookings.listing_id AND other.id!=bookings.id AND other.status='accepted' AND other.start_at<bookings.end_at AND other.end_at>bookings.start_at) AND NOT EXISTS(SELECT 1 FROM availability_blocks block WHERE block.listing_id=bookings.listing_id AND block.start_at<bookings.end_at AND block.end_at>bookings.start_at)").bind(p[1],Date.now(),Date.now()).run()
      : await db.prepare("UPDATE bookings SET status=? WHERE id=? AND status=?").bind(status,p[1],b.status).run();
    if(!result.meta.changes)return json({error:"This request has changed or is no longer available. Refresh your bookings."},409);
    return json({success:true,status});
  }
  if(p[0]==="blocks"&&method==="POST") {
    const data=z.object({listingId:short(80),startAt:z.number().int(),endAt:z.number().int(),reason:short(120).default("")}).parse(await body(request));const l=await db.prepare("SELECT owner_id FROM listings WHERE id=?").bind(data.listingId).first<{owner_id:string}>();if(!l||l.owner_id!==user.userId)return json({error:"You cannot change this calendar."},403);if(data.endAt<=data.startAt||data.endAt-data.startAt>366*86400000)return json({error:"Choose a valid date range of up to one year."},400);
    const result=await db.prepare("INSERT INTO availability_blocks(id,listing_id,owner_id,start_at,end_at,reason) SELECT ?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM bookings WHERE listing_id=? AND (status='accepted' OR (status='pending' AND expires_at>?)) AND start_at<? AND end_at>?)").bind(crypto.randomUUID(),data.listingId,user.userId,data.startAt,data.endAt,data.reason,data.listingId,Date.now(),data.endAt,data.startAt).run();if(!result.meta.changes)return json({error:"This period includes an active reservation. Resolve it before blocking these dates."},409);return json({success:true},201);
  }
  if(p[0]==="blocks"&&p[1]&&method==="DELETE") { await db.prepare("DELETE FROM availability_blocks WHERE id=? AND owner_id=?").bind(p[1],user.userId).run();return json({success:true}); }
  if(p[0]==="support"&&method==="POST") {
    const data=z.object({topic:short(100).min(2),message:short(2500).min(10)}).parse(await body(request));const count=await db.prepare("SELECT COUNT(*) AS n FROM support_tickets WHERE user_id=? AND created_at>?").bind(user.userId,Date.now()-86400000).first<{n:number}>();if((count?.n||0)>=10)return json({error:"Please wait before sending another support request."},429);const id=crypto.randomUUID();await db.prepare("INSERT INTO support_tickets(id,user_id,email,topic,message,status,created_at) VALUES(?,?,?,?,?,'open',?)").bind(id,user.userId,user.email,data.topic,data.message,Date.now()).run();return json({success:true,id},201);
  }
  if(p[0]==="admin") {
    if(!user.isAdmin)return json({error:"You do not have access to listing review."},403);
    if(method==="GET") { const [spaces,tickets]=await Promise.all([db.prepare("SELECT * FROM listings ORDER BY created_at DESC LIMIT 300").all<Record<string,unknown>>(),db.prepare("SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 100").all()]);return json({listings:(spaces.results||[]).map(r=>toSpace(r,true)),tickets:tickets.results||[]}); }
    if(method==="PATCH"&&p[1]==="listings"&&p[2]) {const data=z.object({status:z.enum(["published","rejected","pending"]),note:short(500),checked:z.boolean()}).parse(await body(request));const l=await db.prepare("SELECT rights_confirmed,images,status FROM listings WHERE id=?").bind(p[2]).first<Record<string,unknown>>();if(!l)return json({error:"Listing not found."},404);if(data.status==="published"&&(!data.checked||!l.rights_confirmed||JSON.parse(String(l.images)).length===0))return json({error:"Confirm the permission, photographs and access review before publishing."},400);await db.prepare("UPDATE listings SET status=?,review_note=?,updated_at=? WHERE id=?").bind(data.status,data.note,Date.now(),p[2]).run();return json({success:true});}
    if(method==="PATCH"&&p[1]==="tickets"&&p[2]) {await db.prepare("UPDATE support_tickets SET status='resolved' WHERE id=?").bind(p[2]).run();return json({success:true});}
  }
  return json({error:"This page could not be found."},404);
}
async function safe(request:Request) {try{return await handle(request);}catch(error){if(error instanceof z.ZodError)return json({error:error.issues.map(i=>i.message).slice(0,3).join(" ")},400);const message=error instanceof Error?error.message:"Please try again.";if(/Choose|host|parking plan|Closing|price|date|duration|valid|request is too large/.test(message))return json({error:message},400);console.error("Parkniva API",error);return json({error:"We could not complete that request. Please try again shortly."},500);}}
export const GET=safe;export const POST=safe;export const PUT=safe;export const PATCH=safe;export const DELETE=safe;
