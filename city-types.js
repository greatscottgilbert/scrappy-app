/* City-specific building filters. Vancouver labels are derived from the City's
specific-use/property-use fields as normalized by classifyBuilding(). */
const CITY_TYPES={
 Vancouver:['Single-family','Duplex / townhouse','Apartment / condo','Commercial','Industrial','Other']
};
function syncCityBuildingTypes(){
 const city=$('cityChoice').value,field=$('buildingTypes');
 field.classList.toggle('hide',!city);
 if(!city)return;
 const available=CITY_TYPES[city]||[...new Set(permits.filter(p=>p.city===city).map(p=>p.buildingType).filter(Boolean))].sort();
 const selected=new Set([...field.querySelectorAll('input:checked')].map(x=>x.value));
 field.innerHTML='<legend>Building types for '+esc(city)+' (select any)</legend>'+available.map(type=>'<label><input type="checkbox" value="'+esc(type)+'" '+(selected.has(type)?'checked':'')+'> '+esc(type)+'</label>').join('')+'<small>None checked means all buildings. Address search works independently of building types.</small>';
 if(!available.length)field.insertAdjacentHTML('beforeend','<p>Building-type filters will appear when this city\'s dataset is connected.</p>');
 $('siteResults').classList.add('hide');$('routeBar').classList.add('hide');$('routeBar').style.display='none';document.body.classList.remove('has-route');
}
$('cityChoice').addEventListener('change',syncCityBuildingTypes);
syncCityBuildingTypes();
