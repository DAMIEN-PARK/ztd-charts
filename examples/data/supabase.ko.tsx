import { AreaChart, ChartCard, ChartState, useChartData } from "ztd-charts";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase(PostgREST)는 행 배열을 그대로 돌려줘서 바로 data에 넣으면 돼요.
 * numeric 열은 "1234.50" 같은 문자열로 오는데, 차트가 숫자로 읽어요.
 *
 * supabase-js를 쓰면:
 *   const { data, error } = await supabase.from("daily_revenue").select("day, plan, revenue").order("day");
 *   if (error) throw error; return data;
 */
export function SupabaseChart() {
  const configured = !!(SUPABASE_URL && SUPABASE_KEY);
  const revenue = useChartData(
    configured
      ? `${SUPABASE_URL}/rest/v1/daily_revenue?select=day,plan,revenue&order=day`
      : // 키가 없으면 예시 행으로 보여줘요 (Postgres numeric은 문자열)
        async () => [
          { day: "2025-06-01", plan: "베이직", revenue: "1820.50" },
          { day: "2025-06-01", plan: "프로", revenue: "2410.00" },
          { day: "2025-06-02", plan: "베이직", revenue: "1902.25" },
          { day: "2025-06-02", plan: "프로", revenue: "2675.75" },
          { day: "2025-06-03", plan: "베이직", revenue: "1876.00" },
          { day: "2025-06-03", plan: "프로", revenue: "2890.10" },
        ],
    configured ? { init: { headers: { apikey: SUPABASE_KEY!, Authorization: `Bearer ${SUPABASE_KEY}` } } } : {},
  );
  return (
    <ChartCard title="플랜별 일 매출" subtitle={configured ? "Supabase daily_revenue" : "Supabase 예시 행"} takeaway="프로가 매일 앞서요" level="기본" replay>
      <ChartState loading={revenue.loading && !revenue.data.length} error={revenue.error} empty={revenue.empty} onRetry={revenue.reload}>
        <AreaChart data={revenue.data} x="day" y="revenue" series="plan" highlight="프로" unit="만" />
      </ChartState>
    </ChartCard>
  );
}
