#!/usr/bin/env python3
"""Refresh static Vancouver demo-site snapshot from the public city dataset."""
import json, pathlib, re, urllib.parse, urllib.request
API="https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/issued-building-permits/records"
OUT=pathlib.Path("data/vancouver-sites.json")
def eligible(r):
 d=str(r.get("projectdescription") or "").lower()
 if re.search(r"interior|partial|selective|portion|suite only|unit only|tenant improvement|facade|façade|floor only|east wing|west wing|abatement only|salvage only",d):return False
 return bool(re.search(r"(?:demolish|demolition|deconstruct|deconstruction|remove|removal|raz(?:e|ing))[^.]{0,110}(?:existing |entire |whole |complete |all of the )*(?:one.family|single.family|single detached|duplex|house|dwelling|building|structure|warehouse|garage|commercial building|industrial building)|(?:complete|entire|full|total) demolition of (?:the |an? )?(?:building|structure|dwelling|house|warehouse)",d))
def typ(r):
 s=" ".join(str(r.get(k) or "").lower() for k in ("specificusecategory","propertyuse","projectdescription"))
 for pattern,value in [(r"industrial|manufactur|warehouse","Industrial"),(r"retail|office|commercial|restaurant|service uses","Commercial"),(r"apartment|multiple dwelling|condo|multi.family","Apartment / condo"),(r"duplex|townhouse|rowhouse|two.family","Duplex / townhouse"),(r"single|one.family|detached house|dwelling","Single-family")]:
  if re.search(pattern,s):return value
 return "Other"
records=[];offset=0
while True:
 params=urllib.parse.urlencode({"where":"typeofwork = 'Demolition / Deconstruction'","limit":100,"offset":offset})
 with urllib.request.urlopen(API+"?"+params,timeout=45) as resp: obj=json.load(resp)
 batch=obj.get("results",[])
 records.extend(batch);offset+=len(batch)
 if len(batch)<100:break
 if offset>=10000:raise RuntimeError("Safety limit reached; refusing truncated snapshot")
sites=[]
for r in records:
 if not eligible(r):continue
 address=str(r.get("address") or "").strip()
 if not address:continue
 number=str(r.get("permitnumber") or "").strip()
 sites.append({"id":number or address,"permit":number,"address":address,"city":"Vancouver","date":r.get("issuedate") or "","status":"City record (site progress unverified)","buildingType":typ(r),"description":r.get("projectdescription") or ""})
if not sites:raise RuntimeError("No eligible sites; retaining previous snapshot")
sites.sort(key=lambda r:(r["address"],r["id"]))
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps({"source":"City of Vancouver open data","sourceRecordCount":len(records),"sites":sites},ensure_ascii=False,separators=(",",":"))+"\n")
print(f"Saved {len(sites)} sites from {len(records)} source records")
