'use strict';
const C=JobCore, KEY='autojobhunter-v1';
const $=id=>document.getElementById(id);
let state=C.restore(localStorage.getItem(KEY));
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function show(message){$('status').textContent=message}
function render(){
 const list=$('jobList'),tracker=$('trackerList');
 list.replaceChildren();tracker.replaceChildren();
 for(const job of state.jobs){
  const card=document.createElement('p');
  card.textContent=job.title+' — '+job.employer+' ('+job.stage+')';
  list.append(card);
  const selector=document.createElement('select');
  for(const stage of C.stages){const option=document.createElement('option');option.textContent=stage;option.value=stage;selector.append(option)}
  selector.value=job.stage;
  selector.onchange=()=>{
   let receipt=job.receipt||'';
   if(selector.value==='Sent — receipt recorded'&&!receipt)receipt=window.prompt('Enter real Gmail or portal receipt ID')||'';
   try{Object.assign(job,C.transition(job,selector.value,receipt));save();render()}catch(err){show(err.message);selector.value=job.stage}
  };
  const row=document.createElement('p');row.textContent=job.title+' — '+job.employer+' ';row.append(selector);tracker.append(row);
 }
}
document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>{
 document.querySelectorAll('section').forEach(section=>section.classList.remove('active'));
 $(button.dataset.tab).classList.add('active');
});
$('jobForm').onsubmit=event=>{
 event.preventDefault();
 const item=Object.fromEntries(new FormData(event.target));
 try{
  C.validate(item);
  const match=C.duplicate(state.jobs,item);
  if(match){show('Duplicate opportunity: '+match.title);return}
  state.jobs.unshift({...item,id:String(Date.now()),stage:'Saved',receipt:''});
  save();render();event.target.reset();show('Saved. No application sent.');
 }catch(err){show(err.message)}
};
const profileForm=$('profileForm');
Object.entries(state.profile).forEach(([name,value])=>{if(profileForm.elements.namedItem(name))profileForm.elements.namedItem(name).value=value});
profileForm.onsubmit=event=>{event.preventDefault();state.profile=Object.fromEntries(new FormData(profileForm));save();show('Profile saved')};
$('exportBtn').onclick=()=>{
 const file=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(file),anchor=document.createElement('a');
 anchor.href=url;anchor.download='autojobhunter-backup.json';anchor.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('importFile').onchange=async event=>{
 const file=event.target.files[0];if(!file)return;
 const content=await file.text();if(!content.includes('"jobs"')){show('Invalid backup');return}
 if(confirm('Replace records?')){state=C.restore(content);save();render()}
};
$('eraseBtn').onclick=()=>{if(confirm('Erase records?')){state=C.initial();save();render()}};
render();