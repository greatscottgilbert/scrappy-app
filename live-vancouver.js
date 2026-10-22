/* Live Vancouver permit feed; conservative whole-building classification. */
const SCRAPPY_API='https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records';
function wholeBuilding(r){
 const d=String(r.projectdescription||'').toLowerCase();
 if(/interior|partial|selective|portion|suite only|unit only|tenant improvement|facade|façade|floor only|east wing|west wing|abatement only|salvage only/.test(d))return false;
 return /(?:demolish|demolition|deconstruct|deconstruction|remove|removal|raz(e|ing))[^.]{0,110}(?:existing |entire |whole |complete |all of the )*(?:one.family|single.family|single detached|duplex|house|dwelling|building|structure|warehouse|garage|commercial building|industrial building)|(?:complete|entire|full|total) demolition of (?:the |an? )?(?:building|structure|dwelling|house|warehouse)/.test(d);
}
function classifyBuilding(r){
 const s=String(r.specificusecategory||'').toLowerCase(),p=String(r.propertyuse||'').toLowerCase(),d=String(r.projectdescription||'').toLowerCase();
 if(/industrial|manufactur|warehouse/.test(s+' '+p+' '+d))return 'Industrial';
 if(/retail|office|commercial|restaurant|service uses/.test(s+' '+p))return 'Commercial';
 if(/apartment|multiple dwelling|condo|multi.family/.test(s+' '+d))return 'Apartment / condo';
 if(/duplex|townhouse|rowhouse|two.family/.test(s+' '+d))return 'Duplex / townhouse';
 if(/single|one.family|detached house|dwelling/.test(s+' '+d))return 'Single-family';
 return 'Other';
}
async function loadVancouverLive(){
 const response=await fetch('./data/vancouver-sites.json',{cache:'no-cache'});
 if(!response.ok)throw new Error('Saved Vancouver site list not published yet ('+response.status+')');
 const snapshot=await response.json();
 if(!Array.isArray(snapshot.sites)||!snapshot.sites.length)throw new Error('Saved site list is empty');
 const existing=new Map(permits.map(p=>[p.permit||p.id,p]));
 const live=snapshot.sites.map(r=>{
  const old=existing.get(r.permit||r.id)||{};
  return {...r,selected:!!old.selected,stage:Number.isInteger(old.stage)?old.stage:0,opportunity:old.opportunity||'Not visited'};
 });
 permits=[...permits.filter(p=>p.city!=='Vancouver'),...live];
 save('scrappy-permits',permits);
 return {total:snapshot.sourceRecordCount,eligible:live.length};
}

const originalSearch=runSearch;
runSearch=async function(){
 if(!$('cityChoice').value)return originalSearch();
 if($('cityChoice').value!=='Vancouver')return originalSearch();
 $('siteResults').classList.remove('hide');$('count').textContent='Loading Vancouver demo sites…';$('results').innerHTML='';
 try{
  const info=await loadVancouverLive();
  originalSearch();
  const note=document.createElement('p');
  note.style.fontSize='12px';note.textContent='Vancouver demo sites · '+info.eligible+' conservatively matched whole-building demolitions out of '+info.total+' city records reviewed. Physical demolition status is not confirmed. Ambiguous records excluded.';
  $('results').prepend(note);
 }catch(err){
  $('count').textContent='Saved site list unavailable';
  $('results').textContent='Could not load Vancouver demo sites: '+err.message+'. Check your connection and retry.';
 }
};
