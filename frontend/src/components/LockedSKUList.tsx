import React from 'react';
import { SKU } from '../types';

interface LockedSKUListProps {
  lockedSKUs: SKU[];
  onClose: () => void;
  onContact: () => void;
}

const LockedSKUList: React.FC<LockedSKUListProps> = ({ lockedSKUs, onClose, onContact }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-stone-800 rounded-2xl shadow-2xl border border-stone-700/50 overflow-hidden">
        <div className="p-6 border-b border-stone-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-stone-700 rounded-lg">
                <svg className="w-5 h-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">更多煤种待解锁</h3>
                <p className="text-sm text-stone-400">联系客户经理开通更多预测权限</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {lockedSKUs.map((sku) => (
              <div
                key={sku.id}
                className="flex items-center justify-between p-4 bg-stone-900/50 rounded-lg border border-stone-700/30 opacity-60"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-stone-300">{sku.name}</h4>
                    <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{sku.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-stone-400">¥{sku.basePrice.toLocaleString()}</p>
                  <p className="text-xs text-stone-500">基准价</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-stone-700/50 bg-stone-900/30">
          <button
            onClick={onContact}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg shadow-amber-500/25 transition-all"
          >
            联系客户经理开通
          </button>
          <p className="text-xs text-stone-500 text-center mt-3">
            电话：400-888-8888
          </p>
        </div>
      </div>
    </div>
  );
};

export default LockedSKUList;
