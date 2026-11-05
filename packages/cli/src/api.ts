import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CHARTS, commonOptionsIn, findGroup, findLevel, getChartDef, localizeDef, schemaForIn, specLocale, specSchemaIn, suggestCharts, validateSpec, type ChartDef, type ChartSpec, type JSONSchema, type Suggestion, type ValidationResult, TYPE_ALIASES } from "ztd-charts/spec";
import { normalizeData, parseCSV } from "ztd-charts/spec";
import { langOf, renderSpecToHTML, renderSpecToSVG, resolveSpecData } from "ztd-charts/server";
import { CLI_TEXT } from "./messages";

const require = createRequire(import.meta.url);

export type { ChartSpec, ValidationResult, Suggestion, ChartDef, JSONSchema };

export interface ChartSummary {
  type: string;
  component: string;
  name: string;
  nameEn: string;
  level: string;
  group: string;
  summary: string;
  useWhen: string;
  avoidWhen: string;
  encoding: { name: string; required: boolean; type: string; description: string }[];
}

export function summarize(def: ChartDef): ChartSummary {
  return {
    type: def.type,
    component: def.component,
    name: def.name,
    nameEn: def.nameEn,
    level: def.level,
    group: def.group,
    summary: def.summary,
    useWhen: def.useWhen,
    avoidWhen: def.avoidWhen,
    encoding: def.encoding.map((c) => ({ name: c.name, required: c.required, type: c.multi ? `${c.type} | ${c.type}[]` : c.type, description: c.description })),
  };
}

/**
 * 차트 목록. group, level은 id("flow", "basic")나 영어, 한글 이름("흐름", "기본") 어느 것으로도 걸러요.
 * locale이 "ko"면 이름과 설명이 한글, 기본 영어
 */
export function listCharts(filter: { group?: string; level?: string; locale?: string } = {}): ChartSummary[] {
  const group = filter.group ? findGroup(filter.group)?.id ?? filter.group : undefined;
  const level = filter.level ? findLevel(filter.level)?.id ?? filter.level : undefined;
  const lang = langOf(filter.locale);
  return CHARTS.filter((c) => (!group || c.group === group) && (!level || c.level === level)).map((c) => summarize(localizeDef(c, lang)));
}

export function resolveType(type: string): ChartDef | undefined {
  return getChartDef(type) ?? getChartDef(TYPE_ALIASES[type] ?? "");
}

/** 모르는 차트 오류 */
function unknownChart(type: string, locale?: string): Error {
  return new Error(CLI_TEXT[langOf(locale)].unknownChart(type));
}

/** 전체 또는 차트 하나의 JSON Schema. locale "ko"면 설명이 한글 */
export function getChartSchema(type?: string, locale?: string): JSONSchema {
  const lang = langOf(locale);
  if (!type) return specSchemaIn(lang);
  const def = resolveType(type);
  if (!def) throw unknownChart(type, locale);
  return schemaForIn(def.type, lang)!;
}

/** 차트 하나의 설명, 스키마, 예시, React 코드. locale "ko"면 글과 예시가 한글 */
export function getChartInfo(type: string, locale?: string) {
  const found = resolveType(type);
  if (!found) throw unknownChart(type, locale);
  const lang = langOf(locale);
  const def = localizeDef(found, lang);
  return {
    ...summarize(def),
    why: def.why,
    options: [...def.options, ...commonOptionsIn(lang)].map((o) => ({ name: o.name, type: o.enum ? o.enum.map((e) => JSON.stringify(e)).join(" | ") : o.type, default: o.default, description: o.description })),
    schema: schemaForIn(def.type, lang),
    example: def.example,
    react: reactSnippet(def.example, { locale }),
  };
}

/** 스펙 검사. locale "ko"면 메시지가 한글 */
export function validate(spec: unknown, locale?: string): ValidationResult {
  return validateSpec(spec, { lang: langOf(locale) });
}

function jsxValue(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  return `{${JSON.stringify(v)}}`;
}

