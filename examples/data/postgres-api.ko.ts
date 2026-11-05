/**
 * Postgres(node-postgres) 결과를 차트용 JSON으로 내보내는 API 예시 (Node, Express나 Next.js Route Handler 어디서나).
 * pg는 numeric, bigint를 문자열로 돌려주지만 그대로 보내도 돼요. 차트가 숫자로 읽어요.
 *
 *   // app/api/signups/route.ts (Next.js)
 *   import { Pool } from "pg";
 *   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
 *   export async function GET() {
 *     const { rows } = await pool.query(
 *       "select date_trunc('day', created_at)::date as day, count(*) as signups from users group by 1 order by 1",
 *     );
 *     return Response.json(rows); // [{ day: "2025-06-01", signups: "128" }, ...]
 *   }
 *
 * 클라이언트에서는:
 *   const s = useChartData("/api/signups");
 *   <CalendarHeatmap data={s.data} date="day" value="signups" />
 *
 * 열 이름과 행이 따로 오는 결과(rows + fields, Google Sheets values)는 fromRows로 바꿔요.
 */
import { fromRows } from "ztd-charts";

export const fromPgArrayMode = fromRows(
  [
    ["2025-06-01", "128"],
    ["2025-06-02", "141"],
  ],
  ["day", "signups"],
);
