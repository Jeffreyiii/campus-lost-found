/**
 * 失物招领物品类型定义
 * 与后端 Flask API 返回的数据结构保持一致
 */
export interface LostItem {
  /** 物品唯一标识（后续由 Supabase 生成 UUID） */
  id: string;
  /** 物品名称 */
  title: string;
  /** 物品描述 */
  description: string;
  /** 拾取/丢失地点 */
  location: string;
  /** 联系人姓名 */
  contact_name: string;
  /** 联系电话 */
  contact_phone: string;
  /** 物品类型：lost=寻物启事, found=失物招领 */
  item_type: 'lost' | 'found';
  /** 图片公开URL */
  image_url?: string;
  /** 丢失/捡到日期（YYYY-MM-DD） */
  lost_time?: string;
  /** 认领状态：unclaimed=未认领, claimed=已认领 */
  claim_status: 'unclaimed' | 'claimed';
  /** 评论列表（仅详情页返回） */
  comments?: Comment[];
  /** 发布者用户 ID */
  user_id?: string;
  /** 发布时间（ISO 8601 格式） */
  created_at: string;
}

/**
 * 发布招领信息时的请求体
 */
export interface CreateLostItemPayload {
  title: string;
  description: string;
  location: string;
  contact_name: string;
  contact_phone: string;
  item_type: 'lost' | 'found';
  /** 图片公网URL（可选，通过 uploadImage 获取） */
  image_url?: string;
  /** 丢失/捡到日期（YYYY-MM-DD） */
  lost_time?: string;
}

/**
 * 评论类型定义
 */
export interface Comment {
  id: string;
  item_id: string;
  user_id?: string;
  content: string;
  created_at: string;
  nickname?: string;
}

/**
 * 后端 API 统一响应格式
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
