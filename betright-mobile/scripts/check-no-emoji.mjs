// No-emoji gate: BetRight UI uses Lucide icons only, never emoji/emoticons.
// Scans src/ for emoji codepoints and fails the build if any are found.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(process.cwd(), 'src');
// Pictographic emoji + common symbol ranges. Excludes ordinary text/punctuation.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/u;

let failures = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    const lines = readFileSync(full, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (EMOJI.test(line)) {
        console.error(`Emoji found: ${full}:${i + 1}  ->  ${line.trim()}`);
        failures += 1;
      }
    });
  }
}

walk(ROOT);

if (failures > 0) {
  console.error(`\nno-emoji check failed: ${failures} occurrence(s). Use Lucide icons instead.`);
  process.exit(1);
}
console.log('no-emoji check passed: UI is emoji-free.');
