import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticate, isValidPhone, validateLength } from '@/lib/auth-helpers';

const TABLE_NAME = 'lost_items';

/** POST /api/items — 发布物品（需登录） */
export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const data = await request.json();

    // 校验必填字段
    const requiredFields = ['title', 'description', 'location', 'contact_name', 'contact_phone', 'item_type'];
    const missing = requiredFields.filter((f) => !data[f]);
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, message: `缺少必填字段: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // 校验字段长度
    const lengthChecks = [
      validateLength(data, 'title', 100, true),
      validateLength(data, 'description', 500, true),
      validateLength(data, 'location', 100, true),
      validateLength(data, 'contact_name', 50, true),
      validateLength(data, 'contact_phone', 20, true),
      validateLength(data, 'image_url', 500, false),
    ];
    for (const err of lengthChecks) {
      if (err) return NextResponse.json({ success: false, message: err }, { status: 400 });
    }

    // 校验手机号
    if (!isValidPhone(data.contact_phone)) {
      return NextResponse.json(
        { success: false, message: 'contact_phone 格式不正确，请输入有效的手机号' },
        { status: 400 }
      );
    }

    // 校验 item_type
    if (data.item_type !== 'lost' && data.item_type !== 'found') {
      return NextResponse.json(
        { success: false, message: 'item_type 必须为 lost 或 found' },
        { status: 400 }
      );
    }

    const payload = {
      title: data.title,
      description: data.description,
      location: data.location,
      contact_name: data.contact_name,
      contact_phone: data.contact_phone,
      item_type: data.item_type,
      user_id: auth.user_id,
      image_url: data.image_url || null,
      lost_time: data.lost_time || null,
      claim_status: 'unclaimed',
    };

    const client = supabaseAdmin || supabase;
    const { data: item, error } = await client
      .from(TABLE_NAME)
      .insert(payload)
      .select('*')
      .single();

    if (error || !item) {
      return NextResponse.json(
        { success: false, message: `发布失败: ${error?.message || '未知错误'}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: '发布成功', data: item },
      { status: 201 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '发布失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

/** GET /api/items — 查询全部招领信息（公开） */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    let query = supabase.from(TABLE_NAME).select('*').order('created_at', { ascending: false });
    if (userId) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        return NextResponse.json(
          { success: false, message: 'user_id 格式不合法，必须为 UUID 格式' },
          { status: 400 }
        );
      }
      query = query.eq('user_id', userId);
    }

    const { data: items, error } = await query;
    if (error) {
      return NextResponse.json(
        { success: false, message: `查询失败: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '查询成功',
      data: items,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '查询失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
