import type { ApiResponse, CreateLostItemPayload, LostItem } from '@/types/lost-item';
import type { UserInfo } from '@/types/user';

/**
 * API 基础地址
 * 优先读取环境变量，开发环境默认指向 Flask 后端
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/** 从 localStorage 读取 token（供非组件上下文场景使用） */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * 通用 fetch 封装，统一处理请求与错误
 * 自动携带 JWT token（如有）
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  // 自动注入 Authorization 头
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 如果响应不是 JSON，直接抛出错误（防止 parse 异常导致页面崩溃）
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(text || `请求失败: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (!response.ok) {
    // 401 表示 token 过期或无效，清除本地登录状态
    if (response.status === 401 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw new Error(result.message || `请求失败: ${response.status}`);
  }

  return result;
}

// ==================== 物品相关 API ====================

/** 上传物品图片 POST /api/items/upload（需登录，multipart/form-data） */
export async function uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/api/items/upload`;
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  const result: ApiResponse<{ url: string }> = await response.json();

  if (!response.ok) {
    throw new Error(result.message || '上传失败');
  }

  return result;
}

/** 发布物品信息 POST /api/items（需登录） */
export async function createLostItem(
  payload: CreateLostItemPayload
): Promise<ApiResponse<LostItem>> {
  return request<LostItem>('/api/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/** 查询招领信息 GET /api/items（公开，可选按用户筛选） */
export async function getAllLostItems(userId?: string): Promise<ApiResponse<LostItem[]>> {
  const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return request<LostItem[]>(`/api/items${query}`, {
    method: 'GET',
  });
}

/** 删除信息 DELETE /api/items/:id（需登录，仅本人或管理员） */
export async function deleteLostItem(id: string): Promise<ApiResponse<null>> {
  return request<null>(`/api/items/${id}`, {
    method: 'DELETE',
  });
}

/** 标记为已认领 PATCH /api/items/:id/claim（需登录，仅本人或管理员） */
export async function markClaimed(id: string): Promise<ApiResponse<LostItem>> {
  return request<LostItem>(`/api/items/${id}/claim`, {
    method: 'PATCH',
  });
}

// ==================== 物品详情与评论 API ====================

/** 获取物品详情（含评论）GET /api/items/:id */
export async function getItemDetail(id: string): Promise<ApiResponse<LostItem>> {
  return request<LostItem>(`/api/items/${id}`, {
    method: 'GET',
  });
}

/** 发表评论 POST /api/items/:id/comments（需登录） */
export async function createComment(
  itemId: string,
  content: string
): Promise<ApiResponse<Comment>> {
  return request<Comment>(`/api/items/${itemId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

/** 获取评论列表 GET /api/items/:id/comments */
export async function getComments(itemId: string): Promise<ApiResponse<Comment[]>> {
  return request<Comment[]>(`/api/items/${itemId}/comments`, {
    method: 'GET',
  });
}

/** 删除评论 DELETE /api/items/:id/comments/:commentId（需登录） */
export async function deleteComment(
  itemId: string,
  commentId: string
): Promise<ApiResponse<null>> {
  return request<null>(`/api/items/${itemId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

// ==================== 认证相关 API ====================

interface LoginRegisterResponse {
  token: string;
  user: UserInfo;
}

/** 注册 POST /api/auth/register */
export async function register(
  username: string,
  password: string,
  nickname?: string
): Promise<ApiResponse<LoginRegisterResponse>> {
  return request<LoginRegisterResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, nickname: nickname || '' }),
  });
}

/** 登录 POST /api/auth/login */
export async function login(
  username: string,
  password: string
): Promise<ApiResponse<LoginRegisterResponse>> {
  return request<LoginRegisterResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// ==================== 管理员相关 API ====================

interface AdminUser {
  id: string;
  username: string;
  nickname: string;
  role: 'user' | 'admin';
  created_at: string;
}

/** 获取所有用户 GET /api/admin/users（需管理员） */
export async function getAllUsers(): Promise<ApiResponse<AdminUser[]>> {
  return request<AdminUser[]>('/api/admin/users', {
    method: 'GET',
  });
}

/** 更新用户角色 PATCH /api/admin/users/:id/role（需管理员） */
export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<ApiResponse<null>> {
  return request<null>(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

/** 删除用户 DELETE /api/admin/users/:id（需管理员） */
export async function deleteUser(userId: string): Promise<ApiResponse<null>> {
  return request<null>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
}
