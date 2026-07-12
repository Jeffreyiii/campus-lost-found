import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import AppLayout from '@/components/AppLayout';
import './globals.css';

export const metadata: Metadata = {
  title: '校园失物招领系统',
  description: '帮助校园师生快速发布和查找失物招领信息',
};

/**
 * 根布局
 * AntdRegistry 用于在 Next.js App Router 中正确渲染 Ant Design 组件（SSR 兼容）
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <AppLayout>{children}</AppLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
