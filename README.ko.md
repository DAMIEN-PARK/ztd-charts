# ztd charts

[English](README.md) · 한국어

React용 애니메이션 인터랙티브 차트 33종. 순수 SVG, 런타임 의존성 0. JSON 스펙 하나로 그리고, CLI와 MCP 서버, 에이전트 스킬로 AI가 바로 써요.

사이트: [charts.ztd.app](https://charts.ztd.app/) · 문서와 갤러리: [charts.ztd.app/docs](https://charts.ztd.app/docs/)

0.2.0부터 `@junhanlee/chart-kit`에서 이름이 바뀌었어요. `ztd-charts`(와 `ztd-charts-cli`, `ztd-charts-mcp`)를 설치하고, CSS 이름은 `--ck-*`, `.ck-*`, `data-ck-theme`에서 `--ztd-*`, `.ztd-*`, `data-ztd-theme`로 바꿔 주세요.

<p><img src="docs/screens/charts/dark-1440/candlestick.jpg" width="32%" alt="캔들스틱 차트 다크"> <img src="docs/screens/charts/dark-1440/chord.jpg" width="32%" alt="코드 다이어그램 다크"> <img src="docs/screens/charts/dark-1440/sankey.jpg" width="32%" alt="생키 다이어그램 다크"></p>

- **강조 하나로 말해요.** 강조할 항목 하나만 강조색, 나머지는 무채색. 카드마다 번호, 제목, 회색 부제, 작은 네모 범례, 굵은 한 줄 요약, 수준 배지(기본, 중급, 심화).
- **움직임이 읽는 순서를 알려줘요.** 화면에 들어오면 쓸어 그리고, 차오르고, 흘러가요. 데이터가 바뀌면 지금 자리에서 이어서 움직여요(임계 감쇠 스프링, 중간에 바뀌어도 속도가 이어져요).
- **진짜 데이터를 바로.** 필드 이름이나 함수로 연결하고, URL이나 비동기 함수에서 불러오면서 로딩, 오류, 빈 상태를 같이 받아요.
- **영어와 한국어.** 기본은 영어(en-US)예요. `locale="ko-KR"`이면 ko-KR 숫자, 날짜 포맷(1.2만, 3.4억, ₩5,000)과 한국어 차트 글자로 바뀌어요. Pretendard 기준 레이아웃.
- **접근성.** 키보드 탐색, 스크린 리더 설명과 데이터 표, 동작 줄이기, 모든 글자 WCAG AA.

기본 테마 두 가지는 랜딩 페이지와 같은 색이에요. 다크(기본값)는 먹색 카드와 라임 강조, 라이트는 흰 카드와 하늘색 강조예요.

## 목차

- [설치](#설치) · [빠른 시작](#빠른-시작) · [차트 33종](#차트-33종) · [카드와 그리드](#카드와-그리드)
- [테마](#테마) · [애니메이션과 인터랙션](#애니메이션과-인터랙션) · [접근성](#접근성)
- [데이터 연결](#데이터-연결) · [JSON 스펙](#json-스펙) · [CLI](#cli) · [MCP 서버](#mcp-서버) · [AI 스킬](#ai-스킬)
- [문서 사이트](#문서-사이트) · [개발](#개발) · [QA 결과](#qa-결과)

## 설치

```bash
npm i ztd-charts
```

React 18 이상이 필요해요. 다른 런타임 의존성은 없어요. 글꼴은 [Pretendard](https://github.com/orioncactus/pretendard)를 권해요(없으면 시스템 한글 글꼴).

## 빠른 시작

```tsx
import { ChartCard, PieChart } from "ztd-charts";

const data = [
  { device: "모바일", sales: 72 },
  { device: "PC", sales: 23 },
  { device: "태블릿", sales: 5 },
];

export function DeviceShare() {
  return (
    <ChartCard
      number="01"
      title="파이 차트"
      subtitle="기기별 매출 비중"
      legend={[{ label: "모바일", color: "accent" }, { label: "PC", color: "ink" }, { label: "태블릿", color: "neutral" }]}
      takeaway="2~4개 항목만"
      level="기본"
      replay
    >
      <PieChart data={data} label="device" value="sales" highlight="모바일" />
    </ChartCard>
  );
}
```

`data`는 그대로 두고, 같은 차트를 JSON 스펙으로 그려요:

```tsx
import { Chart } from "ztd-charts";

<Chart
  spec={{
    type: "pie",
    data,
    encoding: { label: "device", value: "sales" },
    options: { highlight: "모바일" },
    card: { number: "01", title: "파이 차트", subtitle: "기기별 매출 비중", takeaway: "2~4개 항목만", level: "기본", legend: "auto" },
  }}
/>;
```

배지, 툴팁, 숫자 포맷까지 한국어로 보려면 앱을 `<ThemeProvider locale="ko-KR">`로 감싸요.

## 차트 33종

보고서와 대시보드에서 "강조 하나"로 잘 읽히는 형태를 골랐어요. 고른 이유와 뺀 것은 [docs/catalog.ko.md](docs/catalog.ko.md)에 있어요.

| 묶음 | 차트(`type` · 컴포넌트) |
|---|---|
| 비율 | `pie` PieChart · `donut` DonutChart · `waffle` WaffleChart · `marimekko` MarimekkoChart · `segmented` SegmentedBar |
| 계층 | `treemap` Treemap · `sunburst` SunburstChart |
| 흐름 | `funnel` FunnelChart · `sankey` SankeyChart · `chord` ChordChart |
| 비교 | `bar` BarChart · `waterfall` WaterfallChart · `pareto` ParetoChart · `radar` RadarChart · `slope` SlopeChart · `dumbbell` DumbbellChart · `lollipop` LollipopChart |
| 추이 | `line` LineChart · `area` AreaChart · `stream` StreamGraph · `sparkline` Sparkline · `calendar` CalendarHeatmap · `bump` BumpChart · `candlestick` CandlestickChart |
| 분포 | `box` BoxPlot(box, violin) · `beeswarm` BeeswarmChart · `ridgeline` RidgelineChart |
| 관계 | `heatmap` Heatmap · `bubble` BubbleChart(산점도 포함) · `parallel` ParallelCoordinates |
| KPI | `gauge` GaugeChart(arc, semi, ring, ticks) · `bullet` BulletChart · `radialBar` RadialBarChart |

차트마다 프롭 표와 복사할 수 있는 코드는 [문서 사이트](https://charts.ztd.app/docs/)의 차트 페이지에 있어요. 터미널에서는 `npx ztd-charts-cli info <type>`.

자주 쓰는 프롭은 모든 차트가 같아요.

| 프롭 | 설명 |
|---|---|
| `data` | 객체 배열 |
| `label`, `value`, `x`, `y`, `series`, `size`, `group`, `source`, `target`, `date` … | 필드 이름(점 표기 가능) 또는 `(d, i) => 값` |
| `highlight` | 강조할 항목. 인덱스, 이름, 배열, `"max"`, `"min"`, `"first"`, `"last"`, `"none"`, 판별 함수 |
| `format`, `unit`, `locale` | `"number"`, `"integer"`, `"percent"`, `"ratio"`, `"compact"`, `"currency"`, `"decimal"` 또는 Intl 옵션. 로캘 기본은 en-US, `"ko-KR"`이면 한국어 포맷과 글자 |
| `height`, `width` | 폭은 부모에 맞춰요(ResizeObserver) |
| `animate`, `duration`, `easing`, `stagger`, `replayKey`, `reducedMotion`, `animateOnView` | 애니메이션 |
| `onHover`, `onClick`, `tooltip`, `showLabels` | 인터랙션 |
| `ariaLabel`, `description`, `theme`, `className`, `style` | 접근성, 꾸미기 |

데이터가 많으면 알아서 바꿔요. 라인, 영역, 스파크라인은 LTTB로 점을 줄이고, 산점도(1,500개 이상), 히트맵(2,500칸 이상), 비스웜(2,000개 이상), 평행 좌표(1,500줄 이상), 캘린더(4,000일 이상)는 캔버스로 그려요. 축과 라벨은 그대로 SVG예요.

## 카드와 그리드

```tsx
import { ChartCard, ChartGrid, FunnelChart } from "ztd-charts";

const rows = [{ stage: "방문", users: 10000 }, { stage: "구매", users: 760 }];

<ChartGrid columns={2}>  {/* 1 | 2 | 3, 좁으면 1칸으로 접혀요 */}
  <ChartCard number="03" title="퍼널 차트" subtitle="단계별 사용자(명)" takeaway="단계별 이탈" level="기본" replay sample>
    <FunnelChart data={rows} label="stage" value="users" />
  </ChartCard>
</ChartGrid>
```

- `ChartCard`: `number`, `title`, `subtitle`, `legend`(배열이나 노드), `replay`(다시 재생 버튼, 안쪽 차트가 알아서 다시 재생), `takeaway`, `level`, `sample`("예시 데이터"), `actions`.
- `ChartGrid`: `columns`(기본 2), `gap`, `minColumnWidth`(기본 320). 미디어 쿼리 없이 CSS만으로 접혀요.
- `ChartState`: `loading`, `error`, `empty`, `onRetry`. 차트와 같은 높이로 스켈레톤, 오류와 다시 시도, 빈 상태를 보여줘요.

## 테마

```tsx
import { ThemeProvider } from "ztd-charts";

<ThemeProvider theme="dark" paint>…</ThemeProvider>                 // 기본
<ThemeProvider theme="light">…</ThemeProvider>                       // 흰 카드, 하늘색 강조
<ThemeProvider locale="ko-KR">…</ThemeProvider>                      // 한국어 포맷과 차트 글자
<ThemeProvider theme={{ accent: "#F7465C", accentText: "#C42B40" }}>…</ThemeProvider>
<BarChart theme={{ accent: "#18A058" }} … />                         // 차트 하나만
```

모든 색은 `--ztd-*` CSS 변수예요. React를 다시 그리지 않고 CSS만으로도 바뀌어요.

```css
.my-report { --ztd-accent: #00a3ff; --ztd-panel: #0b1220; }
```

| 토큰 | 다크 | 라이트 | 쓰임 |
|---|---|---|---|
| `bg` | #14171B | #FFFFFF | 페이지 바탕 |
| `panel` | #14171B | #FFFFFF | 카드 바탕 |
| `ink` | #F1F3F5 | #14171B | 글자, 두 번째 강조 |
| `muted` | #A3ABB5 | #5D6570 | 보조 글자(AA) |
| `dim` | #5B636D | #B3B9C2 | 축, 보조선 |
| `accent` | #D6FD70 | #0B8FD8 | 강조 하나 |
| `accentText` | #D6FD70 | #006DA8 | 글자로 쓰는 강조 |
| `line` / `line2` | #2A2F36 / #22272D | #E6E9ED / #F0F2F5 | 테두리, 눈금 |
| `neutral` / `neutralStrong` / `neutralSoft` | #3A414A / #5F6772 / #262B31 | #D5DAE0 / #9AA3AE / #EEF1F4 | 나머지 채움, 트랙 |

`dim`은 카드 바탕 위에서 다크 2.95:1, 라이트 1.97:1이라 작은 글자에 쓰면 WCAG AA(4.5:1)에 못 미쳐요. 그래서 글자에는 `muted`를 쓰고 `dim`은 선에만 써요. 라이트 `accent`(#0B8FD8)는 흰 바탕 위 도형 기준(3:1)에 맞춘 색이라 글자에는 더 진한 `accentText`(#006DA8)를 써요. 다크의 라임은 먹색 위 글자로도 충분히 밝아서 두 값이 같아요. 강조색 위 글자(`onAccent`), ink 도형 위 글자(`onInk`)도 따로 있어요. 카드 모서리는 18px, 코드 블록은 14px로 랜딩의 겹친 모서리(28/18/14)를 따르고, 작은 칸은 4px예요.

## 애니메이션과 인터랙션

- 화면에 25% 넘게 들어오면 등장해요(`animateOnView`). 모든 차트가 requestAnimationFrame 루프 하나를 같이 써요.
- `easing`: `"spring"`(기본, 임계 감쇠라 넘치지 않아요), `"easeOut"`, `"easeInOut"`, `"linear"`.
- `replayKey`가 바뀌거나 카드의 다시 재생 버튼을 누르면 처음부터. 데이터가 바뀌면 새 항목은 들어오고, 빠진 항목은 접히며 사라지고, 남은 항목은 이어서 움직여요.
- OS의 동작 줄이기를 따라요. `reducedMotion={true}`면 항상 끄고, `false`면 항상 켜요.
- 호버하면 툴팁과 함께 나머지가 옅어져요. 터치는 톡 누르면 값을 보여 주고 바깥을 누를 때까지 유지해요.
- 구간 고르기(`brush`): 라인, 영역, 캔들스틱에서 마우스로 끌면 그 구간의 등락과 최고, 최저를 짚어요. `brush="zoom"`이면 그 구간으로 확대하고 오른쪽 위 "전체 보기"(또는 Escape)로 돌아와요. 키보드는 Shift+화살표로 넓히고 Enter로 정해요. 고른 구간은 `onBrush({ from, to, fromLabel, toLabel })`로 받아요.

```tsx
<LineChart data={rows} x="t" y="p95" series="api" brush="zoom" onBrush={(r) => r && setRange([r.fromKey, r.toKey])} />
<CandlestickChart data={daily} x="date" open="open" high="high" low="low" close="close" volume="volume" ma={[5, 20]} brush />
```

## 접근성

- 차트 바깥 `role="group"`, 안쪽 SVG `role="img"`에 제목과 데이터로 만든 설명(`<desc>`)을 붙여요. 화면에 안 보이는 데이터 표도 넣어요.
- Tab으로 들어가 화살표, Home, End로 항목을 옮기고 Enter, Space가 클릭이에요. 고른 항목은 aria-live로 읽어 줘요.
- 라벨 글자색은 바탕과 대비를 계산해서 골라요. QA에서 1만 개 넘는 글자를 실제 화면 픽셀로 재서 모두 4.5:1 이상인지 확인했어요.

## 데이터 연결

```tsx
import { ChartCard, ChartState, LineChart, useChartData } from "ztd-charts";

export function Revenue() {
  const r = useChartData("/api/revenue", { select: "data.items", refreshMs: 60_000 });
  return (
    <ChartCard title="채널별 월 매출" subtitle="(만 원)" takeaway="SNS가 빠르게 커져요" level="기본" replay>
      <ChartState loading={r.loading && !r.data.length} error={r.error} empty={r.empty} onRetry={r.reload}>
        <LineChart data={r.data} x="month" y="revenue" series="channel" highlight="SNS" unit="만" />
      </ChartState>
    </ChartCard>
  );
}
```

| 출처 | 방법 |
|---|---|
| REST JSON | `useChartData(url, { select: "data.items", init: { headers } })` |
| CSV 파일 | `useChartData("/data/sales.csv")`. `.csv`, `text/csv`, `format=csv`를 보고 `parseCSV`로 읽어요 |
| Supabase | `useChartData(async () => (await supabase.from("t").select("day, revenue")).data)` 또는 REST `${url}/rest/v1/t?select=...` + `apikey` 헤더 |
| Postgres(node-postgres) | API에서 `rows`를 그대로 JSON으로. numeric이 `"1234.50"` 문자열이어도 숫자로 읽어요 |
| Google Sheets | `https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<탭>` |
| 2차원 배열, SQL rows + fields | `fromRows(rows, columns)` |
| 키-값 맵, 열 모음 | `fromObjects({ 모바일: 72 })`, `fromObjects({ 월: [...], 매출: [...] })` |
| 넓은 표 → 긴 표 | `melt(rows, ["월"])` 또는 `y={["검색", "SNS"]}` |

`loading`은 `refreshMs`나 `reload()`로 다시 불러올 때도 true예요. 그동안 `data`에는 이전 행이 남아 있어요. 위처럼 `loading={r.loading && !r.data.length}`로 넘기면 처음 불러올 때만 스켈레톤을 보여 주고, 다시 불러오는 동안에는 차트를 그대로 둬요.

예시 코드는 [examples/data/](examples/data)에 있어요(REST, CSV, Supabase, Google Sheets, Postgres API). 문서 사이트 ["데이터 연결" 페이지](https://charts.ztd.app/docs/data/)에서 직접 동작을 볼 수 있고, Google Sheets 주소를 붙여 넣어 볼 수도 있어요.

## JSON 스펙

```json
{
  "$schema": "https://unpkg.com/ztd-charts/schema/chart-spec.schema.json",
  "type": "funnel",
  "data": [{ "stage": "방문", "users": 10000 }, { "stage": "구매", "users": 760 }],
  "encoding": { "label": "stage", "value": "users" },
  "options": { "unit": "명" },
  "card": { "number": "03", "title": "퍼널 차트", "takeaway": "단계별 이탈", "level": "기본" }
}
```

- `data`: 행 배열, `{ "values": [...] }`, `{ "csv": "..." }`, `{ "url": "...", "format": "csv", "select": "data.items" }`.
- `card.level`: `"basic"`, `"intermediate"`, `"advanced"`. 예전 한국어 값(`"기본"`, `"중급"`, `"심화"`)도 그대로 돼요.
- 공개 JSON Schema(draft 2020-12): 패키지의 `ztd-charts/schema.json`, 차트별은 `schema/charts/<type>.schema.json`.
- React 없이 쓰는 도구는 `ztd-charts/spec`: `validateSpec`, `specSchema`, `schemaFor`, `suggestCharts`, `CHARTS`(레지스트리), 예시 데이터.
- 레지스트리 글은 영어가 기본이에요. 한국어 이름, 설명, 예시는 `chartsIn("ko")`나 `localizeDef(def, "ko")`, 한국어 예시 데이터는 `...SampleKo`(`barSampleKo` …), 한국어 메시지는 `validateSpec(spec, { lang: "ko" })`, `suggestCharts(rows, { lang: "ko" })`로 받아요. 묶음과 수준 이름은 `GROUPS`, `LEVELS`에 두 언어로 있어요.
- 서버 렌더는 `ztd-charts/server`: `renderSpecToSVG`(PNG 변환용 독립 SVG, ChartCard 포함), `renderSpecToHTML`, `resolveSpecData`.
- `validateSpec(spec, { lang: "ko" })`은 틀린 필드에 비슷한 이름을 알려줘요: `"revenu" 필드가 데이터에 없어요. "revenue"인가요?`

## CLI

```bash
npx ztd-charts-cli list                         # 전체 목록 (--json, --group, --level)
npx ztd-charts-cli info sankey                  # 채널, 옵션, 예시, React 코드
npx ztd-charts-cli schema line --out line.schema.json
npx ztd-charts-cli example donut --out donut.json
npx ztd-charts-cli validate donut.json          # 성공 0, 실패 1
npx ztd-charts-cli render donut.json --out donut.png --theme light --scale 2
npx ztd-charts-cli render donut.json --out donut.svg
npx ztd-charts-cli render donut.json --out donut.html --interactive
npx ztd-charts-cli init my-app --type funnel    # 스펙, CSV, Dashboard.tsx
npx ztd-charts-cli suggest sales.csv --out-dir charts
```

안내 문구, 차트 글자, 숫자 형식은 영어가 기본이에요. 명령 앞뒤 어디든 `--locale ko`를 붙이면 한국어로 바뀌어요.

프로젝트에 설치하면(`npm i -D ztd-charts-cli`) 명령 이름은 `ztd-charts`예요. 설치하지 않았다면 `npx ztd-charts-cli`로 실행해 주세요. `npx ztd-charts`는 명령이 없는 차트 라이브러리 패키지를 받아요. PNG는 [resvg](https://github.com/yisibl/resvg-js)로 그리고, `pretendard` 패키지가 있거나 `ZTD_CHARTS_FONT_DIR`을 주면 그 글꼴을 써요(`--font path.otf`도 돼요).

## MCP 서버

stdio MCP 서버예요. 도구는 다섯 개.

| 도구 | 기능 |
|---|---|
| `list_charts` | 전체 차트 목록(묶음, 수준으로 거르기) |
| `get_chart_schema` | 차트 하나의 스키마, 예시 스펙, React 코드 |
| `validate_spec` | 경로와 제안이 있는 오류, 경고 |
| `render_chart` | PNG 이미지 + SVG + React 코드. `locale: "ko"`면 한국어 차트 글자와 숫자 형식 |
| `suggest_chart` | CSV, 행 배열, URL로 차트 추천과 바로 쓰는 스펙 |

Claude Desktop(`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ztd-charts": { "command": "npx", "args": ["-y", "ztd-charts-mcp"] }
  }
}
```

Claude Code:

```bash
claude mcp add ztd-charts -- npx -y ztd-charts-mcp
```

Cursor(`.cursor/mcp.json` 또는 `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "ztd-charts": { "command": "npx", "args": ["-y", "ztd-charts-mcp"] }
  }
}
```

저장소에서 바로 쓰려면 `pnpm build`를 실행한 뒤 `"command": "node", "args": ["<저장소>/packages/mcp/dist/index.js"]`로 등록해요.

## AI 스킬

[skills/ztd-charts/SKILL.md](skills/ztd-charts/SKILL.md)는 에이전트에게 차트 고르기, 스펙 쓰기, 실제 데이터 연결, 카드 문구, 검증과 미리 보기 순서를 가르쳐요(영어로 써 있어요). 33종 참고표는 [skills/ztd-charts/references/charts.md](skills/ztd-charts/references/charts.md). Claude Code는 `.claude/skills/ztd-charts/`, Cursor는 `.cursor/skills/ztd-charts/`에 폴더를 복사하면 돼요. 요약본 [llms.txt](llms.txt)는 문서 사이트 루트에서도 열려요.

## 문서 사이트

[charts.ztd.app/docs](https://charts.ztd.app/docs/)에서 볼 수 있고, 랜딩 페이지는 [charts.ztd.app](https://charts.ztd.app/)이에요.

갤러리(2칸, 3칸, 다크, 라이트, 묶음 필터, 모두 다시 재생), 예시 대시보드 5개(SaaS 대시보드, 마케팅 퍼널 리포트, 투자 포트폴리오, 제품 리텐션 분석, 운영/인프라 모니터링), 차트 페이지(직접 만져 보기, 데이터 바꾸기, 프롭 표, React, JSON, CLI 코드), 데이터 연결, 문서, 플레이그라운드, 1만 점 스트레스(`/qa/stress/`)가 있어요.

## 개발

```
packages/ztd-charts  ztd-charts      라이브러리 (src/charts, core, data, layout, spec, server)
packages/cli         ztd-charts-cli  ztd-charts
packages/mcp         ztd-charts-mcp  MCP 서버
examples/data        데이터 연결 예시 (문서가 그대로 보여줘요)
skills/ztd-charts    에이전트 스킬
docs                 catalog.md (catalog.ko.md), QA-report.md, EVALUATION-2026-11.md, screens/
```

```bash
pnpm build        # 라이브러리 → CLI → MCP
pnpm test         # Vitest (빌드 뒤: CLI, MCP 끝단 테스트가 dist를 써요)
pnpm typecheck
pnpm lint
pnpm size         # size-limit
```

## QA 결과

[docs/QA-report.md](docs/QA-report.md)에 숫자가 모두 있어요. 차트 33종과 예시 5개를 1440, 1280, 390px × 다크, 라이트로 찍고, 잘림, 겹침, 대비(실제 픽셀), 애니메이션 프레임, 1만 점 스트레스, 번들 크기를 쟀어요.

2026년 11월에 심미성, 성능, 품질, 속도, 실제 기능성 다섯 축으로 평가하고 고친 내용과 전후 숫자는 [docs/EVALUATION-2026-11.md](docs/EVALUATION-2026-11.md)에 있어요.

## 라이선스

MIT. 예시의 모든 숫자는 가상의 데이터예요.
