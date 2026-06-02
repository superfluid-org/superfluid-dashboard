#!/usr/bin/env node
/**
 * Creates tests/cypress.env.json with a dedicated Superfluid Wallet E2E keypair.
 * Re-run is safe: existing SUPERFLUID_WALLET_E2E_* values are preserved.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const testsDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envPath = path.join(testsDir, 'cypress.env.json');
const dashboardEnvPath = path.join(testsDir, '..', '.env.local');

/** @type {Record<string, unknown>} */
let env = {};
if (fs.existsSync(envPath)) {
  env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
}

if (!env.SUPERFLUID_WALLET_E2E_PRIVATE_KEY) {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  env.SUPERFLUID_WALLET_E2E_PRIVATE_KEY = privateKey;
  env.SUPERFLUID_WALLET_E2E_ADDRESS = account.address;
  console.log('Generated new Superfluid Wallet E2E keypair.');
} else {
  console.log('Using existing SUPERFLUID_WALLET_E2E_* from cypress.env.json.');
}

env.dev = env.dev ?? true;

fs.writeFileSync(envPath, `${JSON.stringify(env, null, 2)}\n`);

const walletEnvLines = [
  'NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true',
  'NEXT_PUBLIC_SUPERFLUID_WALLET_URL=http://localhost:3001',
];
const walletEnvBlock = `${walletEnvLines.join('\n')}\n`;

if (!fs.existsSync(dashboardEnvPath)) {
  fs.writeFileSync(dashboardEnvPath, walletEnvBlock);
  console.log(`Created ${dashboardEnvPath}`);
} else {
  const current = fs.readFileSync(dashboardEnvPath, 'utf8');
  if (!current.includes('NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true')) {
    fs.appendFileSync(dashboardEnvPath, `\n${walletEnvBlock}`);
    console.log(`Appended Superfluid Wallet flags to ${dashboardEnvPath}`);
  } else {
    console.log(`${dashboardEnvPath} already enables Superfluid Wallet.`);
  }
}

console.log('');
console.log('Superfluid Wallet E2E setup complete.');
console.log('');
console.log('Fund this address on Optimism Sepolia (≥ 0.15 ETH recommended):');
console.log(`  ${env.SUPERFLUID_WALLET_E2E_ADDRESS}`);
console.log('');
console.log('Then run:');
console.log('  1. pnpm dev                          # dashboard root, port 3000');
console.log('  2. cd tests && pnpm e2e:superfluid-wallet');
