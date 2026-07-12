# 校园失物招领系统

基于 **Next.js 14 (App Router)** 前端 + **Flask** 后端的校园失物招领平台。

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
│   ├── config.py               # 配置（含 Supabase 预留）
│   ├── routes/items.py         # 物品 API 路由
│   ├── services/item_service.py # 业务逻辑层
│   ├── db/supabase_client.py   # Supabase 客户端（预留）
│   └── requirements.txt        # Python 依赖
└── package.json                # 前端依赖
```

## 环境要求

- Node.js 18+ 和 npm
- Python 3.10+

## 安装与启动

### 一、前端（Next.js）

```bash
# 1. 进入项目根目录
cd campus_lost_found

# 2. 安装前端依赖
npm install

# 3. 复制环境变量文件并按需修改
copy .env.local.example .env.local

# 4. 启动开发服务器（默认 http://localhost:3000）
npm run dev
```

### 二、后端（Flask）

```bash
# 1. 进入 backend 目录
cd backend

# 2. 创建并激活 Python 虚拟环境（Windows）
python -m venv venv
venv\Scripts\activate

# 3. 安装 Python 依赖
pip install -r requirements.txt

# 4. 复制环境变量文件（可选）
copy .env.example .env

# 5. 启动 Flask 后端（默认 http://localhost:5000）
python app.py
```

### 三、验证

- 前端：浏览器访问 http://localhost:3000
- 后端健康检查：http://localhost:5000/api/health

## API 接口

| 方法   | 路径              | 说明           |
|--------|-------------------|----------------|
| POST   | /api/items        | 发布物品信息   |
| GET    | /api/items        | 查询全部招领信息 |
| DELETE | /api/items/:id    | 删除信息       |

## 后续对接 Supabase

1. 在 Supabase 控制台创建 `lost_items` 表（建表 SQL 见 `backend/db/supabase_client.py`）
2. 安装依赖：`pip install supabase python-dotenv`
3. 在 `backend/.env` 中配置 `SUPABASE_URL` 和 `SUPABASE_KEY`
4. 实现 `backend/db/supabase_client.py` 中的客户端
5. 在 `backend/services/item_service.py` 中替换内存存储为 Supabase 调用
