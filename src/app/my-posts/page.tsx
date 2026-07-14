'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  Tag,
  Typography,
  Button,
  message,
  Spin,
  Empty,
  Popconfirm,
  Tooltip,
  Row,
  Col,
} from 'antd';
import {
  DeleteOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  PlusCircleOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { getAllLostItems, deleteLostItem, markClaimed } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { LostItem } from '@/types/lost-item';

const { Title, Text, Paragraph } = Typography;

export default function MyPostsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getAllLostItems(user.id);
      setItems(result.data || []);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchMyItems(); }, [fetchMyItems]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLostItem(id);
      message.success('已删除');
      fetchMyItems();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleClaim = async (id: string) => {
    try {
      await markClaimed(id);
      message.success('已标记为已认领');
      fetchMyItems();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  const unclaimedCount = items.filter((i) => i.claim_status === 'unclaimed').length;
  const claimedCount = items.filter((i) => i.claim_status === 'claimed').length;

  if (!user) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Empty description="请先登录后查看" />
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
      {/* 顶部区域 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 28,
      }}>
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/items')}
            style={{ marginBottom: 8, color: '#6B7280' }}
          >
            返回招领信息
          </Button>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
            <InboxOutlined style={{ marginRight: 10, color: '#6C5CE7' }} />
            我的发布
          </Title>
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
            共 {items.length} 条发布 · {unclaimedCount} 条未认领 · {claimedCount} 条已认领
          </Text>
        </div>

        <Link href="/publish">
          <Button type="primary" icon={<PlusCircleOutlined />} size="large" style={{ borderRadius: 10, fontWeight: 600 }}>
            发布新信息
          </Button>
        </Link>
      </div>

      <Spin spinning={loading}>
        {items.length > 0 ? (
          <Row gutter={[16, 16]}>
            {items.map((item) => (
              <Col xs={24} sm={12} key={item.id}>
                <Card
                  hoverable
                  style={{ borderRadius: 14, border: '1px solid #ECEEF5', overflow: 'hidden' }}
                  styles={{ body: { padding: 20 } }}
                  onClick={() => router.push(`/items/${item.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    {/* 缩略图 */}
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 10,
                        background: item.image_url
                          ? `url(${item.image_url}) center/cover no-repeat`
                          : 'linear-gradient(135deg, #F8F7FF 0%, #EEEDFD 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        flexShrink: 0,
                        color: '#C4B5FD',
                      }}
                    >
                      {!item.image_url && <InboxOutlined />}
                    </div>

                    {/* 内容区 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <Tag
                          color={item.item_type === 'found' ? 'success' : 'warning'}
                          style={{ borderRadius: 6, fontWeight: 600, margin: 0 }}
                        >
                          {item.item_type === 'found' ? '失物招领' : '寻物启事'}
                        </Tag>
                        <Tag
                          color={item.claim_status === 'claimed' ? 'default' : 'processing'}
                          style={{ borderRadius: 6, margin: 0 }}
                        >
                          {item.claim_status === 'claimed' ? '已认领' : '待认领'}
                        </Tag>
                      </div>

                      <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>
                        {item.title}
                      </Text>
                      <Paragraph
                        ellipsis={{ rows: 1 }}
                        style={{ color: '#6B7280', fontSize: 13, marginBottom: 8 }}
                      >
                        {item.description}
                      </Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        发布于 {new Date(item.created_at).toLocaleDateString('zh-CN')}
                      </Text>

                      {/* 操作按钮 */}
                      <div
                        style={{ display: 'flex', gap: 8, marginTop: 12, borderTop: '1px solid #F3F4F6', paddingTop: 10 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.claim_status === 'unclaimed' && (
                          <Tooltip title="标记为已认领">
                            <Button
                              type="link"
                              size="small"
                              icon={<CheckCircleOutlined />}
                              onClick={() => handleClaim(item.id)}
                              style={{ color: '#10B981', fontSize: 13, padding: 0 }}
                            >
                              去认领
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip title="查看详情">
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => router.push(`/items/${item.id}`)}
                            style={{ color: '#6C5CE7', fontSize: 13, padding: 0 }}
                          >
                            详情
                          </Button>
                        </Tooltip>
                        <Popconfirm
                          title="确认删除这条信息？"
                          description="删除后无法恢复"
                          onConfirm={() => handleDelete(item.id)}
                          okText="删除"
                          cancelText="取消"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="link"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            style={{ fontSize: 13, padding: 0 }}
                          >
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            image={<InboxOutlined style={{ fontSize: 64, color: '#D1D5DB' }} />}
            description="你还没有发布过任何信息"
          >
            <Link href="/publish">
              <Button type="primary" icon={<PlusCircleOutlined />} style={{ borderRadius: 10 }}>
                立即发布
              </Button>
            </Link>
          </Empty>
        )}
      </Spin>
    </div>
  );
}
