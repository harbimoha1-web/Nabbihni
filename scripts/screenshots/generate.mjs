// Kam Baqi — App Store Screenshot Generator
// Usage: node scripts/screenshots/generate.mjs [--index=N]
//
// Reads raw screenshots from docs/screenshots/raw/
// Outputs framed screenshots to docs/screenshots/output/
// If raw files are missing, generates test placeholders.

import puppeteer from 'puppeteer';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { screenshots, OUTPUT_WIDTH, OUTPUT_HEIGHT } from './config.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');
const RAW_DIR = join(PROJECT_ROOT, 'docs', 'screenshots', 'raw');
const OUTPUT_DIR = join(PROJECT_ROOT, 'docs', 'screenshots', 'output');
const ASSETS_DIR = join(__dirname, 'assets');

// Parse --index=N argument to generate a single screenshot
const indexArg = process.argv.find(a => a.startsWith('--index='));
const singleIndex = indexArg ? parseInt(indexArg.split('=')[1], 10) - 1 : null;

// Load fonts as base64 for embedding in HTML
function loadFontBase64(filename) {
  const fontPath = join(ASSETS_DIR, filename);
  if (!existsSync(fontPath)) return null;
  return readFileSync(fontPath).toString('base64');
}

// Build the HTML template string
function buildTemplate(data) {
  const boldFont = loadFontBase64('Tajawal-Bold.ttf');
  const extraBoldFont = loadFontBase64('Tajawal-ExtraBold.ttf');

  const fontFaces = `
    ${boldFont ? `@font-face {
      font-family: 'Tajawal';
      src: url('data:font/truetype;base64,${boldFont}') format('truetype');
      font-weight: 700;
      font-style: normal;
    }` : ''}
    ${extraBoldFont ? `@font-face {
      font-family: 'Tajawal';
      src: url('data:font/truetype;base64,${extraBoldFont}') format('truetype');
      font-weight: 800;
      font-style: normal;
    }` : ''}
  `;

  const bgStyle = data.background.type === 'gradient'
    ? `background: linear-gradient(180deg, ${data.background.from}, ${data.background.to});`
    : `background: ${data.background.color};`;

  // Status bar overlay: covers time, battery, signal at top of screenshot
  // iPhone status bar is ~54pt = ~162px at 3x. We use a gradient fade for a natural look.
  const statusBarOverlay = `<div style="position:absolute;top:0;left:0;right:0;height:170px;
    background:linear-gradient(180deg, #0F1419 40%, rgba(15,20,25,0.8) 70%, transparent 100%);
    z-index:20;border-radius:56px 56px 0 0;pointer-events:none;"></div>`;

  const screenshotImg = data.imgBase64
    ? `<img src="${data.imgBase64}" style="width:100%;height:100%;object-fit:cover;display:block;" />${statusBarOverlay}`
    : `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:#0F1419;">
         <div style="font-size:80px;opacity:0.3;">📱</div>
         <div style="font-size:28px;font-weight:700;color:rgba(255,255,255,0.15);font-family:'Tajawal',sans-serif;">لقطة الشاشة</div>
       </div>`;

  return `<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    ${fontFaces}

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      width: ${OUTPUT_WIDTH}px;
      height: ${OUTPUT_HEIGHT}px;
      overflow: hidden;
      font-family: 'Tajawal', 'SF Arabic', system-ui, sans-serif;
      ${bgStyle}
      -webkit-font-smoothing: antialiased;
    }

    .text-area {
      width: 100%;
      padding-top: 200px;
      padding-bottom: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      direction: rtl;
    }

    .headline {
      font-size: 76px;
      font-weight: 800;
      color: #ffffff;
      text-align: center;
      line-height: 1.2;
      text-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
      padding: 0 60px;
      direction: rtl;
    }

    .subtitle {
      font-size: 44px;
      font-weight: 700;
      color: ${data.subtitleColor};
      text-align: center;
      line-height: 1.3;
      text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
      padding: 0 80px;
      direction: rtl;
    }

    .phone-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    .phone-frame {
      width: 920px;
      height: 1994px;
      border-radius: 68px;
      background: #1c1c1e;
      position: relative;
      box-shadow:
        0 50px 120px rgba(0, 0, 0, 0.55),
        0 20px 60px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.08),
        inset 0 0 0 2px rgba(255, 255, 255, 0.04);
    }

    /* Subtle outer edge highlight */
    .phone-frame::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 68px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      pointer-events: none;
      z-index: 5;
    }

    .dynamic-island {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: 126px;
      height: 38px;
      border-radius: 19px;
      background: #000000;
      z-index: 10;
    }

    .screen {
      position: absolute;
      top: 12px; left: 12px; right: 12px; bottom: 12px;
      border-radius: 56px;
      overflow: hidden;
      background: #0F1419;
    }

    /* Side buttons */
    .btn { position: absolute; width: 3px; background: #2a2a2e; }
    .btn-r { right: -3px; border-radius: 0 2px 2px 0; }
    .btn-l { left: -3px; border-radius: 2px 0 0 2px; }
  </style>
</head>
<body>

  <div class="text-area">
    <div class="headline">${data.headline}</div>
    <div class="subtitle">${data.subtitle}</div>
  </div>

  <div class="phone-wrapper">
    <div class="phone-frame">
      <div class="dynamic-island"></div>

      <!-- Side buttons -->
      <div class="btn btn-r" style="top:380px;height:100px;"></div>
      <div class="btn btn-l" style="top:280px;height:36px;"></div>
      <div class="btn btn-l" style="top:340px;height:60px;"></div>
      <div class="btn btn-l" style="top:420px;height:60px;"></div>

      <div class="screen">
        ${screenshotImg}
      </div>
    </div>
  </div>

</body>
</html>`;
}

