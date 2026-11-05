import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Painter } from "../theme/context";
import { Txt } from "./ChartFrame";
import { DEFAULT_LOCALE, formatNumber } from "./format";
import type { ChartLang } from "./i18n";
import { textWidth } from "./text";

/** 구간 고르기 문구 (라인, 캔들스틱) */
const en = {
  zoomHint: " Press Enter to zoom in.",
  pickHint: " Press Enter to select.",
  high: "High",
  low: "Low",
  resetLabel: "Show all (reset zoom)",
  reset: "Show all",
  /** 읽어 줄 문장의 최고, 최저 부분 */
  extremes: (hi: string, lo: string) => `, high ${hi}, low ${lo}`,
  /** 고른 구간 이름. 예: "Jan to Mar" */
  range: (a: string, b: string) => `${a} to ${b}`,
};
const BRUSH_TEXT: Record<ChartLang, typeof en> = {
  en,
  ko: {
    zoomHint: " Enter를 누르면 확대해요.",
    pickHint: " Enter를 누르면 이 구간을 골라요.",
    high: "최고",
    low: "최저",
    resetLabel: "전체 보기(확대 풀기)",
    reset: "전체 보기",
    extremes: (hi, lo) => `, 최고 ${hi}, 최저 ${lo}`,
    range: (a, b) => `${a}~${b}`,
  },
};

/** 고른 구간. 지금 보이는 점의 인덱스이고 양끝을 포함해요 (from < to) */
export interface BrushRange {
  from: number;
  to: number;
}

/** 차트가 onBrush로 알려 주는 x 구간. 인덱스는 확대하기 전 전체 순서예요 */
export interface XRange {
  from: number;
  to: number;
  fromKey: string;
  toKey: string;
  fromLabel: string;
  toLabel: string;
}

/** 구간 고르기를 쓰는 차트의 옵션 */
export interface BrushProps {
  /**
   * 끌어서 x 구간 고르기 (마우스, 펜. 키보드는 Shift+화살표, Enter).
   * true면 구간의 등락과 최고, 최저를 보여주고, "zoom"이면 그 구간으로 확대해요. 기본 false
   */
  brush?: boolean | "zoom";
  /** 구간을 고르거나 지울 때. 인덱스는 확대 전 x 순서(정렬된 고유 x, 캔들스틱은 봉 순서) 기준 */
  onBrush?: (range: XRange | null) => void;
}

export interface BrushOptions {
  enabled: boolean;
  /** 보이는 점 개수 */
  count: number;
  /** svg x 좌표에서 가장 가까운 점 인덱스 */
  indexAt: (x: number) => number;
  /** 끌기를 시작할 수 있는 곳(그림 영역)인지 */
  inPlot: (x: number, y: number) => boolean;
  /** 구간이 정해졌을 때 (마우스를 떼거나 Enter). 지우면 null */
  onCommit: (r: BrushRange | null) => void;
  /** 정한 뒤에도 띠를 남겨요. 확대처럼 정하자마자 화면이 바뀌면 false. 기본 true */
  keep?: boolean;
}

export interface Brush {
  range: BrushRange | null;
  dragging: boolean;
  /** 키보드(Shift+화살표)로 고르는 중이고 아직 Enter로 정하지 않았어요 */
  keyboard: boolean;
  /** 끌기를 시작했으면 true */
  down: (x: number, y: number, e: PointerEvent<SVGSVGElement>) => boolean;
  /** 끄는 중이면 true (차트는 이때 호버를 따로 처리하지 않아도 돼요) */
  move: (x: number) => boolean;
  up: (x: number, y: number, e: PointerEvent<SVGSVGElement>) => void;
  /** Shift+화살표로 넓히기, Enter로 정하기, Escape로 지우기. 처리했으면 true */
  key: (e: KeyboardEvent<HTMLDivElement>, active: number | null) => boolean;
}

const MIN_DRAG_PX = 4;

/**
 * 끌어서 x 구간 고르기 (마우스, 펜). 터치는 손가락으로 값을 읽는 동작과 겹쳐서 쓰지 않아요.
 * 키보드는 Shift+화살표로 고르고 Enter로 정해요.
 */
