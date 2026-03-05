import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  
  // 设置登录状态
  await page.addInitScript(() => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify({ id: 'user_001', name: '张三', unlockedSKUs: ['SKU_01', 'SKU_02'] }));
  });
  
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: './coal-dashboard.png', fullPage: false });
  console.log('✅ Screenshot saved to coal-dashboard.png');
  
  await browser.close();
}

main().catch(console.error);
