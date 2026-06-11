import { expect, type Locator, type Page } from '@playwright/test'

const TOLERANCE_PX = 3

export async function openHfaSetupSignInModal(page: Page, setupUrl: string): Promise<void> {
  await page.goto(setupUrl)
  await page.getByRole('button', { name: 'Sign in to continue' }).click({ timeout: 15_000 })
  await expect(page.getByText('Log in or sign up')).toBeVisible({ timeout: 15_000 })
  await waitForTurnkeyModalLayoutStable(page)
}

/** Turnkey measures modal size with ResizeObserver + a short blur transition. */
export async function waitForTurnkeyModalLayoutStable(page: Page): Promise<void> {
  const panel = turnkeyModalPanel(page)
  let lastWidth = 0
  let stableReads = 0

  for (let attempt = 0; attempt < 15; attempt += 1) {
    const box = await panel.boundingBox()
    const width = box?.width ?? 0
    if (width > 0 && Math.abs(width - lastWidth) < 1) {
      stableReads += 1
      if (stableReads >= 2) return
    } else {
      stableReads = 0
    }
    lastWidth = width
    await page.waitForTimeout(100)
  }
}

export function turnkeyModalPanel(page: Page): Locator {
  return page.locator('.tk-modal .bg-modal-background-light, .tk-modal .bg-modal-background-dark').first()
}

/** Fail if `inner` extends past `outer` horizontally (clipped or overflowing modal). */
export async function expectContainedHorizontally(
  outer: Locator,
  inner: Locator,
  label: string,
): Promise<void> {
  const outerBox = await outer.boundingBox()
  const innerBox = await inner.boundingBox()
  expect(outerBox, `${label}: outer box missing`).not.toBeNull()
  expect(innerBox, `${label}: inner box missing`).not.toBeNull()

  const outerRight = outerBox!.x + outerBox!.width
  const innerRight = innerBox!.x + innerBox!.width

  expect(
    innerBox!.x,
    `${label}: left edge ${innerBox!.x} < outer ${outerBox!.x}`,
  ).toBeGreaterThanOrEqual(outerBox!.x - TOLERANCE_PX)
  expect(
    innerRight,
    `${label}: right edge ${innerRight} > outer ${outerRight}`,
  ).toBeLessThanOrEqual(outerRight + TOLERANCE_PX)
}

export async function captureTurnkeyModalScreenshot(page: Page, path: string): Promise<void> {
  const panel = turnkeyModalPanel(page)
  await panel.screenshot({ path })
}
