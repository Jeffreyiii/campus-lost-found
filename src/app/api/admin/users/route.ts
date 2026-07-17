import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin, isValidUUID } from '@/lib/auth-helpers';

/** GET /api/admin/users — 获取所有用户列表（需管理员） */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, nickname, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, message: `查询失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '查询成功',
      count: users.length,
      data: users,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '查询失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
