import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  
  await page.addInitScript(() => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify({ id: 'user_001', name: '张三', unlockedSKUs: ['SKU_01', 'SKU_02'] }));
  });
  
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(8000);
  
  const html = await page.content();
  console.log('Page HTML length:', html.length);
  console.log('Has 煤探长:', html.includes('煤探长'));
  console.log('Has SKU:', html.includes('安泽') || html.includes('柳林'));
  
  await page.screenshot({ path: './coal-dashboard.png', fullPage: false });
  console.log('✅ Screenshot saved');
  
  await browser.close();
}

main().catch(console.error);
