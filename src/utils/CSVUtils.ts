function findAllKeys(array: Array<Object>) {
  return array.reduce<string[]>(
    (keys, item) => [
      ...keys,
      ...Object.keys(item).filter((key) => !keys.includes(key)),
    ],
    []
  );
}

export function arrayToCSV(array: Array<Object>) {
  const keys = findAllKeys(array);
  return [
    keys.join(","),
    ...array.map((object) => Object.values(object).join(",")),
  ].join("\n");
}
