import type { Metadata } from 'next';
import './globals.css';
import 'antd/dist/reset.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '校园失物招领系统',
  description: '帮助校园师生快速发布和查找失物招领信息',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
