import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticate, isValidUUID } from '@/lib/auth-helpers';

const TABLE_NAME = 'lost_items';

/** GET /api/items/[id] — 获取物品详情（含评论） */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = params.id;
    if (!isValidUUID(itemId)) {
      return NextResponse.json(
        { success: false, message: 'item_id 格式不合法，必须为 UUID 格式' },
        { status: 400 }
      );
    }

    const { data: item, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', itemId)
      .maybeSingle();

    if (error || !item) {
      return NextResponse.json(
        { success: false, message: '未找到该物品信息' },
        { status: 404 }
      );
    }

    // 查询评论（带用户信息）
    const { data: comments } = await supabase
      .from('comments')
      .select('*, users(nickname, username)')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    const flatComments = (comments || []).map((row: Record<string, unknown>) => {
      const userInfo = (row.users as Record<string, string>) || {};
      return {
        ...row,
        nickname: userInfo.nickname || userInfo.username || '匿名用户',
        users: undefined,
      };
    });

    return NextResponse.json({
      success: true,
      message: '查询成功',
      data: { ...item, comments: flatComments },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '查询失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/** DELETE /api/items/[id] — 删除物品（需登录，仅本人或管理员） */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await authenticate(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const itemId = params.id;
    if (!isValidUUID(itemId)) {
      return NextResponse.json(
        { success: false, message: 'item_id 格式不合法' },
        { status: 400 }
      );
    }

    // 检查物品是否存在
    const { data: item } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', itemId)
      .maybeSingle();

    if (!item) {
      return NextResponse.json(
        { success: false, message: '未找到该物品信息' },
        { status: 404 }
      );
    }

    // 权限校验
    if (auth.role !== 'admin' && item.user_id !== auth.user_id) {
      return NextResponse.json(
        { success: false, message: '无权删除他人发布的物品' },
        { status: 403 }
      );
    }

    const client = supabaseAdmin || supabase;
    const { error } = await client.from(TABLE_NAME).delete().eq('id', itemId);

    if (error) {
      return NextResponse.json(
        { success: false, message: `删除失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: '删除成功', data: null });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '删除失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
