import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticate, isValidUUID } from '@/lib/auth-helpers';

/** DELETE /api/items/[id]/comments/[commentId] — 删除评论（需登录，仅本人或管理员） */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  const auth = await authenticate(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id: itemId, commentId } = params;

    if (!isValidUUID(itemId)) {
      return NextResponse.json(
        { success: false, message: 'item_id 格式不合法' },
        { status: 400 }
      );
    }
    if (!isValidUUID(commentId)) {
      return NextResponse.json(
        { success: false, message: 'comment_id 格式不合法' },
        { status: 400 }
      );
    }

    // 检查评论是否存在
    const { data: comment } = await supabase
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .maybeSingle();

    if (!comment) {
      return NextResponse.json(
        { success: false, message: '未找到该评论' },
        { status: 404 }
      );
    }

    // 权限校验
    if (auth.role !== 'admin' && comment.user_id !== auth.user_id) {
      return NextResponse.json(
        { success: false, message: '无权删除他人评论' },
        { status: 403 }
      );
    }

    const client = supabaseAdmin || supabase;
    const { error } = await client.from('comments').delete().eq('id', commentId);

    if (error) {
      return NextResponse.json(
        { success: false, message: `删除失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '删除失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
