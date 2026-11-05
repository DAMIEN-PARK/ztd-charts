import { ChartCard, ChartState, DonutChart, useChartData } from "ztd-charts";

/**
 * Google Sheets: choose File > Share > Publish to web > CSV, or use one of these address formats.
 *   https://docs.google.com/spreadsheets/d/<sheet ID>/export?format=csv&gid=<tab ID>
 *   https://docs.google.com/spreadsheets/d/<sheet ID>/gviz/tq?tqx=out:csv&sheet=<tab name>
 * Addresses with format=csv or out:csv are read as CSV.
 */
export function SheetChart({ url }: { url: string }) {
  const sheet = useChartData(url);
  return (
    <ChartCard title="Budget by channel" subtitle="Google Sheets CSV" takeaway="Search ads take half" level="basic" replay>
      <ChartState loading={sheet.loading && !sheet.data.length} error={sheet.error} empty={sheet.empty} onRetry={sheet.reload}>
        <DonutChart data={sheet.data} label="channel" value="budget" centerLabel="Budget ($K)" />
      </ChartState>
    </ChartCard>
  );
}
