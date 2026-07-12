"""
应用配置
后续对接 Supabase 时，在此读取环境变量
"""

import os


class Config:
    """Flask 基础配置"""

    # 密钥（生产环境请通过环境变量设置）
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

    # Supabase 配置（后续对接时取消注释并填写）
    # SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
    # SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')  # service_role 或 anon key

    # 调试模式
    DEBUG = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
