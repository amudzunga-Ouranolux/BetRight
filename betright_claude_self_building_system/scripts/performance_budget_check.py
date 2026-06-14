# Placeholder performance budget checker.
# The performance-load-engineer should connect this to k6/Artillery output.

import json
from pathlib import Path

report = Path("reports/performance/latest.json")
if not report.exists():
    print("No performance report found. Skipping.")
    raise SystemExit(0)

data = json.loads(report.read_text())
p95 = data.get("p95_ms", 0)
error_rate = data.get("error_rate", 0)

if p95 > 800 or error_rate > 0.01:
    raise SystemExit(f"Performance budget failed: p95={p95}, error_rate={error_rate}")

print("Performance budget passed.")
