const { chromium } = require('playwright');
const path = require('path');

const ASSETS_DIR = '/Users/hasansali/Career/Projects/sred-final-v2/docs/presentation/slides/assets';

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Navigate and log in
  await page.goto('http://localhost:4200/login', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);

  // Fill login form
  await page.fill('input[name="username"], input[placeholder*="sername"], input[type="text"]', 'afiniti');
  await page.fill('input[name="password"], input[type="password"]', 'sred2025');
  await page.click('button[type="submit"], button:has-text("Sign in")');
  await page.waitForURL('**/analytics', { timeout: 15000 });
  // Extra wait for charts to render
  await page.waitForTimeout(3000);

  // ------------------------------------------------------------------
  // SCREENSHOT 1: Sticky Client Header (req1-client-header.png)
  // ------------------------------------------------------------------
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // Use app-client-header element directly
  const headerBox = await page.evaluate(() => {
    const el = document.querySelector('app-client-header');
    if (el) {
      const r = el.getBoundingClientRect();
      // Include some padding for context - grab the whole sticky bar including the row above
      const stickyBar = el.closest('[class*="sticky"]') || el.parentElement?.parentElement;
      if (stickyBar) {
        const sr = stickyBar.getBoundingClientRect();
        // Return just the app-client-header region with a bit of padding
        return { x: sr.x, y: sr.y, width: sr.width, height: Math.round(r.height) + 20 };
      }
      return { x: r.x, y: r.y, width: r.width, height: r.height + 20 };
    }
    return null;
  });

  if (headerBox) {
    await page.screenshot({
      path: path.join(ASSETS_DIR, 'req1-client-header.png'),
      clip: { x: headerBox.x, y: headerBox.y, width: headerBox.width, height: Math.min(headerBox.height, 130) }
    });
    console.log('req1-client-header.png saved, box:', JSON.stringify(headerBox));
  } else {
    console.error('Header element not found');
  }

  // ------------------------------------------------------------------
  // SCREENSHOT 2: Sidebar fully open (req2-sidebar.png)
  // ------------------------------------------------------------------
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  // Make sure sidebar is pinned/expanded and labels are visible
  await page.evaluate(() => {
    const aside = document.querySelector('aside');
    if (aside) {
      aside.classList.add('is-pinned', 'w-56');
      // Force all opacity-0 spans inside sidebar to be visible
      aside.querySelectorAll('span').forEach(span => {
        if (span.style.opacity !== undefined) span.style.opacity = '1';
        // Remove opacity-0 class if present
        span.classList.remove('opacity-0');
        span.classList.add('opacity-100');
      });
    }
  });
  await page.waitForTimeout(300);

  const asideEl = await page.$('aside');
  if (asideEl) {
    const box = await asideEl.boundingBox();
    if (box) {
      await page.screenshot({
        path: path.join(ASSETS_DIR, 'req2-sidebar.png'),
        clip: { x: box.x, y: box.y, width: box.width, height: box.height }
      });
      console.log('req2-sidebar.png saved, box:', JSON.stringify(box));
    }
  }

  // ------------------------------------------------------------------
  // SCREENSHOT 3: Employee Salary Grid on Analytics page (01-employee-grid.png)
  // ------------------------------------------------------------------
  // The table is at y≈2988, scroll to it
  const tableEl = await page.$('table');
  if (tableEl) {
    await tableEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await tableEl.boundingBox();
    if (box) {
      // Capture the table with some padding above for the section heading
      const paddingTop = 60;
      const clipY = Math.max(0, box.y - paddingTop);
      const clipH = Math.min(box.height + paddingTop + 20, 700);
      await page.screenshot({
        path: path.join(ASSETS_DIR, '01-employee-grid.png'),
        clip: { x: Math.max(0, box.x - 10), y: clipY, width: Math.min(box.width + 20, 1440), height: clipH }
      });
      console.log('01-employee-grid.png saved, box:', JSON.stringify(box));
    }
  } else {
    console.error('Employee table not found');
  }

  // ------------------------------------------------------------------
  // SCREENSHOT 4: Project Cost-Share Donut Chart (03-projects-summary.png)
  // ------------------------------------------------------------------
  // Find the H2 "Hours share by project" and scroll it into view
  const donutHeadingInfo = await page.evaluate(() => {
    let found = null;
    document.querySelectorAll('h2').forEach(el => {
      const txt = (el.textContent || '').trim();
      if (txt.includes('Hours share by project') && !found) {
        const r = el.getBoundingClientRect();
        found = { absY: r.y + window.scrollY, viewY: Math.round(r.y), x: Math.round(r.x) };
      }
    });
    return found;
  });

  if (donutHeadingInfo) {
    // Scroll so the heading has 50px of space above it
    await page.evaluate((info) => window.scrollTo(0, Math.max(0, info.absY - 50)), donutHeadingInfo);
    await page.waitForTimeout(800);

    // Now get the bounding box of the heading's parent section
    const donutSectionBox = await page.evaluate(() => {
      let found = null;
      document.querySelectorAll('h2').forEach(el => {
        const txt = (el.textContent || '').trim();
        if (txt.includes('Hours share by project') && !found) {
          // Walk up to find a section/div that contains both the heading and the SVG
          let container = el.parentElement;
          for (let i = 0; i < 8; i++) {
            if (!container) break;
            const hasSvg = container.querySelector('svg');
            const r = container.getBoundingClientRect();
            if (hasSvg && r.width > 300 && r.height > 200 && r.height < 900) {
              found = { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
              break;
            }
            container = container.parentElement;
          }
        }
      });
      return found;
    });

    if (donutSectionBox) {
      const clipY = Math.max(0, donutSectionBox.y - 10);
      const clipX = Math.max(0, donutSectionBox.x - 10);
      const clipH = Math.min(donutSectionBox.height + 20 + (donutSectionBox.y < 0 ? Math.abs(donutSectionBox.y) : 0), 700);
      await page.screenshot({
        path: path.join(ASSETS_DIR, '03-projects-summary.png'),
        clip: {
          x: clipX,
          y: clipY,
          width: Math.min(donutSectionBox.width + 20, 1380),
          height: clipH
        }
      });
      console.log('03-projects-summary.png saved, box:', JSON.stringify(donutSectionBox), 'clip:', {x:clipX, y:clipY, h:clipH});
    } else {
      console.error('Donut section container not found after scroll');
    }
  } else {
    console.error('Donut chart heading not found');
  }

  await browser.close();
  console.log('All screenshots done.');
}

takeScreenshots().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
