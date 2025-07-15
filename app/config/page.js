'use client';

import { useState, useEffect } from 'react';

export default function ConfigPage() {
  const [config, setConfig] = useState({
    discount: {},
    productPrices: {},
    valancePrices: {},
    valanceColorPrices: {},
    bottomRailPrices: {},
    controlPrices: {}
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [newItems, setNewItems] = useState({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      setMessage({ type: 'error', text: '加载配置失败' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '配置保存成功' });
        setNewItems({});
      } else {
        setMessage({ type: 'error', text: '保存失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误' });
    } finally {
      setSaving(false);
    }
  };

  const updatePrice = (category, key, value) => {
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: parseFloat(value) || 0
      }
    }));
  };

  const addNewItem = (category) => {
    const newItemName = newItems[category];
    if (newItemName && newItemName.trim()) {
      setConfig(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [newItemName.trim()]: 0
        }
      }));
      setNewItems(prev => ({
        ...prev,
        [category]: ''
      }));
    }
  };

  const removeItem = (category, key) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      delete newConfig[category][key];
      return newConfig;
    });
  };

  const handleNewItemChange = (category, value) => {
    setNewItems(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const renderConfigSection = (title, category, unit = '$', step = '1') => {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          {/* 现有项目 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(config[category] || {}).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="form-label">{key}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => updatePrice(category, key, e.target.value)}
                    className="form-input"
                    min="0"
                    step={step}
                    placeholder={unit}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(category, key)}
                  className="mt-6 bg-red-500 hover:bg-red-600 text-white p-2 rounded-md text-sm"
                  title="删除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          {/* 添加新项目 */}
          <div className="border-t pt-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label className="form-label">添加新项目</label>
                <input
                  type="text"
                  value={newItems[category] || ''}
                  onChange={(e) => handleNewItemChange(category, e.target.value)}
                  className="form-input"
                  placeholder="输入新项目名称"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addNewItem(category);
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => addNewItem(category)}
                className="btn-primary"
                disabled={!newItems[category]?.trim()}
              >
                添加
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">系统配置</h2>
        <p className="mt-1 text-gray-600">管理折扣设置、产品类型、配件、面料的价格设置。可以添加新选项或删除现有选项。</p>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Discount 配置 */}
      {renderConfigSection('Discount Settings (%)', 'discount', '%', '1')}

      {/* 产品基础价格 */}
      {renderConfigSection('Product Types', 'productPrices', '', '1')}

      {/* Valance */}
      {renderConfigSection('Valance Types', 'valancePrices', '', '1')}

      {/* Valance颜色价格 */}
      {renderConfigSection('Valance Color Prices ($)', 'valanceColorPrices', '$', '1')}

      {/* Bottom Rail */}
      {renderConfigSection('Bottom Rail Types', 'bottomRailPrices', '', '1')}

      {/* Control价格 */}
      {renderConfigSection('Control Types ($)', 'controlPrices', '$', '1')}

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '保存中...' : '保存配置'}
        </button>
      </div>


    </div>
  );
} 