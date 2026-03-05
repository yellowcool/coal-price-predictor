import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SKUCard from '../components/SKUCard';
import LockedSKUList from '../components/LockedSKUList';
import AIReportDrawer from '../components/AIReportDrawer';
import { getUnlockedSKUs, getLockedSKUs, mockUser } from '../data/mockData';
import { SKU, AIReport } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [reportData, setReportData] = useState<AIReport | null>(null);

  const unlockedSKUs = getUnlockedSKUs(mockUser);
  const lockedSKUs = getLockedSKUs(mockUser);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleViewReport = (sku: SKU) => {
    import('../data/mockData').then(({ mockReports }) => {
      const report = mockReports[sku.id];
      if (report) {
        setReportData(report);
        setSelectedSKU(sku);
      }
    });
  };

  const handleContactManager = () => {
    alert('请联系您的专属客户经理：\n电话：400-888-8888\n邮箱：sales@meitanzhang.com');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      <header className="bg-stone-800/80 backdrop-blur-xl border-b border-stone-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-red-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">煤探长 AI</h1>
                <p className="text-xs text-stone-400">煤价智能预测系统</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLockedModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-stone-700/50 hover:bg-stone-700 border border-stone-600 rounded-lg text-stone-300 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-medium">增加更多关注 SKU</span>
              </button>

              <div className="flex items-center space-x-3 pl-4 border-l border-stone-600">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{mockUser.name}</p>
                  <p className="text-xs text-stone-400">已解锁 {unlockedSKUs.length} 个煤种</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-lg transition-all"
                  title="退出登录"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">行情预警雷达看板</h2>
          <p className="text-stone-400">基于 AI 大模型 + 量化模型融合分析，预测未来一旬（10天）价格走势</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unlockedSKUs.map((sku) => (
            <SKUCard
              key={sku.id}
              sku={sku}
              onViewReport={() => handleViewReport(sku)}
            />
          ))}
        </div>

        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-amber-500">数据说明</h4>
              <p className="text-xs text-stone-400 mt-1">
                基准价格（P0）为过去10天现货均价。预测涨跌幅为未来10天的价格变化区间。红色↑代表上涨/利多，绿色↓代表下跌/利空。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-700/50">
          <p className="text-center text-xs text-stone-500">
            本报告基于 AI 生成，不构成配煤技术指导，请结合实际炉况谨慎决策。不对交易盈亏负责。
          </p>
        </div>
      </main>

      {showLockedModal && (
        <LockedSKUList
          lockedSKUs={lockedSKUs}
          onClose={() => setShowLockedModal(false)}
          onContact={handleContactManager}
        />
      )}

      {selectedSKU && reportData && (
        <AIReportDrawer
          sku={selectedSKU}
          report={reportData}
          onClose={() => {
            setSelectedSKU(null);
            setReportData(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
