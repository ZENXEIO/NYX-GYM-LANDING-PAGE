import { OpeningSlot, site } from '../content/site';

/** Day of the week (0 = Sunday) and minutes since midnight, in Mumbai time. */
export function mumbaiNow(now: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** 300 → '5:00', 1260 → '21:00', 1440 → 'midnight'. */
function clock(minutes: number): string {
  if (minutes >= 24 * 60) return site.status.midnight;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;
}

/**
 * The live opening line, e.g. "Open now, until midnight" or
 * "Opens tomorrow at 5:00". Browser-only: call it after render, so the
 * prerendered HTML (which shows `site.hoursShort`) never mismatches.
 */
export function openStatus(
  now: Date,
  schedule: readonly OpeningSlot[] = site.schedule,
): { open: boolean; text: string } {
  const { day, minutes } = mumbaiNow(now);
  const slotFor = (d: number) => schedule.find((s) => s.days.includes(d));
  const today = slotFor(day);
  if (today && minutes >= today.opens && minutes < today.closes) {
    return { open: true, text: site.status.openUntil.replace('{time}', clock(today.closes)) };
  }
  if (today && minutes < today.opens) {
    return { open: false, text: site.status.opensToday.replace('{time}', clock(today.opens)) };
  }
  const next = slotFor((day + 1) % 7);
  return {
    open: false,
    text: next ? site.status.opensTomorrow.replace('{time}', clock(next.opens)) : site.hoursShort,
  };
}
