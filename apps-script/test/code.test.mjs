import fs from 'node:fs';
import assert from 'node:assert';

// --- minimal stubs for the Apps Script runtime -----------------------------
class Sheet {
  constructor(name){ this.name=name; this.rows=[]; }
  appendRow(r){ this.rows.push(r.slice()); }
  getLastRow(){ return this.rows.length; }
  setFrozenRows(){} 
  getRange(row, col, numRows=1, numCols=1){
    const self=this;
    return {
      getValues(){
        const out=[];
        for(let i=0;i<numRows;i++){
          const src=self.rows[row-1+i]||[];
          out.push(Array.from({length:numCols},(_,j)=>src[col-1+j] ?? ''));
        }
        return out;
      },
      setValues(vals){
        for(let i=0;i<vals.length;i++){
          const target=row-1+i;
          for(let j=0;j<vals[i].length;j++) self.rows[target][col-1+j]=vals[i][j];
        }
      },
      setFontWeight(){ return this; },
    };
  }
}
class SS {
  constructor(){ this.sheets=new Map(); }
  getSheetByName(n){ return this.sheets.get(n)||null; }
  insertSheet(n){ const s=new Sheet(n); this.sheets.set(n,s); return s; }
}
const book = new SS();
globalThis.SpreadsheetApp = { openById: () => book };
globalThis.PropertiesService = { getScriptProperties: () => ({ getProperty: () => 'sheet-id' }) };
const cache = new Map();
globalThis.CacheService = { getScriptCache: () => ({ get: k=>cache.get(k)||null, put:(k,v)=>cache.set(k,v) }) };
globalThis.LockService = { getScriptLock: () => ({ waitLock(){}, releaseLock(){} }) };
globalThis.ContentService = {
  MimeType:{JSON:'json'},
  createTextOutput: t => ({ setMimeType(){ return { getContent: () => t, _t:t }; } }),
};
globalThis.Logger = { log(){} };

import vm from 'node:vm';
vm.runInThisContext(fs.readFileSync(new URL('../Code.gs', import.meta.url),'utf8'));
const { doGet, doPost } = globalThis;

const parse = r => JSON.parse(r._t);
const get  = p => parse(doGet({ parameter: p }));
const post = b => parse(doPost({ postData: { contents: JSON.stringify(b) } }));

// --- seed a guest list -----------------------------------------------------
const guests = book.insertSheet('Guests');
guests.appendRow(['code','firstName','lastName','isPrimary','allowsPlusOne']);
guests.appendRow(['AB12CD','Alex','Lee',true,false]);
guests.appendRow(['ab12cd','Sam','Lee',false,false]);   // lowercase in sheet
guests.appendRow(['ZZ99ZZ','Jo','Park',true,'TRUE']);   // string boolean

// --- lookup ----------------------------------------------------------------
let r = get({action:'invite', code:'ab12cd'});
assert.equal(r.ok,true,'lowercase code should resolve');
assert.equal(r.data.invitees.length,2,'both party members returned');
assert.equal(r.data.allowsPlusOne,false);
assert.equal(r.data.existingResponse,null);
const [alex,sam] = r.data.invitees.map(i=>i.id);

assert.equal(get({action:'invite',code:'NOPE12'}).error,'NOT_FOUND');
assert.equal(get({action:'invite',code:'short'}).error,'INVALID_CODE');
assert.equal(get({action:'bogus',code:'AB12CD'}).error,'INVALID_ACTION');
assert.equal(get({}).error,'INVALID_ACTION');

// --- submit ----------------------------------------------------------------
assert.equal(post({action:'rsvp',code:'AB12CD',status:'attending',attending:[]}).error,'NO_GUESTS');
cache.clear();

r = post({action:'rsvp',code:'AB12CD',status:'attending',attending:[alex,sam],
          dietaryRestrictions:'=cmd|calc', songRequest:'Dancing Queen'});
assert.equal(r.ok,true);
assert.deepEqual(r.data.attending,['Alex Lee','Sam Lee']);
cache.clear();

const responses = book.getSheetByName('Responses');
assert.equal(responses.getLastRow(),2,'header + one party row');
assert.equal(responses.rows[1][5],"'=cmd|calc",'formula injection is defused');

// spoofed invitee id from another party must be dropped
r = post({action:'rsvp',code:'AB12CD',status:'attending',attending:[alex,'ZZ99ZZ-0']});
assert.deepEqual(r.data.attending,['Alex Lee'],'foreign invitee rejected');
assert.equal(responses.getLastRow(),2,'re-submit overwrites, does not append');
cache.clear();

// existing response is returned for amending
r = get({action:'invite', code:'AB12CD'});
assert.equal(r.data.existingResponse.status,'attending');
assert.deepEqual(r.data.existingResponse.attending,['Alex Lee']);

// rate limit
post({action:'rsvp',code:'AB12CD',status:'declined',attending:[]});
assert.equal(post({action:'rsvp',code:'AB12CD',status:'declined',attending:[]}).error,'RATE_LIMITED');
cache.clear();

// declining needs no guests; plus-one only where offered
assert.equal(post({action:'rsvp',code:'AB12CD',status:'declined',attending:[]}).ok,true);
cache.clear();
r = post({action:'rsvp',code:'AB12CD',status:'attending',attending:[alex],plusOneName:'Guest'});
assert.equal(responses.rows[1][4],'','plus-one ignored when not offered');
cache.clear();
post({action:'rsvp',code:'ZZ99ZZ',status:'attending',attending:['ZZ99ZZ-0'],plusOneName:'Robin'});
assert.equal(responses.rows[2][4],'Robin','plus-one kept when offered');
cache.clear();

// malformed input
assert.equal(doPost({}) && parse(doPost({})).error,'INVALID_BODY');
assert.equal(parse(doPost({postData:{contents:'{oops'}})).error,'INVALID_JSON');
assert.equal(post({action:'rsvp',code:'AB12CD',status:'maybe',attending:[]}).error,'INVALID_STATUS');

console.log('all', 26, 'backend assertions passed');

// --- invite code generation ------------------------------------------------
const { generateInviteCodes } = globalThis;
const codes = generateInviteCodes(50);
assert.equal(codes.length, 50);
assert.equal(new Set(codes).size, 50, 'codes are unique');
assert.ok(codes.every(c => /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/.test(c)), 'no ambiguous chars');

// Pin Math.random so every draw collides with a code already in use: the
// generator must give up rather than hand back a duplicate.
guests.appendRow(['AAAAAA','Robin','Shaw',true,false]);
const realRandom = Math.random;
Math.random = () => 0;
try {
  assert.deepEqual(generateInviteCodes(5), [], 'never reissues a code already in the sheet');
} finally {
  Math.random = realRandom;
}
console.log('code generation assertions passed');
