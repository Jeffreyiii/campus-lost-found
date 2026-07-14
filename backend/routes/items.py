"""
失物招领物品 API 路由

提供接口：
 ① POST   /api/items/upload  - 上传图片（需登录）
 ② POST   /api/items         - 发布物品信息（需登录）
 ③ GET    /api/items         - 查询全部招领信息（公开）
 ④ DELETE /api/items/<id>    - 删除信息（需登录，仅本人或管理员）
"""

import uuid
from flask import Blueprint, request, jsonify
from middlewares.auth import require_auth
from services.item_service import ItemService
from config import Config
from db.supabase_client import is_supabase_configured, get_supabase_client

# 创建蓝图，所有物品相关路由挂载在此
items_bp = Blueprint('items', __name__)

# 服务层实例
item_service = ItemService()

# 允许的图片格式
ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/gif', 'image/webp'}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB


@items_bp.route('/upload', methods=['POST'])
@require_auth
def upload_image(current_user):
    """上传物品图片到 Supabase Storage

    请求头:
        Authorization: Bearer <token>

    请求: multipart/form-data, 字段名 file

    返回:
        200: {'success': True, 'data': {'url': 'https://...'}}
        400: 文件格式/大小不合法
    """
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': '请选择上传文件'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'success': False, 'message': '文件名为空'}), 400

    # 校验文件类型
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        return jsonify({'success': False, 'message': '仅支持 JPG / PNG / GIF / WebP 格式'}), 400

    # 校验文件大小
    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_IMAGE_SIZE:
        return jsonify({'success': False, 'message': '图片大小不能超过 5MB'}), 400

    # 生成唯一文件名
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else 'jpg'
    if ext not in ('jpg', 'jpeg', 'png', 'gif', 'webp'):
        ext = 'jpg'
    storage_path = f"{current_user['user_id']}/{uuid.uuid4()}.{ext}"

    file_bytes = file.read()

    if is_supabase_configured():
        try:
            # 使用管理员客户端绕过 Storage RLS 限制
            from db.supabase_client import get_supabase_admin_client
            admin_client = get_supabase_admin_client()
            admin_client.storage.from_(Config.SUPABASE_STORAGE_BUCKET).upload(
                storage_path,
                file_bytes,
                {'content-type': file.content_type, 'cache-control': 'public, max-age=86400'}
            )
            public_url = admin_client.storage.from_(Config.SUPABASE_STORAGE_BUCKET).get_public_url(storage_path)
            return jsonify({'success': True, 'message': '上传成功', 'data': {'url': public_url}})
        except RuntimeError as e:
            # 管理员密钥未配置，回退到普通客户端（需手动开启 RLS）
            return jsonify({'success': False, 'message': f'上传失败: {str(e)}。请在 backend/.env 中设置 SUPABASE_SERVICE_ROLE_KEY'}), 500
        except Exception as e:
            return jsonify({'success': False, 'message': f'云存储上传失败: {str(e)}'}), 500

    return jsonify({'success': False, 'message': '云存储未配置'}), 500


@items_bp.route('', methods=['POST'])
@require_auth
def create_item(current_user):
    """
    ① 发布物品信息（需登录）

    请求头:
        Authorization: Bearer <token>

    请求体 JSON 示例：
    {
        "title": "黑色钱包",
        "description": "内有校园卡和少量现金",
        "location": "图书馆三楼",
        "contact_name": "张三",
        "contact_phone": "13800138000",
        "item_type": "found"
    }
    """
    data = request.get_json()

    # 校验必填字段
    required_fields = ['title', 'description', 'location', 'contact_name', 'contact_phone', 'item_type']
    missing = [f for f in required_fields if not data or not data.get(f)]
    if missing:
        return jsonify({
            'success': False,
            'message': f'缺少必填字段: {", ".join(missing)}',
        }), 400

    # 校验 item_type 取值
    if data['item_type'] not in ('lost', 'found'):
        return jsonify({
            'success': False,
            'message': 'item_type 必须为 lost 或 found',
        }), 400

    try:
        # 注入当前用户 ID
        data['user_id'] = current_user['user_id']
        item = item_service.create(data)
        return jsonify({
            'success': True,
            'message': '发布成功',
            'data': item,
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'发布失败: {str(e)}',
        }), 500


@items_bp.route('', methods=['GET'])
def get_all_items():
    """
    ② 查询全部招领信息（公开）

    返回所有已发布的失物招领记录列表
    """
    try:
        items = item_service.get_all()
        return jsonify({
            'success': True,
            'message': '查询成功',
            'data': items,
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'查询失败: {str(e)}',
        }), 500


@items_bp.route('/<item_id>', methods=['DELETE'])
@require_auth
def delete_item(current_user, item_id: str):
    """
    ③ 删除信息（需登录）

    仅允许删除自己发布的物品，管理员可删除任意物品
    """
    try:
        # 检查物品是否存在
        item = item_service.get_by_id(item_id)
        if not item:
            return jsonify({
                'success': False,
                'message': '未找到该物品信息',
            }), 404

        # 权限校验：仅本人或管理员可删除
        if item.get('user_id') != current_user['user_id'] and current_user['role'] != 'admin':
            return jsonify({
                'success': False,
                'message': '无权删除他人发布的物品',
            }), 403

        deleted = item_service.delete(item_id)
        if not deleted:
            return jsonify({
                'success': False,
                'message': '删除失败',
            }), 500

        return jsonify({
            'success': True,
            'message': '删除成功',
            'data': None,
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'删除失败: {str(e)}',
        }), 500

