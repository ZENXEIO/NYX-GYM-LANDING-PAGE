/**
 * Geometry for the footer's Queen's Necklace: Marine Drive's curve sweeping
 * from the lower left up to a bronze button, with a string of streetlights.
 * Pure maths, evaluated at build time, so the footer prerenders complete.
 */

type P = readonly [number, number];

export interface Necklace {
  viewBox: string;
  d: string;
  /** Lights along the curve. `at` is the share of the curve's length drawn when the light comes on. */
  lights: { x: number; y: number; at: number }[];
  /** Where the button sits, as percentages of the drawing. */
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

function build(w: number, h: number, p: readonly P[], count: number): Necklace {
  // Arc length by sampling, so each light comes on exactly as the line reaches it.
  const N = 400;
  const len: number[] = [0];
  let prev = cubic(p, 0);
  for (let i = 1; i <= N; i++) {
    const q = cubic(p, i / N);
    len.push(len[i - 1] + Math.hypot(q[0] - prev[0], q[1] - prev[1]));
    prev = q;
  }
  const total = len[N];
  const lights = Array.from({ length: count }, (_, k) => {
    // Evenly spaced along the length, stopping short of the button.
    const want = total * (0.05 + (0.88 * k) / (count - 1));
    let i = 1;
    while (i < N && len[i] < want) i++;
    const t = (i - 1 + (want - len[i - 1]) / (len[i] - len[i - 1] || 1)) / N;
    const [x, y] = cubic(p, t);
    return { x: r2(x), y: r2(y), at: r2(want / total) };
  });
  const [ex, ey] = p[3];
  return {
    viewBox: `0 0 ${w} ${h}`,
    d: `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${ex} ${ey}`,
    lights,
    end: { left: `${r2((ex / w) * 100)}%`, top: `${r2((ey / h) * 100)}%` },
  };
}

/** From 768px: a long, low sweep across the footer. */
export const WIDE_NECKLACE = build(
  1200,
  280,
  [
    [0, 262],
    [420, 262],
    [860, 214],
    [1140, 56],
  ],
  34,
);

/** Phones: a tighter curve that still ends high on the right. */
export const NARROW_NECKLACE = build(
  360,
  260,
  [
    [-20, 244],
    [120, 244],
    [250, 204],
    [312, 52],
  ],
  14,
);
