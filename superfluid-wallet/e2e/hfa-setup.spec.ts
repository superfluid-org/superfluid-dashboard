import { test, expect } from '@playwright/test'
import {
  captureTurnkeyModalScreenshot,
  expectContainedHorizontally,
  openHfaSetupSignInModal,
  turnkeyModalPanel,
} from './helpers/turnkey-modal-layout'

const SESSION_ID = 'e2e-setup-session-001'
const AGENT_PUBLIC_KEY = '02' + 'a'.repeat(64)
const PROVIDER_PUB = '03' + 'b'.repeat(64)
const HFA_PORT = 18712
const HFA_ORIGIN = `http://127.0.0.1:${HFA_PORT}`

const pendingSession = {
  setupSessionId: SESSION_ID,
  status: 'pending',
  agentPublicKey: AGENT_PUBLIC_KEY,
  agentLabel: 'E2E Test Agent',
  providerPublicKey: PROVIDER_PUB,
  expiresAt: Date.now() + 60_000,
}

function trackPageErrors(page: import('@playwright/test').Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

test.describe('HFA setup page', () => {
  test('hydrates without blank-page client crashes', async ({ page }) => {
    const pageErrors = trackPageErrors(page)

    await page.route(`${HFA_ORIGIN}/api/turnkey/hfa/setup-sessions/**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(pendingSession),
        })
        return
      }
      await route.continue()
    })

    const setupUrl = `/hfa/setup?session=${SESSION_ID}&hfa=${encodeURIComponent(HFA_ORIGIN)}`
    await page.goto(setupUrl)

    await expect(page.getByText('Enable HFA for this Superfluid Wallet')).toBeVisible({ timeout: 15_000 })
    expect(pageErrors, `page crashed: ${pageErrors.join('; ')}`).toEqual([])
  })

  test('fetches setup session from hfa= URL and does not show Failed to fetch', async ({ page }) => {
    const pageErrors = trackPageErrors(page)

    await page.route(`${HFA_ORIGIN}/api/turnkey/hfa/setup-sessions/**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(pendingSession),
        })
        return
      }
      await route.continue()
    })

    const setupUrl = `/hfa/setup?session=${SESSION_ID}&hfa=${encodeURIComponent(HFA_ORIGIN)}`
    await page.goto(setupUrl)

    await expect(page.getByText('Enable HFA for this Superfluid Wallet')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Failed to fetch')).toHaveCount(0, { timeout: 15_000 })

    const signIn = page.getByText('Sign in with email OTP')
    const enableButton = page.getByRole('button', { name: 'Enable HFA' })
    await expect(signIn.or(enableButton)).toBeVisible({ timeout: 15_000 })

    if (await enableButton.isVisible()) {
      await expect(page.getByText('E2E Test Agent')).toBeVisible()
    }

    expect(pageErrors, `page crashed: ${pageErrors.join('; ')}`).toEqual([])
  })

  test('Turnkey login modal layout is not clipped or overflowing', async ({ page }, testInfo) => {
    const pageErrors = trackPageErrors(page)

    await page.route(`${HFA_ORIGIN}/api/turnkey/hfa/setup-sessions/**`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(pendingSession),
        })
        return
      }
      await route.continue()
    })

    const setupUrl = `/hfa/setup?session=${SESSION_ID}&hfa=${encodeURIComponent(HFA_ORIGIN)}`
    await openHfaSetupSignInModal(page, setupUrl)

    const panel = turnkeyModalPanel(page)
    const emailField = page.getByPlaceholder('Enter your email')
    const heading = page.getByText('Log in or sign up')
    const terms = page.getByText('Terms of Service')

    await expect(emailField).toBeVisible()
    await expect(terms).toBeVisible()

    const screenshotPath = testInfo.outputPath('turnkey-login-modal.png')
    await captureTurnkeyModalScreenshot(page, screenshotPath)

    await expectContainedHorizontally(panel, emailField, 'email input')
    await expectContainedHorizontally(panel, heading, 'modal heading')
    await expectContainedHorizontally(panel, terms, 'terms line')

    expect(pageErrors, `page crashed: ${pageErrors.join('; ')}`).toEqual([])
  })
})