async function generate() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const toGenerate = singleIndex !== null
    ? [screenshots[singleIndex]].filter(Boolean)
    : screenshots;

  if (toGenerate.length === 0) {
    console.error('Invalid index. Use --index=1 through --index=7');
    process.exit(1);
  }

  // Check raw files
  const rawStatus = toGenerate.map(s => ({
    ...s,
    hasRaw: existsSync(join(RAW_DIR, s.rawFile)),
  }));

  const missingCount = rawStatus.filter(s => !s.hasRaw).length;
  if (missingCount > 0) {
    console.log(`⚠  ${missingCount} raw screenshot(s) missing — generating in TEST MODE (placeholder screens)`);
    console.log(`   Drop raw PNGs into: ${RAW_DIR}\n`);
  }

  // Load fonts once (they're embedded in each template)
  console.log('Loading fonts...');
  const boldExists = existsSync(join(ASSETS_DIR, 'Tajawal-Bold.ttf'));
  const extraBoldExists = existsSync(join(ASSETS_DIR, 'Tajawal-ExtraBold.ttf'));
  console.log(`   Tajawal Bold: ${boldExists ? '✓' : '✗'}`);
  console.log(`   Tajawal ExtraBold: ${extraBoldExists ? '✓' : '✗'}`);

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--force-color-profile=srgb',
      '--font-render-hinting=none',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: OUTPUT_WIDTH,
    height: OUTPUT_HEIGHT,
    deviceScaleFactor: 1,
  });

  for (let i = 0; i < rawStatus.length; i++) {
    const screenshot = rawStatus[i];
    console.log(`[${i + 1}/${rawStatus.length}] Generating ${screenshot.id}...`);

    // Prepare image data
    let imgBase64 = null;
    if (screenshot.hasRaw) {
      const rawPath = join(RAW_DIR, screenshot.rawFile);
      const rawBuffer = readFileSync(rawPath);
      imgBase64 = `data:image/png;base64,${rawBuffer.toString('base64')}`;
    }

    // Build and inject the full HTML
    const html = buildTemplate({
      ...screenshot,
      imgBase64,
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    // Wait for fonts to be ready
    await page.evaluate(() => document.fonts.ready);

    // Wait for image to load (if present)
    if (screenshot.hasRaw) {
      await page.waitForFunction(() => {
        const img = document.querySelector('.screen img');
        return img && img.complete && img.naturalWidth > 0;
      }, { timeout: 15000 });
    }

    // Small settle delay
    await new Promise(r => setTimeout(r, 300));

    // Capture
    const outputPath = join(OUTPUT_DIR, screenshot.outputFile);
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT },
    });

    console.log(`   ✓ ${screenshot.outputFile}`);
  }

  await browser.close();

  console.log(`\n✅ Done! ${toGenerate.length} screenshot(s) generated.`);
  console.log(`   Output: ${OUTPUT_DIR}`);
}

generate().catch((err) => {
  console.error('Generation failed:', err);
  process.exit(1);
});
