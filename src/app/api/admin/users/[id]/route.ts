import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin, isValidUUID } from '@/lib/auth-helpers';

/** GET /api/admin/users/[id] — 获取单个用户详情 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const userId = params.id;
    if (!isValidUUID(userId)) {
      return NextResponse.json(
        { success: false, message: 'user_id 格式不合法' },
        { status: 400 }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, username, nickname, role, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '查询失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/** DELETE /api/admin/users/[id] — 删除用户（不能删除自己） */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const userId = params.id;

    if (userId === auth.user_id) {
      return NextResponse.json(
        { success: false, message: '不能删除自己的账号' },
        { status: 400 }
      );
    }

    if (!isValidUUID(userId)) {
      return NextResponse.json(
        { success: false, message: 'user_id 格式不合法' },
        { status: 400 }
      );
    }

    // 先检查用户是否存在
    const { data: user } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 400 }
      );
    }

    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      return NextResponse.json(
        { success: false, message: `删除失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `用户 ${user.username} 已删除`,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '删除失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
