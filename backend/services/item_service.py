"""
物品业务逻辑服务层

存储策略：
- 已配置 Supabase → 使用云数据库持久化
- 未配置 Supabase → 回退到内存存储（开发调试用，重启后数据丢失）
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from db.supabase_client import get_supabase_client, is_supabase_configured

# Supabase 表名
TABLE_NAME = 'lost_items'


class ItemService:
    """失物招领物品服务"""

    def __init__(self):
        # 是否使用 Supabase 云数据库
        self._use_supabase = is_supabase_configured()
        # 内存存储（仅 Supabase 未配置时使用）
        self._items: List[Dict] = []

    @property
    def storage_mode(self) -> str:
        """返回当前存储模式，供健康检查接口使用"""
        return 'supabase' if self._use_supabase else 'memory'

    def create(self, data: Dict) -> Dict:
        """
        创建一条招领信息

        Args:
            data: 包含 title, description, location 等字段的字典

        Returns:
            创建成功的完整物品记录
        """
        if self._use_supabase:
            return self._create_in_supabase(data)
        return self._create_in_memory(data)

    def get_all(self) -> List[Dict]:
        """
        获取全部招领信息，按发布时间倒序排列

        Returns:
            物品列表
        """
        if self._use_supabase:
            return self._get_all_from_supabase()
        return self._get_all_from_memory()

    def delete(self, item_id: str) -> bool:
        """
        根据 ID 删除招领信息

        Args:
            item_id: 物品唯一标识

        Returns:
            是否删除成功（找不到则返回 False）
        """
        if self._use_supabase:
            return self._delete_from_supabase(item_id)
        return self._delete_from_memory(item_id)

    def get_by_id(self, item_id: str) -> Optional[Dict]:
        """
        根据 ID 查询单条记录（预留方法，后续扩展详情页时使用）

        Args:
            item_id: 物品唯一标识

        Returns:
            物品记录，不存在则返回 None
        """
        if self._use_supabase:
            return self._get_by_id_from_supabase(item_id)
        return next((item for item in self._items if item['id'] == item_id), None)

    # ==================== Supabase 存储实现 ====================

    def _create_in_supabase(self, data: Dict) -> Dict:
        """向 Supabase 插入一条招领记录"""
        supabase = get_supabase_client()
        payload = {
            'title': data['title'],
            'description': data['description'],
            'location': data['location'],
            'contact_name': data['contact_name'],
            'contact_phone': data['contact_phone'],
            'item_type': data['item_type'],
            'user_id': data.get('user_id'),
            'image_url': data.get('image_url'),
        }
        result = supabase.table(TABLE_NAME).insert(payload).execute()
        return result.data[0]

    def _get_all_from_supabase(self) -> List[Dict]:
        """从 Supabase 查询全部记录，按时间倒序"""
        supabase = get_supabase_client()
        result = (
            supabase.table(TABLE_NAME)
            .select('*')
            .order('created_at', desc=True)
            .execute()
        )
        return result.data

    def _delete_from_supabase(self, item_id: str) -> bool:
        """从 Supabase 删除指定记录"""
        supabase = get_supabase_client()
        result = (
            supabase.table(TABLE_NAME)
            .delete()
            .eq('id', item_id)
            .execute()
        )
        return len(result.data) > 0

    def _get_by_id_from_supabase(self, item_id: str) -> Optional[Dict]:
        """从 Supabase 查询单条记录"""
        supabase = get_supabase_client()
        result = (
            supabase.table(TABLE_NAME)
            .select('*')
            .eq('id', item_id)
            .execute()
        )
        return result.data[0] if result.data else None

    # ==================== 内存存储实现（开发回退） ====================

    def _create_in_memory(self, data: Dict) -> Dict:
        """向内存列表插入一条招领记录"""
        item = {
            'id': str(uuid.uuid4()),
            'user_id': data.get('user_id'),
            'title': data['title'],
            'description': data['description'],
            'location': data['location'],
            'contact_name': data['contact_name'],
            'contact_phone': data['contact_phone'],
            'item_type': data['item_type'],
            'image_url': data.get('image_url'),
            'created_at': datetime.now(timezone.utc).isoformat(),
        }
        self._items.append(item)
        return item

    def _get_all_from_memory(self) -> List[Dict]:
        """从内存列表获取全部记录"""
        return sorted(self._items, key=lambda x: x['created_at'], reverse=True)

    def _delete_from_memory(self, item_id: str) -> bool:
        """从内存列表删除指定记录"""
        for i, item in enumerate(self._items):
            if item['id'] == item_id:
                self._items.pop(i)
                return True
        return False
