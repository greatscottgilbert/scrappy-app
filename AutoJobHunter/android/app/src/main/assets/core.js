(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.JobCore=factory()})(this,function(){'use strict';
const stages=['Saved','Drafted','Sent — receipt recorded','Employer replied','Interview','Offer','Closed'];
function norm(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function canonicalURL(url){try{const u=new URL(url);if(u.protocol!=='https:')return '';u.hash='';for(const k of [...u.searchParams.keys()])if(/^utm_|^(fbclid|gclid)$/i.test(k))u.searchParams.delete(k);return u.href.replace(/\/$/,'')}catch{return ''}}
function key(j){return [norm(j.employer),norm(j.postingId)||norm(j.title)].join('|')}
function duplicate(existing,candidate){const url=canonicalURL(candidate.url);return existing.find(x=>key(x)===key(candidate)||url&&canonicalURL(x.url)===url)||null}
function validate(j){if(!String(j.title||'').trim()||!String(j.employer||'').trim())throw Error('Title and employer required');if(j.url&&!canonicalURL(j.url))throw Error('Only HTTPS source URLs are accepted');if(!['Employer careers','Job Bank','WorkBC','Other permitted source'].includes(j.source))throw Error('Source not permitted');if(j.pay!==''&&j.pay!==undefined&&(+j.pay<0||+j.pay>250||!Number.isFinite(+j.pay)))throw Error('Invalid wage');return true}
function transition(j,next,receipt){if(!stages.includes(next))throw Error('Unknown stage');if(next==='Sent — receipt recorded'&&!String(receipt||'').trim()&&!String(j.receipt||'').trim())throw Error('A real send receipt is required');return {...j,stage:next,receipt:next==='Sent — receipt recorded'?String(receipt||j.receipt).trim():j.receipt||''}}
function initial(){return {version:1,profile:{name:'',minPay:25,availability:'Part-time preferred; flexible',skills:''},jobs:[]}}
function restore(raw){try{const x=JSON.parse(raw);if(x&&x.version===1&&Array.isArray(x.jobs)&&x.profile&&x.jobs.length<=5000)return x}catch{}return initial()}
return {stages,norm,canonicalURL,key,duplicate,validate,transition,initial,restore}
});