'use client';

import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  UnorderedListOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const { Header, Content, Footer } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * 全局布局组件
 * 包含顶部导航栏，链接到三个主要页面
 */
export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  // 根据当前路径高亮对应菜单项
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">首页</Link>,
    },
    {
      key: '/items',
      icon: <UnorderedListOutlined />,
      label: <Link href="/items">失物招领列表</Link>,
    },
    {
      key: '/publish',
      icon: <PlusCircleOutlined />,
      label: <Link href="/publish">发布招领信息</Link>,
    },
  ];

  // 匹配当前路由，用于菜单选中状态
  const selectedKey =
    menuItems.find((item) =>
      item.key === '/' ? pathname === '/' : pathname.startsWith(item.key)
    )?.key || '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#001529',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            marginRight: '40px',
            whiteSpace: 'nowrap',
          }}
        >
          校园失物招领
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>

      {/* 页面主体内容 */}
      <Content>
        <div className="page-container">{children}</div>
      </Content>

      {/* 页脚 */}
      <Footer style={{ textAlign: 'center', color: '#999' }}>
        校园失物招领系统 ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}
