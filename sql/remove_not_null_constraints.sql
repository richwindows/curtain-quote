-- 移除尺寸字段的NOT NULL约束
-- 允许width_inch和height_inch字段为null

-- 移除width_inch的NOT NULL约束
ALTER TABLE quotes ALTER COLUMN width_inch DROP NOT NULL;

-- 移除height_inch的NOT NULL约束
ALTER TABLE quotes ALTER COLUMN height_inch DROP NOT NULL;

-- 确保其他尺寸字段也可以为null（如果有约束的话）
ALTER TABLE quotes ALTER COLUMN width_m DROP NOT NULL;
ALTER TABLE quotes ALTER COLUMN height_m DROP NOT NULL;

COMMIT;