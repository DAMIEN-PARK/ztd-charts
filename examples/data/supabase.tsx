import { AreaChart, ChartCard, ChartState, useChartData } from "ztd-charts";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase (PostgREST) returns an array of rows, so you can pass it straight to data.
 * numeric columns arrive as strings such as "1234.50", and the chart reads them as numbers.
 *
 * With supabase-js:
 *   const { data, error } = await supabase.from("daily_revenue").select("day, plan, revenue").order("day");
 *   if (error) throw error; return data;
 */
export function SupabaseChart() {
  const configured = !!(SUPABASE_URL && SUPABASE_KEY);
  const revenue = useChartData(
    configured
      ? `${SUPABASE_URL}/rest/v1/daily_revenue?select=day,plan,revenue&order=day`
      : // Without keys, show sample rows (Postgres numeric arrives as strings)
        async () => [
          { day: "2025-06-01", plan: "Basic", revenue: "1820.50" },
          { day: "2025-06-01", plan: "Pro", revenue: "2410.00" },
          { day: "2025-06-02", plan: "Basic", revenue: "1902.25" },
          { day: "2025-06-02", plan: "Pro", revenue: "2675.75" },
          { day: "2025-06-03", plan: "Basic", revenue: "1876.00" },
          { day: "2025-06-03", plan: "Pro", revenue: "2890.10" },
        ],
    configured ? { init: { headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` } } } : {},
  );
  return (
    <ChartCard title="Daily revenue by plan" subtitle={configured ? "Supabase daily_revenue" : "Supabase sample rows"} takeaway="Pro leads every day" level="basic" replay>
      <ChartState loading={revenue.loading && !revenue.data.length} error={revenue.error} empty={revenue.empty} onRetry={revenue.reload}>
        <AreaChart data={revenue.data} x="day" y="revenue" series="plan" highlight="Pro" unit="K" />
      </ChartState>
    </ChartCard>
  );
}
