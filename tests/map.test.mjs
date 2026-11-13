import test from 'node:test';
import assert from 'node:assert/strict';
import {reservationStatus,validPin,distanceKm} from '../lib/map-availability.ts';
const b=(status='accepted',expires_at=900)=>({start_at:200,end_at:400,status,expires_at});
test('map distinguishes reservations, active holds, host blocks and released inventory',()=>{
 assert.equal(reservationStatus(250,300,[b()],[],100).status,'reserved');
 assert.equal(reservationStatus(250,300,[b('pending')],[],100).status,'held');
 assert.equal(reservationStatus(250,300,[b('pending',99)],[],100).status,'available');
 assert.equal(reservationStatus(250,300,[b('cancelled')],[],100).status,'available');
 assert.equal(reservationStatus(250,300,[],[b()],100).status,'unavailable');
 assert.equal(reservationStatus(400,500,[b()],[],100).status,'available');
 assert.equal(reservationStatus(100,500,[b()],[],50).status,'reserved');
});
test('missing or invalid coordinates cannot become invented map locations',()=>{
 for(const [lat,lng] of [[null,null],[undefined,undefined],[0,0],[NaN,80],[13,Infinity],['13','80'],[39,80],[13,99]])assert.equal(validPin(lat,lng),false);
 assert.equal(validPin(13.08,80.27),true);
 assert.equal(distanceKm(13,80,13,80),0);
 assert.ok(distanceKm(13,80,14,80)>110&&distanceKm(13,80,14,80)<112);
});
