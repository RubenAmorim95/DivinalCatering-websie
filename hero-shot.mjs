import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = 'file://' + path.join(__dirname, 'index.html');

const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto(base, { waitUntil: 'networkidle' });
  await p.waitForTimeout(2200);
  await p.screenshot({ path: `screenshots/hero-new-${w}.png`, clip: { x:0, y:0, width:w, height:h } });
  await ctx.close();
  console.log(`done ${w}`);
}
await browser.close();
