const config = {
  appUrl: (process.env.NEXT_PUBLIC_APP_URL || "").trim(),
  intercom: {
    appId: process.env.NEXT_PUBLIC_INTERCOM_APP_ID || "",
  },
  hotjar: {
    id: process.env.NEXT_PUBLIC_HJID,
    sv: process.env.NEXT_PUBLIC_HJSV,
  },
  api: {
    faucetApiUrl:
      process.env.NEXT_PUBLIC_FAUCET_API ||
      "https://967h1q725d.execute-api.eu-west-2.amazonaws.com",
  },
};

export default Object.freeze(config);
