"""
Supabase 数据库客户端（预留模块）

后续对接 Supabase 云数据库时：
1. 在 Supabase 控制台创建 lost_items 表
2. 安装依赖：pip install supabase
3. 在 backend/.env 中配置 SUPABASE_URL 和 SUPABASE_KEY
4. 取消下方注释并实现 get_supabase_client()
5. 在 services/item_service.py 中替换内存存储为数据库调用

建议的 lost_items 表结构（SQL）：
---------------------------------
CREATE TABLE lost_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    location    TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    item_type   TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
---------------------------------
"""

# from supabase import create_client, Client
# from config import Config


# def get_supabase_client() -> Client:
#     """
#     获取 Supabase 客户端单例
#
#     Returns:
#         已配置的 Supabase Client 实例
#     """
#     if not Config.SUPABASE_URL or not Config.SUPABASE_KEY:
#         raise RuntimeError(
#             '请在环境变量中设置 SUPABASE_URL 和 SUPABASE_KEY'
#         )
#     return create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
