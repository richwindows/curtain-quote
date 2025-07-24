-- 更新尺寸字段命名规范
-- 将旧的字段名改为新的统一命名规范

-- 如果存在旧的字段，先删除它们
ALTER TABLE quotes DROP COLUMN IF EXISTS widthinch;
ALTER TABLE quotes DROP COLUMN IF EXISTS widthm;
ALTER TABLE quotes DROP COLUMN IF EXISTS heightinch;
ALTER TABLE quotes DROP COLUMN IF EXISTS heightm;

-- 添加新的统一命名字段（允许NULL值）
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS width_inch DECIMAL(10,3);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS width_m DECIMAL(10,3);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS height_inch DECIMAL(10,3);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS height_m DECIMAL(10,3);

-- 如果现有字段有NOT NULL约束，移除它们
ALTER TABLE quotes ALTER COLUMN width_inch DROP NOT NULL;
ALTER TABLE quotes ALTER COLUMN height_inch DROP NOT NULL;

COMMIT;