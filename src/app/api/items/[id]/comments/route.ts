import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticate, isValidUUID } from '@/lib/auth-helpers';

const TABLE_NAME = 'comments';

/** GET /api/items/[id]/comments — 获取评论列表 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      .from('lost_items')
      .select('id')
      .eq('id', itemId)
      .maybeSingle();

    if (!item) {
      return NextResponse.json(
        { success: false, message: '未找到该物品信息' },
        { status: 404 }
      );
    }

    const { data: comments, error } = await supabase
      .from(TABLE_NAME)
      .select('*, users(nickname, username)')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) {
      // 表不存在时静默回退
      if (error.code === 'PGRST205') return NextResponse.json({ success: true, message: '查询成功', data: [] });
      return NextResponse.json({ success: false, message: `查询失败: ${error.message}` }, { status: 500 });
    }

    const flat = (comments || []).map((row: Record<string, unknown>) => {
      const u = (row.users as Record<string, string>) || {};
      return { ...row, nickname: u.nickname || u.username || '匿名用户', users: undefined };
    });

    return NextResponse.json({ success: true, message: '查询成功', data: flat });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '查询失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/** POST /api/items/[id]/comments — 发表评论（需登录） */
export async function POST(
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
      .from('lost_items')
      .select('id')
      .eq('id', itemId)
      .maybeSingle();

    if (!item) {
      return NextResponse.json(
        { success: false, message: '未找到该物品信息' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const content = (body.content || '').trim();

    if (!content) {
      return NextResponse.json(
        { success: false, message: '评论内容不能为空' },
        { status: 400 }
      );
    }
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, message: '评论内容不能超过 500 字' },
        { status: 400 }
      );
    }

    const client = supabaseAdmin || supabase;
    const { data: comment, error } = await client
      .from(TABLE_NAME)
      .insert({ item_id: itemId, user_id: auth.user_id, content })
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST205') {
        return NextResponse.json(
          { success: false, message: '评论功能暂未配置，请稍后重试' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { success: false, message: `评论失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: '评论成功', data: comment },
      { status: 201 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '评论失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
