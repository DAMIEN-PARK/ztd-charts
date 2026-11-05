/**
 * 길이는 정해져 있고 칸은 처음 읽을 때 만드는 배열. 1만 개 라벨, 이벤트를 다 만들지 않으려고 써요.
 * 인덱스 읽기, length, slice, map, forEach, indexOf가 돼요 (has 트랩이 없으면 배열 메서드가 빈 칸을 건너뛰어요).
 */
export function lazyArray<T>(n: number, make: (i: number) => T): T[] {
  const cache = new Array<T | undefined>(n);
  const has = new Uint8Array(n);
  const index = (prop: string | symbol): number => {
    if (typeof prop !== "string" || prop.length === 0 || prop.length > 9) return -1;
    const i = Number(prop);
    return Number.isInteger(i) && i >= 0 && i < n && String(i) === prop ? i : -1;
  };
  return new Proxy(cache as T[], {
    get(target, prop, recv) {
      const i = index(prop);
      if (i >= 0) {
        if (!has[i]) {
          target[i] = make(i);
          has[i] = 1;
        }
        return target[i];
      }
      return Reflect.get(target, prop, recv);
    },
    has(target, prop) {
      return index(prop) >= 0 || Reflect.has(target, prop);
    },
  });
}
