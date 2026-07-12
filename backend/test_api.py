"""
校园失物招领 API 测试脚本
调用后端接口：发布物品、查询列表、删除记录
需要先有登录 token（需先在 Supabase 执行 schema.sql 创建管理员账号）
"""
import requests

BASE_URL = "http://127.0.0.1:5000"

# 先获取管理员 token
print("=" * 50)
print("校园失物招领 API 测试")
print("=" * 50)

# 1. 健康检查
print("\n[1] 健康检查 GET /api/health")
resp = requests.get(f"{BASE_URL}/api/health")
print(f"  状态码: {resp.status_code}")
print(f"  响应:   {resp.json()}")

# 2. 管理员登录获取 token
print("\n[2] 管理员登录获取 token")
resp = requests.post(f"{BASE_URL}/api/auth/login", json={
    "username": "admin",
    "password": "admin123",
})
result = resp.json()
print(f"  状态码: {resp.status_code}")
print(f"  登录结果: {result.get('success')}")
if result.get('success'):
    token = result['data']['token']
    print(f"  token: {token[:40]}...")
else:
    print(f"  响应: {result}")
    print("\n  ⚠ 管理员登录失败！请确认：")
    print("    1. 已在 Supabase SQL Editor 中执行 backend/db/schema.sql")
    print("    2. Flask 后端已启动: cd backend && python app.py")
    print("    3. .env 中 Supabase 配置正确")
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

test_data = [
    {
        "title": "黑色钱包",
        "description": "内有校园卡和少量现金，品牌为Coach",
        "location": "图书馆三楼阅览室",
        "contact_name": "张三",
        "contact_phone": "13800138001",
        "item_type": "found",
    },
    {
        "title": "iPhone 14 蓝色",
        "description": "屏幕有贴膜，背面有一道划痕",
        "location": "第二食堂门口",
        "contact_name": "李四",
        "contact_phone": "13800138002",
        "item_type": "lost",
    },
    {
        "title": "校园卡 学号20240101",
        "description": "计算机学院，失主姓王",
        "location": "操场跑道旁",
        "contact_name": "王五",
        "contact_phone": "13800138003",
        "item_type": "found",
    },
]

# 3. 新增测试数据（需登录）
created_ids = []
for i, item in enumerate(test_data):
    tag = item["item_type"]
    print(f"\n[3.{i+1}] POST /api/items — 发布[{tag}] {item['title']}")
    resp = requests.post(f"{BASE_URL}/api/items", json=item, headers=headers)
    print(f"  状态码: {resp.status_code}")
    print(f"  响应:   {resp.json()}")
    if resp.status_code == 201:
        created_ids.append(resp.json()["data"]["id"])

# 4. 查询全部列表
print("\n[4] GET /api/items — 查询全部")
resp = requests.get(f"{BASE_URL}/api/items")
print(f"  状态码: {resp.status_code}")
data = resp.json()
print(f"  共 {len(data.get('data', []))} 条记录")
for item in data.get("data", []):
    print(f"  - [{item.get('item_type', '?')}] {item.get('title', '')} @ {item.get('location', '')}")

# 5. 删除第一条测试数据（如有）
if created_ids:
    del_id = created_ids[0]
    print(f"\n[5] DELETE /api/items/{del_id} — 删除第一条")
    resp = requests.delete(f"{BASE_URL}/api/items/{del_id}", headers=headers)
    print(f"  状态码: {resp.status_code}")
    print(f"  响应:   {resp.json()}")

    # 6. 再次查询确认已删除
    print(f"\n[6] 再次查询 GET /api/items — 确认删除")
    resp = requests.get(f"{BASE_URL}/api/items")
    data = resp.json()
    print(f"  剩余 {len(data.get('data', []))} 条记录")

print("\n" + "=" * 50)
print("测试完成")
print("=" * 50)
