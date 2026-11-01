const { test } = require('node:test');
const assert = require('node:assert/strict');
const { availableCities, suggestAddresses, attach } = require('../city-facets.js');
const rows = [
  { city: 'Vancouver', address: '105 E Hastings St', date: '2026-10-02' },
  { city: 'Vancouver', address: '105 E Hastings St', date: '2026-10-12' },
  { city: 'Vancouver', address: '126 E Hastings St', date: '2025-07-08' },
  { city: 'Vancouver', address: '300 W 10th Ave', date: '2024-07-08' },
  { city: 'New Westminster', address: '800 Columbia St', date: '2026-05-01' },
  { city: 'Surrey', address: '  ', date: '2026-01-01' },
  { city: '<img src=x onerror=alert(1)>', address: '1 Example St', date: '2026-01-01' }
];
const years = (...values) => new Set(values);

test('city options include bundled Vancouver and cities with actual address data only', () => {
  assert.deepEqual(availableCities([]), ['Vancouver']);
  const cities = availableCities(rows);
  assert.ok(cities.includes('Vancouver'));
  assert.ok(cities.includes('New Westminster'));
  assert.ok(!cities.includes('Surrey'));
});
test('cities are deduplicated without case or whitespace sensitivity', () => {
  assert.deepEqual(availableCities([{ city:'  VANCOUVER  ', address:'1 Main' }, {city:'new westminster', address:'1 First'}, {city:'New Westminster', address:'2 Second'}]), ['New Westminster','Vancouver']);
});
test('autocomplete respects the exact selected city and permit years', () => {
  assert.deepEqual(suggestAddresses(rows,'Vancouver',years('2026'),'hast'), ['105 E Hastings St']);
  assert.deepEqual(suggestAddresses(rows,'Vancouver',years('2025'),'hast'), ['126 E Hastings St']);
  assert.deepEqual(suggestAddresses(rows,'New Westminster',years('2026'),'Columbia'), ['800 Columbia St']);
  assert.deepEqual(suggestAddresses(rows,'Vancouver',years('2026'),'Columbia'), []);
});
test('short or empty query and no selected years never emit suggestions', () => {
  assert.deepEqual(suggestAddresses(rows,'Vancouver',years('2026'),'ha'), []);
  assert.deepEqual(suggestAddresses(rows,'Vancouver',years(),'Hastings'), []);
  assert.deepEqual(suggestAddresses(rows,'',years('2026'),'Hastings'), []);
});
test('suggestion list is deduplicated and capped to 20', () => {
  const many = Array.from({length:100}, (_,id) => ({city:'Vancouver',address:`${id+100} Example Rd`,date:'2026-01-01'}));
  const matches=suggestAddresses(many,'Vancouver',years('2026'),'Example',100);
  assert.equal(matches.length,20);
  assert.equal(new Set(matches).size,20);
});
test('matching is case-insensitive and prefix suggestions sort first', () => {
  const values=suggestAddresses([{city:'Vancouver',address:'300 Main Street',date:'2026-01-01'},{city:'Vancouver',address:'Main Road 200',date:'2026-01-01'}], 'vancouver', years('2026'),'mAIN');
  assert.deepEqual(values,['Main Road 200','300 Main Street']);
});
test('DOM attachment uses text properties and refreshes when permits update', () => {
  const listeners=new Map();
  const make=()=>({value:'',checked:false,children:[],listeners:new Map(),addEventListener(type,fn){this.listeners.set(type,fn)},replaceChildren(...children){this.children=children}});
  const city=make(),search=make(),options=make(),year=make(); year.value='2026';year.checked=true;
  const els={cityChoice:city,search,addressSuggestions:options};
  const doc={getElementById:id=>els[id],querySelectorAll:()=>[year],createElement:()=>make(),addEventListener:(event,fn)=>listeners.set(event,fn)};
  let data=[];attach(doc,()=>data);
  assert.deepEqual(city.children.map(x=>x.value),['','Vancouver']);
  data=[{city:'<img src=x>',address:'103 Example Road',date:'2026-03-03'}];
  listeners.get('scrappy:permits-updated')();
  assert.ok(city.children.find(x=>x.textContent==='<img src=x>'));
  assert.equal(city.children.find(x=>x.value==='<img src=x>').textContent,'<img src=x>');
  city.value='<img src=x>';search.value='Example';search.listeners.get('input')();
  assert.deepEqual(options.children.map(x=>x.value),['103 Example Road']);
});

test('malformed persisted data does not crash facets', () => {
  assert.deepEqual(availableCities({not:'an array'}),['Vancouver']);
  assert.deepEqual(suggestAddresses({},'Vancouver',years('2026'),'Main'),[]);
});
test('selecting a year refreshes suggestions without stale cross-year addresses', () => {
  const listeners=new Map();
  const el=()=>({value:'',checked:false,children:[],listeners:new Map(),addEventListener(t,f){this.listeners.set(t,f)},replaceChildren(...c){this.children=c}});
  const city=el(),search=el(),suggestions=el(),y2025=el(),y2026=el();
  y2025.value='2025';y2025.checked=true;y2026.value='2026';y2026.checked=false;
  const doc={getElementById:id=>({cityChoice:city,search,addressSuggestions:suggestions})[id],querySelectorAll:()=>[y2025,y2026],createElement:el,addEventListener:(t,f)=>listeners.set(t,f)};
  const controller=attach(doc,()=>rows);
  city.value='Vancouver';search.value='Hastings';controller.refreshSuggestions();
  assert.deepEqual(suggestions.children.map(x=>x.value),['126 E Hastings St']);
  y2025.checked=false;y2026.checked=true;y2026.listeners.get('change')();
  assert.deepEqual(suggestions.children.map(x=>x.value),['105 E Hastings St']);
});
test('persisted city selection survives a data refresh', () => {
  const listeners=new Map();
  const el=()=>({value:'',checked:false,children:[],addEventListener(){},replaceChildren(...c){this.children=c}});
  const city=el(),search=el(),suggestions=el();
  const doc={getElementById:id=>({cityChoice:city,search,addressSuggestions:suggestions})[id],querySelectorAll:()=>[],createElement:el,addEventListener:(t,f)=>listeners.set(t,f)};
  let current=rows;attach(doc,()=>current);
  city.value='New Westminster';current=[...rows,{city:'Burnaby',address:'23 Example St'}];
  listeners.get('scrappy:permits-updated')();
  assert.equal(city.value,'New Westminster');
  assert.ok(city.children.some(x=>x.value==='Burnaby'));
});