export function useBrush(o: BrushOptions): Brush {
  const [range, setRange] = useState<BrushRange | null>(null);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ i: number; x: number; moved: boolean } | null>(null);
  const anchor = useRef<number | null>(null);

  const clear = () => {
    start.current = null;
    anchor.current = null;
    setDragging(false);
    setRange(null);
  };

  const down = (x: number, y: number, e: PointerEvent<SVGSVGElement>) => {
    if (!o.enabled || o.count < 2 || e.pointerType === "touch" || e.button !== 0 || !o.inPlot(x, y)) return false;
    start.current = { i: o.indexAt(x), x, moved: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    return true;
  };

  const move = (x: number) => {
    const s = start.current;
    if (!s) return false;
    if (!s.moved && Math.abs(x - s.x) < MIN_DRAG_PX) return true;
    s.moved = true;
    const i = o.indexAt(x);
    const from = Math.min(s.i, i);
    const to = Math.max(s.i, i);
    setDragging(true);
    // 같은 점 위에서 움직이면 다시 그리지 않아요
    setRange((prev) => (prev?.from === from && prev.to === to ? prev : { from, to }));
    return true;
  };

  const up = (x: number, _y: number, e: PointerEvent<SVGSVGElement>) => {
    const s = start.current;
    start.current = null;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!s) return;
    setDragging(false);
    // 움직이지 않은 클릭은 고른 구간을 지워요
    if (!s.moved || e.type === "pointercancel") {
      if (range) {
        setRange(null);
        o.onCommit(null);
      }
      return;
    }
    const i = o.indexAt(x);
    const r = { from: Math.min(s.i, i), to: Math.max(s.i, i) };
    const ok = r.to > r.from;
    setRange(ok && o.keep !== false ? r : null);
    o.onCommit(ok ? r : null);
  };

  const key = (e: KeyboardEvent<HTMLDivElement>, active: number | null) => {
    if (!o.enabled) return false;
    if (e.key === "Escape" && range) {
      clear();
      o.onCommit(null);
      return true;
    }
    if (e.key === "Enter" && range && anchor.current !== null) {
      anchor.current = null;
      if (o.keep === false) setRange(null);
      o.onCommit(range);
      return true;
    }
    if (!e.shiftKey || (e.key !== "ArrowLeft" && e.key !== "ArrowRight") || o.count < 2) return false;
    const step = e.key === "ArrowRight" ? 1 : -1;
    const a = anchor.current ?? active ?? (step > 0 ? 0 : o.count - 1);
    // 기준점의 반대쪽 끝을 움직여요
    const end = range && anchor.current !== null ? (range.from === a ? range.to : range.from) : a;
    const next = Math.max(0, Math.min(o.count - 1, end + step));
    anchor.current = a;
    setRange(next === a ? null : { from: Math.min(a, next), to: Math.max(a, next) });
    return true;
  };

  return { range, dragging, keyboard: range !== null && anchor.current !== null, down, move, up, key };
}

export interface Zoom {
  /** 확대한 구간 [from, to] (확대하기 전 전체 순서). 확대하지 않았으면 null */
  view: [number, number] | null;
  zoomTo: (range: [number, number]) => void;
  reset: () => void;
}

/** 확대한 구간. 데이터(sig)가 바뀌면 풀려요 */
export function useZoom(sig: string): Zoom {
  const [z, setZ] = useState<{ sig: string; range: [number, number] } | null>(null);
  // 데이터가 바뀐 렌더에서 바로 풀어요. effect로 풀면 옛 구간으로 한 번 더 계산해요
  if (z && z.sig !== sig) setZ(null);
  return {
    view: z && z.sig === sig ? z.range : null,
    zoomTo: (range) => setZ({ sig, range }),
    reset: () => setZ(null),
  };
}

/**
 * brush, onBrush 옵션을 끌기, 키보드 구간 고르기, ("zoom"이면) 확대에 이어요.
 * frame은 ChartFrame에 그대로 펼쳐 넣고, hint는 읽어 줄 문장 끝에 붙여요
 */
export function useChartBrush(
  props: BrushProps,
  zoom: Zoom,
  o: Pick<BrushOptions, "count" | "indexAt" | "inPlot"> & { p: Painter; active: number | null; lang: ChartLang; toXRange: (r: BrushRange) => XRange },
) {
  const text = BRUSH_TEXT[o.lang];
  const mode = props.brush === "zoom" ? "zoom" : props.brush ? "select" : null;
  const brush = useBrush({
    enabled: mode !== null,
    count: o.count,
    indexAt: o.indexAt,
    inPlot: o.inPlot,
    keep: mode !== "zoom",
    onCommit: (r) => {
      const xr = r ? o.toXRange(r) : null;
      props.onBrush?.(xr);
      if (mode === "zoom" && xr && xr.to > xr.from) zoom.zoomTo([xr.from, xr.to]);
    },
  });
  const frame = {
    onPointerDown: mode ? brush.down : undefined,
    onPointerUp: mode ? brush.up : undefined,
    onKey: mode
      ? (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Escape" && zoom.view && !brush.range) {
            zoom.reset();
            return true;
          }
          return brush.key(e, o.active);
        }
      : undefined,
    overlay: zoom.view ? <ZoomReset p={o.p} onReset={zoom.reset} text={text} /> : null,
  };
  const hint = brush.keyboard ? (mode === "zoom" ? text.zoomHint : text.pickHint) : "";
  return { brush, frame, hint, text };
}

