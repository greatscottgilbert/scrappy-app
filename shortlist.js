/* Shortlist is stored separately from search selections and survives feed refreshes. */
const SHORTLIST_KEY='scrappy-shortlist-v1';
function shortlistIds(){try{return JSON.parse(localStorage.getItem(SHORTLIST_KEY)||'[]')}catch{return []}}
function saveShortlist(){
 const ids=new Set(shortlistIds());
 const selected=searchResults.filter(p=>p.selected);
 if(!selected.length)return alert('Check one or more sites first.');
 selected.forEach(p=>ids.add(p.id));
 localStorage.setItem(SHORTLIST_KEY,JSON.stringify([...ids]));
 alert(selected.length+' selected sites saved. '+ids.size+' total in shortlist.');
}
function showShortlist(){
 const ids=new Set(shortlistIds());
 searchResults=permits.filter(p=>ids.has(p.id));
 $('siteResults').classList.remove('hide');
 $('routeBar').classList.toggle('hide',!searchResults.length);
 $('routeBar').style.display=searchResults.length?'flex':'none';
 document.body.classList.toggle('has-route',!!searchResults.length);
 showPermits();
 $('count').textContent='My shortlist · '+searchResults.length+' saved sites';
 const panel=$('routePlanner');
 panel.classList.remove('hide');
 panel.innerHTML='<section><h3>My shortlist</h3><button id="shortlistRoute">Route entire shortlist</button> <button id="shortlistRemove">Remove checked from shortlist</button><p><small>Saved on this device only. Keep permission to access and remove scrap separate from site discovery.</small></p></section>';
 $('shortlistRoute').onclick=()=>routeChoice('all');
 $('shortlistRemove').onclick=()=>{
  const remove=new Set(searchResults.filter(p=>p.selected).map(p=>p.id));
  localStorage.setItem(SHORTLIST_KEY,JSON.stringify(shortlistIds().filter(id=>!remove.has(id))));
  showShortlist();
 };
 $('siteResults').scrollIntoView({behavior:'smooth'});
}
