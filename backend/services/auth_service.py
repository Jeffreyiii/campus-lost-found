"""
用户认证服务

提供用户注册、登录、JWT token 签发与验证等核心功能。
密码使用 bcrypt 哈希存储，token 使用 PyJWT 签发。
"""

import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional

import bcrypt
import jwt

from config import Config
from db.supabase_client import get_supabase_client

USERS_TABLE = 'users'


class AuthService:
    """用户认证服务"""

    # ---------- 密码哈希 ----------

    @staticmethod
    def hash_password(password: str) -> str:
        """对明文密码做 bcrypt 哈希"""
        return bcrypt.hashpw(
            password.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """校验明文密码与哈希是否匹配"""
        return bcrypt.checkpw(
            password.encode('utf-8'), password_hash.encode('utf-8')
        )

    # ---------- JWT ----------

    @staticmethod
    def generate_token(user: Dict) -> str:
        """根据用户信息签发 JWT access token

        Args:
            user: 包含 id, username, role 的字典

        Returns:
            JWT 字符串
        """
        payload = {
            'user_id': user['id'],
            'username': user['username'],
            'role': user['role'],
            'exp': datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRATION_HOURS),
            'iat': datetime.now(timezone.utc),
        }
        return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

    @staticmethod
    def decode_token(token: str) -> Optional[Dict]:
        """验证并解码 JWT token

        Returns:
            成功返回 payload 字典，失败返回 None
        """
        try:
            return jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    # ---------- 用户操作 ----------

    @staticmethod
    def register(username: str, password: str, nickname: str = '') -> Dict:
        """注册新用户

        Args:
            username: 用户名
            password: 明文密码
            nickname: 昵称（可选）

        Returns:
            {'success': bool, 'message': str, 'data': dict|None}

        Raises:
            不会抛出异常，所有错误通过返回值体现
        """
        username = username.strip().lower()
        if not username or len(username) < 2:
            return {'success': False, 'message': '用户名至少需要 2 个字符'}
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return {'success': False, 'message': '用户名仅支持字母、数字和下划线'}
        if not password or len(password) < 6:
            return {'success': False, 'message': '密码至少需要 6 个字符'}

        supabase = get_supabase_client()

        # 检查用户名是否已存在
        existing = supabase.table(USERS_TABLE).select('id').eq('username', username).execute()
        if existing.data:
            return {'success': False, 'message': '用户名已被注册'}

        # 创建用户
        user_data = {
            'id': str(uuid.uuid4()),
            'username': username,
            'password_hash': AuthService.hash_password(password),
            'role': 'user',
            'nickname': nickname.strip() if nickname else username,
        }
        result = supabase.table(USERS_TABLE).insert(user_data).execute()

        if not result.data:
            return {'success': False, 'message': '注册失败，请稍后重试'}

        user = result.data[0]
        return {
            'success': True,
            'message': '注册成功',
            'data': {
                'id': user['id'],
                'username': user['username'],
                'role': user['role'],
                'nickname': user.get('nickname', ''),
            },
        }

    @staticmethod
    def login(username: str, password: str) -> Dict:
        """用户登录

        Args:
            username: 用户名
            password: 明文密码

        Returns:
            {'success': bool, 'message': str, 'data': {'token': str, 'user': dict}|None}
        """
        username = username.strip().lower()
        if not username or not password:
            return {'success': False, 'message': '用户名和密码不能为空'}

        supabase = get_supabase_client()

        # 查询用户
        result = supabase.table(USERS_TABLE).select('*').eq('username', username).execute()
        if not result.data:
            return {'success': False, 'message': '用户名或密码错误'}

        user = result.data[0]

        # 校验密码
        if not AuthService.verify_password(password, user['password_hash']):
            return {'success': False, 'message': '用户名或密码错误'}

        # 签发 token
        token = AuthService.generate_token(user)

        return {
            'success': True,
            'message': '登录成功',
            'data': {
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'nickname': user.get('nickname', ''),
                    'role': user['role'],
                },
            },
        }

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict]:
        """根据 ID 查询用户"""
        supabase = get_supabase_client()
        result = supabase.table(USERS_TABLE).select('*').eq('id', user_id).execute()
        return result.data[0] if result.data else None

    @staticmethod
    def get_all_users() -> list:
        """获取所有用户（管理员功能）"""
        supabase = get_supabase_client()
        result = supabase.table(USERS_TABLE).select('id,username,nickname,role,created_at').order('created_at', desc=True).execute()
        return result.data

    @staticmethod
    def update_user_role(user_id: str, new_role: str) -> Dict:
        """更新用户角色（管理员功能）

        Returns:
            {'success': bool, 'message': str}
        """
        if new_role not in ('user', 'admin'):
            return {'success': False, 'message': '角色必须为 user 或 admin'}

        supabase = get_supabase_client()

        # 检查用户是否存在
        user = AuthService.get_user_by_id(user_id)
        if not user:
            return {'success': False, 'message': '用户不存在'}

        result = supabase.table(USERS_TABLE).update({'role': new_role}).eq('id', user_id).execute()

        if not result.data:
            return {'success': False, 'message': '更新失败'}

        return {
            'success': True,
            'message': f'用户 {user["username"]} 角色已更新为 {new_role}',
            'data': result.data[0],
        }

    @staticmethod
    def delete_user(user_id: str) -> Dict:
        """删除用户（管理员功能）

        Returns:
            {'success': bool, 'message': str}
        """
        supabase = get_supabase_client()

        user = AuthService.get_user_by_id(user_id)
        if not user:
            return {'success': False, 'message': '用户不存在'}

        result = supabase.table(USERS_TABLE).delete().eq('id', user_id).execute()

        if not result.data:
            return {'success': False, 'message': '删除失败'}

        return {
            'success': True,
            'message': f'用户 {user["username"]} 已删除',
        }
