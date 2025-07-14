import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 配置文件路径
const configPath = path.join(process.cwd(), 'config.json');

// 默认配置
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
  }
};

// 读取配置
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    }
  } catch (error) {
    console.error('读取配置文件失败:', error);
  }
  return defaultConfig;
}

// 保存配置
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('保存配置文件失败:', error);
    return false;
  }
}

export async function GET() {
  try {
    const config = loadConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('获取配置失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const newConfig = await request.json();
    
    // 验证配置格式
    const requiredKeys = ['productPrices', 'valancePrices', 'valanceColorPrices', 'bottomRailPrices', 'controlPrices', 'chainPrices'];
    for (const key of requiredKeys) {
      if (!newConfig[key] || typeof newConfig[key] !== 'object') {
        return NextResponse.json(
          { error: `配置格式错误: ${key}` },
          { status: 400 }
        );
      }
    }
    
    // 保存配置
    if (saveConfig(newConfig)) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: '保存配置失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
} 