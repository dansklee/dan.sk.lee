/**
 * Wedding RSVP backend — Google Apps Script Web App.
 *
 * Deploy: Extensions > Apps Script, then Deploy > New deployment
 *   Type:          Web app
 *   Execute as:    Me
 *   Who has access: Anyone
 *
 * Set SPREADSHEET_ID in Project Settings > Script properties.
 * See docs/wedding-site/sheets-backend.md for the sheet layout.
 *
 * Endpoints
 *   GET  ?action=invite&code=AB12CD   -> the party for that code
 *   POST {action:"rsvp", ...}         -> upsert one party's response
 */

var GUESTS_SHEET = 'Guests';
var RESPONSES_SHEET = 'Responses';

var GUESTS_HEADERS = ['code', 'firstName', 'lastName', 'isPrimary', 'allowsPlusOne'];
var RESPONSES_HEADERS = [
  'updatedAt', 'code', 'status', 'attending', 'plusOneName',
  'dietaryRestrictions', 'songRequest', 'travelPlans', 'message', 'userAgent'
];

var CODE_LENGTH = 6;
var MAX_NAME = 80;
var MAX_SHORT_TEXT = 200;
var MAX_LONG_TEXT = 1000;
var LOCK_TIMEOUT_MS = 10000;
var SUBMIT_COOLDOWN_S = 10;

/** Fields a party may submit, with their length caps. */
var TEXT_FIELDS = [
  ['dietaryRestrictions', MAX_LONG_TEXT],
  ['songRequest', MAX_SHORT_TEXT],
  ['travelPlans', MAX_LONG_TEXT],
  ['message', MAX_LONG_TEXT]
];

// --- plumbing ---------------------------------------------------------------

function spreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID is not set in Script properties.');
  return SpreadsheetApp.openById(id);
}

function sheet_(name, headers) {
  var ss = spreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function ok_(data) {
  return json_({ ok: true, data: data || {} });
}

/** Errors carry a stable code for the client; messages stay user-safe. */
function fail_(errorCode, message) {
  return json_({ ok: false, error: errorCode, message: message });
}

function sanitize_(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
}

function normalizeCode_(value) {
  var code = sanitize_(value, CODE_LENGTH).toUpperCase();
  return /^[A-Z0-9]{6}$/.test(code) ? code : null;
}

/**
 * Leading "'" defuses text that Sheets would otherwise evaluate as a formula,
 * so a guest cannot inject =IMPORTXML(...) into the planning spreadsheet.
 */
function cellSafe_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

function truthy_(cell) {
  if (typeof cell === 'boolean') return cell;
  return String(cell).trim().toLowerCase() === 'true';
}

// --- routing ----------------------------------------------------------------

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (params.action !== 'invite') return fail_('INVALID_ACTION', 'Unknown action.');

    var code = normalizeCode_(params.code);
    if (!code) return fail_('INVALID_CODE', 'That invitation code is not valid.');

    var party = lookupParty_(code);
    if (!party) return fail_('NOT_FOUND', 'We could not find that invitation.');

    return ok_(party);
  } catch (err) {
    Logger.log('doGet: ' + err);
    return fail_('SERVER_ERROR', 'Something went wrong. Please try again.');
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return fail_('INVALID_BODY', 'Missing request body.');
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (_) {
      return fail_('INVALID_JSON', 'Malformed request.');
    }

    if (body.action !== 'rsvp') return fail_('INVALID_ACTION', 'Unknown action.');
    return handleRsvp_(body);
  } catch (err) {
    Logger.log('doPost: ' + err);
    return fail_('SERVER_ERROR', 'Something went wrong. Please try again.');
  }
}

// --- guest lookup -----------------------------------------------------------

/**
 * One row per invitee, grouped by shared code, so adding a person to a party
 * is a single new row in the spreadsheet.
 */
function lookupParty_(code) {
  var sheet = sheet_(GUESTS_SHEET, GUESTS_HEADERS);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  var rows = sheet.getRange(2, 1, lastRow - 1, GUESTS_HEADERS.length).getValues();
  var invitees = [];
  var allowsPlusOne = false;

  for (var i = 0; i < rows.length; i++) {
    if (normalizeCode_(rows[i][0]) !== code) continue;

    var firstName = sanitize_(String(rows[i][1]), MAX_NAME);
    if (!firstName) continue;

    invitees.push({
      id: code + '-' + invitees.length,
      firstName: firstName,
      lastName: sanitize_(String(rows[i][2]), MAX_NAME),
      isPrimary: truthy_(rows[i][3])
    });

    if (truthy_(rows[i][4])) allowsPlusOne = true;
  }

  if (!invitees.length) return null;

  return {
    code: code,
    invitees: invitees,
    allowsPlusOne: allowsPlusOne,
    existingResponse: findResponse_(code)
  };
}