/** 스펙을 React 코드로 (컴포넌트를 직접 쓰는 방식). locale "ko"면 주석이 한글 */
export function reactSnippet(spec: ChartSpec, opts: { dataVar?: string; inlineData?: boolean; locale?: string } = {}): string {
  const ko = langOf(opts.locale) === "ko";
  const def = resolveType(spec.type);
  if (!def) return "";
  const rows = Array.isArray(spec.data) ? spec.data : null;
  const dataVar = opts.dataVar ?? "data";
  const props: string[] = [`data={${dataVar}}`];
  for (const c of def.encoding) {
    const v = spec.encoding?.[c.name];
    if (v !== undefined) props.push(`${c.prop ?? c.name}=${jsxValue(v)}`);
  }
  for (const [k, v] of Object.entries(spec.options ?? {})) props.push(`${k}=${jsxValue(v)}`);
  const chartEl = `<${def.component} ${props.join(" ")} />`;
  const card = spec.card;
  const imports = card ? `ChartCard, ${def.component}` : def.component;
  const more = rows && rows.length > 12 ? (ko ? ` // 외 ${rows.length - 12}행` : ` // and ${rows.length - 12} more rows`) : "";
  const dataLine = rows && opts.inlineData !== false ? `const ${dataVar} = ${JSON.stringify(rows.slice(0, 12), null, 2)}${more};\n\n` : `// ${dataVar}: ${ko ? "객체 배열 (REST, CSV, DB 행 등)" : "an array of objects (REST, CSV, database rows and so on)"}\n`;
  let body = chartEl;
  if (card) {
    const cp: string[] = [];
    for (const k of ["number", "title", "subtitle", "takeaway", "level"] as const) if (card[k]) cp.push(`${k}=${JSON.stringify(card[k])}`);
    if (Array.isArray(card.legend)) cp.push(`legend={${JSON.stringify(card.legend)}}`);
    cp.push("replay");
    body = `<ChartCard ${cp.join(" ")}>\n      ${chartEl}\n    </ChartCard>`;
  }
  return `import { ${imports} } from "ztd-charts";\n\n${dataLine}export function ${def.component}Example() {\n  return (\n    ${body}\n  );\n}\n`.replace(/\{"(\w+)":/g, (m) => m);
}

/** 스펙 그대로 쓰는 React 코드. ChartSpec 타입을 달아야 card.legend: "auto" 같은 값이 string으로 넓어지지 않아 TS에서 바로 컴파일돼요 */
export function specSnippet(spec: ChartSpec): string {
  return `import { Chart, type ChartSpec } from "ztd-charts";\n\nconst spec: ChartSpec = ${JSON.stringify({ ...spec, data: Array.isArray(spec.data) ? spec.data.slice(0, 8) : spec.data }, null, 2)};\n\nexport function SpecChart() {\n  return <Chart spec={spec} />;\n}\n`;
}

/** 한글이 들어간 PNG를 위해 쓸 글꼴 파일 */
export function findFonts(extra: string[] = []): string[] {
  const out: string[] = [];
  for (const f of extra) if (existsSync(f)) out.push(resolve(f));
  const dirs: string[] = [];
  if (process.env.ZTD_CHARTS_FONT_DIR) dirs.push(process.env.ZTD_CHARTS_FONT_DIR);
  try {
    const pkg = require.resolve("pretendard/package.json");
    dirs.push(join(dirname(pkg), "dist/public/static"));
  } catch {
    /* pretendard가 없으면 시스템 글꼴 */
  }
  const here = dirname(fileURLToPath(import.meta.url));
  dirs.push(join(here, "../fonts"));
  for (const d of dirs) {
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) if (/^Pretendard-(Regular|Medium|SemiBold|Bold|ExtraBold)\.(otf|ttf)$/i.test(f) || (d === process.env.ZTD_CHARTS_FONT_DIR && /\.(otf|ttf|ttc)$/i.test(f))) out.push(join(d, f));
  }
  return out;
}

