const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const dir = __dirname;
const pages = ['index', 'sobre', 'galeria', 'orcamento'];
const widths = [375, 768, 1024, 1440];

(async () => {
  fs.mkdirSync(path.join(dir, 'screenshots'), { recursive: true });
  const browser = await chromium.launch();

  for (const page of pages) {
    for (const width of widths) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const p = await ctx.newPage();
      const url = 'file://' + path.join(dir, page + '.html');
      await p.goto(url, { waitUntil: 'networkidle' });

      // Scroll through to trigger IntersectionObserver
      const totalHeight = await p.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y <= totalHeight; y += 400) {
        await p.evaluate((sy) => window.scrollTo(0, sy), y);
        await p.waitForTimeout(25);
      }
      await p.evaluate(() => window.scrollTo(0, 0));

      // Wait for fallback reveal (2500ms) + transition (900ms) + buffer
      await p.waitForTimeout(3500);

      await p.screenshot({
        path: path.join(dir, `screenshots/${page}-${width}.png`),
        fullPage: true
      });
      console.log(`✓ ${page}-${width}.png`);
      await ctx.close();
    }
  }

  await browser.close();
  console.log('Done.');
})();