// --- responses --------------------------------------------------------------

function responseRowIndex_(sheet, code) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;

  var codes = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (var i = 0; i < codes.length; i++) {
    if (normalizeCode_(codes[i][0]) === code) return i + 2;
  }
  return -1;
}

/** Lets a returning guest see and amend what they already sent. */
function findResponse_(code) {
  var sheet = sheet_(RESPONSES_SHEET, RESPONSES_HEADERS);
  var rowIndex = responseRowIndex_(sheet, code);
  if (rowIndex === -1) return null;

  var row = sheet.getRange(rowIndex, 1, 1, RESPONSES_HEADERS.length).getValues()[0];
  return {
    updatedAt: row[0] ? new Date(row[0]).toISOString() : '',
    status: String(row[2]),
    attending: String(row[3]) ? String(row[3]).split(', ') : [],
    plusOneName: String(row[4]),
    dietaryRestrictions: String(row[5]),
    songRequest: String(row[6]),
    travelPlans: String(row[7]),
    message: String(row[8])
  };
}

function handleRsvp_(body) {
  var code = normalizeCode_(body.code);
  if (!code) return fail_('INVALID_CODE', 'That invitation code is not valid.');

  var status = body.status;
  if (status !== 'attending' && status !== 'declined') {
    return fail_('INVALID_STATUS', 'Please tell us whether you can make it.');
  }

  var cache = CacheService.getScriptCache();
  var cacheKey = 'rsvp-' + code;
  if (cache.get(cacheKey)) {
    return fail_('RATE_LIMITED', 'Just a moment — that was already received.');
  }

  var party = lookupParty_(code);
  if (!party) return fail_('NOT_FOUND', 'We could not find that invitation.');

  // Trust the guest list, not the client: accept only names on the invitation.
  var invited = {};
  for (var i = 0; i < party.invitees.length; i++) {
    invited[party.invitees[i].id] = party.invitees[i];
  }

  var attending = [];
  var submitted = Array.isArray(body.attending) ? body.attending : [];
  for (var j = 0; j < submitted.length; j++) {
    var invitee = invited[submitted[j]];
    if (invitee) attending.push((invitee.firstName + ' ' + invitee.lastName).trim());
  }

  if (status === 'attending' && !attending.length) {
    return fail_('NO_GUESTS', 'Please select at least one guest, or decline.');
  }

  var plusOneName = party.allowsPlusOne && status === 'attending'
    ? sanitize_(body.plusOneName || '', MAX_NAME)
    : '';

  var text = {};
  for (var k = 0; k < TEXT_FIELDS.length; k++) {
    var field = TEXT_FIELDS[k][0];
    text[field] = cellSafe_(sanitize_(body[field] || '', TEXT_FIELDS[k][1]));
  }

  var row = [
    new Date(),
    code,
    status,
    attending.join(', '),
    cellSafe_(plusOneName),
    text.dietaryRestrictions,
    text.songRequest,
    text.travelPlans,
    text.message,
    sanitize_(body.userAgent || '', MAX_SHORT_TEXT)
  ];

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(LOCK_TIMEOUT_MS);
  } catch (_) {
    return fail_('BUSY', 'We are a little busy — please try again in a moment.');
  }

  try {
    var sheet = sheet_(RESPONSES_SHEET, RESPONSES_HEADERS);
    var existingRow = responseRowIndex_(sheet, code);

    // One row per party, overwritten on re-submit, so the sheet stays readable.
    if (existingRow === -1) {
      sheet.appendRow(row);
    } else {
      sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    }
  } finally {
    lock.releaseLock();
  }

  cache.put(cacheKey, '1', SUBMIT_COOLDOWN_S);
  return ok_({ status: status, attending: attending });
}

// --- authoring helpers (run manually from the Apps Script editor) -----------

/** Ambiguous characters are omitted so codes survive being read off paper. */
var CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function usedCodes_() {
  var sheet = sheet_(GUESTS_SHEET, GUESTS_HEADERS);
  var lastRow = sheet.getLastRow();
  var used = {};
  if (lastRow < 2) return used;

  var codes = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < codes.length; i++) {
    var code = normalizeCode_(codes[i][0]);
    if (code) used[code] = true;
  }
  return used;
}

/**
 * Log a batch of unused invite codes to paste into the Guests sheet.
 * Every row of one party shares a single code.
 */
function generateInviteCodes(count) {
  var used = usedCodes_();
  var generated = [];
  var attempts = 0;

  while (generated.length < (count || 10) && attempts < 1000) {
    attempts++;
    var code = '';
    for (var i = 0; i < CODE_LENGTH; i++) {
      code += CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length));
    }
    if (used[code]) continue;
    used[code] = true;
    generated.push(code);
  }

  Logger.log(generated.join('\n'));
  return generated;
}
