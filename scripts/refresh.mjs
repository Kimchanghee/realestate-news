#!/usr/bin/env node
// pnpm refresh — fetch official public data into src/data/*.json.
// Rule: on any failure keep the last good snapshot untouched (its real asOf keeps rendering),
// record the failure in src/data/refresh-status.json, and never invent or interpolate values.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseBokBaseRate } from './refresh.parse.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'src', 'data');
const UA = 'korearealestatenews.online data refresh (contact@korearealestatenews.online)';
const BOK_URL = 'https://www.bok.or.kr/portal/singl/baseRate/list.do?dataSeCd=01&menuNo=200643';

const kstDate = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

async function fetchText(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20_000);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' }, signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function validate(rows) {
  if (rows.length < 20) throw new Error(`too few rows (${rows.length})`);
  for (const r of rows) {
    if (!(r.rate >= 0 && r.rate <= 10)) throw new Error(`implausible rate ${r.rate} on ${r.date}`);
  }
  if (rows[0].date > kstDate()) throw new Error(`future date ${rows[0].date}`);
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function refreshBaseRate(status) {
  const file = path.join(dataDir, 'base-rate.json');
  const prev = await readJson(file, null);
  try {
    const html = await fetchText(BOK_URL);
    const history = parseBokBaseRate(html);
    validate(history);
    const snapshot = {
      asOf: kstDate(),
      source: '한국은행 기준금리 추이',
      sourceUrl: BOK_URL,
      current: history[0],
      history,
    };
    // asOf = KST date we observed the official table; current.date = the BOK decision date.
    await writeFile(file, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
    status.baseRate = { ok: true, at: new Date().toISOString(), rows: history.length, current: history[0] };
    console.log(`[refresh] base-rate ok: ${history[0].rate}% since ${history[0].date} (${history.length} rows)`);
  } catch (err) {
    status.baseRate = { ok: false, at: new Date().toISOString(), error: String(err?.message || err), keptAsOf: prev?.asOf ?? null };
    console.warn(`[refresh] base-rate FAILED, keeping last good snapshot (asOf ${prev?.asOf ?? 'none'}): ${err?.message || err}`);
    if (!prev) throw new Error('no previous base-rate snapshot to fall back to');
  }
}

/**
 * Extension point: 국토교통부 실거래가 공개 API (data.go.kr).
 * Runs only when DATA_GO_KR_SERVICE_KEY is set. Without a key the site shows no market prices at all —
 * we never substitute estimated or sample prices.
 */
async function refreshTradeData(status) {
  if (!process.env.DATA_GO_KR_SERVICE_KEY) {
    status.trades = { ok: null, note: 'DATA_GO_KR_SERVICE_KEY not set; 실거래가 refresh skipped (no prices rendered).' };
    return;
  }
  status.trades = { ok: null, note: 'Key present but the 실거래가 module is not implemented yet; nothing fetched.' };
}

const status = await readJson(path.join(dataDir, 'refresh-status.json'), {});
let fatal = false;
try {
  await refreshBaseRate(status);
} catch (e) {
  console.error('[refresh] fatal:', e.message);
  fatal = true;
}
await refreshTradeData(status);
await writeFile(path.join(dataDir, 'refresh-status.json'), JSON.stringify(status, null, 2) + '\n', 'utf8');
// process.exitCode instead of process.exit(): avoids a libuv assertion on Windows when fetch sockets are closing.
process.exitCode = fatal ? 1 : 0;
