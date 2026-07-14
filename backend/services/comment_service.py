"""
评论业务逻辑服务层

存储策略：
- 已配置 Supabase → 使用云数据库持久化
- 未配置 Supabase → 回退到内存存储（开发调试用，重启后数据丢失）
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

from db.supabase_client import get_supabase_client, get_supabase_admin_client, is_supabase_configured

TABLE_NAME = 'comments'


class CommentService:
    """评论服务"""

    def __init__(self):
        self._use_supabase = is_supabase_configured()
        self._comments: List[Dict] = []

    def get_by_item(self, item_id: str) -> List[Dict]:
        """获取某条物品的所有评论（按时间倒序），并关联用户信息"""
        try:
            if self._use_supabase:
                return self._get_by_item_from_supabase(item_id)
        except Exception as e:
            # Supabase comments 表未创建时静默回退到空列表
            if 'PGRST205' in str(e):
                return []
            raise
        return sorted(
            [c for c in self._comments if c['item_id'] == item_id],
            key=lambda x: x['created_at'],
            reverse=True,
        )

    def create(self, item_id: str, user_id: Optional[str], content: str) -> Dict:
        """创建评论"""
        try:
            if self._use_supabase:
                return self._create_in_supabase(item_id, user_id, content)
        except Exception as e:
            if 'PGRST205' in str(e):
                raise RuntimeError('评论功能暂未配置，请稍后重试')
            raise
        return self._create_in_memory(item_id, user_id, content)

    def delete(self, comment_id: str) -> bool:
        """删除评论"""
        try:
            if self._use_supabase:
                return self._delete_from_supabase(comment_id)
        except Exception as e:
            if 'PGRST205' in str(e):
                raise RuntimeError('评论功能暂未配置，请稍后重试')
            raise
        for i, c in enumerate(self._comments):
            if c['id'] == comment_id:
                self._comments.pop(i)
                return True
        return False

    def get_by_id(self, comment_id: str) -> Optional[Dict]:
        """根据 ID 查询单条评论"""
        try:
            if self._use_supabase:
                supabase = get_supabase_client()
                result = supabase.table(TABLE_NAME).select('*').eq('id', comment_id).execute()
                return result.data[0] if result.data else None
        except Exception as e:
            if 'PGRST205' in str(e):
                return None
            raise
        return next((c for c in self._comments if c['id'] == comment_id), None)

    # ==================== Supabase 实现 ====================

    def _get_by_item_from_supabase(self, item_id: str) -> List[Dict]:
        """从 Supabase 查询评论及评论者信息"""
        supabase = get_supabase_client()
        result = (
            supabase.table(TABLE_NAME)
            .select('*, users(nickname, username)')
            .eq('item_id', item_id)
            .order('created_at', desc=True)
            .execute()
        )
        # 展平 users 字段
        comments = []
        for row in result.data:
            user_info = row.pop('users', {}) or {}
            row['nickname'] = user_info.get('nickname') or user_info.get('username') or '匿名用户'
            comments.append(row)
        return comments

    def _create_in_supabase(self, item_id: str, user_id: Optional[str], content: str) -> Dict:
        """向 Supabase 插入评论（使用 admin key 绕过 RLS）"""
        supabase = get_supabase_admin_client()
        payload = {'item_id': item_id, 'user_id': user_id, 'content': content}
        result = supabase.table(TABLE_NAME).insert(payload).execute()
        return result.data[0]

    def _delete_from_supabase(self, comment_id: str) -> bool:
        """从 Supabase 删除评论（使用 admin key 绕过 RLS）"""
        supabase = get_supabase_admin_client()
        result = supabase.table(TABLE_NAME).delete().eq('id', comment_id).execute()
        return len(result.data) > 0

    # ==================== 内存存储实现 ====================

    def _create_in_memory(self, item_id: str, user_id: Optional[str], content: str) -> Dict:
        comment = {
            'id': str(uuid.uuid4()),
            'item_id': item_id,
            'user_id': user_id,
            'content': content,
            'created_at': datetime.now(timezone.utc).isoformat(),
            'nickname': '匿名用户',
        }
        self._comments.append(comment)
        return comment
