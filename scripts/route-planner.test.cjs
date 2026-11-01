const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
function load() {
 const ctx=vm.createContext({ URLSearchParams, console, alert:()=>{}, searchResults:[] });
 vm.runInContext(readFileSync(__dirname+'/../route-planner.js','utf8'),ctx);
 return ctx;
}
const plain=x=>JSON.parse(JSON.stringify(x));
test('ordinary Vancouver street and avenue addresses no longer return null',()=>{
 const c=load();
 for(const address of ['105 Main St','200 E 12th Ave','300 W 10th Ave','400 Fraser St']) {
  const point=c.addressGrid({address,city:'Vancouver'});
  assert.ok(point,address);
  assert.ok(Number.isFinite(point.lat)&&Number.isFinite(point.lon));
 }
});
test('lowercase, extra spaces and City of Vancouver label are normalized',()=>{
 const c=load();
 assert.deepEqual(plain(c.addressGrid({address:'  200   e 12th ave ',city:'City of Vancouver'})),plain(c.addressGrid({address:'200 E 12th Ave',city:'Vancouver'})));
});
test('postal fallback works without a leading street number',()=>{
 const c=load();
 assert.deepEqual(plain(c.addressGrid({address:'Unknown site, Vancouver BC V6A 1A1'})),{lat:49.275,lon:-123.095});
});
test('unknown streets and other cities do not invent Vancouver street positions',()=>{
 const c=load();
 assert.equal(c.addressGrid({address:'123 Imaginary Lane'}),null);
 assert.equal(c.addressGrid({address:'123 Main St',city:'Surrey'}),null);
});
test('invalid, blank and out-of-range coordinates are rejected',()=>{
 const c=load();
 for(const p of [{coordinates:['','']},{latitude:91,longitude:0},{latitude:49,longitude:181},{coordinates:[NaN,-123]},{latitude:null,longitude:-123}])assert.equal(c.geoPoint(p),null);
 assert.deepEqual(plain(c.geoPoint({geo_point_2d:{lat:49.27,lon:-123.1}})),{lat:49.27,lon:-123.1});
});
test('three address-only sites produce an order containing each original site once',()=>{
 const c=load();const items=[{id:1,address:'105 Main St'},{id:2,address:'200 E 12th Ave'},{id:3,address:'400 Fraser St'}];
 const result=c.geographicSweep(items);
 assert.equal(result.length,3);assert.deepEqual(plain(result.map(x=>x.id).sort()),[1,2,3]);
 assert.deepEqual(items.map(x=>x.id),[1,2,3]);
});
test('multi-batch routes preserve order and overlap exactly one connecting site',()=>{
 const c=load();
 for(const count of [0,1,2,8,9,10,16,17,18,25,33]){
  const items=Array.from({length:count},(_,id)=>({id,address:'Example '+id}));
  const batches=plain(c.makeRouteBatches(items));
  assert.ok(batches.every(b=>b.length>=1&&b.length<=9));
  const restored=batches.flatMap((b,i)=>i?b.slice(1):b);
  assert.deepEqual(restored,items);
  for(let i=1;i<batches.length;i++)assert.equal(batches[i-1].at(-1).id,batches[i][0].id);
 }
});
test('a single site opens Maps with a destination and no identical origin',()=>{
 const c=load();const u=new URL(c.batchMapsUrl([{address:'Fictional 1',city:'Vancouver'}]));
 assert.equal(u.searchParams.get('destination'),'Fictional 1, Vancouver, BC');
 assert.equal(u.searchParams.has('origin'),false);assert.equal(u.searchParams.has('waypoints'),false);
});
test('Maps URL preserves multi-stop endpoints and ordered intermediate stops',()=>{
 const c=load();const u=new URL(c.batchMapsUrl([{address:'One'},{address:'Two'},{address:'Three'}]));
 assert.equal(u.searchParams.get('origin'),'One, BC');
 assert.equal(u.searchParams.get('waypoints'),'Two, BC');
 assert.equal(u.searchParams.get('destination'),'Three, BC');
});
test('one and two sites are not described as optimized',()=>{
 const c=load();let seen;
 c.renderRoutePlan=(items,note)=>{seen={items,note};};
 for(const count of [1,2]){
  c.searchResults=Array.from({length:count},(_,id)=>({id,address:'Unknown '+id}));
  c.routeChoice('all');
  assert.match(seen.note,/no route optimization was performed/);
  assert.equal(vm.runInContext('routeBatches.length',c),1);
 }
});
