#!/usr/bin/env python3
"""Tool to get the number of Data Specialists in NYC DOE.

Uses the NYC Open Data Citywide Payroll Data (Fiscal Year) SODA API
to count employees with the title "DATA SPECIALIST" at the
Department of Education.

API docs: https://data.cityofnewyork.us/City-Government/Citywide-Payroll-Data-Fiscal-Year-/k397-673e
"""

import argparse
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

SODA_ENDPOINT = "https://data.cityofnewyork.us/resource/k397-673e.json"
AGENCY_NAME = "DEPT OF EDUCATION"
DEFAULT_TITLE = "DATA SPECIALIST"


def get_data_specialist_count(fiscal_year=None, title=DEFAULT_TITLE):
    """Query NYC Open Data for the count of DOE data specialists.

    Args:
        fiscal_year: Optional fiscal year to filter by (e.g. 2024).
        title: Job title to search for (default: "DATA SPECIALIST").
                Supports partial matching via LIKE.

    Returns:
        dict with 'count' and 'fiscal_year' (if specified), or per-year
        breakdown if no fiscal year is given.
    """
    where_clauses = [
        f"agency_name='{AGENCY_NAME}'",
        f"title_description LIKE '%{title}%'",
    ]
    if fiscal_year:
        where_clauses.append(f"fiscal_year={int(fiscal_year)}")

    query = {
        "$select": "fiscal_year, COUNT(*) AS count",
        "$where": " AND ".join(where_clauses),
        "$group": "fiscal_year",
        "$order": "fiscal_year DESC",
    }

    url = f"{SODA_ENDPOINT}?{urllib.parse.urlencode(query)}"
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"Error: HTTP {e.code} — {e.reason}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"Error: Could not connect — {e.reason}", file=sys.stderr)
        sys.exit(1)

    return data


def main():
    parser = argparse.ArgumentParser(
        description="Get the number of Data Specialists in NYC DOE"
    )
    parser.add_argument(
        "--fiscal-year", "-y",
        type=int,
        default=None,
        help="Filter by fiscal year (e.g. 2024). If omitted, shows all years.",
    )
    parser.add_argument(
        "--title", "-t",
        default=DEFAULT_TITLE,
        help=f'Job title to search (default: "{DEFAULT_TITLE}"). Partial match.',
    )
    parser.add_argument(
        "--json", "-j",
        action="store_true",
        dest="output_json",
        help="Output raw JSON instead of formatted text.",
    )
    args = parser.parse_args()

    results = get_data_specialist_count(
        fiscal_year=args.fiscal_year,
        title=args.title,
    )

    if args.output_json:
        print(json.dumps(results, indent=2))
        return

    if not results:
        print("No data specialists found matching the query.")
        return

    print(f"NYC DOE Data Specialists (title matching '{args.title}'):")
    print("-" * 50)

    total = 0
    for row in results:
        fy = row.get("fiscal_year", "N/A")
        count = int(row.get("count", 0))
        total += count
        print(f"  Fiscal Year {fy}: {count:,}")

    print("-" * 50)
    print(f"  Total (across all listed years): {total:,}")


if __name__ == "__main__":
    main()
