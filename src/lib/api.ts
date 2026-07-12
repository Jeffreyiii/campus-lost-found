import type { ApiResponse, CreateLostItemPayload, LostItem } from '@/types/lost-item';

/**
 * API 基础地址
 * 优先读取环境变量，开发环境默认指向 Flask 后端
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

/**
 * 通用 fetch 封装，统一处理请求与错误
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `请求失败: ${response.status}`);
  }

  return result;
}

/**
 * ① 发布物品信息 POST /api/items
 */
export async function createLostItem(
  payload: CreateLostItemPayload
): Promise<ApiResponse<LostItem>> {
  return request<LostItem>('/api/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * ② 查询全部招领信息 GET /api/items
 */
export async function getAllLostItems(): Promise<ApiResponse<LostItem[]>> {
  return request<LostItem[]>('/api/items', {
    method: 'GET',
  });
}

/**
 * ③ 删除信息 DELETE /api/items/:id
 */
export async function deleteLostItem(id: string): Promise<ApiResponse<null>> {
  return request<null>(`/api/items/${id}`, {
    method: 'DELETE',
  });
}
