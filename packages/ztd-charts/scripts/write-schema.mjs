// 빌드한 spec 모듈로 공개 JSON Schema 파일을 써요
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { specSchema, schemaFor, CHARTS } = await import(join(root, "dist/spec.js"));
const dir = join(root, "schema");
mkdirSync(join(dir, "charts"), { recursive: true });
writeFileSync(join(dir, "chart-spec.schema.json"), JSON.stringify(specSchema(), null, 2) + "\n");
for (const c of CHARTS) writeFileSync(join(dir, "charts", `${c.type}.schema.json`), JSON.stringify(schemaFor(c.type), null, 2) + "\n");
console.log(`schema: ${CHARTS.length + 1} files -> schema/`);
