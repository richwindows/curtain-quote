'use client';

import { useState, useEffect } from 'react';

export default function CreateQuotePage() {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    product: '',
    valance: '',
    valance_color: '',
    bottom_rail: '',
    control: '',
    fabric: '',
    fabric_price: '',
    motor_price: '',
    width_inch: '',
    height_inch: '',
    quantity: '1'
  });

  const [options, setOptions] = useState({
    products: [],
    valances: [],
    valanceColors: [],
    bottomRails: [],
    controls: []
  });
  
  const [discountConfig, setDiscountConfig] = useState({});

  const [items, setItems] = useState([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      setOptions({
        products: Object.keys(config.productPrices || {}),
        valances: Object.keys(config.valancePrices || {}),
        valanceColors: Object.keys(config.valanceColorPrices || {}),
        bottomRails: Object.keys(config.bottomRailPrices || {}),
        controls: Object.keys(config.controlPrices || {})
      });
      setDiscountConfig(config.discount || {});
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };

  const calculateItemPrice = async (itemData) => {
    try {
      const response = await fetch('/api/quotes/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      const data = await response.json();
      return data.price || 0;
    } catch (error) {
      console.error('Price calculation failed:', error);
      return 0;
    }
  };

  // 客户端价格计算函数 - 在浏览器console显示详细过程
  const calculatePriceWithDetails = async (itemData) => {
    try {
      // 获取配置数据
      const configResponse = await fetch('/api/config');
      const config = await configResponse.json();
      
      const {
        width_inch,
        height_inch,
        product,
        valance,
        valance_color,
        bottom_rail,
        control,
        fabric,
        fabric_price,
        motor_price,
        quantity
      } = itemData;

      console.log('========== 浏览器端价格计算开始 ==========');
      console.log('原始数据:', itemData);
      
      // 将英寸转换为米 (1 inch = 0.0254 meters)
      const widthMeters = parseFloat(width_inch) * 0.0254;
      const heightMeters = parseFloat(height_inch) * 0.0254;
      
      // 计算面积（平方米）
      const areaSquareMeters = widthMeters * heightMeters;
      
      // 面积小于1平方米按1平方米计算
      const billableArea = Math.max(areaSquareMeters, 1);
      
      console.log('尺寸转换:');
      console.log(`  宽度: ${parseFloat(width_inch).toFixed(3)}" = ${widthMeters.toFixed(4)}m`);
      console.log(`  高度: ${parseFloat(height_inch).toFixed(3)}" = ${heightMeters.toFixed(4)}m`);
      console.log(`  实际面积: ${areaSquareMeters.toFixed(4)} 平方米`);
      console.log(`  计费面积: ${billableArea.toFixed(4)} 平方米 ${billableArea > areaSquareMeters ? '(最小1平方米)' : ''}`);
      
      // 获取各种价格配置
      const valanceColorPrice = config.valanceColorPrices[valance_color] || 0;
      const controlPrice = config.controlPrices[control] || 0;
      
      // 获取discount配置
      const discountConfig = config.discount || {};
      const discountPercentage = Object.values(discountConfig)[0] || 0;
      const discountMultiplier = discountPercentage / 100;
      
      // 面料价格和电机价格（如果提供，否则默认为0）
      const fabricPrice = fabric_price ? parseFloat(fabric_price) : 0;
      const motorPrice = motor_price ? parseFloat(motor_price) : 0;
      
      console.log('价格配置:');
      console.log(`  Fabric Price: $${parseFloat(fabricPrice).toFixed(2)}`);
      console.log(`  Motor Price: $${parseFloat(motorPrice).toFixed(2)}`);
      console.log(`  Discount: ${discountPercentage}% (multiplier: ${discountMultiplier})`);
      console.log(`  Valance Color Price: $${parseFloat(valanceColorPrice).toFixed(2)}`);
      console.log(`  Control Price: $${parseFloat(controlPrice).toFixed(2)}`);
      
      // 新的价格公式：成品价格 = （Fabric price * discount + valance color price）* Area + control price + motor price
      const fabricWithDiscount = fabricPrice * discountMultiplier;
      const pricePerSquareMeter = fabricWithDiscount + valanceColorPrice;
      const areaCost = pricePerSquareMeter * billableArea;
      const additionalCosts = controlPrice + motorPrice;
      const unitPrice = areaCost + additionalCosts;
      
      console.log('价格计算过程:');
      console.log(`  Fabric price * discount = $${parseFloat(fabricPrice).toFixed(2)} * ${discountMultiplier} = $${fabricWithDiscount.toFixed(2)}`);
      console.log(`  (Fabric with discount + valance color) = ($${fabricWithDiscount.toFixed(2)} + $${parseFloat(valanceColorPrice).toFixed(2)}) = $${pricePerSquareMeter.toFixed(2)} 每平方米`);
      console.log(`  面积成本 = $${pricePerSquareMeter.toFixed(2)} * ${billableArea.toFixed(4)}㎡ = $${areaCost.toFixed(2)}`);
      console.log(`  附加成本 = Control($${parseFloat(controlPrice).toFixed(2)}) + Motor($${parseFloat(motorPrice).toFixed(2)}) = $${additionalCosts.toFixed(2)}`);
      console.log(`  单价 = $${areaCost.toFixed(2)} + $${additionalCosts.toFixed(2)} = $${unitPrice.toFixed(2)}`);
      
      // 总价 = 单价 × 数量
      const totalPrice = unitPrice * parseInt(quantity);
      
      console.log(`  总价 = $${unitPrice.toFixed(2)} * ${quantity} = $${totalPrice.toFixed(2)}`);
      console.log('========== 浏览器端价格计算结束 ==========');
      
      // 仍然调用服务器端API获取最终价格（保持一致性）
      const serverPrice = await calculateItemPrice(itemData);
      
      console.log(`服务器端计算结果: $${parseFloat(serverPrice).toFixed(2)}`);
      console.log(`客户端计算结果: $${Math.round(totalPrice)}`);
      console.log('计算结果是否一致:', Math.round(totalPrice) === serverPrice);
      
      return serverPrice;
    } catch (error) {
      console.error('客户端价格计算失败:', error);
      return await calculateItemPrice(itemData);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setIsAddingItem(true);
    
    try {
      // 验证必填字段
      const requiredFields = ['product', 'valance', 'valance_color', 'bottom_rail', 'control', 'fabric', 'width_inch', 'height_inch', 'quantity'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          setResult({
            success: false,
            error: `请填写 ${field.replace('_', ' ')}`
          });
          setIsAddingItem(false);
          return;
        }
      }

      // 计算价格 - 在浏览器console显示详细过程
      const itemPrice = await calculatePriceWithDetails(formData);
      
      // 创建item对象
      const newItem = {
        id: Date.now(), // 临时ID
        ...formData,
        unitPrice: itemPrice,
        totalPrice: itemPrice * parseInt(formData.quantity)
      };

      // 添加到items列表
      setItems(prev => [...prev, newItem]);

      // 不清空表单，保留所有内容供下次使用
      setResult({
        success: true,
        message: 'Item added successfully!'
      });
    } catch (error) {
      setResult({
        success: false,
        error: '添加失败，请稍后重试'
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleSaveQuote = async () => {
    if (items.length === 0) {
      setResult({
        success: false,
        error: '请至少添加一个item'
      });
      return;
    }

    setIsSavingQuote(true);
    try {
      const quoteData = {
        customer_name: formData.customer_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        items: items
      };

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      const data = await response.json();
      
      if (data.success) {
        const originalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
        setResult({
          success: true,
          quoteNumber: data.quoteNumber,
          totalPrice: parseFloat(originalAmount).toFixed(2),
          message: 'Quote saved successfully!'
        });
        // 清空所有数据
        setItems([]);
        setFormData({
          customer_name: '',
          phone: '',
          email: '',
          address: '',
          product: '',
          valance: '',
          valance_color: '',
          bottom_rail: '',
          control: '',
          fabric: '',
          fabric_price: '',
          motor_price: '',
          width_inch: '',
          height_inch: '',
          quantity: '1'
        });
      } else {
        setResult({
          success: false,
          error: data.error
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: '保存失败，请稍后重试'
      });
    } finally {
      setIsSavingQuote(false);
    }
  };

  const removeItem = (itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      phone: '',
      email: '',
      address: '',
      product: '',
      valance: '',
      valance_color: '',
      bottom_rail: '',
      control: '',
      fabric: '',
      fabric_price: '',
      motor_price: '',
      width_inch: '',
      height_inch: '',
      quantity: '1'
    });
    setItems([]);
    setResult(null);
  };

  const getTotalQuoteAmount = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">创建新报价</h2>
        <p className="mt-1 text-gray-600">填写客户信息和窗帘需求，可添加多个item后统一保存报价单。</p>
      </div>

      {/* 消息提示 */}
      {result && (
        <div className={`rounded-lg p-4 ${
          result.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <span className={result.success ? 'text-green-400 mr-2' : 'text-red-400 mr-2'}>
              {result.success ? '✅' : '❌'}
            </span>
            <div>
              <p className="font-medium">{result.message || result.error}</p>
              {result.quoteNumber && (
                <p className="text-sm mt-1">
                  报价单号：#{result.quoteNumber} | 总金额：${result.totalPrice}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 表单 */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleAddItem} className="space-y-6">
          {/* 客户信息 - 可选 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* 窗帘需求 */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Product *</label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Product</option>
                  {options.products.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Valance *</label>
                <select
                  name="valance"
                  value={formData.valance}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Valance</option>
                  {options.valances.map(valance => (
                    <option key={valance} value={valance}>{valance}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Valance Color *</label>
                <select
                  name="valance_color"
                  value={formData.valance_color}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Color</option>
                  {options.valanceColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Bottom Rail *</label>
                <select
                  name="bottom_rail"
                  value={formData.bottom_rail}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Bottom Rail</option>
                  {options.bottomRails.map(rail => (
                    <option key={rail} value={rail}>{rail}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Control *</label>
                <select
                  name="control"
                  value={formData.control}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select Control</option>
                  {options.controls.map(control => (
                    <option key={control} value={control}>{control}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Fabric *</label>
                <input
                  type="text"
                  name="fabric"
                  value={formData.fabric}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter fabric type or code"
                />
              </div>

              <div>
                <label className="form-label">Fabric Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="fabric_price"
                  value={formData.fabric_price}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  placeholder="Optional custom price"
                />
              </div>

              <div>
                <label className="form-label">Width (inch) *</label>
                <input
                  type="number"
                  step="0.001"
                  name="width_inch"
                  value={formData.width_inch}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="0.001"
                />
              </div>

              <div>
                <label className="form-label">Height (inch) *</label>
                <input
                  type="number"
                  step="0.001"
                  name="height_inch"
                  value={formData.height_inch}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="0.001"
                />
              </div>

              <div>
                <label className="form-label">Motor Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="motor_price"
                  value={formData.motor_price}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                  placeholder="Optional motor price"
                />
              </div>

              <div>
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="form-input"
                  required
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* 添加按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary"
            >
              Reset All
            </button>
            <button
              type="submit"
              disabled={isAddingItem}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingItem ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

      {/* Items 表格 */}
      {items.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Quote Items ({items.length})</h3>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">
                Total: ${parseFloat(getTotalQuoteAmount()).toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specs</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dimensions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{item.product}</div>
                        <div className="text-gray-500">{item.fabric}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>Valance: {item.valance}</div>
                        <div>Color: {item.valance_color}</div>
                        <div>Rail: {item.bottom_rail}</div>
                        <div>Control: {item.control}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(item.width_inch).toFixed(3)}" × {parseFloat(item.height_inch).toFixed(3)}"
                      <div className="text-gray-500">
                        {((parseFloat(item.width_inch) * parseFloat(item.height_inch)) / 144).toFixed(2)} sq ft
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${parseFloat(item.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 保存报价单按钮 */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveQuote}
              disabled={isSavingQuote}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-8 py-2"
            >
              {isSavingQuote ? 'Saving Quote...' : 'Save Complete Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 