"""Read-only audit of New Westminster's demolition permit candidates.

Run: python3 scripts/audit_new_westminster_permits.py

Source: City of New Westminster, Permits - Buildings and Plumbing.
https://www.arcgis.com/home/item.html?id=59558177b3944a51855cfada5e12acbc
Contains information licensed under the Open Government Licence - City of
New Westminster. https://opendata.newwestcity.ca/pages/terms-of-use

This table has no work description or geometry. Report codes identify
candidates for manual scope review under FULL_DEMOLITION_RULES.md. Keep the
City's permit status separate from Scrappy's field observations.
"""

import json
from collections import Counter
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import urlopen


QUERY_URL = (
    "https://services3.arcgis.com/A7O8YnTNtzRPIn7T/arcgis/rest/services/"
    "Permits_Buildings/FeatureServer/0/query"
)
DEMOLITION_CANDIDATES = "FOLDER_CATEGORY = 'BUILDING PERMITS' AND REPORT_CODE LIKE 'DEMO/%'"


def query(**params):
    query_string = urlencode({"f": "json", "where": DEMOLITION_CANDIDATES, **params})
    with urlopen(f"{QUERY_URL}?{query_string}", timeout=20) as response:
        data = json.load(response)
    if "error" in data:
        raise ValueError(f"ArcGIS query failed (code {data['error'].get('code')})")
    return data


def audit():
    count = query(returnCountOnly="true").get("count")
    if type(count) is not int or count < 0:
        raise ValueError("ArcGIS response is missing a valid row count")

    page = query(
        outFields="FOLDER_NUMBER,CIVIC_ADDRESS,REPORT_CODE,STATUS,ISSUED_DATE,ISSUEDATE",
        orderByFields="OBJECTID ASC",
        returnGeometry="false",
    )
    features = page.get("features")
    if page.get("exceededTransferLimit") or not isinstance(features, list) or len(features) != count:
        raise ValueError("ArcGIS row count differs from downloaded records or exceeds one page")

    permits = set()
    codes = Counter()
    statuses = Counter()
    issue_dates = []
    missing_date_only = 0
    for feature in features:
        row = feature["attributes"]
        permit = (row["FOLDER_NUMBER"] or "").strip().casefold()
        address = (row["CIVIC_ADDRESS"] or "").strip()
        code = row["REPORT_CODE"]
        timestamp = row["ISSUED_DATE"]
        if not permit or not address or permit in permits:
            raise ValueError("ArcGIS response contains missing addresses or missing/duplicate permits")
        if not isinstance(code, str) or not code.startswith("DEMO/"):
            raise ValueError("ArcGIS response contains a non-demolition report code")
        if type(timestamp) is not int:
            raise ValueError("ArcGIS response contains an invalid issue timestamp")

        permits.add(permit)
        codes[code] += 1
        statuses[row["STATUS"] or "(missing)"] += 1
        issue_dates.append(datetime.fromtimestamp(timestamp / 1000, tz=timezone.utc).date())
        missing_date_only += not row["ISSUEDATE"]

    return {
        "candidate_rows": count,
        "earliest_issue_date_utc": min(issue_dates).isoformat() if issue_dates else None,
        "latest_issue_date_utc": max(issue_dates).isoformat() if issue_dates else None,
        "missing_date_only_values": missing_date_only,
        "report_codes": dict(codes),
        "municipal_statuses": dict(statuses),
    }


if __name__ == "__main__":
    try:
        print(json.dumps(audit(), indent=2, sort_keys=True))
    except (OSError, ValueError, KeyError, TypeError, OverflowError) as error:
        raise SystemExit(f"New Westminster permit audit failed: {error}") from None
