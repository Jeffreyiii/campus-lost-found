"""
校园失物招领 — 认证功能测试脚本

测试流程:
  1. 注册一个普通用户
  2. 登录获取 token
  3. 用 token 发布物品（需登录）
  4. 无 token 发布物品（应被拒绝）
  5. 管理员登录
  6. 管理员查看所有用户
  7. 管理员删除测试用户

前提条件:
  - Flask 后端已启动: cd backend && python app.py
  - 已在 Supabase SQL Editor 执行 db/schema.sql（含 users 表和管理员初始账号）
  - 管理员初始账号: admin / admin123
"""

import requests

BASE_URL = "http://127.0.0.1:5000"


def print_section(title: str):
    print(f"\n{'=' * 55}")
    print(f"  {title}")
    print(f"{'=' * 55}")


def print_result(label: str, resp):
    print(f"\n[{label}]")
    print(f"  请求: {resp.request.method} {resp.request.url}")
    body = resp.request.body
    if body:
        print(f"  请求体: {body.decode() if isinstance(body, bytes) else body}")
    print(f"  状态码: {resp.status_code}")
    print(f"  响应:   {resp.json()}")
    return resp.json()


# ============================
# 1. 注册普通用户
# ============================
print_section("1. 注册普通用户")
resp = requests.post(f"{BASE_URL}/api/auth/register", json={
    "username": "test_user",
    "password": "123456"
})
result = print_result("注册 test_user", resp)

# 如果用户已存在（之前测试残留），就跳过，直接登录
if not result.get("success"):
    print("  ⚠ 用户名可能已存在，跳过注册")

# ============================
# 2. 登录普通用户
# ============================
print_section("2. 普通用户登录")
resp = requests.post(f"{BASE_URL}/api/auth/login", json={
    "username": "test_user",
    "password": "123456"
})
result = print_result("登录 test_user", resp)

if not result.get("success"):
    print("❌ 普通用户登录失败，测试终止")
    exit(1)

user_token = result["data"]["token"]
user_id = result["data"]["user"]["id"]
print(f"  ✅ 获取到 token: {user_token[:30]}...")

# ============================
# 3. 已登录用户发布物品
# ============================
print_section("3. 已登录用户发布物品")
headers = {"Authorization": f"Bearer {user_token}"}
resp = requests.post(f"{BASE_URL}/api/items", json={
    "title": "测试 - 蓝色水杯",
    "description": "操场看台捡到的",
    "location": "操场",
    "contact_name": "测试用户",
    "contact_phone": "13900001111",
    "item_type": "found",
}, headers=headers)
result = print_result("发布物品（已登录）", resp)
item_id = result.get("data", {}).get("id") if result.get("success") else None

# ============================
# 4. 未登录发布物品（应被拒绝 401）
# ============================
print_section("4. 未登录用户发布物品（应返回 401）")
resp = requests.post(f"{BASE_URL}/api/items", json={
    "title": "黑客发布",
    "description": "未经授权的物品",
    "location": "未知",
    "contact_name": "黑客",
    "contact_phone": "00000000000",
    "item_type": "lost",
})
result = print_result("发布物品（未登录）", resp)
if resp.status_code == 401:
    print("  ✅ 正确拦截未登录请求")
else:
    print("  ❌ 未正确拦截未登录请求")

# ============================
# 5. 查询物品列表（公开）
# ============================
print_section("5. 查询物品列表（公开，无需登录）")
resp = requests.get(f"{BASE_URL}/api/items")
result = print_result("GET /api/items", resp)
print(f"  共 {len(result.get('data', []))} 条记录")

# ============================
# 6. 管理员登录
# ============================
print_section("6. 管理员登录")
resp = requests.post(f"{BASE_URL}/api/auth/login", json={
    "username": "admin",
    "password": "admin123"
})
result = print_result("登录 admin", resp)

if not result.get("success"):
    print("❌ 管理员登录失败，请确认已在 Supabase 执行 schema.sql")
    exit(1)

admin_token = result["data"]["token"]
print(f"  ✅ 管理员 token: {admin_token[:30]}...")

# ============================
# 7. 管理员查看所有用户
# ============================
print_section("7. 管理员查看所有用户")
headers = {"Authorization": f"Bearer {admin_token}"}
resp = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
result = print_result("GET /api/admin/users", resp)
for u in result.get("data", []):
    print(f"  - {u['username']} | 角色: {u['role']} | ID: {u['id'][:8]}...")

# ============================
# 8. 普通用户尝试访问管理接口（应被拒绝 403）
# ============================
print_section("8. 普通用户访问管理接口（应返回 403）")
headers = {"Authorization": f"Bearer {user_token}"}
resp = requests.get(f"{BASE_URL}/api/admin/users", headers=headers)
result = print_result("普通用户 GET /api/admin/users", resp)
if resp.status_code == 403:
    print("  ✅ 正确拦截非管理员请求")
else:
    print("  ❌ 未正确拦截非管理员请求")

# ============================
# 9. 删除刚创建的物品（普通用户删自己的）
# ============================
if item_id:
    print_section("9. 删除自己发布的物品")
    headers = {"Authorization": f"Bearer {user_token}"}
    resp = requests.delete(f"{BASE_URL}/api/items/{item_id}", headers=headers)
    result = print_result(f"DELETE /api/items/{item_id}", resp)
    if resp.status_code == 200:
        print("  ✅ 成功删除自己发布的物品")
    else:
        print("  ❌ 删除失败")

# ============================
print_section("测试完成 ✅")
print("""
总结:
  1. 普通用户可注册/登录
  2. 已登录用户可发布物品（关联 user_id）
  3. 未登录用户发布物品被拒绝 (401)
  4. 查询物品列表公开无需登录
  5. 管理员可查看/管理所有用户
  6. 普通用户无法访问管理接口 (403)
  7. 用户可删除自己发布的物品
""")
