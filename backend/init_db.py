"""数据库初始化：创建 users 表 + 插入种子数据"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

import requests
from config import Config

url = Config.SUPABASE_URL.rstrip('/')
key = Config.SUPABASE_KEY

# 读取 fix.sql
sql_path = os.path.join(os.path.dirname(__file__), 'db', 'fix.sql')
with open(sql_path, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# 尝试通过 REST API 执行 SQL（需要 service_role key）
# 先尝试 Management API
headers = {
    'apikey': key,
    'Authorization': f'Bearer {key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
}

# 方式1: 尝试 SQL API
resp = requests.post(
    f'{url}/rest/v1/',
    headers=headers,
    json={'query': sql_content},
)

print(f"Status: {resp.status_code}")
print(f"Response: {resp.text[:300]}")

# 如果失败，尝试逐表创建
if resp.status_code >= 400:
    print("\n自动创建失败，请手动在 Supabase SQL Editor 执行 backend/db/fix.sql")
    print(f"SQL 文件路径: {os.path.abspath(sql_path)}")
else:
    print("数据库修复成功！")

# 验证 users 表
try:
    from db.supabase_client import get_supabase_client
    client = get_supabase_client()
    r = client.table('users').select('username,role').execute()
    print(f"\n验证: users 表有 {len(r.data)} 条记录")
    for u in r.data:
        print(f"  - {u['username']} ({u['role']})")
except Exception as e:
    print(f"\n验证失败: {e}")