export interface RenderOptions {
  format?: "svg" | "png" | "html";
  width?: number;
  height?: number;
  theme?: "dark" | "light";
  /** PNG 배율. 기본 2 */
  scale?: number;
  /** 카드 틀. 기본: spec.card가 있으면 true */
  frame?: boolean;
  /** HTML에 애니메이션과 인터랙션을 살리는 스크립트를 넣어요 */
  interactive?: boolean;
  fonts?: string[];
  /** 차트 글자, 숫자 형식, 오류 문구의 로캘. "ko"면 한국어(1.2만). 없으면 스펙 options.locale, 그다음 "en-US"(1.2K) */
  locale?: string;
}

export interface RenderResult {
  format: "svg" | "png" | "html";
  svg?: string;
  png?: Buffer;
  html?: string;
  width?: number;
  height?: number;
}

function standaloneUrl(): string | null {
  try {
    const p = require.resolve("ztd-charts/package.json");
    const f = join(dirname(p), "dist/standalone.js");
    if (!existsSync(f)) return null;
    return `data:text/javascript;base64,${readFileSync(f).toString("base64")}`;
  } catch {
    return null;
  }
}

/** 스펙을 SVG, PNG, HTML로. { url } 데이터는 먼저 가져와요. 가져오기, 검사, 그리기가 같은 로캘(locale, 그다음 스펙 options.locale)을 써요 */
export async function render(input: ChartSpec, opts: RenderOptions = {}): Promise<RenderResult> {
  const locale = specLocale(input, opts.locale);
  const spec = await resolveSpecData(input, undefined, locale);
  const v = validateSpec(spec, { lang: langOf(locale) });
  if (!v.valid) throw new Error(v.errors.map((e) => `${e.path}: ${e.message}`).join("\n"));
  const format = opts.format ?? "svg";
  if (format === "html") {
    const lib = opts.interactive ? standaloneUrl() : null;
    const html = renderSpecToHTML(spec, { width: opts.width, height: opts.height, theme: opts.theme, frame: opts.frame, interactive: lib ? { libraryUrl: lib } : false, locale });
    return { format, html };
  }
  const svg = renderSpecToSVG(spec, { width: opts.width, height: opts.height, theme: opts.theme, frame: opts.frame, locale });
  const m = /width="(\d+)" height="(\d+)"/.exec(svg);
  const width = m ? Number(m[1]) : undefined;
  const height = m ? Number(m[2]) : undefined;
  if (format === "svg") return { format, svg, width, height };
  const { Resvg } = await import("@resvg/resvg-js");
  const fontFiles = findFonts(opts.fonts);
  const r = new Resvg(svg, { fitTo: { mode: "zoom", value: opts.scale ?? 2 }, font: { fontFiles, loadSystemFonts: true, defaultFontFamily: fontFiles.length ? "Pretendard" : "sans-serif" } });
  const png = r.render().asPng();
  return { format, svg, png: Buffer.from(png), width, height };
}

/** http(s) 주소인지. loadRows, CLI suggest, MCP suggest_chart가 같은 규칙(대소문자 무시)을 써요 */
export function isHttpUrl(source: string): boolean {
  return /^https?:\/\//i.test(source);
}

/** 파일 경로나 URL, CSV/JSON 문자열을 행 배열로 */
export async function loadRows(source: string): Promise<Record<string, unknown>[]> {
  let text: string;
  if (isHttpUrl(source)) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
  } else if (existsSync(source)) text = readFileSync(source, "utf8");
  else text = source;
  const t = text.trim();
  if (t.startsWith("[") || t.startsWith("{")) return normalizeData(JSON.parse(t));
  return parseCSV(text);
}

/** 데이터로 차트 추천. locale "ko"면 이유와 카드 글이 한글 */
export function suggest(rows: Record<string, unknown>[], opts: { limit?: number; locale?: string } = {}) {
  return suggestCharts(rows, { limit: opts.limit, lang: langOf(opts.locale) });
}

export { CHARTS };
