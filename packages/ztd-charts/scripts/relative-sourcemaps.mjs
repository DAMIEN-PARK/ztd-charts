// 소스 맵의 file 과 sources 에 남은 절대 경로를 dist 기준 상대 경로로 바꿔요. npm 묶음에 빌드한 컴퓨터의 경로가 실리지 않게
// tsup 은 CommonJS 를 쪼개 만들 때(splitting) 조각마다 sucrase 를 한 번 더 돌리면서, 출력 파일 자신의 절대 경로를 두 칸에 넣어요
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const toRelative = (path) => (isAbsolute(path) ? relative(dist, path) : path);
let fixed = 0;
for (const file of readdirSync(dist).filter((f) => f.endsWith(".map"))) {
  const path = join(dist, file);
  const map = JSON.parse(readFileSync(path, "utf8"));
  if (!isAbsolute(map.file ?? "") && !map.sources.some(isAbsolute)) continue;
  if (map.file) map.file = toRelative(map.file);
  map.sources = map.sources.map(toRelative);
  writeFileSync(path, JSON.stringify(map));
  fixed++;
}
console.log(`sourcemaps: ${fixed} files with absolute paths -> relative`);
