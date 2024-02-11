export default function ensureDefined<T>(
  value: T | undefined | null,
  hint?: string | number
): T {
  if (!value)
    throw Error(
      "Value has to be defined." + (hint ? " " + hint.toString() : "")
    );
  return value;
}
