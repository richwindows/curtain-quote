# 窗帘报价网站

一个使用 Next.js、Tailwind CSS 和 SQLite 构建的简单窗帘报价网站。

## 功能特性

- 🔐 **登录认证** - 管理员登录系统保护后台功能
- 📝 **在线报价** - 创建和管理客户报价单
- 📊 **报价管理** - 查看所有生成的报价记录
- ⚙️ **系统配置** - 灵活配置产品价格和折扣
- 💰 **智能计算** - 根据尺寸、材料、配件等自动计算价格
- 📱 **响应式设计** - 支持手机、平板和桌面设备
- 🎨 **现代界面** - 使用 Tailwind CSS 构建的美观界面

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证**: 基于Cookie的Session管理
- **语言**: JavaScript (不使用 TypeScript)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在Vercel部署时，需要设置以下环境变量：

**认证相关：**
```
ADMIN_USERNAME=你的管理员用户名
ADMIN_PASSWORD=你的管理员密码
```

**Supabase数据库相关：**
```
NEXT_PUBLIC_SUPABASE_URL=你的supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase匿名密钥
SUPABASE_SERVICE_ROLE_KEY=你的supabase服务密钥
```

对于本地开发，可以创建 `.env.local` 文件：

```bash
# .env.local

# 管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password_here

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**获取Supabase密钥的方法：**
1. 登录到你的 [Supabase项目](https://supabase.com/dashboard)
2. 前往 Settings > API
3. 复制 Project URL 和 anon public key
4. 复制 service_role secret key（仅用于服务端）

### 3. 设置Supabase数据库

在Supabase项目的SQL Editor中依次执行以下SQL文件来创建数据表：

#### 3.1 创建报价表
执行 `sql/create_tables.sql` 文件内容

#### 3.2 创建配置表  
执行 `sql/create_config_table.sql` 文件内容

这将创建：
- `quotes` 表 - 存储报价数据
- `config_settings` 表 - 存储系统配置数据（价格、折扣等）

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 访问网站

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
curtain-quote/
├── app/                        # Next.js App Router 页面
│   ├── components/            # 可复用组件
│   │   └── UserNav.js        # 用户导航组件
│   ├── login/                # 登录页面
│   ├── quotes/               # 报价历史页面
│   ├── config/               # 系统配置页面
│   ├── api/                  # API 路由
│   │   ├── auth/            # 认证相关API
│   │   ├── quotes/          # 报价相关API
│   │   └── config/          # 配置相关API
│   ├── globals.css          # 全局样式
│   ├── layout.js            # 根布局
│   └── page.js              # 创建报价页面
├── lib/                     # 工具库
│   ├── database.js          # 数据库操作 (Supabase)
│   ├── supabase.js          # Supabase连接配置
│   ├── pricing.js           # 价格计算逻辑
│   └── auth.js              # 认证工具函数
├── sql/                     # 数据库结构文件
│   ├── create_tables.sql    # 创建报价表的SQL语句
│   └── create_config_table.sql # 创建配置表的SQL语句
└── middleware.js            # Next.js中间件 (路由保护)
```

## 使用说明

### 登录系统

系统使用管理员账号密码进行登录验证：

1. 访问系统时会自动重定向到登录页面 `/login`
2. 输入在环境变量中配置的管理员用户名和密码
3. 登录成功后可以访问所有功能页面
4. 点击右上角的"登出"按钮可以安全退出系统
5. Session有效期为24小时，过期后需要重新登录

### 页面功能

- **创建报价** (`/`) - 添加新的客户报价单
- **报价历史** (`/quotes`) - 查看和管理所有报价记录  
- **系统配置** (`/config`) - 配置产品价格、折扣等参数

## 功能说明

### 报价计算逻辑

价格计算基于以下因素：

1. **窗帘类型基础价格** (每平方米)
   - 普通布帘: ¥80
   - 遮光窗帘: ¥120
   - 百叶窗: ¥150
   - 卷帘: ¥100
   - 罗马帘: ¥180
   - 垂直百叶: ¥140

2. **面料类型系数**
   - 棉质: 1.0
   - 涤纶: 0.8
   - 丝绸: 1.8
   - 麻质: 1.2
   - 绒布: 1.3
   - 纱质: 0.9

3. **房间类型系数**
   - 客厅: 1.2
   - 卧室: 1.0
   - 书房: 1.0
   - 儿童房: 1.1
   - 厨房: 0.9
   - 卫生间: 0.8

4. **安装费用**
   - 标准安装: ¥50
   - 复杂安装: ¥100
   - 电动窗帘: ¥200
   - 双层安装: ¥80

**计算公式**: 
```
总价 = (窗户面积 × 窗帘类型基础价格 × 面料系数 × 房间系数) + 安装费用
```

## API 接口

### 创建报价
- **POST** `/api/quotes`
- 提交报价信息，自动计算价格并保存到数据库

### 获取所有报价
- **GET** `/api/quotes`
- 返回所有报价记录的列表

### 获取单个报价
- **GET** `/api/quotes/[id]`
- 根据ID获取特定报价的详细信息

## 部署说明

### 构建生产版本

```bash
npm run build
npm start
```

### 环境要求

- Node.js 18 或更高版本
- SQLite 支持

## 自定义配置

### 修改价格设置

编辑 `lib/pricing.js` 文件中的价格配置：

```javascript
const curtainTypePrices = {
  '普通布帘': 80,  // 修改基础价格
  // ...
};
```

### 添加新的窗帘类型

1. 在 `lib/pricing.js` 中添加新类型和价格
2. 在 `app/quote/page.js` 中添加选项到下拉菜单

## 许可证

MIT License #   c u r t a i n - q u o t e 
 
 