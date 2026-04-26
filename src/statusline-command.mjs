#!/usr/bin/env node

const BAR_WIDTH = 10;
const FILL_CHAR = '▓';
const EMPTY_CHAR = '░';

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

// Truncate toward zero — matches `cut -d. -f1` on jq's numeric output.
function pct(v) {
  if (v === undefined || v === null) return null;
  return Math.trunc(Number(v));
}

function bar(p, width = BAR_WIDTH) {
  const filled = Math.max(0, Math.min(width, Math.trunc((p * width) / 100)));
  return FILL_CHAR.repeat(filled) + EMPTY_CHAR.repeat(width - filled);
}

function hhmm(unixSec) {
  const d = new Date(Number(unixSec) * 1000);
  if (Number.isNaN(d.getTime())) return '';
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

const input = await readStdin();
const data = JSON.parse(input);

const model = data?.model?.display_name ?? '';
const ctxPct = pct(data?.context_window?.used_percentage) ?? 0;
const fivePct = pct(data?.rate_limits?.five_hour?.used_percentage);
const fiveReset = data?.rate_limits?.five_hour?.resets_at;
const weekPct = pct(data?.rate_limits?.seven_day?.used_percentage);

let out = `[${model}] ${bar(ctxPct)} ${ctxPct}%`;

if (fivePct !== null) {
  const resetFmt = fiveReset ? ` ↻ ${hhmm(fiveReset)}` : '';
  out += ` | 5h ${fivePct}%${resetFmt}`;
}
if (weekPct !== null) {
  out += ` | 7d ${weekPct}%`;
}

console.log(out);
