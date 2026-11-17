/**
 * Geometry for the footer's Queen's Necklace: a string of lights hung from the
 * footer's top hairline, sagging to a bronze pendant at its lowest point.
 * Two mirrored halves, each drawn from its own edge towards the middle.
 * Pure maths, evaluated at build time, so the footer prerenders complete.
 */

type P = readonly [number, number];

export interface Necklace {
  viewBox: string;
  /** The two halves, left then right; each path starts at its edge. */
  paths: readonly [string, string];
  /** Lights along both halves. `at` is the share of its half drawn when the light comes on. */
  lights: { x: number; y: number; at: number }[];
  /** Where the pendant hangs (the halves meet), as percentages of the drawing. */
  end: { left: string; top: string };
}

const cubic = (p: readonly P[], t: number): P => {
  const m = 1 - t;
  const a = m * m * m;
  const b = 3 * m * m * t;
  const c = 3 * m * t * t;
  const e = t * t * t;
  return [
    a * p[0][0] + b * p[1][0] + c * p[2][0] + e * p[3][0],
    a * p[0][1] + b * p[1][1] + c * p[2][1] + e * p[3][1],
  ];
};

const r2 = (v: number) => Math.round(v * 100) / 100;
const pathOf = (p: readonly P[]) =>
  `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`;

/** `half` runs from the left edge to the middle; the right half is its mirror. */
function build(w: number, h: number, half: readonly P[], perHalf: number): Necklace {
  // Arc length by sampling, so each light comes on exactly as the line reaches it.
  const N = 400;
  const len: number[] = [0];
  let prev = cubic(half, 0);
  for (let i = 1; i <= N; i++) {
    const q = cubic(half, i / N);
    len.push(len[i - 1] + Math.hypot(q[0] - prev[0], q[1] - prev[1]));
    prev = q;
  }
  const total = len[N];
  const left = Array.from({ length: perHalf }, (_, k) => {
    // Evenly spaced along the length, stopping short of the pendant.
    const want = total * (0.06 + (0.86 * k) / (perHalf - 1));
    let i = 1;
    while (i < N && len[i] < want) i++;
    const t = (i - 1 + (want - len[i - 1]) / (len[i] - len[i - 1] || 1)) / N;
    const [x, y] = cubic(half, t);
    return { x: r2(x), y: r2(y), at: r2(want / total) };
  });
  const mirror = (p: readonly P[]): P[] => p.map(([x, y]) => [w - x, y] as P);
  const [, ey] = half[3];
  return {
    viewBox: `0 0 ${w} ${h}`,
    paths: [pathOf(half), pathOf(mirror(half))],
    lights: [...left, ...left.map((l) => ({ ...l, x: r2(w - l.x) }))],
    end: { left: '50%', top: `${r2((ey / h) * 100)}%` },
  };
}

/** From 768px: a long, shallow sag across the footer. */
export const WIDE_NECKLACE = build(
  1200,
  150,
  [
    [0, 0],
    [170, 95],
    [410, 140],
    [600, 140],
  ],
  17,
);

/** Phones: a deeper sag, so it still reads as hanging. */
export const NARROW_NECKLACE = build(
  360,
  200,
  [
    [0, 0],
    [60, 120],
    [120, 185],
    [180, 185],
  ],
  7,
);
