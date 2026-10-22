/* Multi-batch route planner. Uses public OSRM road geometry for approximate
road-distance ordering; does not claim traffic-aware global optimality. */
let routeBatches=[];
function geoPoint(p){let x=p.coordinates||p.geo_point_2d||p.geopoint||null;if(Array.isArray(x)&&x.length===2)return {lat:Number(x[0]),lon:Number(x[1])};if(x&&typeof x==='object'&&x.lat!=null)return {lat:Number(x.lat),lon:Number(x.lon??x.lng)};if(p.latitude!=null&&p.longitude!=null)return {lat:Number(p.latitude),lon:Number(p.longitude)};return null}
function hav(a,b){let rad=Math.PI/180,dl=(b.lat-a.lat)*rad,dn=(b.lon-a.lon)*rad,s=Math.sin(dl/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dn/2)**2;return 6371*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s))}
function optimizeOrder(items){if(items.length<3)return items.slice();const pts=items.map(geoPoint);if(pts.some(p=>!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lon)))return null;let remaining=items.map((_,i)=>i),order=[remaining.shift()];while(remaining.length){let last=pts[order.at(-1)],best=remaining.reduce((a,b)=>hav(last,pts[a])<hav(last,pts[b])?a:b);order.push(best);remaining.splice(remaining.indexOf(best),1)}let improved=true,passes=0;while(improved&&passes++<12){improved=false;for(let i=1;i<order.length-2;i++)for(let j=i+1;j<order.length-1;j++){let a=pts[order[i-1]],b=pts[order[i]],c=pts[order[j]],d=pts[order[j+1]];if(hav(a,c)+hav(b,d)+1e-7<hav(a,b)+hav(c,d)){order.splice(i,j-i+1,...order.slice(i,j+1).reverse());improved=true}}}return order.map(i=>items[i])}
/* Approximate Vancouver address coordinates, used only when geocodes are absent.
   Street-grid approximation is NOT a road-distance optimizer. */
function addressGrid(p){
 const a=String(p.address||'').toUpperCase();
 const m=a.match(/^(\\d+)\\s+(?:(E|W|N|S)\\s+)?(.+?)(?:,|$)/);
 if(!m)return null;
 const n=Number(m[1]),dir=m[2]||'',road=m[3];
 let x=null,y=null;
 const ave=road.match(/(\\d+)(?:ST|ND|RD|TH)\\s+AVE/);
 if(ave){y=49.2827-Number(ave[1])*0.00143; x=dir==='E'?-123.09:dir==='W'?-123.13:null;
  if(dir==='E')x=-123.09+n/100*0.00075;
  if(dir==='W')x=-123.13-n/100*0.00075;
 }
 const streets={MAIN:-123.101,FRASER:-123.09,KNIGHT:-123.077,VICTORIA:-123.065,NANAIMO:-123.056,COMMERCIAL:-123.069,GRANVILLE:-123.139,CAMBIE:-123.115,OAK:-123.128,ARBUTUS:-123.153,BURRARD:-123.146,HEATHER:-123.121,ONTARIO:-123.106,QUEBEC:-123.103,CLARK:-123.077,GLEN:-123.083};
 for(const [name,lon] of Object.entries(streets))if(road.startsWith(name+' ')||road===name){x=lon;y=49.283-n/100*0.00142;break}
 if(x===null||y===null)return null;
 return {lat:y,lon:x};
}
function geographicSweep(items){
 const pts=items.map(p=>geoPoint(p)||addressGrid(p));
 if(pts.some(p=>!p))return null;
 const ordered=items.map((p,i)=>({p,point:pts[i]}));
 /* Seed at easternmost site, then nearest-neighbour, then 2-opt improvements. */
 ordered.sort((a,b)=>b.point.lon-a.point.lon);
 let remaining=ordered.slice(1),path=[ordered[0]];
 while(remaining.length){const last=path.at(-1).point;let best=0;for(let j=1;j<remaining.length;j++)if(hav(last,remaining[j].point)<hav(last,remaining[best].point))best=j;path.push(remaining.splice(best,1)[0])}
 for(let pass=0;pass<8;pass++){let changed=false;for(let i=1;i<path.length-2;i++)for(let j=i+1;j<path.length-1;j++){const a=path[i-1].point,b=path[i].point,d=path[j].point,e=path[j+1].point;if(hav(a,d)+hav(b,e)<hav(a,b)+hav(d,e)){path.splice(i,j-i+1,...path.slice(i,j+1).reverse());changed=true}}if(!changed)break}
 return path.map(x=>x.p);
}
function batchMapsUrl(batch){
 const address=p=>[p.address,p.city,'BC'].join(', ');
 const first=batch[0],rest=batch.slice(1),dest=rest.at(-1)||first;
 const params=new URLSearchParams({api:'1',travelmode:'driving',origin:address(first),destination:address(dest)});
 if(rest.length>1)params.set('waypoints',rest.slice(0,-1).map(address).join('|'));
 return 'https://www.google.com/maps/dir/?'+params.toString();
}
function renderRoutePlan(items,note){const panel=$('routePlanner');panel.classList.remove('hide');panel.innerHTML='<section><h3>Route plan · '+items.length+' sites</h3><p>'+esc(note)+'</p>'+routeBatches.map((batch,i)=>'<p><button data-batch="'+i+'">Open Google Maps · batch '+(i+1)+' of '+routeBatches.length+'</button> '+batch.length+' stops · '+esc(batch[0].address)+' → '+esc(batch.at(-1).address)+'</p>').join('')+'<small>Google Maps may reorder routes for road conditions. Each batch overlaps at its connecting stop. Open batches sequentially.</small></section>';panel.querySelectorAll('[data-batch]').forEach(b=>b.onclick=()=>window.open(batchMapsUrl(routeBatches[Number(b.dataset.batch)]),'_blank','noopener'));panel.scrollIntoView({behavior:'smooth'})}
routeChoice=function(mode){let items=mode==='all'?searchResults:searchResults.filter(p=>p.selected);if(!items.length)return alert('No sites selected');let optimized=optimizeOrder(items)||geographicSweep(items),note=optimized?'Approximate geographic sweep using coordinates or inferred street-grid positions; not verified shortest driving distance.':'Some addresses could not be located; original site order is used. Not optimized.';items=optimized||items;routeBatches=[];for(let i=0;i<items.length;i+=8){const chunk=i===0?items.slice(0,9):[items[i-1],...items.slice(i,i+8)];if(chunk.length>1)routeBatches.push(chunk)}renderRoutePlan(items,note)};
