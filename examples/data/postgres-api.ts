/**
 * An API that sends Postgres (node-postgres) results to a chart as JSON (in Node: Express or a Next.js Route Handler).
 * pg returns numeric and bigint as strings, and you can send them as they are. The chart reads them as numbers.
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
 * On the client:
 *   const s = useChartData("/api/signups");
 *   <CalendarHeatmap data={s.data} date="day" value="signups" />
 *
 * Results that bring column names and rows separately (rows + fields, Google Sheets values) go through fromRows.
 */
import { fromRows } from "ztd-charts";

export const fromPgArrayMode = fromRows(
  [
    ["2025-06-01", "128"],
    ["2025-06-02", "141"],
  ],
  ["day", "signups"],
);
