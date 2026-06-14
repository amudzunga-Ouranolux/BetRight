from pathlib import Path

required = [
    "CLAUDE.md",
    ".claude/agents",
    ".claude/skills",
    ".claude/commands",
]

missing = [p for p in required if not Path(p).exists()]
if missing:
    raise SystemExit(f"Missing required paths: {missing}")

print("Claude structure looks valid.")
