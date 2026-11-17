import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import {
  TOUR_RETRY_DELAY_MS,
  isRetryable,
  toTourResult,
  TOUR_TIMEOUT_MS,
  TourApiService,
  TourRequest,
  TourResult,
} from './tour-api.service';

const body: TourRequest = {
  name: 'Asha Rao',
  phone: '9820012345',
  email: 'asha@example.com',
  date: '2027-01-02',
  slot: 'evening',
  interest: 'tour',
  company: '',
};
const URL = 'https://api.example/tour';

describe('TourApiService', () => {
  let api: TourApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(TourApiService);
    api.endpoint = URL;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  function run(): { result: () => TourResult | undefined } {
    let result: TourResult | undefined;
    api.submit(body, 'key-123').subscribe((r) => (result = r));
    return { result: () => result };
  }

  it('posts JSON with the idempotency key and maps 201 to success', () => {
    const r = run();
    const req = http.expectOne(URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Idempotency-Key')).toBe('key-123');
    expect(req.request.body).toEqual(body);
    req.flush({}, { status: 201, statusText: 'Created' });
    expect(r.result()).toEqual({ kind: 'success' });
  });

  it('maps 422 field errors back to the form', () => {
    const r = run();
    http
      .expectOne(URL)
      .flush(
        { errors: { phone: 'Number not recognised.' } },
        { status: 422, statusText: 'Unprocessable' },
      );
    expect(r.result()).toEqual({ kind: 'invalid', fields: { phone: 'Number not recognised.' } });
  });

  it('maps 429 to rate-limited without retrying', () => {
    const r = run();
    http.expectOne(URL).flush(null, { status: 429, statusText: 'Too Many Requests' });
    vi.advanceTimersByTime(TOUR_RETRY_DELAY_MS * 2);
    http.expectNone(URL);
    expect(r.result()).toEqual({ kind: 'rate-limited' });
  });

  it('retries once on 5xx, reusing the same idempotency key, then succeeds', () => {
    const r = run();
    http.expectOne(URL).flush(null, { status: 503, statusText: 'Unavailable' });
    vi.advanceTimersByTime(TOUR_RETRY_DELAY_MS);
    const retry = http.expectOne(URL);
    expect(retry.request.headers.get('Idempotency-Key')).toBe('key-123');
    retry.flush({}, { status: 201, statusText: 'Created' });
    expect(r.result()).toEqual({ kind: 'success' });
  });

  it('gives up after one retry and reports unavailable', () => {
    const r = run();
    http.expectOne(URL).flush(null, { status: 500, statusText: 'Error' });
    vi.advanceTimersByTime(TOUR_RETRY_DELAY_MS);
    http.expectOne(URL).flush(null, { status: 502, statusText: 'Bad Gateway' });
    expect(r.result()).toEqual({ kind: 'unavailable' });
  });

  it('times out after 10 s and reports unavailable', () => {
    const r = run();
    http.expectOne(URL);
    vi.advanceTimersByTime(TOUR_TIMEOUT_MS + 1);
    expect(r.result()).toEqual({ kind: 'unavailable' });
  });

  it('sends nothing when the honeypot is filled', () => {
    let result: TourResult | undefined;
    api.submit({ ...body, company: 'Acme' }, 'k').subscribe((x) => (result = x));
    http.expectNone(URL);
    expect(result).toEqual({ kind: 'success' });
  });

  it('simulates success when no endpoint is configured (dev)', () => {
    api.endpoint = '';
    api.demoMode = true;
    const r = run();
    vi.advanceTimersByTime(1000);
    http.expectNone(URL);
    expect(r.result()).toEqual({ kind: 'success' });
  });

  it('reports unavailable, not success, with no endpoint in production', () => {
    api.endpoint = '';
    api.demoMode = false;
    const r = run();
    vi.advanceTimersByTime(1000);
    http.expectNone(URL);
    expect(r.result()).toEqual({ kind: 'unavailable' });
  });

  it('retries a network failure (status 0) once with the same key', () => {
    const r = run();
    http.expectOne(URL).error(new ProgressEvent('error'), { status: 0 });
    vi.advanceTimersByTime(TOUR_RETRY_DELAY_MS);
    const retry = http.expectOne(URL);
    expect(retry.request.headers.get('Idempotency-Key')).toBe('key-123');
    retry.flush({}, { status: 201, statusText: 'Created' });
    expect(r.result()).toEqual({ kind: 'success' });
  });

  it('does not retry other 4xx errors and falls back to phone/WhatsApp', () => {
    const r = run();
    http.expectOne(URL).flush(null, { status: 400, statusText: 'Bad Request' });
    vi.advanceTimersByTime(TOUR_RETRY_DELAY_MS * 2);
    http.expectNone(URL);
    expect(r.result()).toEqual({ kind: 'unavailable' });
  });

  it('maps a 422 without a field list to "invalid" with no field errors', () => {
    const r = run();
    http.expectOne(URL).flush(null, { status: 422, statusText: 'Unprocessable' });
    expect(r.result()).toEqual({ kind: 'invalid', fields: {} });
  });

  it('does not wait before the first attempt, only before the retry', () => {
    run();
    http.expectOne(URL).flush(null, { status: 503, statusText: 'Unavailable' });
    vi.advanceTimersByTime(TOUR_RETRY_DELAY_MS - 1);
    http.expectNone(URL);
    vi.advanceTimersByTime(1);
    http.expectOne(URL).flush({}, { status: 201, statusText: 'Created' });
  });

  it('treats a whitespace-only honeypot as empty (real people can paste spaces)', () => {
    run();
    api.submit({ ...body, company: '   ' }, 'k2').subscribe();
    const reqs = http.match(URL);
    expect(reqs).toHaveLength(2);
    reqs.forEach((q) => q.flush({}, { status: 201, statusText: 'Created' }));
  });

  it('never puts personal data in the URL', () => {
    run();
    const req = http.expectOne(URL);
    expect(req.request.urlWithParams).toBe(URL);
    req.flush({}, { status: 201, statusText: 'Created' });
  });
});

describe('isRetryable', () => {
  const err = (status: number) => new HttpErrorResponse({ status });

  it.each([0, 500, 502, 503, 504])('retries status %i', (s) =>
    expect(isRetryable(err(s))).toBe(true),
  );
  it.each([400, 401, 403, 404, 409, 422, 429])('does not retry status %i', (s) =>
    expect(isRetryable(err(s))).toBe(false),
  );
  it('does not retry a timeout (the request already took 10 s)', () =>
    expect(isRetryable(new TimeoutError())).toBe(false));
});

describe('toTourResult', () => {
  it('maps 422 field errors', () =>
    expect(
      toTourResult(new HttpErrorResponse({ status: 422, error: { errors: { email: 'Bad' } } })),
    ).toEqual({ kind: 'invalid', fields: { email: 'Bad' } }));
  it('maps 429', () =>
    expect(toTourResult(new HttpErrorResponse({ status: 429 }))).toEqual({ kind: 'rate-limited' }));
  it.each([0, 400, 500, 503])('maps status %i to unavailable', (s) =>
    expect(toTourResult(new HttpErrorResponse({ status: s }))).toEqual({ kind: 'unavailable' }),
  );
  it('maps unknown errors to unavailable', () => {
    expect(toTourResult(new TimeoutError())).toEqual({ kind: 'unavailable' });
    expect(toTourResult(new Error('boom'))).toEqual({ kind: 'unavailable' });
  });
});
