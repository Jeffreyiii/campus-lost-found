"""
物品业务逻辑服务层

当前使用内存列表模拟数据库。
后续对接 Supabase 时，将 create / get_all / delete 方法
替换为 supabase_client 中的数据库调用。
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict

# TODO: 后续对接 Supabase 时取消注释
# from db.supabase_client import get_supabase_client


class ItemService:
    """失物招领物品服务"""

    def __init__(self):
        # 临时内存存储（开发阶段使用，重启后数据丢失）
       self._items: List[Dict] = []

    def create(self, data: Dict) -> Dict:
        """
        创建一条招领信息

        Args:
            data: 包含 title, description, location 等字段的字典

        Returns:
            创建成功的完整物品记录
        """
        # ===== Supabase 对接位置（开始） =====
        # 后续替换为：
        # supabase = get_supabase_client()
        # result = supabase.table('lost_items').insert({...}).execute()
        # return result.data[0]
        # ===== Supabase 对接位置（结束） =====

        item = {
            'id': str(uuid.uuid4()),
            'title': data['title'],
            'description': data['description'],
            'location': data['location'],
            'contact_name': data['contact_name'],
            'contact_phone': data['contact_phone'],
            'item_type': data['item_type'],
            'created_at': datetime.now(timezone.utc).isoformat(),
        }
        self._items.append(item)
        return item

    def get_all(self) -> List[Dict]:
        """
        获取全部招领信息，按发布时间倒序排列

        Returns:
            物品列表
        """
        # ===== Supabase 对接位置（开始） =====
        # 后续替换为：
        # supabase = get_supabase_client()
        # result = supabase.table('lost_items').select('*').order('created_at', desc=True).execute()
        # return result.data
        # ===== Supabase 对接位置（结束） =====

        return sorted(self._items, key=lambda x: x['created_at'], reverse=True)

    def delete(self, item_id: str) -> bool:
        """
        根据 ID 删除招领信息

        Args:
            item_id: 物品唯一标识

        Returns:
            是否删除成功（找不到则返回 False）
        """
        # ===== Supabase 对接位置（开始） =====
        # 后续替换为：
        # supabase = get_supabase_client()
        # result = supabase.table('lost_items').delete().eq('id', item_id).execute()
        # return len(result.data) > 0
        # ===== Supabase 对接位置（结束） =====

        for i, item in enumerate(self._items):
            if item['id'] == item_id:
                self._items.pop(i)
                return True
        return False

    def get_by_id(self, item_id: str) -> Optional[dict]:
        """
        根据 ID 查询单条记录（预留方法，后续扩展详情页时使用）

        Args:
            item_id: 物品唯一标识

        Returns:
            物品记录，不存在则返回 None
        """
        # ===== Supabase 对接位置（开始） =====
        # supabase = get_supabase_client()
        # result = supabase.table('lost_items').select('*').eq('id', item_id).single().execute()
        # return result.data
        # ===== Supabase 对接位置（结束） =====

        return next((item for item in self._items if item['id'] == item_id), None)
