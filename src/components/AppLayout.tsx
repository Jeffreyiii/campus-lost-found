'use client';

import { useState } from 'react';
import {
  Layout,
  Button,
  Dropdown,
  Avatar,
  Drawer,
  Space,
} from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyOutlined,
  SettingOutlined,
  MenuOutlined,
  InboxOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const { Header, Content, Footer } = Layout;

/** 获取用户名首字母对应的颜色 */
function stringToColor(str: string): string {
  const colors = ['#6C5CE7', '#A855F7', '#EC4899', '#F97316', '#14B8A6', '#3B82F6', '#EF4444'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, login, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/items', icon: <SearchOutlined />, label: '招领信息' },
    ...(user
      ? [
          { key: '/publish', icon: <PlusCircleOutlined />, label: '发布信息' },
          { key: '/my-posts', icon: <FileTextOutlined />, label: '我的发布' },
        ]
      : []),
    { key: '/guide', icon: <SafetyOutlined />, label: '使用指南' },
    ...(isAdmin
      ? [{ key: '/admin', icon: <SettingOutlined />, label: '后台管理' }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const userMenuItems = [
    {
      key: 'info',
      disabled: true,
      icon: <SafetyOutlined />,
      label: (
        <span style={{ fontWeight: 600 }}>
          {user?.nickname || user?.username}
          <span style={{
            fontSize: 12,
            marginLeft: 8,
            color: isAdmin ? '#A855F7' : '#6B7280',
            background: isAdmin ? '#F3EEFF' : '#F3F4F6',
            padding: '2px 8px',
            borderRadius: 4,
            fontWeight: 600,
          }}>
            {isAdmin ? '管理员' : '用户'}
          </span>
        </span>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#F5F6FA' }}>
      {/* ---------- 顶部导航 ---------- */}
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          padding: '0 32px',
          background: 'linear-gradient(135deg, #4338CA 0%, #6C5CE7 50%, #7C3AED 100%)',
          boxShadow: '0 4px 20px rgba(108, 92, 231, 0.3)',
        }}
      >
        {/* 左侧：Logo + 导航 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: 18,
            }}>
              <InboxOutlined style={{ color: '#fff' }} />
            </div>
            <span style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '-0.3px',
            }}>
              校园失物招领
            </span>
          </Link>

          {/* 桌面端导航 */}
          <nav style={{ display: 'flex', gap: 4 }}>
            {navItems.map((item) => {
              const isActive = pathname === item.key;
              return (
                <Link key={item.key} href={item.key}>
                  <Button
                    type="text"
                    icon={item.icon}
                    style={{
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                      borderRadius: 10,
                      fontWeight: isActive ? 700 : 500,
                      background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                      padding: '4px 16px',
                      height: 36,
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 右侧：用户区域 / 登录注册 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 移动端菜单按钮 */}
          <Button
            className="mobile-only"
            type="text"
            icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
            onClick={() => setDrawerOpen(true)}
            style={{ display: 'none' }}
          />

          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                padding: '4px 14px 4px 4px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              >
                <Avatar
                  size={32}
                  style={{
                    backgroundColor: stringToColor(user.username),
                    verticalAlign: 'middle',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {(user.nickname || user.username).charAt(0).toUpperCase()}
                </Avatar>
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                  {user.nickname || user.username}
                </span>
              </div>
            </Dropdown>
          ) : (
            <Space>
              <Link href="/login">
                <Button
                  style={{
                    borderRadius: 10,
                    fontWeight: 600,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.35)',
                    background: 'rgba(255,255,255,0.08)',
                    height: 36,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                  }}
                >
                  登录
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  style={{
                    borderRadius: 10,
                    fontWeight: 600,
                    background: '#fff',
                    color: '#6C5CE7',
                    border: 'none',
                    height: 36,
                  }}
                >
                  注册
                </Button>
              </Link>
            </Space>
          )}
        </div>
      </Header>

      {/* 移动端侧边抽屉 */}
      <Drawer
        title="校园失物招领"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={260}
      >
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => (
            <Link key={item.key} href={item.key} onClick={() => setDrawerOpen(false)}>
              <Button
                type={pathname === item.key ? 'primary' : 'text'}
                icon={item.icon}
                block
                style={{
                  justifyContent: 'flex-start',
                  height: 44,
                  borderRadius: 10,
                  fontWeight: pathname === item.key ? 700 : 500,
                  fontSize: 15,
                }}
              >
                {item.label}
              </Button>
            </Link>
          ))}

          {!user ? (
            <>
              <div style={{ height: 1, background: '#ECEEF5', margin: '8px 0' }} />
              <Link href="/login" onClick={() => setDrawerOpen(false)}>
                <Button block icon={<UserOutlined />} style={{ marginBottom: 8, borderRadius: 10, height: 44 }}>
                  登录
                </Button>
              </Link>
              <Link href="/register" onClick={() => setDrawerOpen(false)}>
                <Button type="primary" block icon={<PlusCircleOutlined />} style={{ borderRadius: 10, height: 44 }}>
                  注册
                </Button>
              </Link>
            </>
          ) : (
            <>
              <div style={{ height: 1, background: '#ECEEF5', margin: '8px 0' }} />
              <Button danger block icon={<LogoutOutlined />} onClick={() => { handleLogout(); setDrawerOpen(false); }} style={{ borderRadius: 10, height: 44 }}>
                退出登录
              </Button>
            </>
          )}
        </nav>
      </Drawer>

      {/* ---------- 主内容区 ---------- */}
      <Content style={{ flex: 1 }}>
        {children}
      </Content>

      {/* ---------- 底部 ---------- */}
      <Footer style={{
        textAlign: 'center',
        color: '#9CA3AF',
        background: '#fff',
        borderTop: '1px solid #ECEEF5',
        padding: '24px',
        fontSize: 13,
      }}>
        校园失物招领系统 © {new Date().getFullYear()} - 让每件遗失物品都能找到主人
      </Footer>

      {/* 移动端响应式样式 */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-only { display: inline-flex !important; }
          header nav { display: none !important; }
        }
      `}</style>
    </Layout>
  );
}
