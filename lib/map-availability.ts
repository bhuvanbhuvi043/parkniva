export type MapStatus = 'available' | 'reserved' | 'held' | 'unavailable' | 'unknown' | 'example';
export const MAP_LABELS: Record<MapStatus,string> = {available:'Available to request',reserved:'Reserved',held:'Request pending',unavailable:'Unavailable',unknown:'Status unknown',example:'Example · not bookable'};
export type MapEntry = {id:string; title:string; area:string; city:string; lat?:number|null; lng?:number|null; price:string; example?:boolean};
export type MapAvailability = {status:MapStatus; reason:string};
export function validPin(lat:unknown,lng:unknown):boolean {return typeof lat==='number'&&typeof lng==='number'&&Number.isFinite(lat)&&Number.isFinite(lng)&&lat>=6&&lat<=38&&lng>=68&&lng<=98;}
export function distanceKm(a:number,b:number,c:number,d:number){const r=Math.PI/180,s=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 6371*2*Math.atan2(Math.sqrt(s),Math.sqrt(Math.max(0,1-s)));}
export function reservationStatus(start:number,end:number,bookings:{start_at:number;end_at:number;status:string;expires_at:number}[],blocks:{start_at:number;end_at:number}[],now:number):MapAvailability{
 const overlaps=(b:{start_at:number;end_at:number})=>b.start_at<end&&b.end_at>start;
 if(bookings.some(b=>b.status==='accepted'&&overlaps(b)))return {status:'reserved',reason:'An accepted booking overlaps this slot. This is a reservation record, not a physical occupancy sensor.'};
 if(blocks.some(overlaps))return {status:'unavailable',reason:'The host blocked this slot.'};
 if(bookings.some(b=>b.status==='pending'&&b.expires_at>now&&overlaps(b)))return {status:'held',reason:'Another request temporarily holds this slot.'};
 return {status:'available',reason:'No conflicting platform reservation found. Host acceptance is required; off-platform occupancy and equipment operation are not monitored.'};
}
