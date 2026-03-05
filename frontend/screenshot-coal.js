import { chromium } from 'playwright';

async function takeScreenshot() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 }
  });

  // 捕获控制台日志
  page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('Page Error:', err.message));

  try {
    // 设置登录状态
    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({ id: 'user_001', name: '张三', unlockedSKUs: ['SKU_01', 'SKU_02'] }));
    });
    
    // 跳转到 Dashboard
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    await page.waitForTimeout(8000);
    
    // 截图
    await page.screenshot({ path: './screenshot-coal-dashboard.png', fullPage: true });
    console.log('✅ 煤探长 AI Dashboard 截图完成');
    
  } catch (error) {
    console.error('截图失败:', error);
    await page.screenshot({ path: './screenshot-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

takeScreenshot();
