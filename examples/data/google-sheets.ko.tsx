import { ChartCard, ChartState, DonutChart, useChartData } from "ztd-charts";

/**
 * Google Sheets: 파일 > 공유 > 웹에 게시 > CSV를 고르거나, 아래 주소 형식을 써요.
 *   https://docs.google.com/spreadsheets/d/<시트 ID>/export?format=csv&gid=<탭 ID>
 *   https://docs.google.com/spreadsheets/d/<시트 ID>/gviz/tq?tqx=out:csv&sheet=<탭 이름>
 * format=csv, out:csv가 들어간 주소는 CSV로 읽어요.
 */
export function SheetChart({ url }: { url: string }) {
  const sheet = useChartData(url);
  return (
    <ChartCard title="채널별 예산" subtitle="Google Sheets CSV" takeaway="검색 광고가 절반" level="기본" replay>
      <ChartState loading={sheet.loading && !sheet.data.length} error={sheet.error} empty={sheet.empty} onRetry={sheet.reload}>
        <DonutChart data={sheet.data} label="channel" value="budget" centerLabel="예산(만 원)" />
      </ChartState>
    </ChartCard>
  );
}
