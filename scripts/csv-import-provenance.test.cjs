const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const api=require('../csv-import-provenance.js');
const headers=['Civic Address','Municipality','Permit Number','Issue Date','TypeOfWork'];
const good=['201 Royal Ave','New Westminster','NW-123','2026-10-15','Demolition / Deconstruction'];
const parse=(rows)=>api.parseRows([headers,...rows],{importedAt:'2026-11-01T11:00:00Z'});
test('New Westminster candidate retains exact municipality and is unverified',()=>{
 const x=parse([good]).candidates[0];
 assert.equal(x.city,'New Westminster');assert.equal(x.verified,false);assert.equal(x.source,'user-csv-unverified');
});
test('a missing city cannot be silently converted to Vancouver',()=>{
 const x=parse([[good[0],'',good[2],good[3],good[4]]]);
 assert.equal(x.candidates.length,0);assert.equal(x.rejected,1);
});
test('mandatory city column cannot be omitted',()=>assert.throws(()=>api.parseRows([['Address','Permit','Date'],['1','2','2026-10-01']]),/requires/));
test('missing permit cannot create unstable site identity',()=>assert.equal(parse([[good[0],good[1],'',good[3],good[4]]]).rejected,1));
test('missing or invalid date is rejected rather than inventing issue dates',()=>{
 assert.equal(parse([[good[0],good[1],good[2],'2026-02-30',good[4]]]).rejected,1);
 assert.equal(parse([[good[0],good[1],good[2],'10/15/2026',good[4]]]).rejected,1);
});
test('unrelated work types are filtered out',()=>assert.equal(parse([[...good.slice(0,4),'PLUMBING PERMIT']]).nonDemolition,1));
test('missing work-type is accepted only as explicitly unverified candidate',()=>{
 const x=parse([[...good.slice(0,4),'']]);assert.equal(x.unverifiedWorkType,1);assert.equal(x.candidates[0].workType,'');
});
test('same permit in different municipalities remains separate',()=>{
 const x=parse([good,[good[0],'Vancouver',good[2],good[3],good[4]]]);
 assert.equal(x.candidates.length,2);assert.notEqual(api.keyFor(x.candidates[0]),api.keyFor(x.candidates[1]));
});
test('duplicate same-city permit is counted and excluded',()=>{
 const x=parse([good,good]);assert.equal(x.candidates.length,1);assert.equal(x.duplicates,1);
});
test('commonly-used CSV headers with punctuation are normalized',()=>{
 const x=api.parseRows([['Site_Address','City','Permit_No','Date_Issued'],['2 4th','New Westminster','DEM-4','2026-08-21']]);
 assert.equal(x.candidates.length,1);
});
test('spreadsheet formula-like identifiers are rejected',()=>{
 const x=parse([['=HYPERLINK("evil")',good[1],good[2],good[3],good[4]]]);
 assert.equal(x.candidates.length,0);
});
test('key normalization is stable for capitalization and whitespace',()=>{
 assert.equal(api.keyFor({city:' New   Westminster ',permit:'DEMO-1'}),api.keyFor({city:'new westminster',permit:'demo-1'}));
});
test('no CSV is transmitted or automatically labelled verified',()=>{
 const src=fs.readFileSync(path.join(__dirname,'..','csv-import-provenance.js'),'utf8');
 assert.doesNotMatch(src,/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(/);
 assert.match(src,/verified:false/);
});
test('UI wires explicit CSV uploader and provenance module',()=>{
 const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
 const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
 assert.match(html,/id="csv"/);assert.match(html,/src="csv-import-provenance\.js"/);
 assert.match(app,/ScrappyCsvImport\.parseRows/);assert.doesNotMatch(app,/city:get\('city'\)\|\|'Vancouver'/);
});