const fs = require('fs');
const path = require('path');

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

// 读取当前配置
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

function calculatePrice(quoteData) {
  const config = loadConfig();
  
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
  } = quoteData;

  // 将英寸转换为米 (1 inch = 0.0254 meters)
  const widthMeters = parseFloat(width_inch) * 0.0254;
  const heightMeters = parseFloat(height_inch) * 0.0254;
  
  // 计算面积（平方米）
  const areaSquareMeters = widthMeters * heightMeters;
  
  // 面积小于1平方米按1平方米计算
  const billableArea = Math.max(areaSquareMeters, 1);
  
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
  
  // 新的价格公式：成品价格 = （Fabric price * discount + valance color price）* Area + control price + motor price
  const fabricWithDiscount = fabricPrice * discountMultiplier;
  const pricePerSquareMeter = fabricWithDiscount + valanceColorPrice;
  const areaCost = pricePerSquareMeter * billableArea;
  const additionalCosts = controlPrice + motorPrice;
  const unitPrice = areaCost + additionalCosts;
  
  // 返回单价，让前端自己计算总价
  return Math.round(unitPrice);
}

// 获取所有选项
function getOptions() {
  const config = loadConfig();
  return {
    products: Object.keys(config.productPrices),
    valances: Object.keys(config.valancePrices),
    valanceColors: Object.keys(config.valanceColorPrices),
    bottomRails: Object.keys(config.bottomRailPrices),
    controls: Object.keys(config.controlPrices)
  };
}

module.exports = {
  calculatePrice,
  getOptions,
  loadConfig
}; 