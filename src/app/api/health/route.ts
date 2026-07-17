import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

/** GET /api/health — 健康检查 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: '校园失物招领后端运行正常',
    storage: 'supabase',
    supabase_configured: isSupabaseConfigured(),
  });
}
