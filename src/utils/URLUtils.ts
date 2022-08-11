export function buildQueryString(queryObject: Object) {
  return Object.entries(queryObject)
    .map(([key, value]) =>
      value !== undefined && value !== null
        ? `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        : null
    )
    .filter((item) => item !== null)
    .join("&");
}
