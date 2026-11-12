export type Charger = {
 id:string; owner_id:string; title:string; city:string; area:string; address?:string;
 description:string; vehicle_type:string; connector:string; power_kw:number; cable:string;
 price_basis:'session'|'kwh'; rate_paise:number; session_minutes:number; max_kwh:number;
 open_time:string; close_time:string; image:string; status:string; review_note?:string;
};
export const SOCKET_CONNECTORS=['230 V AC outlet - 5 A','230 V AC outlet - 6 A','230 V AC outlet - 15 A','230 V AC outlet - 16 A'];
export const CONNECTORS=['Type 2 AC','CCS2 DC','CHAdeMO DC','Manufacturer-approved two-wheeler outlet','Other (describe compatibility)',...SOCKET_CONNECTORS];
export function chargingSetup(connector:string){
 if(SOCKET_CONNECTORS.includes(connector)||connector==='Manufacturer-approved two-wheeler outlet')return 'socket';
 if(connector==='Type 2 AC')return 'ac';
 if(connector==='CCS2 DC'||connector==='CHAdeMO DC')return 'dc';
 return 'confirm';
}
export const SETUP_LABELS:Record<string,string>={socket:'Power outlet · bring approved portable charger',ac:'AC charging equipment',dc:'DC charging equipment',confirm:'Equipment needs confirmation'};
export function equipmentNeeded(connector:string){
 const setup=chargingSetup(connector);
 return setup==='socket'?'Bring your complete manufacturer-approved portable charger, not just a loose cable. Match its input plug, voltage and current to this outlet.':setup==='ac'?'Use the host’s AC charging equipment. Check whether its vehicle cable is attached or whether you must bring a compatible charging cable.':setup==='dc'?'Use the station’s compatible DC connector and cable. A portable household charger cannot turn an outlet into DC fast charging.':'Ask the host which charging equipment and cable are provided. Do not assume model compatibility.';
}
export function validateSocketOffer(connector:string,power:number,details:string){
 if(chargingSetup(connector)!=='socket')return;
 if(details.trim().length<20)throw new Error('Describe the outlet rating, plug format, available load and inspected electrical protection.');
 const amps=Number(connector.match(/- (\d+) A$/)?.[1]);
 if(amps&&power>230*amps/1000)throw new Error('Available power exceeds this outlet’s nominal 230 V current rating. Ask your electrical professional to confirm a lower safe continuous limit.');
}
export function validateDriverEquipment(connector:string,ready:boolean,details:string){
 if(chargingSetup(connector)==='socket'&&(!ready||details.trim().length<10))throw new Error('Confirm you will bring your approved portable charger and provide its model and input rating for the host to check.');
}
export function chargingQuote(c:Pick<Charger,'price_basis'|'rate_paise'|'max_kwh'>,kwh:number){
 if(!Number.isFinite(kwh)||kwh<=0||kwh>c.max_kwh)throw new Error('Choose energy within the charger session limit.');
 return c.price_basis==='session'?c.rate_paise:Math.round(c.rate_paise*kwh);
}
export function chargingWindow(c:Pick<Charger,'open_time'|'close_time'|'session_minutes'>,date:string,time:string,now=Date.now()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Choose a valid date and time.');
 const start=Date.parse(`${date}T${time}:00+05:30`),end=start+c.session_minutes*60000;
 if(!Number.isFinite(start)||new Date(start+19800000).toISOString().slice(0,10)!==date||start<=now||start>now+90*86400000)throw new Error('Choose a future date within 90 days.');
 if(start<Date.parse(`${date}T${c.open_time}:00+05:30`)||end>Date.parse(`${date}T${c.close_time}:00+05:30`))throw new Error('Choose a slot fully within the charger opening hours.');
 return {start,end};
}
// One listing represents one physical port and its dedicated charging bay.
export const CHARGE_INSERT="INSERT INTO charging_bookings(id,charger_id,guest_id,host_id,title,guest_name,vehicle_model,vehicle_type,start_at,end_at,requested_kwh,rate_paise,price_basis,quote_paise,status,expires_at,created_at,snapshot) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',?,?,? WHERE EXISTS(SELECT 1 FROM chargers WHERE id=? AND status='published' AND rate_paise=? AND price_basis=?) AND NOT EXISTS(SELECT 1 FROM charging_bookings WHERE charger_id=? AND (status='accepted' OR (status='pending' AND expires_at>?)) AND start_at<? AND end_at>?)";
export const CHARGE_ACCEPT="UPDATE charging_bookings SET status='accepted' WHERE id=? AND host_id=? AND status='pending' AND expires_at>? AND start_at>? AND EXISTS(SELECT 1 FROM chargers WHERE id=charging_bookings.charger_id AND status='published') AND NOT EXISTS(SELECT 1 FROM charging_bookings other WHERE other.charger_id=charging_bookings.charger_id AND other.id!=charging_bookings.id AND other.status='accepted' AND other.start_at<charging_bookings.end_at AND other.end_at>charging_bookings.start_at)";
