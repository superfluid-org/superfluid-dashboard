import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";
import { CoreHelperUtil } from "@reown/appkit/react";

const source = readFileSync(new URL("../src/features/wallet/oathWallet.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { getOathWallets } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("offers Oath on desktop and iOS without inventing an injected or desktop wallet", () => {
  for (const agent of ["", "Macintosh", "Windows", "iPhone", "iPad"]) {
    const [wallet] = getOathWallets(agent);
    assert.equal(wallet.name, "Oath Wallet");
    assert.equal(wallet.mobile_link, "oathwallet://");
    assert.equal(wallet.app_store, "https://apps.apple.com/app/id6780187283");
    assert.equal(wallet.desktop_link, undefined);
    assert.equal(wallet.webapp_link, undefined);
    assert.equal(wallet.play_store, undefined);
  }
});

test("does not offer the iOS-only wallet on Android", () => {
  assert.deepEqual(getOathWallets("Mozilla/5.0 (Linux; Android 14)"), []);
});

test("installed AppKit preserves the complete pairing URI in Oath's native link", () => {
  const [wallet] = getOathWallets("iPhone");
  const uri = "wc:test-topic@2?relay-protocol=irn&symKey=test-only&expiryTimestamp=123";
  const result = CoreHelperUtil.formatNativeUrl(wallet.mobile_link, uri);
  const url = new URL(result.redirect);
  assert.equal(url.protocol, "oathwallet:");
  assert.equal(url.hostname, "wc");
  assert.equal(url.searchParams.get("uri"), uri);
});

test("the bundled logo is available with rounded corners", () => {
  const [wallet] = getOathWallets("Macintosh");
  const svg = readFileSync(new URL(`../public${wallet.image_url}`, import.meta.url), "utf8");
  assert.match(svg, /<svg/);
  assert.match(svg, /rx="/);
});
