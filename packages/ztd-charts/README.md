# ztd-charts

33 animated, interactive charts for React 18+. Pure SVG, zero runtime dependencies.

Renamed from `@junhanlee/chart-kit` in 0.2.0. CSS names moved from `--ck-*`, `.ck-*` and `data-ck-theme` to `--ztd-*`, `.ztd-*` and `data-ztd-theme`.

```bash
npm i ztd-charts
```

```tsx
import { ChartCard, FunnelChart } from "ztd-charts";

<ChartCard number="03" title="Funnel chart" subtitle="Users by stage" takeaway="Drop-off by stage" level="basic" replay>
  <FunnelChart data={rows} label="stage" value="users" />
</ChartCard>
```

- Entry points: `ztd-charts` (components, hooks, helpers), `ztd-charts/spec` (registry, schema, validation and suggestions without React), `ztd-charts/server` (SVG and HTML server rendering), `ztd-charts/schema.json` (JSON Schema).
- English by default. `<ThemeProvider locale="ko-KR">` or a chart's `locale` switches number formats and chart text to Korean.
- ESM, `sideEffects: false`. One chart is about 11 to 19 KB with Brotli (shared core included).

Full docs: [repository README](https://github.com/Junhan2/ztd-charts#readme) ([한국어](https://github.com/Junhan2/ztd-charts/blob/main/README.ko.md))
