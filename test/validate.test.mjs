/**
 * Rules for the RSVP form, tested without a DOM.
 * Run: npm run test:validate
 */
import assert from 'node:assert';
import { validateRsvp, firstName, FIELD_ORDER } from '../lib/rsvp/validate.ts';

const base = {
  names: '', attending: null, ceremony: null,
  reception: null, dietary: null, dietaryNotes: '',
};
const accepting = {
  ...base, names: 'Alex & Sam Lee', attending: 'accepts',
  ceremony: 'yes', reception: 'yes', dietary: 'no',
};

// An empty form reports both problems at once, not one at a time.
let { valid, errors } = validateRsvp(base);
assert.equal(valid, false);
assert.deepEqual(Object.keys(errors).sort(), ['attending', 'names']);

assert.equal(validateRsvp({ ...base, names: '   ' }).errors.names, 'Please tell us who you are.');

// Declining skips every question below the attendance choice: validating
// collapsed inputs would point at markup the guest cannot see.
({ valid, errors } = validateRsvp({ ...base, names: 'Jo Park', attending: 'declines' }));
assert.equal(valid, true, 'declining needs nothing else');
assert.deepEqual(errors, {});

// Accepting requires all three.
errors = validateRsvp({ ...accepting, ceremony: null, reception: null, dietary: null }).errors;
assert.deepEqual(Object.keys(errors).sort(), ['ceremony', 'dietary', 'reception']);

assert.equal(validateRsvp(accepting).valid, true);

// The specify box only matters when they said yes to restrictions.
assert.equal(validateRsvp({ ...accepting, dietary: 'yes' }).errors.dietaryNotes,
  'Please tell us what to avoid.');
assert.equal(validateRsvp({ ...accepting, dietary: 'yes', dietaryNotes: 'No shellfish' }).valid, true);
assert.equal(validateRsvp({ ...accepting, dietary: 'no', dietaryNotes: '' }).valid, true,
  'notes are irrelevant when they said no');

// Focus order follows the form top to bottom.
assert.deepEqual(FIELD_ORDER,
  ['names', 'attending', 'ceremony', 'reception', 'dietary', 'dietaryNotes']);

assert.equal(firstName('Alex & Sam Lee'), 'Alex');
assert.equal(firstName('  Jo   Park '), 'Jo');
assert.equal(firstName('Alex,Sam'), 'Alex');
assert.equal(firstName(''), '');

console.log('validation: all assertions passed');
