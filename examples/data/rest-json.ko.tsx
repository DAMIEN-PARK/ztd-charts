import { BarChart, ChartCard, ChartState, useChartData } from "ztd-charts";

/**
 * REST JSON API에서 불러오기.
 * 응답이 { data: { items: [...] } } 처럼 감싸져 있으면 select로 안쪽 배열을 꺼내요.
 */
export function RestJsonChart({ url = "/data/orders.ko.json" }: { url?: string }) {
  const orders = useChartData<{ day: string; orders: number }>(url, {
    select: "data.items",
    refreshMs: 60_000,
    init: { headers: { Accept: "application/json" } },
  });
  return (
    <ChartCard title="요일별 주문" subtitle="REST JSON, 1분마다 갱신" takeaway="금요일이 가장 많아요" level="기본" replay>
      <ChartState loading={orders.loading && !orders.data.length} error={orders.error} empty={orders.empty} onRetry={orders.reload}>
        <BarChart data={orders.data} x="day" y="orders" unit="건" />
      </ChartState>
    </ChartCard>
  );
}
