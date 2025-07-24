-- 添加新的尺寸字段到现有的quotes表
-- 这个脚本用于迁移现有数据库，添加新的四个尺寸字段

-- 添加新的尺寸字段
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS width_inch DECIMAL(10,3);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS width_m DECIMAL(10,3);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS height_inch DECIMAL(10,3);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS height_m DECIMAL(10,3);

-- 注意：如果数据库中已经存在旧的width_inch和height_inch字段，
-- 可以选择保留它们或者删除它们，这里我们保留以确保数据完整性

COMMIT;