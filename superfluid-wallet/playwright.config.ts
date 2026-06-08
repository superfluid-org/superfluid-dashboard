import { defineConfig, devices } from '@playwright/test'

const walletPort = process.env.HFA_WALLET_TEST_PORT ?? '3099'
const walletBaseUrl = `http://127.0.0.1:${walletPort}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: walletBaseUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm exec next dev --port ${walletPort} --hostname 127.0.0.1`,
    url: walletBaseUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
