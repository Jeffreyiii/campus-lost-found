import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || '').trim().toLowerCase();
    const password = body.password || '';
    const nickname = (body.nickname || '').trim() || username;

    if (!username || username.length < 2) {
      return NextResponse.json(
        { success: false, message: '用户名至少需要 2 个字符' },
        { status: 400 }
      );
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { success: false, message: '用户名仅支持字母、数字和下划线' },
        { status: 400 }
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: '密码至少需要 6 个字符' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, message: '用户名已被注册' },
        { status: 400 }
      );
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        username,
        password_hash: passwordHash,
        role: 'user',
        nickname,
      })
      .select('id, username, nickname, role, created_at')
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: '注册失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '注册成功',
        data: {
          id: user.id,
          username: user.username,
          role: user.role,
          nickname: user.nickname,
        },
      },
      { status: 201 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '注册失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
