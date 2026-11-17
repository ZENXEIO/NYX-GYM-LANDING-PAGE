import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, delay, map, of, retry, throwError, timeout, timer } from 'rxjs';
import { environment } from '../../environments/environment';

/** Request body for the tour endpoint (CLAUDE.md §10). */
export interface TourRequest {
  name: string;
  phone: string;
  email: string;
  date: string;
  slot: string;
  interest: string;
  /** Honeypot. Real people leave it empty. */
  company: string;
  turnstileToken?: string;
}

export type TourField = 'name' | 'phone' | 'email' | 'date' | 'slot';

export type TourResult =
  | { kind: 'success' }
  | { kind: 'invalid'; fields: Partial<Record<TourField, string>> }
  | { kind: 'rate-limited' }
  | { kind: 'unavailable' };

export const TOUR_TIMEOUT_MS = 10_000;
export const TOUR_RETRY_DELAY_MS = 800;

/** Only network failures (status 0) and server errors are worth one retry. */
export function isRetryable(err: unknown): boolean {
  return err instanceof HttpErrorResponse && (err.status === 0 || err.status >= 500);
}

export function toTourResult(err: unknown): TourResult {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 422) {
      const fields = (err.error as { errors?: Partial<Record<TourField, string>> } | null)?.errors;
      return { kind: 'invalid', fields: fields ?? {} };
    }
    if (err.status === 429) return { kind: 'rate-limited' };
  }
  return { kind: 'unavailable' };
}

@Injectable({ providedIn: 'root' })
export class TourApiService {
  private readonly http = inject(HttpClient);
  /** Overridable in tests. */
  endpoint = environment.tourEndpoint;
  /** Dev only: simulate success when no endpoint is set. Overridable in tests. */
  demoMode = !environment.production;

  submit(body: TourRequest, idempotencyKey: string): Observable<TourResult> {
    // Honeypot filled: quietly pretend success, send nothing.
    if (body.company.trim()) return of<TourResult>({ kind: 'success' });

    // No endpoint configured. In dev, simulate success. In production, never
    // pretend a lead was received: show the phone/WhatsApp fallback instead.
    if (!this.endpoint) {
      return this.demoMode
        ? of<TourResult>({ kind: 'success' }).pipe(delay(700))
        : of<TourResult>({ kind: 'unavailable' });
    }

    return this.http
      .post(this.endpoint, body, {
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      })
      .pipe(
        timeout(TOUR_TIMEOUT_MS),
        retry({
          count: 1,
          delay: (err: unknown) =>
            isRetryable(err) ? timer(TOUR_RETRY_DELAY_MS) : throwError(() => err),
        }),
        map((): TourResult => ({ kind: 'success' })),
        catchError((err: unknown) => of(toTourResult(err))),
      );
  }
}
