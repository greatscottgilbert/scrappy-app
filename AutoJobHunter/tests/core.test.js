const test=require('node:test'),assert=require('node:assert/strict'),c=require('../android/app/src/main/assets/core.js');
test('same posting is detected',()=>{const x={employer:'ABC Strata',title:'Building Manager',url:'https://example.com/jobs/123?utm_source=test'};assert.equal(c.duplicate([x],{employer:'ABC STRATA',title:'Building-Manager',url:'https://example.com/jobs/123'}),x)});
test('separate employer roles are allowed',()=>assert.equal(c.duplicate([{employer:'ABC',title:'Cleaner'}],{employer:'ABC',title:'Maintenance Tech'}),null));
test('send without receipt is rejected',()=>assert.throws(()=>c.transition({stage:'Saved'},'Sent — receipt recorded',''),/receipt/));
test('send with receipt is accepted',()=>assert.equal(c.transition({stage:'Saved'},'Sent — receipt recorded','msg-id').receipt,'msg-id'));
test('forbidden sources are rejected',()=>assert.throws(()=>c.validate({title:'A',employer:'B',source:'Craigslist'}),/Source/));
test('HTTP posting links rejected',()=>assert.throws(()=>c.validate({title:'A',employer:'B',source:'Job Bank',url:'http://example.com'}),/HTTPS/));
test('corrupt state resets',()=>assert.deepEqual(c.restore('{broken'),c.initial()));
