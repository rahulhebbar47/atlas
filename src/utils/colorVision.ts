/**
 * Color-vision math for the palette tests (the H1 palette rider's permanent gate).
 *
 * A faithful in-repo port of the dataviz validator's computable checks, so the shipped
 * chart palettes are gated by TEST EXECUTION, not by a one-off CLI run (the
 * enforcement-over-reading law). The simulation model is part of the standard: the CVD
 * thresholds are calibrated to the Machado–Oliveira–Fernandes (2009) severity-1.0
 * transforms — swapping models would move borderline pairs and require recalibration.
 *
 * Sources:
 *  - OKLab / OKLCH: Björn Ottosson, "A perceptual color space for image processing"
 *    (2020) — the sRGB↔OKLab matrices below are the published constants.
 *  - CVD simulation: Machado, Oliveira & Fernandes, "A Physiologically-based Model for
 *    Simulation of Color Vision Deficiency", IEEE TVCG 15(6), 2009 — severity-1.0
 *    matrices, applied in LINEAR RGB.
 *  - Contrast: WCAG 2.x relative-luminance ratio.
 *
 * All functions are pure. ΔE here means Euclidean distance in OKLab ×100 (the
 * validator's convention; its floors — normal ≥ 15, CVD ≥ 8 — are in these units).
 */

export type CVDKind = 'protan' | 'deutan';

/** Machado–Oliveira–Fernandes (2009) severity-1.0 transforms (linear RGB). */
const MACHADO: Record<CVDKind, ReadonlyArray<ReadonlyArray<number>>> = {
  protan: [[0.152286, 1.052583, -0.204868],
           [0.114503, 0.786281, 0.099216],
           [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968],
           [0.280085, 0.672501, 0.047413],
           [-0.011820, 0.042940, 0.968881]],
};

function hexToSrgb(hex: string): [number, number, number] {
  const h = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`colorVision: invalid hex ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

const srgbToLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function linearRgb(hex: string): [number, number, number] {
  const [r, g, b] = hexToSrgb(hex);
  return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
}

/** WCAG relative luminance. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = linearRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors (order-independent). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

function oklabFromLinear([r, g, b]: [number, number, number]): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

/** OKLab [L, a, b] for a hex color. */
export function oklab(hex: string): [number, number, number] {
  return oklabFromLinear(linearRgb(hex));
}

/** OKLCH [L, C] (lightness, chroma) for a hex color. */
export function oklch(hex: string): [number, number] {
  const [L, a, b] = oklab(hex);
  return [L, Math.hypot(a, b)];
}

function simulateCVD(hex: string, kind: CVDKind): [number, number, number] {
  const [r, g, b] = linearRgb(hex);
  const M = MACHADO[kind];
  const clamp = (c: number) => Math.max(0, Math.min(1, c));
  return [
    clamp(M[0]![0]! * r + M[0]![1]! * g + M[0]![2]! * b),
    clamp(M[1]![0]! * r + M[1]![1]! * g + M[1]![2]! * b),
    clamp(M[2]![0]! * r + M[2]![1]! * g + M[2]![2]! * b),
  ];
}

/**
 * ΔE between two colors: Euclidean distance in OKLab ×100. With `kind`, both colors
 * pass through the severity-1.0 CVD simulation first (the validator's CVD check);
 * without it, unsimulated (normal) vision (the validator's normal-vision floor).
 */
export function deltaE(hex1: string, hex2: string, kind?: CVDKind): number {
  const a = oklabFromLinear(kind ? simulateCVD(hex1, kind) : linearRgb(hex1));
  const b = oklabFromLinear(kind ? simulateCVD(hex2, kind) : linearRgb(hex2));
  return 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** The validator's floors, in ΔE (OKLab ×100) and WCAG ratio units. */
export const NORMAL_VISION_FLOOR = 15.0; // worst pair, unsimulated vision — hard gate
export const CVD_TARGET = 8.0;           // worst pair, min(protan, deutan)
export const CONTRAST_MIN = 3.0;         // each mark vs the chart surface
