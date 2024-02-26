const segmentWriteKeyForDeployPreview =
  process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY_FOR_DEPLOY_PREVIEW ||
  "axUnL2Cp3F4qstRzkmmstaeNBdMfoo56";

const segmentWriteKeyForProduction =
  process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY_FOR_PRODUCTION ||
  "U00hhAgEO5bL8vb5OdhFYsIYTDwI04ei"; // This will be exposed client-side anyways.

const netlifyContext = process.env.NEXT_PUBLIC_NETLIFY_CONTEXT;
export const isProduction = netlifyContext === "production";
const isDeployPreview = netlifyContext === "deploy-preview";

const config = {
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
  accountingApi:
    process.env.NEXT_PUBLIC_ACCOUNTING_API ||
    "https://accounting.superfluid.dev/v1",
  platformApi: {
    mumbai:
      process.env.NEXT_PUBLIC_PLATFORM_MUMBAI ||
      "https://prod-mumbai-platform-service.dev.superfluid.dev",
  },
  segmentWriteKey: isProduction
    ? segmentWriteKeyForProduction
    : isDeployPreview
    ? segmentWriteKeyForDeployPreview
    : undefined,
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
    "8fcff23b035b115b5c1324ad717589ab",
} as const;

export default Object.freeze(config);
