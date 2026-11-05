import { BarChart, ChartCard, ChartState, useChartData } from "ztd-charts";

/**
 * Load from a REST JSON API.
 * If the response is wrapped like { data: { items: [...] } }, select pulls out the inner array.
 */
export function RestJsonChart({ url = "/data/orders.json" }: { url?: string }) {
  const orders = useChartData<{ day: string; orders: number }>(url, {
    select: "data.items",
    refreshMs: 60_000,
    init: { headers: { Accept: "application/json" } },
  });
  return (
    <ChartCard title="Orders by weekday" subtitle="REST JSON, refreshed every minute" takeaway="Friday is the busiest day" level="basic" replay>
      <ChartState loading={orders.loading && !orders.data.length} error={orders.error} empty={orders.empty} onRetry={orders.reload}>
        <BarChart data={orders.data} x="day" y="orders" unit=" orders" />
      </ChartState>
    </ChartCard>
  );
}
