import { createContext, useContext } from "react";

/** ChartCard의 다시 재생 버튼이 안쪽 차트에 replayKey를 내려줘요 */
export const ReplayContext = createContext<number | undefined>(undefined);

export function useReplayKey(own: string | number | undefined): string | number | undefined {
  const ctx = useContext(ReplayContext);
  if (own !== undefined && ctx !== undefined) return `${own}:${ctx}`;
  return own ?? ctx;
}
