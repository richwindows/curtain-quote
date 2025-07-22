import { getSupabaseClient } from './supabase.js';

async function saveQuote(quoteData) {
  const supabase = getSupabaseClient();
  
  // 修复单价和总价计算逻辑
  // 前端传递的是 unitPrice 和 totalPrice 字段
  let unitPrice, totalPrice;
  
  if (quoteData.unitPrice && quoteData.totalPrice) {
    // 新的多item模式：前端已经计算好了单价和总价
    unitPrice = parseFloat(quoteData.unitPrice);
    totalPrice = parseFloat(quoteData.totalPrice);
  } else if (quoteData.total_price) {
    // 向后兼容：老的单item模式
    totalPrice = parseFloat(quoteData.total_price);
    unitPrice = totalPrice / parseInt(quoteData.quantity);
  } else {
    // 兜底逻辑
    unitPrice = 0;
    totalPrice = 0;
  }
  
  // 为报价单生成quote_number（如果是多item报价的一部分，使用相同的quote_number）
  let quoteNumber = quoteData.quote_number;
  if (!quoteNumber) {
    // 生成新的报价单号码，从10001开始
    const { data: maxData, error: maxError } = await supabase
      .from('quotes')
      .select('quote_number')
      .order('quote_number', { ascending: false })
      .limit(1);
    
    if (maxError) {
      console.error('获取最大quote_number失败:', maxError);
      quoteNumber = 10001;
    } else {
      const maxNumber = maxData && maxData.length > 0 ? maxData[0].quote_number : 0;
      quoteNumber = Math.max(maxNumber + 1, 10001);
    }
  }
  
  // 插入新记录
  const { data, error } = await supabase
    .from('quotes')
    .insert([
      {
        quote_number: quoteNumber,
        customer_name: quoteData.customer_name || null,
        phone: quoteData.phone || null,
        email: quoteData.email || null,
        address: quoteData.address || null,
        location: quoteData.location || null,
        product: quoteData.product,
        valance: quoteData.valance,
        valance_color: quoteData.valance_color,
        bottom_rail: quoteData.bottom_rail,
        control: quoteData.control,
        fabric: quoteData.fabric,
        fabric_price: quoteData.fabric_price || null,
        motor_price: quoteData.motor_price || null,
        width_inch: parseFloat(quoteData.width_inch),
        height_inch: parseFloat(quoteData.height_inch),
        quantity: parseInt(quoteData.quantity),
        unit_price: parseFloat(unitPrice),
        total_price: parseFloat(totalPrice)
      }
    ])
    .select();
  
  if (error) {
    console.error('保存报价失败:', error);
    throw new Error('保存报价失败');
  }
  
  return { id: data[0].id, quoteNumber: quoteNumber };
}

// 保留向后兼容性
async function createQuote(quoteData) {
  return await saveQuote(quoteData);
}

async function getAllQuotes() {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('获取所有报价失败:', error);
    throw new Error('获取报价失败');
  }
  
  return data || [];
}

async function getQuoteById(id) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('获取报价详情失败:', error);
    return null;
  }
  
  return data;
}

async function getQuotesByPage(page = 1, limit = 10) {
  const supabase = getSupabaseClient();
  const offset = (page - 1) * limit;
  
  // 获取所有报价数据
  const { data: allQuotes, error: quotesError } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (quotesError) {
    console.error('获取报价数据失败:', quotesError);
    return { quotes: [], currentPage: page, totalPages: 0, hasMore: false };
  }
  
  // 按quote_number分组处理
  const groupedQuotes = {};
  
  allQuotes.forEach(quote => {
    const quoteNumber = quote.quote_number;
    if (!groupedQuotes[quoteNumber]) {
      groupedQuotes[quoteNumber] = {
        quote_number: quoteNumber,
        customer_name: quote.customer_name,
        phone: quote.phone,
        email: quote.email,
        address: quote.address,
        created_at: quote.created_at,
        items: [],
        total_amount: 0
      };
    }
    
    groupedQuotes[quoteNumber].items.push(quote);
    groupedQuotes[quoteNumber].total_amount += parseFloat(quote.total_price || 0);
  });
  
  // 转换为数组并排序
  const quotesArray = Object.values(groupedQuotes)
    .sort((a, b) => b.quote_number - a.quote_number)
    .map(group => ({
      quote_number: group.quote_number,
      customer_name: group.customer_name,
      phone: group.phone,
      email: group.email,
      address: group.address,
      created_at: group.created_at,
      item_count: group.items.length,
      total_amount: group.total_amount,
      products_summary: group.items.map(item => `${item.product} (${item.quantity})`).join(', ')
    }));
  
  // 分页处理
  const paginatedQuotes = quotesArray.slice(offset, offset + limit);
  const totalPages = Math.ceil(quotesArray.length / limit);
  
  return {
    quotes: paginatedQuotes,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages
  };
}

async function getQuoteDetails(quoteNumber) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('quote_number', quoteNumber)
    .order('id', { ascending: true });
  
  if (error) {
    console.error('获取报价详情失败:', error);
    throw new Error('获取报价详情失败');
  }
  
  return data || [];
}

async function deleteQuote(quoteNumber) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('quote_number', quoteNumber);
  
  if (error) {
    console.error('删除报价失败:', error);
    return false;
  }
  
  return true;
}

// 配置相关的数据库操作函数

// 获取所有配置数据，按原格式返回
async function getConfig() {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('config_settings')
    .select('category, key, value');
  
  if (error) {
    console.error('获取配置失败:', error);
    return null;
  }
  
  // 将数据库格式转换为原来的JSON格式
  const config = {};
  data.forEach(item => {
    if (!config[item.category]) {
      config[item.category] = {};
    }
    config[item.category][item.key] = item.value;
  });
  
  return config;
}

// 保存配置数据
async function saveConfig(configData) {
  const supabase = getSupabaseClient();
  
  try {
    // 首先删除所有现有配置
    const { error: deleteError } = await supabase
      .from('config_settings')
      .delete()
      .neq('id', 0); // 删除所有记录
    
    if (deleteError) {
      console.error('删除旧配置失败:', deleteError);
      return false;
    }
    
    // 准备插入数据
    const insertData = [];
    Object.keys(configData).forEach(category => {
      Object.keys(configData[category]).forEach(key => {
        insertData.push({
          category: category,
          key: key,
          value: parseFloat(configData[category][key]) || 0
        });
      });
    });
    
    // 批量插入新配置
    const { error: insertError } = await supabase
      .from('config_settings')
      .insert(insertData);
    
    if (insertError) {
      console.error('插入新配置失败:', insertError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('保存配置时发生错误:', error);
    return false;
  }
}

// 更新单个配置项
async function updateConfigItem(category, key, value) {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('config_settings')
    .upsert({
      category: category,
      key: key,
      value: parseFloat(value) || 0
    });
  
  if (error) {
    console.error('更新配置项失败:', error);
    return false;
  }
  
  return true;
}

export {
  saveQuote,
  createQuote, // 向后兼容
  getAllQuotes,
  getQuoteById,
  getQuotesByPage,
  getQuoteDetails,
  deleteQuote,
  getConfig,
  saveConfig,
  updateConfigItem
};