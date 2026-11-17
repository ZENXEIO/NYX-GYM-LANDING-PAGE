// Load test for the tour form endpoint (CLAUDE.md §10, §14).
// The endpoint lives outside this repo; run this against its STAGING URL only.
//
//   k6 run -e TOUR_ENDPOINT=https://staging-forms.example/tour load/tour.k6.js
//   docker run --rm -i -e TOUR_ENDPOINT=... grafana/k6 run - < load/tour.k6.js
//
// Scenarios:
//   ramp      — 0 → 200 req/s over 3 min, hold 2 min. p95 < 500 ms, < 1% 5xx.
//   abuse     — one client hammering: must be rate-limited (429) after 5 requests.
//   replay    — the same Idempotency-Key sent 5 times: only the first may create a lead.
//
// Synthetic data only. Never point this at production or use real phone numbers.
import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate } from 'k6/metrics';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const URL = __ENV.TOUR_ENDPOINT;
if (!URL) throw new Error('Set TOUR_ENDPOINT to the staging form endpoint.');

const serverErrors = new Rate('server_errors');
const rateLimited = new Counter('rate_limited');

export const options = {
  scenarios: {
    ramp: {
      executor: 'ramping-arrival-rate',
      exec: 'ramp',
      startRate: 0,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 400,
      stages: [
        { duration: '3m', target: 200 },
        { duration: '2m', target: 200 },
        { duration: '30s', target: 0 },
      ],
    },
    abuse: {
      executor: 'per-vu-iterations',
      exec: 'abuse',
      vus: 1,
      iterations: 1,
      startTime: '6m',
    },
    replay: {
      executor: 'per-vu-iterations',
      exec: 'replay',
      vus: 1,
      iterations: 1,
      startTime: '6m30s',
    },
  },
  thresholds: {
    'http_req_duration{scenario:ramp}': ['p(95)<500'],
    server_errors: ['rate<0.01'],
    'checks{scenario:abuse}': ['rate==1'],
    'checks{scenario:replay}': ['rate==1'],
  },
};

function body() {
  const n = String(Math.floor(Math.random() * 1e9)).padStart(9, '0');
  const d = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  return JSON.stringify({
    name: 'Load Test',
    phone: `+919${n}`,
    email: `load+${n}@example.com`,
    date: d,
    slot: 'evening',
    interest: 'tour',
    company: '',
    turnstileToken: __ENV.TURNSTILE_TEST_TOKEN || 'XXXX.DUMMY.TOKEN.XXXX',
  });
}

function post(payload, key, ip) {
  const headers = { 'Content-Type': 'application/json', 'Idempotency-Key': key };
  // Distinct client IPs for the ramp, if the staging endpoint trusts this header.
  if (ip) headers['X-Forwarded-For'] = ip;
  return http.post(URL, payload, { headers, tags: { name: 'tour' } });
}

export function ramp() {
  const ip = `10.${__VU % 255}.${__ITER % 255}.${Math.floor(Math.random() * 255)}`;
  const res = post(body(), uuidv4(), ip);
  serverErrors.add(res.status >= 500);
  if (res.status === 429) rateLimited.add(1);
  check(res, { 'ramp: 201 or 429, never 5xx': (r) => r.status === 201 || r.status === 429 });
}

export function abuse() {
  const statuses = [];
  for (let i = 0; i < 8; i++) statuses.push(post(body(), uuidv4()).status);
  check(statuses, {
    'abuse: first 5 accepted': (s) => s.slice(0, 5).every((x) => x === 201),
    'abuse: then 429': (s) => s.slice(5).every((x) => x === 429),
  });
}

export function replay() {
  const key = uuidv4();
  const payload = body();
  const statuses = [];
  for (let i = 0; i < 5; i++) statuses.push(post(payload, key, `10.250.0.${i}`).status);
  check(statuses, {
    'replay: every response is a success (deduplicated, not an error)': (s) =>
      s.every((x) => x === 201 || x === 200),
  });
  // Lead count must be checked in the endpoint's store: exactly one for `key`.
}
