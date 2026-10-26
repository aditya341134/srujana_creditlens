/**
 * CreditLens ULAS Dynamic Continuous Color Interpolation
 * Conforms to:
 * - 0–20: Red to red-orange
 * - 21–40: Orange (e.g. 25: vibrant orange)
 * - 41–60: Amber to yellow (e.g. 50: warm amber/yellow)
 * - 61–80: Yellow-green (e.g. 75: yellow-green)
 * - 81–100: Green (e.g. 100: deep forest teal-green)
 */

const COLOR_STOPS = [
  { score: 0,   r: 220, g: 38,  b: 38  }, // 0: Pure Red (#DC2626)
  { score: 20,  r: 234, g: 88,  b: 12  }, // 20: Red-Orange (#EA580C)
  { score: 30,  r: 249, g: 115, b: 22  }, // 30: Orange (#F97316)
  { score: 40,  r: 245, g: 158, b: 11  }, // 40: Warm Amber (#F59E0B)
  { score: 50,  r: 234, g: 179, b: 8   }, // 50: Amber to Yellow (#EAB308)
  { score: 60,  r: 202, g: 138, b: 4   }, // 60: Golden Yellow (#CA8A04)
  { score: 75,  r: 101, g: 163, b: 13  }, // 75: Yellow-Green (#65A30D)
  { score: 85,  r: 22,  g: 163, b: 74  }, // 85: Fresh Green (#16A34A)
  { score: 100, r: 15,  g: 118, b: 110 }  // 100: CreditLens Deep Forest Teal / Green (#0F766E)
];

export function getInterpolatedColor(score) {
  if (score === null || score === undefined || isNaN(score)) {
    return '#94A3B8';
  }
  const s = Math.max(0, Math.min(100, Number(score)));

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const cur = COLOR_STOPS[i];
    const nxt = COLOR_STOPS[i + 1];
    if (s >= cur.score && s <= nxt.score) {
      const factor = (s - cur.score) / (nxt.score - cur.score);
      const r = Math.round(cur.r + factor * (nxt.r - cur.r));
      const g = Math.round(cur.g + factor * (nxt.g - cur.g));
      const b = Math.round(cur.b + factor * (nxt.b - cur.b));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return '#0F766E';
}
