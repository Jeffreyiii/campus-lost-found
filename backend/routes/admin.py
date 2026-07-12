"""
管理员路由

提供管理员专属的用户管理接口:
  GET    /api/admin/users          — 查看所有用户
  GET    /api/admin/users/<id>     — 查看单个用户详情
  PATCH  /api/admin/users/<id>/role — 修改用户角色
  DELETE /api/admin/users/<id>     — 删除用户

所有接口均需要管理员权限。
"""

from flask import Blueprint, request, jsonify
from middlewares.auth import require_admin
from services.auth_service import AuthService

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/users', methods=['GET'])
@require_admin
def list_users(current_user):
    """获取所有用户列表（管理员专属）

    返回所有用户的基本信息（不含密码哈希）
    """
    try:
        users = AuthService.get_all_users()
        return jsonify({
            'success': True,
            'message': '查询成功',
            'count': len(users),
            'data': users,
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'查询失败: {str(e)}',
        }), 500


@admin_bp.route('/users/<user_id>', methods=['GET'])
@require_admin
def get_user(current_user, user_id: str):
    """查看单个用户详情（管理员专属）"""
    try:
        user = AuthService.get_user_by_id(user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': '用户不存在',
            }), 404

        # 不返回密码哈希
        return jsonify({
            'success': True,
            'data': {
                'id': user['id'],
                'username': user['username'],
                'nickname': user.get('nickname', ''),
                'role': user['role'],
                'created_at': user.get('created_at'),
            },
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'查询失败: {str(e)}',
        }), 500


@admin_bp.route('/users/<user_id>/role', methods=['PATCH'])
@require_admin
def update_user_role(current_user, user_id: str):
    """修改用户角色（管理员专属）

    请求体:
        {"role": "admin"} 或 {"role": "user"}

    注意: 不能修改自己的角色，防止管理员把自己降级
    """
    if user_id == current_user['user_id']:
        return jsonify({
            'success': False,
            'message': '不能修改自己的角色',
        }), 400

    data = request.get_json()
    if not data or 'role' not in data:
        return jsonify({
            'success': False,
            'message': '请提供 role 字段 (user / admin)',
        }), 400

    result = AuthService.update_user_role(user_id, data['role'])
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(current_user, user_id: str):
    """删除用户（管理员专属）

    注意: 不能删除自己
    """
    if user_id == current_user['user_id']:
        return jsonify({
            'success': False,
            'message': '不能删除自己的账号',
        }), 400

    result = AuthService.delete_user(user_id)
    status_code = 200 if result['success'] else 400
    return jsonify(result), status_code
