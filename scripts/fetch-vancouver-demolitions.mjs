#!/usr/bin/env node
// City of Vancouver issued demolition permits; fail closed on unverified data.
// Run: node scripts/fetch-vancouver-demolitions.mjs
// Node 22+. Writes no snapshot on failure.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const endpoint = 'https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records';
const snapshotPath = 'data/vancouver-demolition-verified.json';
const params = new URLSearchParams({
  where: "typeofwork = 'Demolition / Deconstruction'",
  order_by: 'issuedate DESC, permitnumber ASC',
  limit: '100'
});
const url = endpoint + '?' + params.toString();
const timeout = AbortSignal.timeout(20000);
async function main() {
  let res;
  try { res = await fetch(url, {signal: timeout, headers:{Accept:'application/json'}}); }
  catch(e) { throw new Error('Official API unreachable: '+e.message); }
  if (!res.ok) throw new Error('Official API HTTP '+res.status);
  const data = await res.json();
  if (!Array.isArray(data.results) || !Number.isInteger(data.total_count) || data.total_count < 1)
    throw new Error('Official API response missing valid results or total count');
  const records = data.results;
  if (!records.length) throw new Error('Official API supplied zero rows');
  const permits = records.map((r,i) => {
    const id = String(r.permitnumber||'').trim();
    const date = String(r.issuedate||'').slice(0,10);
    if (!id || !/^\d{4}-\d{2}-\d{2}$/.test(date) || r.typeofwork !== 'Demolition / Deconstruction')
      throw new Error('Invalid permit ID/date/work type in row '+i);
    return r;
  });
  for (let i=1;i<permits.length;i++)
    if (String(permits[i-1].issuedate).slice(0,10) < String(permits[i].issuedate).slice(0,10))
      throw new Error('Official API is not ordered by issue date descending');
  let previous = null;
  try { previous = JSON.parse(await readFile(snapshotPath,'utf8')); }
  catch(e) { if (e.code !== 'ENOENT') throw e; }
  const prevIds = new Set((previous?.results||[]).map(p=>p.permitnumber));
  const newlyObserved = previous ? permits.filter(p=>!prevIds.has(p.permitnumber)) : [];
  const checkedAt = new Date().toISOString();
  const out = {source:'City of Vancouver — Issued building permits',url,checkedAt,totalCount:data.total_count,
    maxIssueDate: String(permits[0].issuedate).slice(0,10),priorSnapshotExists:!!previous,
    newComparedWithPreviousVerifiedSnapshot:previous ? newlyObserved.length : null,
    newestFive:permits.slice(0,5),newlyObserved,results:permits};
  await mkdir('data',{recursive:true});
  await writeFile(snapshotPath, JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify({status:'VERIFIED',checkedAt,source:url,totalCount:out.totalCount,
    maxIssueDate:out.maxIssueDate,newComparedWithPreviousVerifiedSnapshot:out.newComparedWithPreviousVerifiedSnapshot,
    newestFive:out.newestFive},null,2));
}
main().catch(e=>{ console.error('OFFICIAL DATA UNAVAILABLE — NEW-PERMIT COUNT UNKNOWN: '+e.message);process.exitCode=1;});
