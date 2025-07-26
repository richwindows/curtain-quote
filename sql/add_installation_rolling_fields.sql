-- 添加installation_type和rolling字段到quotes表
-- 这个脚本用于迁移现有数据库，添加新的installation_type和rolling字段

-- 添加installation_type字段
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS installation_type TEXT;

-- 添加rolling字段
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS rolling TEXT;

-- 提交更改
COMMIT;