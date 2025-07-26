import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from '../../../lib/database.js';

// 默认配置（作为后备）
const defaultConfig = {
  discount: {
    'Discount': 45
  },
  productPrices: {
    'Roller Shades': 0,
    'Zebra Shades': 0,
    'Honey Comb Shades': 0
  },
  valancePrices: {
    'V2': 0,
    'S2': 0,
    '25': 0,
    '38': 0,
    '45': 0
  },
  valanceColorPrices: {
    'White': 0,
    'Gray': 0,
    'Black': 0,
    'Beige': 0,
    'Wrapped': 30
  },
  bottomRailPrices: {
    'Type A': 0,
    'Type C': 0,
    'None': 0
  },
  controlPrices: {
    'bead chain': 20,
    'cordless': 0,
    'battery-motorized': 0,
    'wired-motorized': 0
  },
  installationTypes: {
    'Inside': 0,
    'Outside': 0
  },
  rollings: {
    'Standard': 0,
    'Reverse': 0
  }
};

export const dynamic = 'force-dynamic'; // 禁用缓存

export async function GET() {
  try {
    // 从数据库获取配置
    const config = await getConfig();
    
    // 如果数据库中没有配置数据，返回默认配置
    const responseData = config || defaultConfig;
    
    // 创建响应并添加缓存控制头，配置数据应该实时更新
    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    response.headers.set('X-Accel-Expires', '0');
    
    return response;
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const newConfig = await request.json();
    
    // 验证配置格式
    const requiredKeys = ['discount', 'productPrices', 'valancePrices', 'valanceColorPrices', 'bottomRailPrices', 'controlPrices', 'installationTypes', 'rollings'];
    for (const key of requiredKeys) {
      if (!newConfig[key] || typeof newConfig[key] !== 'object') {
        return NextResponse.json(
          { error: `配置格式错误: ${key}` },
          { status: 400 }
        );
      }
    }
    
    // 保存配置到数据库
    const saveSuccess = await saveConfig(newConfig);
    
    if (!saveSuccess) {
      return NextResponse.json(
        { error: '保存配置到数据库失败' },
        { status: 500 }
      );
    }
    
    const response = NextResponse.json({ 
      success: true, 
      message: '配置保存成功' 
    });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store');
    response.headers.set('X-Accel-Expires', '0');
    
    return response;
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}