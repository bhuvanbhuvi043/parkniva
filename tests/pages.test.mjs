import test from 'node:test';
import assert from 'node:assert/strict';
import { publicPath, applicationPath, liveAppPath, LIVE_APP_URL } from '../lib/build-target.ts';

test('Pages routes and assets respect the repository prefix',()=>{
  assert.equal(publicPath('/explore?city=Chennai','/parkthara'),'/parkthara/explore?city=Chennai');
  assert.equal(publicPath('/images/open-parking.jpg','/parkthara'),'/parkthara/images/open-parking.jpg');
  assert.equal(publicPath('https://example.org/x','/parkthara'),'https://example.org/x');
  assert.equal(applicationPath('/parkthara/explore?mode=monthly#map','/parkthara'),'/explore?mode=monthly#map');
  assert.equal(applicationPath('/parkthara/','/parkthara'),'/');
  assert.equal(applicationPath('/parkthara/explore/?mode=monthly#map','/parkthara'),'/explore?mode=monthly#map');
  assert.equal(applicationPath('/parkthara/about/','/parkthara'),'/about');
  assert.equal(applicationPath('/parkthara?mode=daily','/parkthara'),'/?mode=daily');
  assert.equal(applicationPath('/parktharax/explore','/parkthara'),'/parktharax/explore');
});
test('full app handoffs cannot redirect to an attacker-controlled origin',()=>{
  assert.equal(liveAppPath('/explore?city=Chennai'),`${LIVE_APP_URL}/explore?city=Chennai`);
  for(const path of ['//attacker.example/','/\\attacker.example/','https://attacker.example/','/x\r\nLocation:evil'])assert.equal(liveAppPath(path),LIVE_APP_URL);
});
