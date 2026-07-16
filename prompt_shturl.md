# CodeBuddy 开发对话记录

> 项目：校园失物招领系统（campus_lost_found）
> 日期：2026-07-17
> 截图目录：`screenshots/`

---

## 对话概要

本次开发会话使用 CodeBuddy 完成了**依赖修复、缺陷排查、安全审查、云端部署、Supabase 配置**共 5 个阶段。

---

## 阶段一：后端启动失败修复

**问题：** 前端页面显示「加载数据失败」

**排查流程：**
1. 测试 `curl http://127.0.0.1:5001/api/items` → 无响应
2. 发现 Flask 后端未启动
3. 启动 Flask 报错：`tuple[bool, str]` 语法不兼容 Python 3.8

**修复：**
- `backend/routes/items.py`：2 处 `tuple[bool, str]` → `Tuple[bool, str]`，添加 `from typing import Tuple`
- `backend/routes/admin.py`：同上

| 文件 | 修改内容 |
|------|----------|
| `backend/routes/items.py` | 导入 Tuple，修复 2 处类型注解 |
| `backend/routes/admin.py` | 导入 Tuple，修复 1 处类型注解 |

Git: `c047053` — Python 3.8 兼容性修复

---

## 阶段二：发布页面组件缺失

**问题：** 发布页面报 `Tag is not defined` 错误

**修复：**
- `src/app/publish/page.tsx`：antd 导入中补充 `Tag` 组件

Git: `f9a38ff` — Tag 导入修复

---

## 阶段三：Code Review 审查报告

**任务：** 全面审查前端 18 个 TypeScript 文件 + 后端 20 个 Python 文件

**审查报告文件：** `screenshots/code-review-report.md`

### 发现与修复（15 项）

| 类别 | 数量 | 说明 |
|------|------|------|
| 安全漏洞 | 3 | JWT 密钥脱敏、孤儿 Token 清理、CORS 域名白名单 |
| 参数校验 | 6 | UUID 格式、字段长度、手机号、用户名、评论内容 |
| 前端异常 | 5 | 空值渲染、类型断言、卡片跳转、缺失导入 |
| 兼容性 | 1 | Python 3.8 `tuple` → `Tuple` |

Git: `c047053` — 首轮安全与校验修复

---

## 阶段四：Cloud Studio 部署

**任务：** 将前后端部署到 Cloud Studio，产出公网 URL

### 4.1 构建失败：JSX 引号转义

**问题：** 部署 `npm run build` 报 ESLint `react/no-unescaped-entities`

**位置：** `src/app/guide/page.tsx:198`

```tsx
// 修复前
<Text strong>"发布信息"</Text>
// 修复后
<Text strong>发布信息</Text>
```

### 4.2 API 请求路径修复

**问题：** 前端 API 默认请求 `http://localhost:5000`，部署后浏览器无法访问

**原理：** `next.config.mjs` 已配置 rewrites 代理 `/api/*` → `http://localhost:5000/api/*`，只需将前端请求改为相对路径即可走同源代理。

**修复：** `src/lib/api.ts`

```ts
// 修复前
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
// 修复后
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
```

### 4.3 部署架构

```
[浏览器] ─→ [Next.js :3000] ─→ [/api/* 代理] ─→ [Flask :5000] ─→ [Supabase]
```

### 部署结果

| 次数 | URL | 状态 |
|------|-----|------|
| 第 1 次 | `...0c139ac4.run` | zsh 解析错误 |
| 第 2 次 | `...0e2670e.run` | 成功，但 Supabase 报 500 |
| 第 3 次 | `...1bcd745.run` | 成功，API 返回 200 |

Git: `06460eb` — API 相对路径 + 部署配置

---

## 阶段五：Supabase 配置修复

### 5.1 API Key 格式问题

**问题：** `.env` 中使用了 Supabase 新版 key 格式 `sb_publishable_...`，`supabase-py` 库只支持旧版 JWT 格式

**错误日志：**
```
SupabaseException: Invalid API key
```

**修复：** 指导用户从 Supabase Dashboard 获取 Legacy 格式 key

| 变量 | 格式 | 示例 |
|------|------|------|
| SUPABASE_KEY | JWT (eyJ...) | `eyJhbGciOiJIUzI1NiIs...` |
| SUPABASE_SERVICE_ROLE_KEY | JWT (eyJ...) | `eyJhbGciOiJIUzI1NiIs...` (role: service_role) |

### 5.2 图片上传失败

**问题：** 上传图片报 `signature verification failed`

**排查：** 对比用户提供的 key 与 `.env` 文件

```
用户提供：...O65YJKfuYWSnX22vAn1hUuEJCSQ_...
文件内容：...O65YJKfuYWSnXv22An1hUuEJCSQ_...
                               ↑ typo: 22v → v22
```

**修复：** 更正 service_role_key 中的拼写错误

### 最终部署

**URL：** [http://95df76e1814644b19b5f08576dd7e0d7.codebuddy.cloudstudio.run](http://95df76e1814644b19b5f08576dd7e0d7.codebuddy.cloudstudio.run)

**验证结果：**
- `GET /api/items` → 200 OK
- Supabase 连接正常
- Storage 上传可用

---

## 技术要点总结

| 要点 | 说明 |
|------|------|
| Next.js Rewrites | 服务端代理解决跨域，比客户端 CORS 更安全 |
| Python 类型兼容 | 3.9 以下不支持 `list[X]` / `tuple[X,Y]` 语法，需从 typing 导入 |
| Supabase Key 格式 | 新版 `sb_publishable_` 格式不被旧版 supabase-py 支持，需用 Legacy JWT |
| Cloud Studio 部署 | 支持单沙箱运行多进程，注意 zsh 解析兼容性 |
| JSX 引号 | ESLint 要求引号转义或使用实体编码 |

---

## Git 提交历史

```
239d67b fix: 更新 Supabase API Key 为正确的 JWT 格式 key
06460eb fix: 部署到 CloudStudio，API 地址改为相对路径走 Next.js 代理
c1e66a3 fix: JSX 未转义引号导致构建失败 (guide/page.tsx)
f9a38ff docs: 更新代码审查报告 & fix: 补充 Tag 组件导入
3117c3d fix: Python 3.8 兼容性，tuple 类型注解改为 typing.Tuple
c047053 fix: 安全漏洞、参数校验、前端异常修复（首轮 Code Review）
```

---

## 截图索引

| 文件名 | 说明 |
|--------|------|
| `screenshots/code-review-report.md` | 完整代码审查报告（15 项问题） |
| `image.110075e985.png` | 前端加载失败错误 |
| `image.76180c5e03.png` | 发布页面 Tag 未定义错误 |
| `image.b4bcd6606d.png` | 部署构建 ESLint 错误 |
| `image.166e3850c3.png` | 部署构建失败日志 |
| `image.a98cf683ba.png` | Supabase Invalid API Key |
| `image.69502b1f07.png` | Supabase API Settings 页面 |
| `image.f580925fb5.png` | Legacy anon key |
| `image.6105a0d09a.png` | Storage 上传签名失败 |
