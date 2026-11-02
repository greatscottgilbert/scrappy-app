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

/* Load bundled city addresses on selection so suggestions work before Search.
   Share one in-flight request with Search; retry on failure. */
let vancouverSnapshotTask=null;
const loadVancouverUncached=loadVancouverLive;
loadVancouverLive=function(){
 if(!vancouverSnapshotTask){
  vancouverSnapshotTask=loadVancouverUncached()
    .then(info=>{document.dispatchEvent(new Event('scrappy:permits-updated'));return info;})
    .catch(error=>{vancouverSnapshotTask=null;throw error;});
 }
 return vancouverSnapshotTask;
};
$('cityChoice').addEventListener('change',()=>{
 if($('cityChoice').value==='Vancouver')loadVancouverLive().catch(()=>{/* Search provides the visible error state. */});
});

/* Separate Vancouver salvage and abatement search. Fetch only selected years from the City's issued-permits API. */
const VANCOUVER_ABATEMENT_API='https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records';
let abatementCache=new Map();
async function fetchVancouverAbatement(years){
 const key=years.slice().sort().join(','); if(abatementCache.has(key))return abatementCache.get(key);
 const task=(async()=>{
  const clauses=years.map(y=>"issueyear = '"+y+"'").join(' OR ');
  const where="typeofwork = 'Salvage and Abatement' AND ("+clauses+")";
  let offset=0,all=[];
  while(true){
   const params=new URLSearchParams({where,order_by:'issuedate DESC, permitnumber ASC',limit:'100',offset:String(offset)});
   const response=await fetch(VANCOUVER_ABATEMENT_API+'?'+params.toString(),{headers:{Accept:'application/json'}});
   if(!response.ok)throw new Error('Vancouver permit API returned HTTP '+response.status);
   const data=await response.json(); if(!Array.isArray(data.results))throw new Error('Vancouver API response did not contain permit records');
   all.push(...data.results); offset+=data.results.length;
   if(data.results.length<100||offset>=10000)break;
  }
  return all.map(r=>({id:String(r.permitnumber||r.address),permit:String(r.permitnumber||''),address:String(r.address||''),city:'Vancouver',date:String(r.issuedate||'').slice(0,10),status:'City issued permit (site progress unverified)',buildingType:classifyBuilding(r),description:String(r.projectdescription||''),typeOfWork:String(r.typeofwork||''),permitCategory:String(r.permitcategory||''),selected:false,opportunity:'Not visited'}));
 })(); abatementCache.set(key,task); try{return await task}catch(e){abatementCache.delete(key);throw e}
}
const previousRunSearch=runSearch;
runSearch=async function(){
 if($('permitMode')?.value!=='abatement')return previousRunSearch();
 if(!$('cityChoice').value){alert('Please select a city first.');$('cityChoice').focus();return}
 if($('cityChoice').value!=='Vancouver'){alert('Salvage and abatement search is currently available for Vancouver only.');return}
 const years=[...document.querySelectorAll('#permitYears input:checked')].map(x=>x.value);
 if(!years.length){alert('Select at least one permit year.');return}
 $('siteResults').classList.remove('hide');$('routeBar').classList.add('hide');$('routeBar').style.display='none';document.body.classList.remove('has-route');$('count').textContent='Loading Vancouver salvage and abatement permits…';$('results').textContent='';
 try{
  const incoming=await fetchVancouverAbatement(years),others=permits.filter(p=>!(p.city==='Vancouver'&&p.typeOfWork==='Salvage and Abatement'));
  permits=[...others,...incoming]; save('scrappy-permits',permits);
  const q=$('search').value.trim().toLowerCase();
  searchResults=incoming.filter(p=>!q||[p.address,p.city,p.permit,p.description,p.permitCategory].join(' ').toLowerCase().includes(q));
  if(searchResults.length){$('routeBar').classList.remove('hide');$('routeBar').style.display='flex';document.body.classList.add('has-route')}
  showPermits(); const note=document.createElement('p');note.style.fontSize='12px';note.textContent='Salvage and Abatement permits · '+incoming.length+' records returned for '+years.join(', ')+'. These are issued permit records, not confirmation that work is underway or that material is available.';$('results').prepend(note);
 }catch(error){$('count').textContent='Permit search unavailable';$('results').textContent='Could not load salvage and abatement permits: '+error.message+'. Check your connection and try again.'}
};
