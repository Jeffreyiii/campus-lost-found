# 校园失物招领系统

> **线上地址**：[http://95df76e1814644b19b5f08576dd7e0d7.codebuddy.cloudstudio.run](http://95df76e1814644b19b5f08576dd7e0d7.codebuddy.cloudstudio.run)

基于 **Next.js 14 (App Router)** + **Flask** + **Supabase** 全栈校园失物招领平台。支持物品发布 / 图片上传 / 评论互动 / 状态标记，已部署可直接访问。

---

## 功能特性

| 模块 | 说明 |
|------|------|
| 用户系统 | 注册 / 登录 / JWT 鉴权 |
| 物品管理 | 发布寻物启事或失物招领，支持图片上传 |
| 状态标记 | 发布者可标记物品为「已认领」 |
| 评论互动 | 物品详情页支持评论，发布者可删除 |
| 管理后台 | 管理员可删除任意物品和评论 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14 (App Router) · TypeScript · Ant Design 5 |
| 后端 | Python · Flask 3 · Pydantic 校验 |
| 数据库 | Supabase (PostgreSQL) |
| 存储 | Supabase Storage (图片) |
| 部署 | Cloud Studio |

---

## 项目结构

```
campus_lost_found/
├── src/                          # Next.js 前端
│   ├── app/
│   │   ├── page.tsx              # 首页（物品列表 + 搜索）
│   │   ├── items/page.tsx        # 招领信息列表
│   │   ├── items/[id]/page.tsx   # 物品详情 + 评论
│   │   ├── publish/page.tsx      # 发布招领信息
│   │   ├── my-posts/page.tsx     # 我的帖子
│   │   ├── admin/page.tsx        # 管理后台
│   │   ├── login/page.tsx        # 登录
│   │   ├── register/page.tsx     # 注册
│   │   └── guide/page.tsx        # 使用指南
│   ├── components/               # 公共组件
│   ├── contexts/                 # React Context（用户认证）
│   ├── lib/api.ts                # 前端 API 封装
│   └── types/lost-item.ts        # TypeScript 类型
├── backend/                      # Flask 后端
│   ├── app.py                    # 启动入口
│   ├── factory.py                # 应用工厂
│   ├── config.py                 # 配置（环境变量）
│   ├── routes/                   # API 路由
│   │   ├── items.py              # 物品 CRUD + 上传 + 评论
│   │   ├── auth.py               # 注册/登录
│   │   └── admin.py              # 管理接口
│   ├── services/                 # 业务逻辑层
│   │   ├── item_service.py
│   │   ├── auth_service.py
│   │   └── comment_service.py
│   ├── middlewares/auth.py       # JWT 鉴权中间件
│   ├── db/
│   │   └── supabase_client.py    # Supabase 客户端
│   ├── requirements.txt
│   └── .env.example
├── screenshots/                  # 截图 & 审查报告
│   └── code-review-report.md
├── api-doc.md                    # 接口文档
├── prompt_shturl.md              # 对话记录
└── package.json
```

---

## 本地运行教程

### 环境要求

- **Node.js** 18+
- **Python** 3.10+
- **npm** 9+
- Supabase 账号（免费）

### 一、前端

```bash
cd campus_lost_found
npm install
npm run dev
```

→ 浏览器打开 `http://localhost:3000`

### 二、后端

```bash
cd backend

# 创建虚拟环境（首次）
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt

# 配置环境变量
copy .env.example .env  # Windows
# cp .env.example .env   # macOS/Linux

python app.py
```

→ 后端运行在 `http://localhost:5000`

### 三、配置 Supabase

1. [注册 Supabase](https://supabase.com) 并创建项目
2. 进入 **SQL Editor**，执行 `backend/db/schema.sql`
3. 进入 **Settings → API**，复制：
   - `Project URL` → 填入 `SUPABASE_URL`
   - `anon public key` (Legacy 格式) → 填入 `SUPABASE_KEY`
   - `service_role key` (Legacy 格式) → 填入 `SUPABASE_SERVICE_ROLE_KEY`
4. 编辑 `backend/.env` 填入上述值
5. 重启后端

### 四、验证

```bash
curl http://localhost:5000/api/health
# → {"success": true, "storage": "supabase"}
```

---

## API 总览

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 注册 | 否 |
| POST | `/api/auth/login` | 登录 | 否 |
| POST | `/api/items/upload` | 上传图片 | 是 |
| POST | `/api/items` | 发布物品 | 是 |
| GET | `/api/items` | 查询所有物品 | 否 |
| GET | `/api/items/:id` | 物品详情（含评论） | 否 |
| DELETE | `/api/items/:id` | 删除物品 | 是 |
| PATCH | `/api/items/:id/claim` | 标记已认领 | 是 |
| POST | `/api/items/:id/comments` | 发表评论 | 是 |
| GET | `/api/items/:id/comments` | 查询评论 | 否 |
| DELETE | `/api/items/:id/comments/:cid` | 删除评论 | 是 |
| GET | `/api/health` | 健康检查 | 否 |

> 详细参数与示例见 [api-doc.md](./api-doc.md)

---

## 对话记录

全部 CodeBuddy 开发对话、Code Review 与修复过程见 [prompt_shturl.md](./prompt_shturl.md)
