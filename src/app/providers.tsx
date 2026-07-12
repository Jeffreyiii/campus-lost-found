'use client';

import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from '@/lib/auth-context';
import AppLayout from '@/components/AppLayout';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#6C5CE7',
          colorSuccess: '#00B894',
          colorWarning: '#FDCB6E',
          colorError: '#E17055',
          colorInfo: '#74B9FF',
          borderRadius: 10,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 14,
          colorBgContainer: '#FFFFFF',
          colorBgElevated: '#FFFFFF',
          colorBorderSecondary: '#ECEEF5',
          paddingLG: 24,
          paddingMD: 20,
        },
        components: {
          Button: {
            borderRadius: 10,
            controlHeight: 40,
            controlHeightLG: 48,
            fontWeight: 600,
            paddingContentHorizontal: 20,
          },
          Input: {
            borderRadius: 10,
            controlHeight: 44,
            paddingInline: 16,
          },
          Select: {
            borderRadius: 10,
            controlHeight: 44,
          },
          Card: {
            borderRadiusLG: 16,
            paddingLG: 28,
          },
          Table: {
            borderRadiusLG: 12,
            headerBg: '#F8F9FF',
          },
          Tag: {
            borderRadius: 6,
          },
          Menu: {
            itemBorderRadius: 8,
          },
        },
      }}
    >
      <AuthProvider>
        <AppLayout>{children}</AppLayout>
      </AuthProvider>
    </ConfigProvider>
  );
}
