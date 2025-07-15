-- 创建配置设置表
DROP TABLE IF EXISTS config_settings;

CREATE TABLE config_settings (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL,           -- 配置类别 (discount, productPrices, valancePrices等)
    key TEXT NOT NULL,                -- 配置项键名
    value DECIMAL(10,2) NOT NULL,     -- 配置项数值
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建复合唯一索引，确保category+key的组合唯一
CREATE UNIQUE INDEX idx_config_category_key ON config_settings(category, key);

-- 创建索引以提高查询性能
CREATE INDEX idx_config_category ON config_settings(category);
CREATE INDEX idx_config_updated_at ON config_settings(updated_at);

-- 插入默认配置数据
INSERT INTO config_settings (category, key, value) VALUES
-- 折扣配置
('discount', 'Discount', 45),

-- 产品基础价格
('productPrices', 'Roller Shades', 0),
('productPrices', 'Zebra Shades', 0),
('productPrices', 'Honey Comb Shades', 0),

-- Valance类型价格
('valancePrices', '25', 0),
('valancePrices', '38', 0),
('valancePrices', '45', 0),
('valancePrices', 'V2', 0),
('valancePrices', 'S2', 0),

-- Valance颜色价格
('valanceColorPrices', 'White', 0),
('valanceColorPrices', 'Gray', 0),
('valanceColorPrices', 'Black', 0),
('valanceColorPrices', 'Beige', 0),
('valanceColorPrices', 'Wrapped', 30),

-- Bottom Rail价格
('bottomRailPrices', 'Type A', 0),
('bottomRailPrices', 'Type C', 0),
('bottomRailPrices', 'None', 0),

-- Control类型价格
('controlPrices', 'bead chain', 20),
('controlPrices', 'cordless', 0),
('controlPrices', 'battery-motorized', 0),
('controlPrices', 'wired-motorized', 0);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_config_settings_updated_at 
    BEFORE UPDATE ON config_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 