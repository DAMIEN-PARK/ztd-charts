import { ChartCard, ChartState, LineChart, parseCSV, useChartData } from "ztd-charts";

/**
 * Pass a CSV file URL as is. It is read with parseCSV, based on the content-type or the .csv extension.
 * Cells such as "1,234", "12%" and "₩5,000" become numbers.
 */
export function CsvChart({ url = "/data/sales.csv" }: { url?: string }) {
  const sales = useChartData(url);
  return (
    <ChartCard title="Monthly revenue by channel" subtitle="CSV (USD K)" takeaway="Social grows fast" level="basic" replay>
      <ChartState loading={sales.loading && !sales.data.length} error={sales.error} empty={sales.empty} onRetry={sales.reload}>
        <LineChart data={sales.data} x="month" y="revenue" series="channel" highlight="Social" unit="K" />
      </ChartState>
    </ChartCard>
  );
}

// If you already have the text, parse it right away
export const rows = parseCSV(`month,channel,revenue
2025-01,Search,120
2025-01,Social,64`);
