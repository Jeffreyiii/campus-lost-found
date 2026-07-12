"""
失物招领物品 API 路由

提供三个基础接口：
  ① POST   /api/items       - 发布物品信息
  ② GET    /api/items       - 查询全部招领信息
  ③ DELETE /api/items/<id>   - 删除信息
"""

from flask import Blueprint, request, jsonify
from services.item_service import ItemService

# 创建蓝图，所有物品相关路由挂载在此
items_bp = Blueprint('items', __name__)

# 服务层实例（后续替换为 Supabase 数据访问）
item_service = ItemService()


@items_bp.route('', methods=['POST'])
def create_item():
    """
    ① 发布物品信息

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
    ② 查询全部招领信息

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
def delete_item(item_id: str):
    """
    ③ 删除信息

    根据物品 ID 删除对应的招领记录
    """
    try:
        deleted = item_service.delete(item_id)
        if not deleted:
            return jsonify({
                'success': False,
                'message': '未找到该物品信息',
            }), 404

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
