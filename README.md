# 校园失物招领系统

基于 **Next.js 14 (App Router)** 前端 + **Flask** 后端 + **Supabase** 云数据库的校园失物招领平台。

## 项目结构

```
campus_lost_found/
├── src/                        # Next.js 前端源码
│   ├── app/
│   │   ├── page.tsx            # 首页
│   │   ├── items/page.tsx      # 失物招领列表页
│   │   └── publish/page.tsx    # 发布招领信息表单页
│   ├── components/             # 公共组件
│   ├── lib/api.ts              # 前端 API 调用封装
│   └── types/                  # TypeScript 类型定义
├── backend/                    # Flask 后端
│   ├── app.py                  # 后端启动入口
│   ├── factory.py              # Flask 应用工厂
│   ├── config.py               # 配置（含 Supabase）
│   ├── routes/items.py         # 物品 API 路由
│   ├── services/item_service.py # 业务逻辑层
│   ├── db/
│   │   ├── supabase_client.py  # Supabase 客户端
│   │   └── schema.sql          # 建表 SQL 脚本
│   └── requirements.txt        # Python 依赖
└── package.json                # 前端依赖
```

## 环境要求

- Node.js 18+ 和 npm
- Python 3.10+
- Supabase 账号（免费套餐即可）

## 安装与启动

### 一、前端（Next.js）

```bash
cd campus_lost_found
npm install
copy .env.local.example .env.local
npm run dev
```

前端地址：http://localhost:3000

### 二、后端（Flask）

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

后端地址：http://localhost:5000

### 三、验证

- 健康检查：http://localhost:5000/api/health
- 返回 `"storage": "supabase"` 表示已连接云数据库
- 返回 `"storage": "memory"` 表示使用内存模式（未配置 Supabase）

## Supabase 云数据库配置

### 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com) 注册并登录
2. 点击 **New Project** 创建项目
3. 等待数据库初始化完成

### 2. 执行建表 SQL

1. 进入项目 → **SQL Editor**
2. 将 `backend/db/schema.sql` 的内容粘贴并执行
3. 确认 `lost_items` 表创建成功

### 3. 获取 API 密钥

1. 进入 **Settings → API**
2. 复制 **Project URL** → 填入 `SUPABASE_URL`
3. 复制 **service_role** key（推荐后端使用）→ 填入 `SUPABASE_KEY`

### 4. 配置后端环境变量

编辑 `backend/.env`：

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. 重启后端

```bash
python app.py
```

访问 http://localhost:5000/api/health，确认 `storage` 为 `supabase`。

## API 接口

| 方法   | 路径              | 说明           |
|--------|-------------------|----------------|
| POST   | /api/items        | 发布物品信息   |
| GET    | /api/items        | 查询全部招领信息 |
| DELETE | /api/items/:id    | 删除信息       |
| GET    | /api/health       | 健康检查（含存储模式） |

## 存储模式说明

| 模式 | 触发条件 | 特点 |
|------|----------|------|
| `supabase` | `.env` 中配置了 URL 和 KEY | 数据持久化到云数据库 |
| `memory` | 未配置 Supabase | 内存存储，重启后数据丢失，适合本地调试 |
