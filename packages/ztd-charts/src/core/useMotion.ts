import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isBrowser, now, useIsoLayoutEffect } from "./env";
import { MotionEngine, subscribeTick, type EasingName, type Mark, type MotionItem } from "./motion";

export interface UseMotionOptions {
  /** 애니메이션을 쓸지 (animate && !reducedMotion) */
  enabled: boolean;
  /** 지금 화면에 보이는지. true가 되면 등장 시작 */
  active: boolean;
  /** 곧 보일지 (화면 위아래 가까이). 화면 밖에서 받은 다시 재생은 이때 준비해요. 기본 true */
  near?: boolean;
  /** 바뀌면 처음부터 다시 재생 */
  replayKey?: unknown;
  /** 데이터 서명. 바뀌면 전환 애니메이션, 같으면(크기만 바뀜) 바로 맞춰요 */
  dataKey?: unknown;
  easing?: EasingName;
  duration?: number;
  /** 데이터 전환 때 항목 사이 지연(ms) */
  stagger?: number;
}

export interface MotionState<M> {
  items: MotionItem<M>[];
  get: (key: string) => number[] | undefined;
  /** 등장 시작 후 지난 시간(ms). 끝났거나 꺼져 있으면 Infinity */
  elapsed: number;
  /** 등장 중 delay(ms)부터 len(ms) 동안 0에서 1로. 끝나면 1 */
  fade: (delay: number, len?: number) => number;
  /** 아직 등장 전 (화면 밖) */
  waiting: boolean;
  animating: boolean;
  /** 등장이 시작될 때마다 1씩 커져요. CSS 애니메이션을 다시 걸 때 key로 써요 */
  generation: number;
}

type Phase = "init" | "idle" | "running" | "done";

/**
 * 키가 겹치면 두 번째부터 "#2", "#3"을 붙여요. 같은 이름의 항목이 둘이어도(파이 조각, 생키 띠) 하나로 합쳐지지 않게.
 * 겹치는 키가 없으면 받은 배열을 그대로 돌려줘요 (같은 배열이면 바뀐 게 없다고 보거든요)
 */
function uniqueMarkKeys<M>(marks: Mark<M>[]): Mark<M>[] {
  const seen = new Map<string, number>();
  let dup = false;
  for (const m of marks) {
    const n = (seen.get(m.key) ?? 0) + 1;
    seen.set(m.key, n);
    if (n > 1) dup = true;
  }
  if (!dup) return marks;
  seen.clear();
  return marks.map((m) => {
    const n = (seen.get(m.key) ?? 0) + 1;
    seen.set(m.key, n);
    return n > 1 ? { ...m, key: `${m.key}#${n}` } : m;
  });
}

export function useMotion<M>(input: Mark<M>[], opts: UseMotionOptions): MotionState<M> {
  // 같은 marks 배열이면 같은 결과 배열을 써야 아래 "바뀌었나" 비교가 맞아요
  const marks = useMemo(() => uniqueMarkKeys(input), [input]);
  const { enabled, active, near = true, replayKey, dataKey, easing = "spring", duration = 900, stagger = 0 } = opts;
  const engineRef = useRef<MotionEngine<M> | null>(null);
  const phase = useRef<Phase>("init");
  const lastMarks = useRef<Mark<M>[] | null>(null);
  const lastData = useRef<unknown>(dataKey);
  const lastReplay = useRef<unknown>(replayKey);
  // 화면에서 먼 차트는 다시 재생을 미뤄요 (모두 다시 재생에서 보이는 차트만 일을 해요)
  const pendingReplay = useRef(false);
  const generation = useRef(0);
  const [, setFrame] = useState(0);
  const unsub = useRef<(() => void) | null>(null);
  const alive = useRef(true);

  if (!engineRef.current) {
    engineRef.current = new MotionEngine<M>();
    engineRef.current.configure(easing, duration);
    engineRef.current.snap(marks);
    lastMarks.current = marks;
  }
  const engine = engineRef.current;
  engine.configure(easing, duration);

  if (lastMarks.current !== marks) {
    const p = phase.current;
    const dataChanged = !Object.is(lastData.current, dataKey);
    if (!engine.sameTargets(marks)) {
      if (!enabled || p === "init") engine.snap(marks);
      else if (p === "idle") engine.hold(marks);
      else if (p === "running" || dataChanged) engine.update(marks, now(), stagger);
      else engine.snap(marks);
    } else engine.refreshData(marks);
    lastMarks.current = marks;
    lastData.current = dataKey;
  }

  const tick = useRef<(t: number) => boolean>(() => false);
  tick.current = (t: number) => {
    if (!alive.current) return false;
    const moving = engine.step(t);
    if (!moving && phase.current === "running") phase.current = "done";
    setFrame((f) => (f + 1) % 1e9);
    if (!moving) unsub.current = null;
    return moving;
  };

  const ensureTicking = useCallback(() => {
    if (!isBrowser || unsub.current || !engine.animating) return;
    const fn = (t: number) => tick.current(t);
    unsub.current = subscribeTick(fn);
  }, [engine]);

  useIsoLayoutEffect(() => {
    const replayChanged = !Object.is(lastReplay.current, replayKey);
    lastReplay.current = replayKey;
    if (!enabled) {
      if (phase.current !== "done" || engine.animating) {
        engine.snap(lastMarks.current ?? marks);
        phase.current = "done";
        setFrame((f) => f + 1);
      }
      return;
    }
    if (phase.current === "init" || (replayChanged && near)) {
      engine.hold(lastMarks.current ?? marks);
      phase.current = "idle";
      pendingReplay.current = false;
      setFrame((f) => f + 1);
    } else if (replayChanged) pendingReplay.current = true;
    // marks는 lastMarks로 읽어요. replayKey/enabled가 바뀔 때만 다시 세워요
  }, [enabled, replayKey]);

  useIsoLayoutEffect(() => {
    if (!enabled || !near || !pendingReplay.current) return;
    pendingReplay.current = false;
    engine.hold(lastMarks.current ?? marks);
    phase.current = "idle";
    setFrame((f) => f + 1);
    // near가 true로 바뀔 때만
  }, [near, enabled]);

  useEffect(() => {
    if (enabled && active && phase.current === "idle") {
      engine.start(now());
      generation.current += 1;
      phase.current = "running";
      ensureTicking();
      setFrame((f) => f + 1);
    }
  }, [enabled, active, replayKey, engine, ensureTicking]);

  useEffect(() => {
    if (engine.animating) ensureTicking();
  });

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      unsub.current?.();
      unsub.current = null;
    };
  }, []);

  const t = now();
  const elapsed = engine.elapsed(t);
  const waiting = enabled && phase.current === "idle";
  return {
    items: engine.items(),
    get: (key) => engine.get(key),
    elapsed: waiting ? 0 : elapsed,
    fade: (delay, len = 320) => {
      if (waiting) return 0;
      if (!Number.isFinite(elapsed)) return 1;
      return Math.max(0, Math.min(1, (elapsed - delay) / len));
    },
    waiting,
    animating: engine.animating,
    generation: generation.current,
  };
}
