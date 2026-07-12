"""
用户认证路由

提供注册和登录两个公开接口:
  POST /api/auth/register — 注册新用户
  POST /api/auth/login    — 用户登录，获取 JWT token
"""

from flask import Blueprint, request, jsonify
from services.auth_service import AuthService

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """注册新用户

    请求体:
        {"username": "zhangsan", "password": "123456"}

    返回:
        201: 注册成功，返回用户基本信息
        400: 用户名已存在或参数不合法
    """
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': '请提供 JSON 请求体'}), 400

    username = data.get('username', '')
    password = data.get('password', '')
    nickname = data.get('nickname', '')

    result = AuthService.register(username, password, nickname)

    status_code = 201 if result['success'] else 400
    return jsonify(result), status_code


@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录

    请求体:
        {"username": "zhangsan", "password": "123456"}

    返回:
        200: 登录成功，返回 token 和用户信息
        401: 用户名或密码错误
    """
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': '请提供 JSON 请求体'}), 400

    username = data.get('username', '')
    password = data.get('password', '')

    result = AuthService.login(username, password)

    status_code = 200 if result['success'] else 401
    return jsonify(result), status_code
