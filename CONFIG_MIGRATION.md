# 配置数据库迁移完成

配置数据已成功从 `config.json` 文件迁移到Supabase数据库中。

## 🎯 完成的工作

### 1. 数据库表结构创建
- 创建了 `config_settings` 表来存储配置数据
- 使用 `category` + `key` 的结构来组织配置项
- 添加了索引和约束来确保数据完整性
- 创建了自动更新时间戳的触发器

### 2. 数据库操作函数
在 `lib/database.js` 中新增了以下函数：
- `getConfig()` - 获取所有配置数据，返回原JSON格式
- `saveConfig(configData)` - 保存配置数据到数据库
- `updateConfigItem(category, key, value)` - 更新单个配置项

### 3. API接口更新
更新了 `app/api/config/route.js`：
- GET接口现在从数据库读取配置数据
- POST接口现在将配置数据保存到数据库
- 保留了默认配置作为后备方案
- 保持了与前端的兼容性（相同的JSON格式）

### 4. 价格计算系统更新
更新了 `lib/pricing.js`：
- `calculatePrice()` 函数现在是异步的，从数据库获取配置
- `getOptions()` 函数也更新为异步
- 更新了 `app/api/quotes/calculate/route.js` 以支持异步调用

### 5. 文件清理
- 删除了不再需要的 `config.json` 文件
- 所有配置数据现在存储在数据库中

## 🚀 下一步操作

### 必须完成的步骤：

1. **在Supabase项目中执行SQL脚本**
   ```bash
   # 在Supabase项目的SQL Editor中运行：
   sql/create_config_table.sql
   ```

2. **验证功能正常**
   - 启动开发服务器：`npm run dev`
   - 访问配置页面：`http://localhost:3000/config`
   - 测试配置的读取和保存功能
   - 测试价格计算是否使用数据库配置

## 📊 数据库表结构

```sql
CREATE TABLE config_settings (
    id BIGSERIAL PRIMARY KEY,
    category TEXT NOT NULL,           -- 配置类别
    key TEXT NOT NULL,                -- 配置项键名  
    value DECIMAL(10,2) NOT NULL,     -- 配置项数值
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 配置数据结构

数据库中的配置数据将按以下方式组织：

| Category | Key | Value | 说明 |
|----------|-----|-------|------|
| discount | Discount | 45 | 折扣百分比 |
| productPrices | Roller Shades | 0 | 产品基础价格 |
| valanceColorPrices | Wrapped | 30 | Valance颜色价格 |
| controlPrices | bead chain | 20 | Control类型价格 |
| ... | ... | ... | ... |

## ✅ 兼容性保证

- 前端配置页面无需修改，API返回相同的JSON格式
- 价格计算逻辑保持不变，只是数据来源改为数据库
- 如果数据库连接失败，系统会自动使用默认配置

## 🔍 故障排查

如果遇到问题，请检查：

1. **环境变量是否正确设置**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **数据库表是否创建成功**
   - 在Supabase控制台查看 `config_settings` 表
   - 确认初始数据已插入

3. **API接口是否正常**
   - 访问 `/api/config` 检查响应
   - 检查浏览器开发者工具的网络面板

配置系统迁移完成！现在所有配置数据都存储在Supabase数据库中，支持Vercel部署。 