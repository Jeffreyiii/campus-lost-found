'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Tag,
  message,
  Spin,
  Space,
} from 'antd';
import {
  SearchOutlined,
  PlusCircleOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
  InboxOutlined,
  BellOutlined,
  LoginOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getAllLostItems } from '@/lib/api';
import type { LostItem } from '@/types/lost-item';

const { Title, Paragraph, Text } = Typography;

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatest();
  }, []);

  const fetchLatest = async () => {
    try {
      const result = await getAllLostItems();
      setItems(result.data || []);
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  const latestItems = items.slice(0, 4);
  const foundCount = items.filter((i) => i.item_type === 'found').length;
  const lostCount = items.filter((i) => i.item_type === 'lost').length;

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="hero-section">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <InboxOutlined />
          </div>
        </div>
        <h1>校园失物招领</h1>
        <p>帮助校园师生快速发布和查找失物招领信息，让遗失物品更快回家</p>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
          <Link href="/items">
            <Button size="large" icon={<SearchOutlined />} style={{ borderRadius: 12, fontWeight: 600, height: 46, padding: '0 28px' }}>
              浏览招领信息
            </Button>
          </Link>
          <Link href="/publish">
            <Button size="large" type="primary" icon={<PlusCircleOutlined />}
              style={{
                borderRadius: 12, fontWeight: 600, height: 46, padding: '0 28px',
                background: '#fff', color: '#6C5CE7', border: 'none',
                boxShadow: '0 4px 20px rgba(255,255,255,0.3)',
              }}>
              发布招领信息
            </Button>
          </Link>
        </div>
      </section>

      <div className="page-container" style={{ marginTop: -40, position: 'relative', zIndex: 10 }}>
        {/* ---------- 统计卡片 ---------- */}
        <Row gutter={[20, 20]} style={{ marginBottom: 36 }}>
          <Col xs={24} sm={8}>
            <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0s' }}>
              <div className="stat-number">{items.length}</div>
              <div className="stat-label">
                <EyeOutlined /> 总发布数
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="stat-number" style={{ color: '#00B894' }}>{foundCount}</div>
              <div className="stat-label">
                <InboxOutlined style={{ color: '#00B894' }} /> 失物招领
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div className="stat-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="stat-number" style={{ color: '#F97316' }}>{lostCount}</div>
              <div className="stat-label">
                <BellOutlined style={{ color: '#F97316' }} /> 寻物启事
              </div>
            </div>
          </Col>
        </Row>

        {/* ---------- 快速入口 ---------- */}
        <div className="page-header animate-fade-in">
          <h2>快速入口</h2>
        </div>
        <div className="feature-grid" style={{ marginBottom: 36 }}>
          <Link href="/items">
            <div className="feature-card animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <div className="icon-wrapper" style={{ background: '#EEEDFD', color: '#6C5CE7' }}><SearchOutlined /></div>
              <h3>浏览招领信息</h3>
              <p>查看所有失物招领和寻物启事</p>
              <Text type="secondary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
                立即查看 <ArrowRightOutlined />
              </Text>
            </div>
          </Link>
          <Link href="/publish">
            <div className="feature-card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
              <div className="icon-wrapper" style={{ background: '#E8FAF2', color: '#00B894' }}><PlusCircleOutlined /></div>
              <h3>发布招领信息</h3>
              <p>捡到或丢失物品？快速发布</p>
              <Text type="secondary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
                立即发布 <ArrowRightOutlined />
              </Text>
            </div>
          </Link>
          <Link href="/guide">
            <div className="feature-card animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <div className="icon-wrapper" style={{ background: '#FFF4E5', color: '#F97316' }}><SafetyOutlined /></div>
              <h3>使用指南</h3>
              <p>了解平台功能与使用规范</p>
              <Text type="secondary" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
                查看指南 <ArrowRightOutlined />
              </Text>
            </div>
          </Link>
        </div>

        {/* ---------- 最新招领 ---------- */}
        <div className="page-header animate-fade-in">
          <h2>最新招领信息</h2>
          <Link href="/items">
            <Button type="link" icon={<ArrowRightOutlined />} style={{ fontWeight: 600 }}>查看全部</Button>
          </Link>
        </div>

        <Spin spinning={loading}>
          <Row gutter={[20, 20]}>
            {latestItems.length > 0 ? (
              latestItems.map((item, idx) => (
                <Col xs={24} sm={12} md={6} key={item.id}>
                  <Card
                    hoverable
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 0.1}s`, borderRadius: 16, overflow: 'hidden', border: '1px solid #ECEEF5', height: '100%' }}
                    styles={{ body: { padding: 22 } }}
                    onClick={() => router.push('/items')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <Tag color={item.item_type === 'found' ? 'success' : 'warning'} style={{ borderRadius: 6, fontWeight: 600, margin: 0 }}>
                        {item.item_type === 'found' ? '失物招领' : '寻物启事'}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(item.created_at).toLocaleDateString('zh-CN')}
                      </Text>
                    </div>
                    <Title level={5} style={{ margin: 0, marginBottom: 8, fontSize: 15, lineHeight: 1.4, fontWeight: 600 }}>
                      {item.title}
                    </Title>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#6B7280', fontSize: 13, marginBottom: 14, minHeight: 36 }}>
                      {item.description}
                    </Paragraph>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9CA3AF', fontSize: 13 }}>
                      <SafetyOutlined /> {item.location}
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div className="empty-state">
                  <InboxOutlined />
                  <h3>暂无招领信息</h3>
                  <p>快来发布第一条信息吧！</p>
                  <Button type="primary" size="large" onClick={() => router.push('/publish')} style={{ borderRadius: 10, height: 44 }}>
                    发布招领信息
                  </Button>
                </div>
              </Col>
            )}
          </Row>
        </Spin>

        {/* ---------- 未登录引导 ---------- */}
        {!user && (
          <div className="card-container animate-fade-in" style={{
            marginTop: 36,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #F8F7FF 0%, #F3EEFF 100%)',
            border: '1px solid #DDD6FE',
          }}>
            <Title level={4} style={{ marginBottom: 8, fontWeight: 700, color: '#4C1D95' }}>还没登录？</Title>
            <Paragraph style={{ color: '#6B7280', marginBottom: 24 }}>
              登录后即可发布招领信息，管理自己发布的记录
            </Paragraph>
            <Space size={12}>
              <Link href="/login">
                <Button type="primary" size="large" icon={<LoginOutlined />} className="btn-gradient-primary" style={{ height: 46 }}>
                  立即登录
                </Button>
              </Link>
              <Link href="/register">
                <Button size="large" icon={<PlusCircleOutlined />} style={{ borderRadius: 10, height: 46, fontWeight: 600 }}>
                  注册账号
                </Button>
              </Link>
            </Space>
          </div>
        )}
      </div>
    </div>
  );
}
