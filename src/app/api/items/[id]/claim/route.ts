import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticate, isValidUUID } from '@/lib/auth-helpers';

const TABLE_NAME = 'lost_items';

/** PATCH /api/items/[id]/claim — 标记为已认领（需登录） */
export async function PATCH(
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

    const { data: item } = await supabaseAdmin!
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

    if (item.claim_status === 'claimed') {
      return NextResponse.json(
        { success: false, message: '该物品已标记为已认领' },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabaseAdmin!
      .from(TABLE_NAME)
      .update({ claim_status: 'claimed' })
      .eq('id', itemId)
      .select('*')
      .single();

    if (error || !updated) {
      return NextResponse.json(
        { success: false, message: '操作失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '已标记为已认领',
      data: updated,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '操作失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
