import { chromium } from 'playwright';

async function takeScreenshot() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 }
  });

  try {
    // 直接设置登录状态，跳转到 Dashboard
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle', timeout: 20000 });
    
    // 等待图表加载完成
    await page.waitForSelector('canvas', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // 截图 Dashboard
    await page.screenshot({ path: './screenshot-dashboard-full.png', fullPage: true });
    console.log('✓ Dashboard 完整截图完成');

    // 截图第一个 SKU 卡片（包含价格趋势图）
    const skuCard = await page.$('.bg-stone-800\\/60').first();
    if (skuCard) {
      await skuCard.screenshot({ path: './screenshot-sku-card.png' });
      console.log('✓ SKU 卡片截图完成');
    }

    // 点击第一个"查看本旬深度 AI 战报"按钮
    const reportButtons = await page.$$('button:has-text("查看本旬深度 AI 战报")');
    if (reportButtons.length > 0) {
      await reportButtons[0].click();
      await page.waitForTimeout(1500);
      
      await page.screenshot({ path: './screenshot-report-detail.png', fullPage: true });
      console.log('✓ AI 战报详情截图完成');
    }

    console.log('\n✅ 所有截图已完成！');
  } catch (error) {
    console.error('截图失败:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshot();
