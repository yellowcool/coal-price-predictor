import { chromium } from 'playwright';

async function takeScreenshot() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  try {
    // 访问登录页面
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: './screenshot-login.png', fullPage: false });
    console.log('✓ 登录页面截图完成');

    // 直接设置登录状态，跳转到 Dashboard
    await page.evaluate(() => {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({ id: 'user_001', name: '张三' }));
    });
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: './screenshot-dashboard.png', fullPage: false });
    console.log('✓ Dashboard 页面截图完成');

    // 点击第一个 SKU 卡片的"查看本旬深度 AI 战报"按钮
    const reportButtons = await page.$$('button:has-text("查看本旬深度 AI 战报")');
    if (reportButtons.length > 0) {
      await reportButtons[0].click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ path: './screenshot-report.png', fullPage: false });
      console.log('✓ AI 战报页面截图完成');
    }

    console.log('\n✅ 所有截图已完成！');
  } catch (error) {
    console.error('截图失败:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshot();
