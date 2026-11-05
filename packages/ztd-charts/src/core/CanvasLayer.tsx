import { useEffect, useRef } from "react";

export interface CanvasLayerProps {
  width: number;
  height: number;
  /** 그리기. 진행도 t(0~1)와 실제 색을 읽는 함수를 받아요 */
  draw: (ctx: CanvasRenderingContext2D, t: number, color: (cssVar: string, fallback: string) => string) => void;
  /** 0~1 등장 진행도 */
  progress: number;
  /** 바뀌면 다시 그려요 */
  version: unknown;
  /** 오른쪽을 이만큼(px) 가려요. 한 번 그린 그림을 CSS로 드러낼 때 (프레임마다 다시 그리지 않아요) */
  clipRight?: number;
  /** 그리기 전에 전체를 지우지 않아요. 바뀐 부분만 다시 그리는 draw용 (크기가 바뀌면 캔버스는 어차피 비워져요) */
  manualClear?: boolean;
}

/**
 * 점이 아주 많을 때 쓰는 캔버스 바닥층. SVG(축, 라벨) 아래에 깔려요.
 * CSS 변수 색은 그릴 때 계산된 값으로 읽어요.
 */
export function CanvasLayer(props: CanvasLayerProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { width, height, draw, progress, version, clipRight, manualClear } = props;
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(1, Math.round(width * dpr));
    const H = Math.max(1, Math.round(height * dpr));
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!manualClear) ctx.clearRect(0, 0, width, height);
    const cs = getComputedStyle(cv);
    const cache = new Map<string, string>();
    const color = (v: string, fb: string) => {
      let c = cache.get(v);
      if (c === undefined) {
        c = cs.getPropertyValue(v).trim() || fb;
        cache.set(v, c);
      }
      return c;
    };
    draw(ctx, progress, color);
  }, [width, height, draw, progress, version, manualClear]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "auto", aspectRatio: `${width} / ${height}`, pointerEvents: "none", clipPath: clipRight ? `inset(0 ${((clipRight / Math.max(1, width)) * 100).toFixed(3)}% 0 0)` : undefined }}
    />
  );
}
