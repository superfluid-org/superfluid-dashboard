// Inspired by: https://stackoverflow.com/a/64091830/6099842
export function debouncePromiseToLastResult(
  func: (...args: any[]) => Promise<any>,
  interval: number
): (...args: any[]) => ReturnType<typeof func> {
  let handle: NodeJS.Timeout | undefined;
  let resolves: Array<(value?: unknown) => void> = [];

  return async (...args: unknown[]) => {
    clearTimeout(handle);
    handle = setTimeout(() => {
      const result = func(...args);
      resolves.forEach((resolve) => resolve(result));
      resolves = [];
    }, interval);

    return new Promise((resolve) => resolves.push(resolve));
  };
}
