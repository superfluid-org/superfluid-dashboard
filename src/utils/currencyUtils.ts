export enum CurrencyCode {
  USD = "USD",
  EUR = "EUR",
  AUD = "AUD",
  BRL = "BRL",
  CAD = "CAD",
  CHF = "CHF",
  CNY = "CNY",
  GBP = "GBP",
  HKD = "HKD",
  INR = "INR",
  JPY = "JPY",
  KRW = "KRW",
  MXN = "MXN",
  NOK = "NOK",
  RUB = "RUB",
  SEK = "SEK",
}

// Basically an Enum with more data
export class Currency {
  static readonly USD = new Currency(CurrencyCode.USD, "US", (v) => `$${v}`);
  static readonly EUR = new Currency(CurrencyCode.EUR, "EU", (v) => `€${v}`);
  static readonly AUD = new Currency(CurrencyCode.AUD, "AU", (v) => `$ ${v}`);
  static readonly BRL = new Currency(CurrencyCode.BRL, "BR", (v) => `R$ ${v}`);
  static readonly CAD = new Currency(CurrencyCode.CAD, "CA", (v) => `$ ${v}`);
  static readonly CHF = new Currency(CurrencyCode.CHF, "CH", (v) => `fr. ${v}`);
  static readonly CNY = new Currency(CurrencyCode.CNY, "CN", (v) => `¥ ${v}`);
  static readonly GBP = new Currency(CurrencyCode.GBP, "GB", (v) => `£${v}`);
  static readonly HKD = new Currency(CurrencyCode.HKD, "HK", (v) => `HK$ ${v}`);
  static readonly INR = new Currency(CurrencyCode.INR, "IN", (v) => `₹ ${v}`);
  static readonly JPY = new Currency(CurrencyCode.JPY, "JP", (v) => `¥ ${v}`);
  static readonly KRW = new Currency(CurrencyCode.KRW, "KR", (v) => `₩ ${v}`);
  static readonly MXN = new Currency(CurrencyCode.MXN, "MX", (v) => `$ ${v}`);
  static readonly NOK = new Currency(CurrencyCode.NOK, "NO", (v) => `kr ${v}`);
  static readonly RUB = new Currency(CurrencyCode.RUB, "RU", (v) => `${v} p.`);
  static readonly SEK = new Currency(CurrencyCode.SEK, "SE", (v) => `${v} kr`);

  // private to disallow creating other instances of this type
  private constructor(
    public readonly code: CurrencyCode,
    public readonly country: string,
    public readonly format: (value: any) => string
  ) {}

  toString() {
    return this.code;
  }
}

export const currenciesByCode = {
  [CurrencyCode.USD]: Currency.USD,
  [CurrencyCode.EUR]: Currency.EUR,
  [CurrencyCode.AUD]: Currency.AUD,
  [CurrencyCode.BRL]: Currency.BRL,
  [CurrencyCode.CAD]: Currency.CAD,
  [CurrencyCode.CHF]: Currency.CHF,
  [CurrencyCode.CNY]: Currency.CNY,
  [CurrencyCode.GBP]: Currency.GBP,
  [CurrencyCode.HKD]: Currency.HKD,
  [CurrencyCode.INR]: Currency.INR,
  [CurrencyCode.JPY]: Currency.JPY,
  [CurrencyCode.KRW]: Currency.KRW,
  [CurrencyCode.MXN]: Currency.MXN,
  [CurrencyCode.NOK]: Currency.NOK,
  [CurrencyCode.RUB]: Currency.RUB,
  [CurrencyCode.SEK]: Currency.SEK,
};

export const currencies = Object.values(currenciesByCode);
