import { useEffect, useLayoutEffect } from "react";

export const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

/** 서버에서는 useEffect, 브라우저에서는 useLayoutEffect */
export const useIsoLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

let uid = 0;
/** SSR에서도 안정적인 짧은 id가 필요할 때 React.useId를 쓰고, 그 외에 쓰는 카운터 */
export function nextId(prefix = "ztd"): string {
  uid += 1;
  return `${prefix}${uid}`;
}
