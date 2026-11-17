import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Indian mobile: optional +91 / 91 prefix, then 10 digits starting 6–9. Spaces and hyphens are ignored. */
export const INDIAN_MOBILE = /^(?:\+?91)?[6-9]\d{9}$/;

export function normalisePhone(value: string): string {
  return value.replace(/[\s-]/g, '');
}

export const indianMobile: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = String(c.value ?? '');
  if (!v) return null; // `required` reports empty values
  return INDIAN_MOBILE.test(normalisePhone(v)) ? null : { indianMobile: true };
};

/** Local date as YYYY-MM-DD (the value format of <input type="date">). */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Date must be today or later. */
export function notInPast(now: () => Date = () => new Date()): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = String(c.value ?? '');
    if (!v) return null;
    return v >= todayIso(now()) ? null : { notInPast: true };
  };
}
