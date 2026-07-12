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

# 调试打印，查看实际读到的值
raw_url = os.environ.get("SUPABASE_URL", "")
raw_key = os.environ.get("SUPABASE_KEY", "")
print("==========【DEBUG ENV】==========")
print("URL:", repr(raw_url))
print("KEY:", repr(raw_key))
print("=================================")

class Config:
    """Flask 基础配置"""

    # 密钥（生产环境请通过环境变量设置）
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

    # Supabase 云数据库配置
    SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

    # 调试模式
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'

    @classmethod
    def is_supabase_enabled(cls) -> bool:
        """检查 Supabase 是否已正确配置"""
        return bool(cls.SUPABASE_URL and cls.SUPABASE_KEY)