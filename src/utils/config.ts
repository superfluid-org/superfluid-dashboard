const config = Object.freeze({
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || "").trim(),
  intercom: {
    appId: process.env.NEXT_PUBLIC_INTERCOM_APP_ID || "",
  },
  hotjar: {
    id: process.env.NEXT_PUBLIC_HJID,
    sv: process.env.NEXT_PUBLIC_HJSV,
  },
  tokenIconUrl:
    "https://raw.githubusercontent.com/superfluid-finance/assets/master/public/",
  api: {
    faucetApiUrl:
      process.env.NEXT_PUBLIC_FAUCET_API ||
      "https://967h1q725d.execute-api.eu-west-2.amazonaws.com",
  },
  platformApi: {
    goerli:
      process.env.NEXT_PUBLIC_PLATFORM_GOERLI ||
      "https://prod-goerli-platform-service.dev.superfluid.dev",
  },
  segmentWriteKey:
    process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY ||
    "axUnL2Cp3F4qstRzkmmstaeNBdMfoo56",
});

export default Object.freeze(config);
