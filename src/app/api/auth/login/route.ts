import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || '').trim().toLowerCase();
    const password = body.password || '';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
      return NextResponse.json(
        { success: false, message: '用户名或密码错误' },
        { status: 401 }
      );
    }

    const token = await signToken({
      user_id: user.id,
      username: user.username,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname || '',
          role: user.role,
        },
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '登录失败';
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
