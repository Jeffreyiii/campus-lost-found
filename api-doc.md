# API 接口文档

> 后端地址：`http://localhost:5000`
> 基础路径：`/api`
> 所有响应统一格式：`{"success": bool, "message": str, "data": ...}`

---

## 一、用户认证（Auth）

### 1.1 注册

> 创建新用户账号

```
POST /api/auth/register
```

**请求体 (JSON)**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名，3-20 位字母数字或下划线 |
| password | string | 是 | 密码，6-100 位 |
| nickname | string | 否 | 昵称，默认使用用户名 |

```json
{
  "username": "zhangsan",
  "password": "123456",
  "nickname": "张三"
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "zhangsan",
    "nickname": "张三",
    "role": "user",
    "created_at": "2026-07-17T12:00:00.000Z"
  }
}
```

**错误响应**

| 状态码 | message |
|--------|---------|
| 400 | 请提供 JSON 请求体 |
| 400 | 用户名已被注册 |
| 400 | 用户名仅支持字母、数字和下划线，3-20 位 |
| 400 | 密码不能少于 6 位 |

---

### 1.2 登录

> 用户登录获取 JWT Token

```
POST /api/auth/login
```

**请求体 (JSON)**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

```json
{
  "username": "zhangsan",
  "password": "123456"
}
```

**成功响应 (200)**

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "user_id": "550e8400-...",
      "username": "zhangsan",
      "nickname": "张三",
      "role": "user"
    }
  }
}
```

**错误响应**

| 状态码 | message |
|--------|---------|
| 400 | 请提供 JSON 请求体 |
| 401 | 用户名或密码错误 |
| 401 | 用户名和密码不能为空 |

**使用 Token**

所有需认证的接口在请求头中携带：

```
Authorization: Bearer <token>
```

Token 有效期：24 小时。

---

## 二、物品管理（Items）

### 2.1 上传图片

> 上传物品图片到 Supabase Storage（需登录）

```
POST /api/items/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | File | 是 | 图片文件，支持 JPG/PNG/GIF/WebP，最大 5MB |

```bash
curl -X POST http://localhost:5000/api/items/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@wallet.jpg"
```

**成功响应 (200)**

```json
{
  "success": true,
  "message": "上传成功",
  "data": {
    "url": "https://xxxxx.supabase.co/storage/v1/object/public/item-images/550e8400-/xxx.jpg"
  }
}
```

**错误响应**

| 状态码 | message |
|--------|---------|
| 400 | 请选择上传文件 |
| 400 | 仅支持 JPG / PNG / GIF / WebP 格式 |
| 400 | 图片大小不能超过 5MB |
| 500 | 云存储上传失败 |

---

### 2.2 发布物品

> 发布寻物启事或失物招领（需登录）

