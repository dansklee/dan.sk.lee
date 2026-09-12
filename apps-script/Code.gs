/**
 * Wedding RSVP backend — Google Apps Script Web App.
 *
 * Deploy: Extensions > Apps Script, then Deploy > New deployment
 *   Type:           Web app
 *   Execute as:     Me
 *   Who has access: Anyone
 *
 * Set SPREADSHEET_ID in Project Settings > Script properties.
 * See docs/wedding-site/sheets-backend.md for the sheet layout.
 *
 * The fields mirror the RSVP form in the designer's comps exactly.
 */

var RESPONSES_SHEET = 'Responses';

var RESPONSES_HEADERS = [
  'timestamp', 'names', 'attending', 'ceremony', 'reception',
  'dietaryRestrictions', 'dietaryNotes', 'userAgent'
];

var MAX_NAMES = 200;
var MAX_NOTES = 1000;
var MAX_USER_AGENT = 200;
var MIN_NAMES = 2;
var LOCK_TIMEOUT_MS = 10000;
var SUBMIT_COOLDOWN_S = 15;

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

/** Errors carry a stable code for the client; messages stay safe to show. */
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

/**
 * Leading "'" defuses text that Sheets would otherwise evaluate as a formula,
 * so a guest cannot land =IMPORTXML(...) in the planning spreadsheet.
 */
function cellSafe_(value) {
  return /^[=+\-@]/.test(value) ? "'" + value : value;
}

/** Tri-state: true, false, or '' when the question does not apply. */
function optionalBool_(value) {
  if (value === true || value === false) return value;
  return '';
}

// --- routing ----------------------------------------------------------------

function doGet() {
  // Nothing to read: responses are private to the couple's spreadsheet.
  return fail_('INVALID_ACTION', 'Unknown action.');
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

// --- responses --------------------------------------------------------------

function handleRsvp_(body) {
  var names = sanitize_(body.names, MAX_NAMES);
  if (names.length < MIN_NAMES) {
    return fail_('INVALID_NAMES', 'Please tell us who is replying.');
  }

  var attending = body.attending;
  if (attending !== 'accepts' && attending !== 'declines') {
    return fail_('INVALID_ATTENDING', 'Please let us know if you can make it.');
  }

  var accepting = attending === 'accepts';

  // Ceremony and reception only matter for guests who are coming.
  var ceremony = accepting ? optionalBool_(body.ceremony) : '';
  var reception = accepting ? optionalBool_(body.reception) : '';
  if (accepting && (ceremony === '' || reception === '')) {
    return fail_('INCOMPLETE', 'Please answer the ceremony and reception questions.');
  }

  var dietary = accepting ? optionalBool_(body.dietaryRestrictions) : '';
  if (accepting && dietary === '') {
    return fail_('INCOMPLETE', 'Please answer the dietary restrictions question.');
  }

  var dietaryNotes = dietary === true
    ? cellSafe_(sanitize_(body.dietaryNotes || '', MAX_NOTES))
    : '';
  if (dietary === true && !dietaryNotes) {
    return fail_('INCOMPLETE', 'Please tell us about your dietary restrictions.');
  }

  // One guest double-tapping submit should not land two rows.
  var cache = CacheService.getScriptCache();
  var cacheKey = 'rsvp-' + names.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cache.get(cacheKey)) {
    return fail_('RATE_LIMITED', 'We already have that — thank you!');
  }

  var row = [
    new Date(),
    cellSafe_(names),
    attending,
    ceremony,
    reception,
    dietary,
    dietaryNotes,
    sanitize_(body.userAgent || '', MAX_USER_AGENT)
  ];

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(LOCK_TIMEOUT_MS);
  } catch (_) {
    return fail_('BUSY', 'We are a little busy — please try again in a moment.');
  }

  try {
    // Append rather than overwrite: with free-text names there is no reliable
    // key, and losing a reply is far worse than reading two. Newest row wins.
    sheet_(RESPONSES_SHEET, RESPONSES_HEADERS).appendRow(row);
  } finally {
    lock.releaseLock();
  }

  cache.put(cacheKey, '1', SUBMIT_COOLDOWN_S);
  return ok_({ attending: attending });
}
