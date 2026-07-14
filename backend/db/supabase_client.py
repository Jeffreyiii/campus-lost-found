
"""
Supabase 数据库客户端

使用方式：
1. 在 Supabase 控制台执行 db/schema.sql 建表
2. 在 backend/.env 中填写 SUPABASE_URL 和 SUPABASE_KEY
3. 重启 Flask 后端，自动切换为云数据库存储
"""

from functools import lru_cache
from typing import TYPE_CHECKING

from config import Config

if TYPE_CHECKING:
    from supabase import Client


@lru_cache(maxsize=1)
def get_supabase_client() -> 'Client':
    """
    获取 Supabase 客户端单例（懒加载 + 缓存）

    Returns:
        已配置的 Supabase Client 实例

    Raises:
        RuntimeError: 未配置 Supabase 环境变量时抛出
    """
    if not Config.is_supabase_enabled():
        raise RuntimeError(
            'Supabase 未配置，请在 backend/.env 中设置 SUPABASE_URL 和 SUPABASE_KEY'
        )

    # 延迟导入，未安装 supabase 包时不影响内存模式启动
    from supabase import create_client

    return create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)


@lru_cache(maxsize=1)
def get_supabase_admin_client() -> 'Client':
    """
    获取 Supabase 管理员客户端（使用 service_role key，绕过 RLS）

    用于 Storage 上传等需要管理员权限的操作。

    Raises:
        RuntimeError: 未配置 SUPABASE_SERVICE_ROLE_KEY 时抛出
    """
    if not Config.is_supabase_admin_enabled():
        raise RuntimeError(
            'Supabase admin 未配置，请在 backend/.env 中设置 SUPABASE_SERVICE_ROLE_KEY'
        )

    from supabase import create_client
    return create_client(Config.SUPABASE_URL, Config.SUPABASE_SERVICE_ROLE_KEY)


def is_supabase_configured() -> bool:
    """判断 Supabase 环境变量是否已配置"""
    return Config.is_supabase_enabled()