```
POST /api/items
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体 (JSON)**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 物品名称，≤100 字 |
| description | string | 是 | 物品描述，≤500 字 |
| location | string | 是 | 地点，≤100 字 |
| contact_name | string | 是 | 联系人，≤50 字 |
| contact_phone | string | 是 | 手机号，11 位数字 |
| item_type | string | 是 | `"lost"` 寻物 `"found"` 拾取 |
| image_url | string | 否 | 图片 URL（从 upload 接口获取）≤500 字 |
| lost_time | string | 否 | 日期，格式 `YYYY-MM-DD` |

```json
{
  "title": "黑色钱包",
  "description": "内有校园卡和少量现金，咖啡馆旁捡到",
  "location": "图书馆三楼",
  "contact_name": "张三",
  "contact_phone": "13800138000",
  "item_type": "found",
  "image_url": "https://xxxxx.supabase.co/.../xxx.jpg",
  "lost_time": "2026-07-15"
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "message": "发布成功",
  "data": {
    "id": "550e8400-...",
    "title": "黑色钱包",
    "description": "内有校园卡和少量现金，咖啡馆旁捡到",
    "location": "图书馆三楼",
    "contact_name": "张三",
    "contact_phone": "13800138000",
    "item_type": "found",
    "image_url": "https://xxxxx.supabase.co/.../xxx.jpg",
    "lost_time": "2026-07-15",
    "claim_status": "unclaimed",
    "user_id": "550e8400-...",
    "created_at": "2026-07-17T12:00:00.000Z"
  }
}
```

**错误响应**

| 状态码 | message |
|--------|---------|
| 400 | 缺少必填字段: ... |
| 400 | title 不能超过 100 个字符 |
| 400 | contact_phone 格式不正确 |
| 400 | item_type 必须为 lost 或 found |
| 401 | 未提供认证 Token |

---

### 2.3 查询所有物品

> 公开接口，可选按用户筛选

```
GET /api/items?user_id=<uuid>
```

**查询参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | UUID | 否 | 按发布者筛选 |

```bash
curl http://localhost:5000/api/items
```

**成功响应 (200)**

```json
{
  "success": true,
  "message": "查询成功",
  "data": [
    {
      "id": "550e8400-...",
      "title": "黑色钱包",
      "description": "内有校园卡...",
      "location": "图书馆三楼",
      "contact_name": "张三",
      "contact_phone": "13800138000",
      "item_type": "found",
      "image_url": "https://xxx...",
      "claim_status": "unclaimed",
      "user_id": "550e8400-...",
      "created_at": "2026-07-17T12:00:00.000Z"
    }
  ]
}
```

---

### 2.4 获取物品详情

> 包含评论列表

```
GET /api/items/:id
```

```bash
curl http://localhost:5000/api/items/550e8400-...
```

**成功响应 (200)**

```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "id": "550e8400-...",
    "title": "黑色钱包",
    "description": "...",
    "location": "图书馆三楼",
    "contact_name": "张三",
    "contact_phone": "13800138000",
    "item_type": "found",
    "image_url": "https://xxx...",
    "claim_status": "unclaimed",
    "user_id": "550e8400-...",
    "created_at": "2026-07-17T12:00:00.000Z",
    "comments": [
      {
        "id": "660e8400-...",
        "item_id": "550e8400-...",
        "user_id": "770e8400-...",
        "nickname": "李四",
        "content": "我在食堂也见过这个钱包",
        "created_at": "2026-07-17T13:00:00.000Z"
      }
    ]
  }
}
```

| 状态码 | message |
|--------|---------|
| 400 | ID 格式不合法 |
| 404 | 未找到该物品信息 |

---

### 2.5 删除物品

> 仅发布者本人或管理员可删除（需登录）

```
DELETE /api/items/:id
Authorization: Bearer <token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "message": "删除成功",
  "data": null
}
```

| 状态码 | message |
|--------|---------|
| 403 | 无权删除他人发布的物品 |
| 404 | 未找到该物品信息 |

---

### 2.6 标记已认领

> 发布者可标记物品已认领（需登录）

```
PATCH /api/items/:id/claim
Authorization: Bearer <token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "message": "已标记为已认领",
  "data": {
    "id": "550e8400-...",
    "claim_status": "claimed",
    ...
  }
}
```

| 状态码 | message |
|--------|---------|
| 400 | 该物品已标记为已认领 |
| 404 | 未找到该物品信息 |

---

## 三、评论管理（Comments）

### 3.1 发表评论

> 对某个物品发表评论（需登录）

```
POST /api/items/:id/comments
Content-Type: application/json
Authorization: Bearer <token>
```

**请求体 (JSON)**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 评论内容，≤500 字 |

```json
{
  "content": "我在食堂也见过这个钱包，失主应该就在附近"
}
```

**成功响应 (201)**

```json
{
  "success": true,
  "message": "评论成功",
  "data": {
    "id": "660e8400-...",
    "item_id": "550e8400-...",
    "user_id": "770e8400-...",
    "content": "我在食堂也见过这个钱包，失主应该就在附近",
    "created_at": "2026-07-17T14:00:00.000Z"
  }
}
```

| 状态码 | message |
|--------|---------|
| 400 | 评论内容不能为空 |
| 400 | 评论内容不能超过 500 字 |
| 404 | 未找到该物品信息 |

---

### 3.2 查询评论

```
GET /api/items/:id/comments
```

**成功响应 (200)**

```json
{
  "success": true,
  "message": "查询成功",
  "data": [
    {
      "id": "660e8400-...",
      "item_id": "550e8400-...",
      "user_id": "770e8400-...",
      "nickname": "李四",
      "content": "我在食堂也见过这个钱包",
      "created_at": "2026-07-17T14:00:00.000Z"
    }
  ]
}
```

---

### 3.3 删除评论

> 仅评论者本人或管理员可删除（需登录）

```
DELETE /api/items/:id/comments/:comment_id
Authorization: Bearer <token>
```

**成功响应 (200)**

```json
{
  "success": true,
  "message": "删除成功"
}
```

| 状态码 | message |
|--------|---------|
| 403 | 无权删除他人评论 |
| 404 | 未找到该评论 |

---

## 附录

### 通用错误码

| 码 | 含义 |
|----|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 / Token 无效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 认证说明

- JWT Token 通过 `Authorization: Bearer <token>` 传递
- Token 有效期 24 小时
- 登录接口返回 Token，前端存入 `localStorage`
- 需认证接口列表：发布物品、上传图片、删除物品、标记认领、发表评论、删除评论

### 数据类型

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 36 位 UUID v4 格式 |
| item_type | string | `"lost"` 寻物 | `"found"` 招领 |
| claim_status | string | `"unclaimed"` 未认领 | `"claimed"` 已认领 |
| created_at | string | ISO 8601 时间戳 |
| image_url | string | Supabase Storage 公开 URL |
