# CLAUDE.md

## Project Overview

A Python 3 CLI utility that queries the NYC Open Data Citywide Payroll Data (Fiscal Year) SODA API to count employees with "DATA SPECIALIST" titles at the NYC Department of Education.

## Repository Structure

```
dan.sk.lee/
├── nyc_doe_data_specialists.py   # Main (and only) script
└── CLAUDE.md                     # This file
```

Single-file project with no subdirectories.

## Dependencies

**Zero external dependencies.** Uses only Python 3 standard library:
- `argparse`, `json`, `sys`, `urllib.error`, `urllib.parse`, `urllib.request`

No `requirements.txt`, `setup.py`, or `pyproject.toml`.

## Running the Script

```bash
# Show all fiscal years
python3 nyc_doe_data_specialists.py

# Filter by fiscal year
python3 nyc_doe_data_specialists.py --fiscal-year 2024

# Custom title search (partial match)
python3 nyc_doe_data_specialists.py --title "ANALYST"

# JSON output
python3 nyc_doe_data_specialists.py --json
```

## Key Constants

- `SODA_ENDPOINT`: `https://data.cityofnewyork.us/resource/k397-673e.json`
- `AGENCY_NAME`: `"DEPT OF EDUCATION"`
- `DEFAULT_TITLE`: `"DATA SPECIALIST"`

## Code Conventions

- Python 3 with `#!/usr/bin/env python3` shebang
- PEP 8 style formatting
- Google-style docstrings (Args/Returns sections)
- f-strings for string formatting
- `if __name__ == "__main__": main()` guard pattern
- Explicit error handling for HTTP/URL errors with stderr output

## Testing / Linting / CI

No testing framework, linter, or CI/CD pipeline is configured. The script can be verified manually by running it and checking API output.

## API Reference

NYC Open Data Citywide Payroll Data: https://data.cityofnewyork.us/City-Government/Citywide-Payroll-Data-Fiscal-Year-/k397-673e
