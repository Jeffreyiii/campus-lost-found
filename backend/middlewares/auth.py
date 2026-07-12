"""
认证中间件

提供装饰器用于保护需要登录或管理员权限的 API 接口。

使用方式:
    from middlewares.auth import require_auth, require_admin

    @items_bp.route('/xxx', methods=['POST'])
    @require_auth          # ← 需要登录
    def create_xxx(current_user):
        ...

    @items_bp.route('/xxx', methods=['DELETE'])
    @require_admin         # ← 需要管理员
    def admin_endpoint(current_user):
        ...

    装饰器会将当前用户信息以 current_user 参数注入路由函数。
"""

from functools import wraps
from typing import Callable, Optional

from flask import request, jsonify, g
from services.auth_service import AuthService


def _extract_token() -> Optional[str]:
    """从请求头中提取 Bearer token"""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header[7:]
    return None


def require_auth(func: Callable) -> Callable:
    """登录校验装饰器 —— 仅允许已登录用户访问

    被装饰的函数必须接受 current_user 作为第一个参数。

    用法:
        @items_bp.route('', methods=['POST'])
        @require_auth
        def create_item(current_user):
            ...
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        token = _extract_token()
        if not token:
            return jsonify({
                'success': False,
                'message': '请先登录',
            }), 401

        payload = AuthService.decode_token(token)
        if not payload:
            return jsonify({
                'success': False,
                'message': '登录已过期，请重新登录',
            }), 401

        current_user = {
            'user_id': payload['user_id'],
            'username': payload['username'],
            'role': payload['role'],
        }
        g.current_user = current_user
        return func(current_user, *args, **kwargs)

    return wrapper


def require_admin(func: Callable) -> Callable:
    """管理员校验装饰器 —— 仅允许管理员访问

    必须先通过 require_auth 校验（即同时需要登录 + 管理员身份）。

    用法:
        @items_bp.route('/admin/users', methods=['GET'])
        @require_admin
        def list_users(current_user):
            ...
    """

    @wraps(func)
    @require_auth
    def wrapper(current_user, *args, **kwargs):
        if current_user['role'] != 'admin':
            return jsonify({
                'success': False,
                'message': '权限不足，仅管理员可操作',
            }), 403
        return func(current_user, *args, **kwargs)

    return wrapper


def optional_auth(func: Callable) -> Callable:
    """可选认证装饰器 —— 如果提供了 token 则解析用户，否则 current_user 为 None

    用法:
        @items_bp.route('', methods=['GET'])
        @optional_auth
        def get_items(current_user):
            ...
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        token = _extract_token()
        if token:
            payload = AuthService.decode_token(token)
            if payload:
                current_user = {
                    'user_id': payload['user_id'],
                    'username': payload['username'],
                    'role': payload['role'],
                }
            else:
                current_user = None
        else:
            current_user = None

        g.current_user = current_user
        return func(current_user, *args, **kwargs)

    return wrapper
