import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const route of ['/', '/tools/', '/json-format/', '/privacy/', '/terms/', '/support/']) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route)
    await page.evaluate(async () => {
      await Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => undefined)),
      )
    })
    const results = await new AxeBuilder({ page }).analyze()
    expect(
      results.violations.filter((violation) =>
        ['critical', 'serious'].includes(violation.impact ?? ''),
      ),
    ).toEqual([])
  })
}
