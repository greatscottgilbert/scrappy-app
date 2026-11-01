/* Browser-local candidate CSV parser. Imported permits are never verified city data. */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.ScrappyCsvImport=api;
}(typeof globalThis==='undefined'?null:globalThis,function(){
  'use strict';
  const clean=value=>String(value==null?'':value).replace(/[\u0000-\u001f\u007f]/g,' ').trim().replace(/\s+/g,' ');
  const header=value=>clean(value).toLowerCase().replace(/[^a-z0-9]/g,'');
  const aliases={
    address:['address','civicaddress','propertyaddress','siteaddress','streetaddress'],
    city:['city','municipality','locality'],
    permit:['permit','permitnumber','permitno','permitid','foldernumber'],
    date:['issuedate','permitissuedate','date','dateissued'],
    workType:['typeofwork','worktype','workdescription','permitdescription','permittype','type']
  };
  function keyFor(row){
    if(!row||typeof row!=='object')return null;
    const city=clean(row.city).toLocaleLowerCase('en-CA');
    const permit=clean(row.permit).toLocaleLowerCase('en-CA');
    return city&&permit?JSON.stringify([city,permit]):null;
  }
  function validDate(date){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
    const d=new Date(date+'T00:00:00Z');
    return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===date;
  }
  function parseRows(rows,options={}){
    if(!Array.isArray(rows)||!Array.isArray(rows[0]))throw Error('CSV must contain a header row.');
    const headers=rows[0].map(header);
    const column={};
    for(const [name,names] of Object.entries(aliases)){
      column[name]=headers.findIndex(h=>names.includes(h));
    }
    for(const name of ['address','city','permit','date']){
      if(column[name]<0)throw Error('CSV requires address, city, permit and issue date (YYYY-MM-DD) columns.');
    }
    const result=[],seen=new Set();
    let rejected=0,nonDemolition=0,unverifiedWorkType=0,duplicates=0;
    for(const values of rows.slice(1)){
      if(!Array.isArray(values)||values.every(v=>!clean(v)))continue;
      const get=name=>column[name]<0?'':clean(values[column[name]]);
      const address=get('address'),city=get('city'),permit=get('permit'),date=get('date');
      const workType=get('workType');
      if(!address||!city||!permit||!validDate(date)||[address,city,permit].some(s=>s.length>250||/^[=+@\-]/.test(s))){rejected++;continue;}
      if(workType&&!/\b(demolition|deconstruction|demo)\b/i.test(workType)){nonDemolition++;continue;}
      const key=keyFor({city,permit});
      if(seen.has(key)){duplicates++;continue;}seen.add(key);
      if(!workType)unverifiedWorkType++;
      result.push({
        id:'csv:'+encodeURIComponent(key),city,address,permit,date,
        source:'user-csv-unverified',verified:false,
        workType:workType||'',buildingType:'Other',
        importedAt:options.importedAt||new Date().toISOString(),
        selected:false
      });
    }
    return{candidates:result,rejected,nonDemolition,unverifiedWorkType,duplicates};
  }
  return{parseRows,keyFor,validDate};
}));