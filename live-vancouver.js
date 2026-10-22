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
 const rows=[];let offset=0;
 while(true){
  const u=new URL(SCRAPPY_API);
  u.searchParams.set('where', "typeofwork = 'Demolition / Deconstruction'");
  u.searchParams.set('select','permitnumber,issuedate,address,projectdescription,specificusecategory,propertyuse,typeofwork');
  u.searchParams.set('limit','100');u.searchParams.set('offset',String(offset));
  const response=await fetch(u.toString());
  if(!response.ok)throw new Error('City API returned '+response.status);
  const json=await response.json(),batch=json.results||[];
  rows.push(...batch);offset+=batch.length;
  if(batch.length<100||offset>=10000)break;
 }
 const existing=new Map(permits.map(p=>[p.permit,p]));
 const live=rows.filter(wholeBuilding).map(r=>{
  const old=existing.get(r.permitnumber)||{};
  return {id:old.id||r.permitnumber,permit:r.permitnumber,address:r.address||'',city:'Vancouver',date:r.issuedate||'',status:'Permit issued (physical progress unverified)',buildingType:classifyBuilding(r),selected:!!old.selected,stage:Number.isInteger(old.stage)?old.stage:0,description:r.projectdescription||''};
 }).filter(r=>r.address);
 permits=[...permits.filter(p=>p.city!=='Vancouver'||(!p.permit&&!p.id?.startsWith('BP-'))),...live];
 save('scrappy-permits',permits);
 return {total:rows.length,eligible:live.length};
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
  $('count').textContent='Live feed unavailable';
  $('results').textContent='Could not load Vancouver demo sites: '+err.message+'. Check your connection and retry.';
 }
};
