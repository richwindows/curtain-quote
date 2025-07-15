# Supabase迁移指南

本项目已从SQLite迁移到Supabase PostgreSQL数据库，以支持Vercel等无服务器环境的部署。

## 🚀 快速部署步骤

### 1. 创建Supabase项目

1. 前往 [Supabase](https://supabase.com/) 并注册账号
2. 点击 "New Project" 创建新项目
3. 选择合适的region（建议选择离用户最近的区域）
4. 等待项目初始化完成

### 2. 设置数据库

1. 在Supabase项目控制台中，前往 **SQL Editor**
2. 复制并执行以下SQL语句：

```sql
-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS quotes;

-- 创建报价表
CREATE TABLE quotes (
    id BIGSERIAL PRIMARY KEY,
    quote_number INTEGER NOT NULL,
    customer_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    product TEXT NOT NULL,
    valance TEXT NOT NULL,
    valance_color TEXT NOT NULL,
    bottom_rail TEXT NOT NULL,
    control TEXT NOT NULL,
    fabric TEXT NOT NULL,
    fabric_price DECIMAL(10,2),
    motor_price DECIMAL(10,2),
    width_inch DECIMAL(10,3) NOT NULL,
    height_inch DECIMAL(10,3) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_quotes_customer_name ON quotes(customer_name);
```

### 3. 获取API密钥

1. 在Supabase项目中，前往 **Settings > API**
2. 复制以下信息：
   - Project URL
   - anon public key
   - service_role secret key

### 4. 配置Vercel环境变量

在Vercel项目设置中添加以下环境变量：

```
# 认证配置
ADMIN_USERNAME=你的管理员用户名
ADMIN_PASSWORD=你的安全密码

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥
```

### 5. 部署到Vercel

1. 将代码推送到你的Git仓库
2. 在Vercel中连接你的Git仓库
3. Vercel会自动部署项目

## 🔧 本地开发设置

创建 `.env.local` 文件：

```bash
# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password_here

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📊 数据迁移（如有现有数据）

如果你有现有的SQLite数据需要迁移：

1. 导出SQLite数据为CSV格式
2. 在Supabase控制台中使用 **Table Editor** 的导入功能
3. 或者编写迁移脚本批量插入数据

## ✅ 验证部署

部署完成后，访问你的网站：

1. 应该会重定向到登录页面
2. 输入设置的管理员账号密码
3. 成功登录后可以正常使用所有功能

## 🆕 新功能特性

迁移到Supabase后的优势：

- ✅ **云端部署支持** - 可在Vercel等平台正常运行
- ✅ **自动备份** - Supabase提供自动数据备份
- ✅ **更好的性能** - PostgreSQL数据库性能更优
- ✅ **实时功能** - 支持实时数据同步（如需要）
- ✅ **扩展性** - 更容易扩展和维护

## 🔒 安全注意事项

- 确保`SUPABASE_SERVICE_ROLE_KEY`只在服务端使用
- 定期更换管理员密码
- 在Supabase中设置适当的RLS（Row Level Security）规则

## 🛠️ 故障排除

### 常见问题：

**1. 环境变量错误**
- 检查所有环境变量是否正确设置
- 确保URL没有尾部斜杠

**2. 数据库连接失败**
- 验证Supabase项目是否正常运行
- 检查API密钥是否有效

**3. 登录失败**
- 确认管理员账号密码环境变量设置正确

如有其他问题，请检查Vercel和Supabase的控制台日志。 