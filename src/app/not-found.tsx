'use client';

import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    }}>
      <Result
        status="404"
        title="页面不存在"
        subTitle="您访问的页面不存在或已被移除"
        extra={
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => router.back()}
              className="btn-gradient-primary"
              style={{ height: 44 }}
            >
              返回上页
            </Button>
            <Link href="/">
              <Button size="large" style={{ borderRadius: 10, height: 44, fontWeight: 600 }}>
                返回首页
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
