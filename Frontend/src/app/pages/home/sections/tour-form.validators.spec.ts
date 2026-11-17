import { FormControl } from '@angular/forms';
import { indianMobile, normalisePhone, notInPast, todayIso } from './tour-form.validators';

describe('indianMobile', () => {
  const check = (v: string) => indianMobile(new FormControl(v));

  it.each([
    '9820012345',
    '98200 12345',
    '+91 98200 12345',
    '+91-9820012345',
    '919820012345',
    '6000000000',
    '7000000000',
    '8999999999',
    ' 98200 12345 ',
  ])('accepts %s', (v) => expect(check(v)).toBeNull());

  it.each([
    '5820012345',
    '982001234',
    '98200123456',
    '+1 9820012345',
    'abcdefghij',
    '022 2345 6789',
    '0000000000',
    '+91 5820012345',
    '09820012345',
    '9820o12345',
    '+919820012345 ext 2',
  ])('rejects %s', (v) => expect(check(v)).toEqual({ indianMobile: true }));

  it('leaves empty values to `required`', () => expect(check('')).toBeNull());
  it('treats null as empty', () => expect(indianMobile(new FormControl(null))).toBeNull());

  it('normalises spaces and hyphens', () =>
    expect(normalisePhone('+91 98200-12345')).toBe('+919820012345'));
});

describe('notInPast', () => {
  const now = () => new Date(2026, 10, 16, 23, 30); // 16 Nov 2026, late evening local time
  const check = (v: string) => notInPast(now)(new FormControl(v));

  it('formats today as YYYY-MM-DD in local time', () => expect(todayIso(now())).toBe('2026-11-16'));
  it('accepts today', () => expect(check('2026-11-16')).toBeNull());
  it('accepts a future date', () => expect(check('2027-01-02')).toBeNull());
  it('rejects yesterday', () => expect(check('2026-11-15')).toEqual({ notInPast: true }));
  it('leaves empty values to `required`', () => expect(check('')).toBeNull());
});

describe('todayIso', () => {
  it('zero-pads single-digit months and days', () =>
    expect(todayIso(new Date(2027, 0, 5))).toBe('2027-01-05'));
  it('handles a leap day', () => expect(todayIso(new Date(2028, 1, 29))).toBe('2028-02-29'));
  it('uses local time just after midnight, not UTC (IST is UTC+5:30)', () =>
    expect(todayIso(new Date(2026, 11, 31, 0, 5))).toBe('2026-12-31'));
});

describe('notInPast across a year boundary', () => {
  const check = (v: string) => notInPast(() => new Date(2026, 11, 31))(new FormControl(v));
  it('rejects last year', () => expect(check('2025-12-31')).toEqual({ notInPast: true }));
  it('accepts next year', () => expect(check('2027-01-01')).toBeNull());
  it('treats null as empty', () => expect(notInPast()(new FormControl(null))).toBeNull());
});