/** a에서 b로 바뀐 비율. a가 0이면 비율 대신 null */
export function changeRatio(a: number, b: number): number | null {
  if (!Number.isFinite(a) || !Number.isFinite(b) || a === 0) return null;
  return (b - a) / Math.abs(a);
}

export function signedPercent(r: number, locale = DEFAULT_LOCALE): string {
  const v = Math.round(r * 1000) / 10;
  return `${v > 0 ? "+" : ""}${formatNumber(v, { locale, maximumFractionDigits: 1 })}%`;
}

/** 고른 구간: 옅은 띠, 양끝 선, 위쪽 요약 칩 */
export function BrushBand(props: { p: Painter; x0: number; x1: number; top: number; bottom: number; width: number; main: string; sub: string; dragging: boolean }) {
  const { p, top, bottom } = props;
  const a = Math.min(props.x0, props.x1);
  const b = Math.max(props.x0, props.x1);
  const mainW = textWidth(props.main, 11.5, 800);
  const subW = textWidth(props.sub, 10.5, 500) + 6;
  const chipW = mainW + subW + 16;
  const chipX = Math.max(2, Math.min(props.width - chipW - 2, (a + b) / 2 - chipW / 2));
  const chipY = top + 4;
  return (
    <g pointerEvents="none" aria-hidden="true">
      <rect x={a} y={top} width={Math.max(1, b - a)} height={Math.max(0, bottom - top)} fill={p.paint("accent")} opacity={props.dragging ? 0.1 : 0.14} />
      <line x1={a} x2={a} y1={top} y2={bottom} stroke={p.paint("accent")} strokeWidth={1} opacity={0.7} />
      <line x1={b} x2={b} y1={top} y2={bottom} stroke={p.paint("accent")} strokeWidth={1} opacity={0.7} />
      <rect x={chipX} y={chipY} width={chipW} height={22} rx={8} fill={p.paint("panel")} stroke={p.paint("line")} />
      <Txt x={chipX + 8} y={chipY + 11} size={11.5} weight={800} fill={p.paint("ink")}>
        {props.main}
      </Txt>
      <Txt x={chipX + 8 + mainW + 6} y={chipY + 11} size={10.5} weight={500} fill={p.paint("muted")}>
        {props.sub}
      </Txt>
    </g>
  );
}

interface TagPoint {
  x: number;
  y: number;
  /** 값 글자 */
  text: string;
}

/** 구간의 최고점(점 위)과 최저점(점 아래) 꼬리표. 그쪽에 자리가 없으면 반대쪽에 붙여요 */
export function ExtremeTags(props: { p: Painter; width: number; top: number; bottom: number; max: TagPoint; min: TagPoint; lang: ChartLang }) {
  const { p, width, top, bottom, max, min } = props;
  const text = BRUSH_TEXT[props.lang];
  return (
    <>
      <PointTag p={p} x={max.x} y={max.y} text={`${text.high} ${max.text}`} below={max.y - 26 < top + 30} width={width} />
      <PointTag p={p} x={min.x} y={min.y} text={`${text.low} ${min.text}`} below={min.y + 26 < bottom} width={width} />
    </>
  );
}

/** 점 위(또는 아래)에 붙는 작은 값 꼬리표 */
function PointTag(props: { p: Painter; x: number; y: number; text: string; below?: boolean; width: number }) {
  const { p } = props;
  const w = textWidth(props.text, 10.5, 700) + 12;
  const h = 18;
  const tx = Math.max(2, Math.min(props.width - w - 2, props.x - w / 2));
  const ty = props.below ? props.y + 8 : props.y - h - 8;
  return (
    <g pointerEvents="none" aria-hidden="true">
      <circle cx={props.x} cy={props.y} r={3.5} fill={p.paint("ink")} stroke={p.paint("panel")} strokeWidth={2} />
      <rect x={tx} y={ty} width={w} height={h} rx={9} fill={p.paint("ink")} />
      <Txt x={tx + w / 2} y={ty + h / 2} anchor="middle" size={10.5} weight={700} fill={p.paint("onInk")}>
        {props.text}
      </Txt>
    </g>
  );
}

/** 확대했을 때 오른쪽 위에 뜨는 "Show all" 단추 */
function ZoomReset(props: { p: Painter; onReset: () => void; text: typeof en }) {
  const { p } = props;
  return (
    <button
      type="button"
      className="ztd-btn"
      onClick={props.onReset}
      aria-label={props.text.resetLabel}
      style={{ position: "absolute", top: 0, right: 0, height: 24, padding: "0 10px", borderRadius: 12, border: `1px solid ${p.paint("line")}`, background: p.paint("panel"), color: p.paint("muted"), fontSize: 11.5, fontWeight: 600, zIndex: 4 }}
    >
      {props.text.reset}
    </button>
  );
}
