import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = ['index', 'sobre', 'galeria', 'orcamento'];
const widths = [375, 768, 1024, 1440];

const browser = await chromium.launch();

for (const page of pages) {
  for (const width of widths) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const p = await ctx.newPage();
    const url = 'file://' + path.join(__dirname, page + '.html');
    await p.goto(url, { waitUntil: 'networkidle' });

    // Scroll through the page to trigger IntersectionObserver
    const totalHeight = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y <= totalHeight; y += 400) {
      await p.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await p.waitForTimeout(25);
    }
    await p.evaluate(() => window.scrollTo(0, 0));

    // Wait for fallback reveal (2500ms) + transition (900ms) + buffer
    await p.waitForTimeout(3500);

    await p.screenshot({
      path: path.join(__dirname, `screenshots/${page}-${width}.png`),
      fullPage: true
    });
    console.log(`✓ ${page}-${width}.png`);
    await ctx.close();
  }
}

await browser.close();
console.log('Done.');
