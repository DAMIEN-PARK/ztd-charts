import { toDate } from "../core/format";
import type { Accessor } from "../core/types";

function field(d: unknown, k: string): unknown {
  if (d === null || d === undefined) return undefined;
  if (typeof d !== "object") return undefined;
  const o = d as Record<string, unknown>;
  if (k in o) return o[k];
  if (k.includes(".")) {
    let cur: unknown = o;
    for (const p of k.split(".")) {
      if (cur === null || typeof cur !== "object") return undefined;
      cur = (cur as Record<string, unknown>)[p];
    }
    return cur;
  }
  return undefined;
}

/** "1,234", "12%", "₩5,000", " 3.5 " 같은 문자열도 숫자로. 못 읽으면 NaN */
export function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") {
    const s = v.trim();
    if (!s) return NaN;
    const neg = /^\(.*\)$/.test(s);
    const n = Number(s.replace(/[(),\s%₩$€£¥원명건개회]/g, "").replace(/^\+/, ""));
    return Number.isFinite(n) ? (neg ? -n : n) : NaN;
  }
  if (v instanceof Date) return v.getTime();
  if (typeof v === "boolean") return v ? 1 : 0;
  return NaN;
}

export function getter<T>(a: Accessor<T, unknown> | undefined, def: string): (d: T, i: number) => unknown {
  if (typeof a === "function") return a;
  const k = a ?? def;
  return (d) => field(d, k);
}

export function numGetter<T>(a: Accessor<T, unknown> | undefined, def: string): (d: T, i: number) => number {
  const g = getter(a, def);
  return (d, i) => toNumber(g(d, i));
}

export function strGetter<T>(a: Accessor<T, unknown> | undefined, def: string): (d: T, i: number) => string {
  const g = getter(a, def);
  return (d, i) => {
    const v = g(d, i);
    if (v === undefined || v === null) return "";
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    return String(v);
  };
}

export function dateGetter<T>(a: Accessor<T, unknown> | undefined, def: string): (d: T, i: number) => Date | null {
  const g = getter(a, def);
  return (d, i) => toDate(g(d, i));
}

/** 접근자가 데이터에 없는 필드를 가리키면 그 이름을 돌려줘요 (검증용) */
export function missingField<T>(a: Accessor<T, unknown> | undefined, def: string, data: readonly T[]): string | null {
  if (typeof a === "function" || !data.length) return null;
  const k = a ?? def;
  const sample = data.slice(0, 20);
  return sample.some((d) => field(d, k) !== undefined) ? null : k;
}

/** 처음 나온 순서대로 고유값 */
export function uniq(xs: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of xs)
    if (!seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  return out;
}
