import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAdmin, isValidUUID } from '@/lib/auth-helpers';

/** PATCH /api/admin/users/[id]/role — 修改用户角色（不能修改自己） */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const userId = params.id;

    if (userId === auth.user_id) {
      return NextResponse.json(
        { success: false, message: '不能修改自己的角色' },
        { status: 400 }
      );
    }

    if (!isValidUUID(userId)) {
      return NextResponse.json(
        { success: false, message: 'user_id 格式不合法' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const role = body.role;

    if (!role || (role !== 'user' && role !== 'admin')) {
      return NextResponse.json(
        { success: false, message: '角色必须为 user 或 admin' },
        { status: 400 }
      );
    }

    // 检查用户是否存在
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

    const { data: updated, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select('id, username, nickname, role, created_at')
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { success: false, message: '更新失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `用户 ${user.username} 角色已更新为 ${role}`,
      data: updated,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '操作失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
