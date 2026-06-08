#!/usr/bin/env node
/**
 * Smoke-test that /hfa/setup hydrates without blank-page crashes.
 * Usage: SETUP_URL='http://localhost:3001/hfa/setup?...' pnpm smoke:hfa-setup
 */
import { chromium } from '@playwright/test'

const SETUP_URL = process.env.SETUP_URL?.trim()
const HEADING = 'Enable HFA for this Superfluid Wallet'

if (!SETUP_URL) {
  console.error('SETUP_URL is required (full /hfa/setup link with session and hfa params).')
  process.exit(1)
}

const pageErrors = []
const browser = await chromium.launch({ headless: true })

try {
  const page = await browser.newPage()
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto(SETUP_URL, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.getByText(HEADING).waitFor({ state: 'visible', timeout: 15_000 })

  if (pageErrors.length > 0) {
    console.error('Setup page crashed:')
    for (const entry of pageErrors) console.error(`  - ${entry}`)
    console.error('\nTry: rm -rf .next && pnpm dev')
    process.exit(1)
  }

  console.log('OK: setup page rendered without client errors.')
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Setup page smoke failed: ${message}`)
  if (pageErrors.length > 0) {
    for (const entry of pageErrors) console.error(`  - ${entry}`)
  }
  console.error('\nTry: rm -rf .next && pnpm dev')
  process.exit(1)
} finally {
  await browser.close()
}
