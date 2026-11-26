import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/routines', '/iaq-lab', '/community', '/assistant'];

const widths = [320, 360, 375, 390, 430, 600, 768, 820, 1024, 1280, 1440, 1920, 2560];
const screenshotWidths = new Set([375, 768, 1024, 1440]);

async function overflowingElements(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    return [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        // Ignore elements inside a container that scrolls on purpose.
        return r.width > 0 && r.right > vw + 1 && !el.closest('[data-lenis-prevent], .overflow-x-auto');
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 80)}`);
  });
}

for (const route of routes) {
  test.describe(`route ${route}`, () => {
    for (const width of widths) {
      test(`no horizontal overflow at ${width}px`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));

        await page.setViewportSize({ width, height: width < 768 ? 800 : 900 });
        await page.goto(route, { waitUntil: 'networkidle' });

        const { scroll, client } = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(scroll, `page wider than viewport; offenders: ${(await overflowingElements(page)).join(', ')}`)
          .toBeLessThanOrEqual(client);
        expect(errors, 'uncaught page errors').toEqual([]);

        if (screenshotWidths.has(width)) {
          const name = route === '/' ? 'home' : route.slice(1);
          await page.screenshot({ path: `e2e/screenshots/${name}-${width}.png`, fullPage: true });
        }
      });
    }

    test('landscape phone (844x390) has no overflow', async ({ page }) => {
      await page.setViewportSize({ width: 844, height: 390 });
      await page.goto(route, { waitUntil: 'networkidle' });
      const ok = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      expect(ok).toBe(true);
    });

    test('no serious axe WCAG A/AA violations at 375px', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(route, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.length} node(s) e.g. ${v.nodes[0]?.target}`)).toEqual([]);
    });
  });
}

test('mobile navigation is reachable at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  const nav = page.getByRole('navigation').first();
  const toggle = page.getByRole('button', { name: /menu/i });
  if (await toggle.count()) {
    await toggle.first().click();
  }
  await expect(page.getByRole('link', { name: /routines/i }).first()).toBeVisible();
  await expect(nav).toBeAttached();
});

test('routines use live air quality for the selected city', async ({ page }) => {
  await page.route('**/api/air-quality**', async (route) => {
    const real = await route.fetch();
    const json = await real.json();
    json.current = { ...json.current, usAqi: 287, pm25: 210 };
    await route.fulfill({ response: real, json });
  });
  await page.goto('/routines');
  await expect(page.getByText('AQI 287')).toBeVisible();
  await page.getByRole('button', { name: /generate daily routine/i }).click();
  await expect(page.getByText('210 µg/m³ outdoors').first()).toBeVisible();
  // With model keys configured the label names the model; without, the rule engine.
  await expect(page.getByText(/Rule engine|Personalized by/)).toBeVisible();
});
