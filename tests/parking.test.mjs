import test from 'node:test';
import assert from 'node:assert/strict';
import { bookingWindow, quoteParking, overlapping, filterSpaces } from '../lib/parking.ts';

const space = { hourlyPrice: 25.55, dailyPrice: 180, monthlyPrice: 2500, openTime: '07:00', closeTime: '21:00', days: [0,1,2,3,4,5,6], title:'Covered corner',city:'Chennai',state:'Tamil Nadu',area:'Adyar',parkingType:'covered',vehicles:['car'],amenities:['gated'],isExample:false,createdAt:1 };
test('quotes use integer paise and reject unavailable plans or invalid duration',()=>{
  assert.equal(quoteParking(space,'hourly',3),7665);
  assert.equal(quoteParking(space,'monthly',1),250000);
  for(const units of [0,-1,1.5,13]) assert.throws(()=>quoteParking(space,'hourly',units));
  assert.throws(()=>quoteParking({...space,dailyPrice:null},'daily',1));
  assert.throws(()=>quoteParking(space,'monthly',2));
});
test('India booking hours enforce opening and closing boundaries',()=>{
  const valid=bookingWindow(space,'hourly','2026-11-07','19:00',2);
  assert.equal(valid.startAt,Date.parse('2026-11-07T19:00:00+05:30'));
  assert.equal(valid.endAt,Date.parse('2026-11-07T21:00:00+05:30'));
  assert.throws(()=>bookingWindow(space,'hourly','2026-11-07','06:00',1));
  assert.throws(()=>bookingWindow(space,'hourly','2026-11-07','20:00',2));
  assert.throws(()=>bookingWindow(space,'hourly','2026-02-30','09:00',1));
});
test('daily requests reject a closed day inside a multi-day stay',()=>{
  const weekdays={...space,days:[1,2,3,4,5]};
  assert.throws(()=>bookingWindow(weekdays,'daily','2026-11-06','09:00',2));
  const daily=bookingWindow(space,'daily','2026-11-30','09:00',2);
  assert.equal(daily.endAt,Date.parse('2026-12-01T21:00:00+05:30'));
});
test('monthly plans clamp to calendar months including leap years',()=>{
  assert.equal(bookingWindow(space,'monthly','2027-01-31','09:00',1).endAt,Date.parse('2027-02-27T21:00:00+05:30'));
  assert.equal(bookingWindow(space,'monthly','2028-01-31','09:00',1).endAt,Date.parse('2028-02-28T21:00:00+05:30'));
});
test('adjacent reservations are allowed while even partial overlaps are rejected',()=>{
  assert.equal(overlapping(10,20,20,30),false);
  assert.equal(overlapping(10,20,19,30),true);
  assert.equal(overlapping(10,30,15,20),true);
});
test('city, vehicle, amenity, budget and live filters combine',()=>{
  const spaces=[space,{...space,title:'Sample',isExample:true,hourlyPrice:10},{...space,city:'Mumbai',hourlyPrice:50}];
  assert.equal(filterSpaces(spaces,{city:'Chennai',maxPrice:30,vehicle:'car',amenities:['gated'],liveOnly:true}).length,1);
  assert.equal(filterSpaces(spaces,{vehicle:'suv'}).length,0);
  assert.equal(filterSpaces(spaces,{mode:'hourly',sort:'price-low'})[0].title,'Sample');
});
