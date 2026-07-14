"""
应用配置
从 .env 文件和环境变量中读取配置项
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# 加载 backend/.env 文件（若存在）
_env_path = Path(__file__).parent / '.env'
load_dotenv(_env_path)

# 调试打印（仅在开发环境显示）
raw_url = os.environ.get("SUPABASE_URL", "")
raw_key = os.environ.get("SUPABASE_KEY", "")
if os.environ.get('FLASK_DEBUG', 'True').lower() == 'true':
    print("==========【DEBUG ENV】==========")
    print("URL:", repr(raw_url[:20] + '...' if raw_url else '未设置'))
    print("KEY:", repr('已设置' if raw_key else '未设置'))
    print("=================================")

class Config:
    """Flask 基础配置"""

    # 密钥（生产环境请通过环境变量设置）
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

    # JWT 签名密钥（用于签发和验证用户 Token）
    JWT_SECRET = os.environ.get('JWT_SECRET', os.environ.get('SECRET_KEY', 'dev-jwt-secret'))

    # JWT 过期时间（小时）
    JWT_EXPIRATION_HOURS = int(os.environ.get('JWT_EXPIRATION_HOURS', '24'))

    # Supabase 云数据库配置
    SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

    # Supabase 管理员密钥（用于绕过 Storage RLS 上传文件）
    # 在 Supabase Dashboard → Settings → API → service_role key 中复制
    SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

    # Supabase 存储桶名称（用于物品图片）
    SUPABASE_STORAGE_BUCKET = os.environ.get('SUPABASE_STORAGE_BUCKET', 'item-images')

    # 调试模式
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'

    @classmethod
    def is_supabase_enabled(cls) -> bool:
        """检查 Supabase 是否已正确配置"""
        return bool(cls.SUPABASE_URL and cls.SUPABASE_KEY)

    @classmethod
    def is_supabase_admin_enabled(cls) -> bool:
        """检查是否配置了管理员密钥（用于绕过 Storage RLS）"""
        return bool(cls.SUPABASE_URL and cls.SUPABASE_SERVICE_ROLE_KEY)