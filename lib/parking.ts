export type ParkingSpace = {
  id: string; ownerId: string; ownerName: string; title: string; city: string; state: string; area: string;
  address: string; description: string; lat: number; lng: number; parkingType: "open" | "covered" | "garage";
  vehicles: string[]; amenities: string[]; images: string[]; hourlyPrice: number | null; dailyPrice: number | null;
  monthlyPrice: number | null; openTime: string; closeTime: string; days: number[]; length: number; width: number;
  height: number | null; instructions: string; rightsConfirmed: boolean; status: string; reviewNote: string;
  isExample: boolean; createdAt: number;
};
export type Booking = {
  id: string; listing_id: string; guest_id: string; host_id: string; listing_title: string; city: string;
  guest_name: string; guest_email: string; vehicle_plate: string; vehicle_type: string; mode: string; units: number;
  start_at: number; end_at: number; total_paise: number; status: string; message: string; expires_at: number; created_at: number;
};
export type SiteUser = { userId: string; displayName: string; email: string; isAdmin: boolean } | null;
export const CITY_OPTIONS = ["Chennai", "Bengaluru", "Mumbai", "New Delhi", "Hyderabad", "Pune", "Coimbatore", "Kolkata", "Tiruchirappalli", "Madurai", "Salem", "Tiruppur", "Kochi", "Ahmedabad", "Jaipur", "Chandigarh", "Lucknow", "Noida", "Gurugram", "Visakhapatnam", "Bhubaneswar", "Indore", "Nagpur", "Surat"];
export const AMENITIES = [{ id: "cctv", label: "CCTV" }, { id: "guard", label: "Security guard" }, { id: "gated", label: "Gated access" }, { id: "lighting", label: "Well lit" }, { id: "ev", label: "EV charging (host-declared)" }, { id: "accessible", label: "Step-free access" }];
export const money = (value: number, digits = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: digits }).format(value);
export const bookingDate = (value: number) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(value);
export const bookingTime = (value: number) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(value);
export const todayIndia = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export function tomorrowIndia() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(Date.now() + 86400000)); }
export function quoteParking(space: ParkingSpace, mode: string, units: number): number {
  const rate = mode === "hourly" ? space.hourlyPrice : mode === "daily" ? space.dailyPrice : mode === "monthly" ? space.monthlyPrice : null;
  if (rate === null || !Number.isFinite(rate) || rate <= 0) throw new Error("This parking plan is not offered by the host.");
  if (!Number.isInteger(units) || units < 1 || units > (mode === "hourly" ? 12 : mode === "daily" ? 7 : 1)) throw new Error("Choose a valid booking duration.");
  return Math.round(rate * 100) * units;
}
export function bookingWindow(space: ParkingSpace, mode: string, date: string, time: string, units: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) throw new Error("Choose a valid date and arrival time.");
  const startTime = mode === "hourly" ? time : space.openTime;
  const start = new Date(`${date}T${startTime}:00+05:30`);
  if (!Number.isFinite(start.getTime()) || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(start) !== date) throw new Error("Choose a valid calendar date.");
  const weekday = new Date(`${date}T12:00:00+05:30`).getUTCDay();
  if (!space.days.includes(weekday)) throw new Error("The host is not available on this day.");
  let end: Date;
  if (mode === "hourly") {
    end = new Date(start.getTime() + units * 3600000);
    const earliest = Date.parse(`${date}T${space.openTime}:00+05:30`);
    const latest = Date.parse(`${date}T${space.closeTime}:00+05:30`);
    if (start.getTime() < earliest || end.getTime() > latest) throw new Error(`Choose hours between ${space.openTime} and ${space.closeTime}.`);
  } else if (mode === "daily") {
    const dayOffset = new Date(`${date}T12:00:00+05:30`); dayOffset.setUTCDate(dayOffset.getUTCDate() + units - 1);
    end = new Date(`${dayOffset.toISOString().slice(0, 10)}T${space.closeTime}:00+05:30`);
    for (let day = 0; day < units; day++) if (!space.days.includes((weekday + day) % 7)) throw new Error("This daily plan includes a day when the host is unavailable.");
  } else if (mode === "monthly") {
    const parts = date.split("-").map(Number); const monthEnd = new Date(Date.UTC(parts[0], parts[1] + 1, 0)).getUTCDate();
    const next = new Date(Date.UTC(parts[0], parts[1], Math.min(parts[2], monthEnd), 12)); next.setUTCDate(next.getUTCDate() - 1);
    end = new Date(`${next.toISOString().slice(0, 10)}T${space.closeTime}:00+05:30`);
  } else throw new Error("Choose an offered parking plan.");
  return { startAt: start.getTime(), endAt: end.getTime() };
}
export function overlapping(aStart: number, aEnd: number, bStart: number, bEnd: number) { return aStart < bEnd && bStart < aEnd; }
export function filterSpaces(spaces: ParkingSpace[], filters: { city?: string; q?: string; type?: string; vehicle?: string; amenities?: string[]; maxPrice?: number; mode?: string; sort?: string; liveOnly?: boolean }) {
  const mode = filters.mode || "hourly"; const rate = (s: ParkingSpace) => mode === "monthly" ? s.monthlyPrice : mode === "daily" ? s.dailyPrice : s.hourlyPrice;
  let result = spaces.filter(s => { const price = rate(s); const haystack = `${s.title} ${s.city} ${s.state} ${s.area}`.toLowerCase();
    return (!filters.city || filters.city === "All cities" || s.city.toLowerCase() === filters.city.toLowerCase()) && (!filters.q || haystack.includes(filters.q.toLowerCase())) && (!filters.type || filters.type === "all" || s.parkingType === filters.type) && (!filters.vehicle || s.vehicles.includes(filters.vehicle)) && (!filters.amenities?.length || filters.amenities.every(a => s.amenities.includes(a))) && (price !== null) && (!filters.maxPrice || Number(price) <= filters.maxPrice) && (!filters.liveOnly || !s.isExample);
  });
  if (filters.sort === "price-low") result = result.sort((a,b) => Number(rate(a)) - Number(rate(b)));
  if (filters.sort === "price-high") result = result.sort((a,b) => Number(rate(b)) - Number(rate(a)));
  if (filters.sort === "newest") result = result.sort((a,b) => b.createdAt - a.createdAt);
  return result;
}
