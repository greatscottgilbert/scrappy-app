#!/usr/bin/env python3
"""Refresh static Vancouver demo-site snapshot from the public city dataset."""
import json, os, pathlib, re, tempfile, urllib.parse, urllib.request
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
records=[];offset=0;expected_count=None;seen=set()
while True:
 params=urllib.parse.urlencode({"where":"typeofwork = 'Demolition / Deconstruction'","limit":100,"offset":offset})
 with urllib.request.urlopen(API+"?"+params,timeout=45) as resp: obj=json.load(resp)
 if not isinstance(obj,dict):raise RuntimeError("Invalid source object; retaining previous snapshot")
 count=obj.get("total_count")
 if not isinstance(count,int) or isinstance(count,bool) or count<0:raise RuntimeError("Invalid source total count; retaining previous snapshot")
 if expected_count is None:expected_count=count
 elif count!=expected_count:raise RuntimeError("Source count changed during pagination; retaining previous snapshot")
 batch=obj.get("results")
 if not isinstance(batch,list):raise RuntimeError("Invalid source results; retaining previous snapshot")
 for row in batch:
  if not isinstance(row,dict) or not isinstance(row.get("permitnumber"),str):raise RuntimeError("Invalid permit ID; retaining previous snapshot")
  number=row["permitnumber"].strip()
  if not number or number in seen:raise RuntimeError("Missing or duplicate permit ID; retaining previous snapshot")
  seen.add(number)
 records.extend(batch);offset+=len(batch)
 if len(batch)<100:break
 if offset>=10000:raise RuntimeError("Safety limit reached; refusing truncated snapshot")
if len(records)!=expected_count:raise RuntimeError("Incomplete source snapshot; retaining previous snapshot")
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
payload=json.dumps({"source":"City of Vancouver open data","sourceRecordCount":len(records),"sites":sites},ensure_ascii=False,separators=(",",":"))+"\n"
# Stage beside destination, then atomically replace only after a complete write.
temporary=None
try:
 with tempfile.NamedTemporaryFile(mode="w",encoding="utf-8",dir=OUT.parent,prefix=".vancouver-sites-",suffix=".tmp",delete=False) as stream:
  temporary=pathlib.Path(stream.name)
  stream.write(payload)
  stream.flush()
  os.fsync(stream.fileno())
 os.replace(temporary,OUT)
finally:
 if temporary is not None:temporary.unlink(missing_ok=True)
print(f"Saved {len(sites)} sites from {len(records)} source records")

