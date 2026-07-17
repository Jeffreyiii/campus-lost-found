import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

export interface CurrentUser {
  user_id: string;
  username: string;
  role: string;
}

/**
 * 从请求头提取并验证 Bearer token，返回当前用户信息
 * 失败时返回 NextResponse（可直接 return）
 */
export async function authenticate(request: Request): Promise<CurrentUser | NextResponse> {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: '请先登录' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, message: '登录已过期，请重新登录' },
      { status: 401 }
    );
  }

  // 验证用户是否仍存在于数据库中
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('id', payload.user_id as string)
    .maybeSingle();

  if (!user) {
    return NextResponse.json(
      { success: false, message: '用户不存在，请重新登录' },
      { status: 401 }
    );
  }

  return {
    user_id: payload.user_id as string,
    username: payload.username as string,
    role: payload.role as string,
  };
}

/**
 * 管理员校验 —— 先认证再检查 admin 角色
 */
export async function requireAdmin(request: Request): Promise<CurrentUser | NextResponse> {
  const result = await authenticate(request);
  if (result instanceof NextResponse) return result;

  if (result.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: '权限不足，仅管理员可操作' },
      { status: 403 }
    );
  }

  return result;
}

/** UUID 格式校验 */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** 字段长度校验 */
export function validateLength(
  data: Record<string, unknown>,
  field: string,
  maxLen: number,
  required = false
): string | null {
  const val = (data[field] as string) || '';
  if (required && !val) return `${field} 不能为空`;
  if (val && val.length > maxLen) return `${field} 不能超过 ${maxLen} 个字符`;
  return null;
}

/** 手机号格式校验 */
export function isValidPhone(phone: string): boolean {
  return /^1\d{10}$/.test(phone);
}
