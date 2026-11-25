import type { CustomWallet } from "@reown/appkit/react";

// A local AppKit entry, not a WalletGuide listing or an injected browser wallet.
export function getOathWallets(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
): CustomWallet[] {
  // Oath is an iOS app; do not offer a native handoff on Android.
  if (/android/i.test(userAgent)) return [];

  return [{
    id: "oath-ios",
    name: "Oath Wallet",
    homepage: "https://oathwallet.org",
    image_url: "/icons/oath-wallet.svg",
    mobile_link: "oathwallet://",
    app_store: "https://apps.apple.com/app/id6780187283",
  }];
}
