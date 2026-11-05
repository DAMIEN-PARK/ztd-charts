import { ChartCard, ChartState, LineChart, parseCSV, useChartData } from "ztd-charts";

/**
 * CSV 파일 주소를 그대로 넣으면 돼요. content-type이나 .csv 확장자를 보고 parseCSV로 읽어요.
 * "1,234", "12%", "₩5,000" 같은 칸도 숫자로 바뀌어요.
 */
export function CsvChart({ url = "/data/sales.ko.csv" }: { url?: string }) {
  const sales = useChartData(url);
  return (
    <ChartCard title="채널별 월 매출" subtitle="CSV (만 원)" takeaway="SNS가 빠르게 커져요" level="기본" replay>
      <ChartState loading={sales.loading && !sales.data.length} error={sales.error} empty={sales.empty} onRetry={sales.reload}>
        <LineChart data={sales.data} x="month" y="revenue" series="channel" highlight="SNS" unit="만" />
      </ChartState>
    </ChartCard>
  );
}

// 문자열이 이미 있으면 바로 파싱해도 돼요
export const rows = parseCSV(`month,channel,revenue
2025-01,검색,120
2025-01,SNS,64`);
