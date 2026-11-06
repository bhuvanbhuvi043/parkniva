// Run against a fresh loopback portable preview. This creates only local test records.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5174';
assert.ok(['127.0.0.1','localhost','[::1]'].includes(new URL(base).hostname),'Test writes are allowed only on loopback');
let cookie='';
async function req(path,method='GET',body,headers={}){
  const response=await fetch(base+'/api/'+path,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(body instanceof FormData?{}:body?{'Content-Type':'application/json'}:{}),...headers},body:body instanceof FormData?body:body?JSON.stringify(body):undefined});
  const text=await response.text();let data;try{data=JSON.parse(text);}catch{data={error:text};}
  return {status:response.status,data};
}
assert.equal((await req('profile','POST',{displayName:'Local test',phone:'',city:'Chennai',bio:''})).status,401);
const auth=await fetch(base+'/signin-with-chatgpt?return_to=/',{redirect:'manual'});
cookie=auth.headers.get('set-cookie')?.split(';')[0]||'';
assert.ok(cookie,'Portable sign-in did not return a local session');
const session=await req('session');assert.equal(session.data.user.userId,'local_seedy');assert.equal(session.data.user.isAdmin,true);
assert.equal((await req('profile','POST',{displayName:'Local QA Host',phone:'',city:'Chennai',bio:'Local preview test account.'})).status,200);
assert.equal((await req('profile','POST',{displayName:'Local QA',phone:'',city:'Chennai',bio:''},{Origin:'https://unrelated.example'})).status,403);
const invalid=new FormData();invalid.set('file',new File(['not a photo'],'bad.png',{type:'image/png'}));
assert.equal((await req('uploads','POST',invalid)).status,400);
const form=new FormData();form.set('file',new File([await readFile(new URL('../public/images/covered-parking.jpg',import.meta.url))],'local-qa.jpg',{type:'image/jpeg'}));
const uploaded=await req('uploads','POST',form);assert.equal(uploaded.status,201,JSON.stringify(uploaded.data));
const listing={title:'Local QA covered parking',city:'Chennai',state:'Tamil Nadu',area:'Adyar',address:'Illustrative local QA address',description:'A fictional local test space for validating the upload and review flow.',lat:13.00672,lng:80.25621,parkingType:'covered',vehicles:['car','bike'],amenities:['gated'],images:[uploaded.data.url],hourlyPrice:23.45,dailyPrice:180,monthlyPrice:2500,openTime:'07:00',closeTime:'21:00',days:[0,1,2,3,4,5,6],length:5.5,width:2.8,height:2.3,instructions:'Local test only.',rightsConfirmed:true,submit:true};
const submitted=await req('listings','POST',listing);assert.equal(submitted.status,201,JSON.stringify(submitted.data));assert.equal(submitted.data.status,'pending');
const id=submitted.data.id;cookie='';assert.equal((await req('listings/'+id)).status,404);
assert.equal((await fetch(base+uploaded.data.url)).status,404);
cookie=auth.headers.get('set-cookie').split(';')[0];
assert.equal((await req('admin/listings/'+id,'PATCH',{status:'published',note:'Local test review',checked:false})).status,400);
assert.equal((await req('admin/listings/'+id,'PATCH',{status:'published',note:'Local test review',checked:true})).status,200);
assert.equal((await req('listings/'+id,'PUT',{...listing,images:['/api/photos/00000000-0000-4000-8000-000000000000']})).status,400);
cookie='';const publicListing=await req('listings/'+id);assert.equal(publicListing.status,200);assert.equal(publicListing.data.listing.address,'Adyar, Chennai');assert.equal(publicListing.data.listing.lat,13.01);assert.equal(publicListing.data.listing.reviewNote,'');
assert.equal((await fetch(base+uploaded.data.url)).status,200);
cookie=auth.headers.get('set-cookie').split(';')[0];
assert.equal((await req('favorites','POST',{listingId:id,saved:true})).status,200);
const tomorrow=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()+86400000));
const request={listingId:'example-adyar',mode:'hourly',date:tomorrow,time:'09:00',units:3,vehicleType:'car',vehiclePlate:'TN00TEST2',message:'Local test only'};
assert.equal((await req('bookings','POST',{...request,listingId:id})).status,400,'Own-space booking must be rejected');
assert.equal((await req('bookings','POST',{...request,units:13})).status,400);
const booking=await req('bookings','POST',request);assert.equal(booking.status,201,JSON.stringify(booking.data));assert.equal(booking.data.totalPaise,7500);assert.equal(booking.data.status,'demo');
const account=await req('account');assert.ok(account.data.bookings.some(b=>b.id===booking.data.id));assert.ok(account.data.favorites.includes(id));assert.equal(account.data.profile.display_name,'Local QA Host');
assert.equal((await req('bookings/'+booking.data.id,'PATCH',{action:'cancel'})).status,200);
assert.equal((await req('bookings/'+booking.data.id,'PATCH',{action:'cancel'})).status,409);
assert.equal((await req('support','POST',{topic:'Local QA',message:'Testing the internal support inbox in local preview.'})).status,201);
assert.equal((await req('listings/'+id+'/pause','POST')).status,200);
cookie='';assert.equal((await req('listings/'+id)).status,404);
console.log('PASS: anonymous protection, sign-in, origin checks, profile, image validation/storage/access, listing submission/review/privacy, favourites, booking pricing/persistence/cancellation, support and pause.');
