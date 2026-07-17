import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { authenticate } from '@/lib/auth-helpers';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'item-images';

/** POST /api/items/upload — 上传图片（需登录） */
export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth instanceof NextResponse) return auth;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, message: '云存储未配置' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file || !file.name) {
      return NextResponse.json({ success: false, message: '请选择上传文件' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: '仅支持 JPG / PNG / GIF / WebP 格式' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: '图片大小不能超过 5MB' },
        { status: 400 }
      );
    }

    // 生成唯一文件名
    let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) ext = 'jpg';

    const storagePath = `${auth.user_id}/${uuidv4()}.${ext}`;
    const fileBuffer = await file.arrayBuffer();

    // 使用管理员客户端绕过 Storage RLS
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: '上传失败: 管理员密钥未配置' },
        { status: 500 }
      );
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        cacheControl: 'public, max-age=86400',
      });

    if (uploadError) {
      return NextResponse.json(
        { success: false, message: `云存储上传失败: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      message: '上传成功',
      data: { url: urlData.publicUrl },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '上传失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
