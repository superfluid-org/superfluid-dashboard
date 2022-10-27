// Basically an Enum with more data
export class Currency {
  static readonly USD = new Currency("USD", "US", (v) => `$${v}`);
  static readonly EUR = new Currency("EUR", "EU", (v) => `€${v}`);
  static readonly AUD = new Currency("AUD", "AU", (v) => `$ ${v}`);
  static readonly BRL = new Currency("BRL", "BR", (v) => `R$ ${v}`);
  static readonly CAD = new Currency("CAD", "CA", (v) => `$ ${v}`);
  static readonly CHF = new Currency("CHF", "CH", (v) => `fr. ${v}`);
  static readonly CNY = new Currency("CNY", "CN", (v) => `¥ ${v}`);
  static readonly GBP = new Currency("GBP", "GB", (v) => `£${v}`);
  static readonly HKD = new Currency("HKD", "HK", (v) => `HK$ ${v}`);
  static readonly INR = new Currency("INR", "IN", (v) => `₹ ${v}`);
  static readonly JPY = new Currency("JPY", "JP", (v) => `¥ ${v}`);
  static readonly KRW = new Currency("KRW", "KR", (v) => `₩ ${v}`);
  static readonly MXN = new Currency("MXN", "MX", (v) => `$ ${v}`);
  static readonly NOK = new Currency("NOK", "NO", (v) => `kr ${v}`);
  static readonly RUB = new Currency("RUB", "RU", (v) => `${v} p.`);
  static readonly SEK = new Currency("SEK", "SE", (v) => `${v} kr`);
  static readonly TRY = new Currency("TRY", "TR", (v) => `${v} ₺`);
  static readonly ZAR = new Currency("ZAR", "ZA", (v) => `R ${v}`);

  // private to disallow creating other instances of this type
  private constructor(
    public readonly code: string,
    public readonly country: string,
    public readonly format: (value: any) => string
  ) {}

  toString() {
    return this.code;
  }
}

export const currencies = [
  Currency.USD,
  Currency.EUR,
  Currency.AUD,
  Currency.BRL,
  Currency.CAD,
  Currency.CHF,
  Currency.CNY,
  Currency.GBP,
  Currency.HKD,
  Currency.INR,
  Currency.JPY,
  Currency.KRW,
  Currency.MXN,
  Currency.NOK,
  Currency.RUB,
  Currency.SEK,
  Currency.TRY,
  Currency.ZAR,
];

// p.
