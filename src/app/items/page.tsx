'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tag,
  Button,
  Typography,
  message,
  Spin,
  Card,
  Input,
  Select,
  Row,
  Col,
  Popconfirm,
  Image,
  Empty,
  Space,
  Badge,
  Tooltip,
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  InboxOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  PictureOutlined,
  CalendarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { getAllLostItems, deleteLostItem, markClaimed } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { LostItem } from '@/types/lost-item';

const { Title, Text, Paragraph } = Typography;

export default function ItemsPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllLostItems();
      setItems(result.data || []);
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string) => {
    try {
      await deleteLostItem(id);
      message.success('删除成功');
      fetchItems();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleClaim = async (id: string) => {
    try {
      await markClaimed(id);
      message.success('已标记为已认领');
      fetchItems();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchSearch = !search ||
      item.title.includes(search) ||
      item.description.includes(search) ||
      item.location.includes(search);
    const matchType = typeFilter === 'all' || item.item_type === typeFilter;
    return matchSearch && matchType;
  });

  const claimedCount = items.filter(i => i.claim_status === 'claimed').length;

  const foundCount = items.filter(i => i.item_type === 'found').length;
  const lostCount = items.filter(i => i.item_type === 'lost').length;

  return (
    <div className="page-container animate-fade-in">
      {/* 头部 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 4, fontWeight: 700 }}>
          <InboxOutlined style={{ marginRight: 10, color: '#6C5CE7' }} />
          招领信息
        </Title>
        <Text type="secondary">浏览所有遗失物品和拾取物品信息</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[20, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <div className="stat-card" style={{ padding: '20px 16px' }}>
            <div className="stat-number" style={{ fontSize: 32 }}>{items.length}</div>
            <div className="stat-label">全部信息</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card" style={{ padding: '20px 16px' }}>
            <div className="stat-number" style={{ fontSize: 32, color: '#10B981' }}>
              {foundCount}
            </div>
            <div className="stat-label" style={{ color: '#10B981' }}>失物招领</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card" style={{ padding: '20px 16px' }}>
            <div className="stat-number" style={{ fontSize: 32, color: '#F59E0B' }}>
              {lostCount}
            </div>
            <div className="stat-label" style={{ color: '#F59E0B' }}>寻物启事</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card" style={{ padding: '20px 16px' }}>
            <div className="stat-number" style={{ fontSize: 32, color: '#EC4899' }}>
              {claimedCount}
            </div>
            <div className="stat-label" style={{ color: '#EC4899' }}>已认领</div>
          </div>
        </Col>
      </Row>

      {/* 搜索筛选栏 */}
      <Card style={{ borderRadius: 16, marginBottom: 20, border: '1px solid #ECEEF5' }}
        styles={{ body: { padding: '20px 24px' } }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={14}>
            <Input
              size="large"
              placeholder="搜索标题、描述或地点..."
              prefix={<SearchOutlined style={{ color: '#A0A0B8' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              size="large"
              style={{ width: '100%' }}
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'found', label: '🔍 失物招领' },
                { value: 'lost', label: '📢 寻物启事' },
              ]}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchItems}
              size="large"
              block
              style={{ borderRadius: 10, fontWeight: 600, height: 44 }}
            >
              刷新
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 物品卡片网格 */}
      <Spin spinning={loading}>
        {filteredItems.length > 0 ? (
          <Row gutter={[20, 20]}>
            {filteredItems.map((item) => (
              <Col key={item.id} xs={24} sm={12} lg={8} xl={6}>
                <Badge.Ribbon
                  text={item.item_type === 'found' ? '失物招领' : '寻物启事'}
                  color={item.item_type === 'found' ? '#10B981' : '#F59E0B'}
                  style={{ fontWeight: 600, fontSize: 12 }}
                >
                  <Card
                    hoverable
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '1px solid #F0F0F5',
                      height: '100%',
                    }}
                    styles={{ body: { padding: 0 } }}
                    cover={
                      <div
                        onClick={() => router.push(`/items/${item.id}`)}
                        style={{
                          height: 180,
                          background: 'linear-gradient(135deg, #F8F7FF 0%, #EEEDFD 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                      >
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iMTQiPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4="
                            preview={{ mask: <><EyeOutlined style={{ marginRight: 6 }} />查看大图</> }}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', color: '#B0AEC8' }}>
                            <PictureOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                            <div style={{ fontSize: 13 }}>暂无图片</div>
                          </div>
                        )}
                      </div>
                    }
                    actions={
                      user ? [
                        (isAdmin || item.user_id === user.id) && (
                          item.claim_status === 'unclaimed' ? (
                            <Tooltip title="标记为已认领" key="claim">
                              <Button
                                type="link"
                                size="small"
                                onClick={() => handleClaim(item.id)}
                                style={{ color: '#10B981', fontSize: 13, padding: '0 8px' }}
                              >
                                去认领
                              </Button>
                            </Tooltip>
                          ) : (
                            <Tooltip title="该物品已认领" key="claimed">
                              <Button
                                type="link"
                                size="small"
                                disabled
                                style={{ color: '#9CA3AF', fontSize: 13, padding: '0 8px' }}
                              >
                                已认领
                              </Button>
                            </Tooltip>
                          )
                        ),
                        (isAdmin || item.user_id === user.id) && (
                          <Popconfirm
                            key="delete"
                            title="确认删除这条信息？"
                            description="删除后无法恢复"
                            onConfirm={() => handleDelete(item.id)}
                            okText="删除"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                          >
                            <Tooltip title="删除">
                              <DeleteOutlined style={{ color: '#EF4444', fontSize: 16 }} />
                            </Tooltip>
                          </Popconfirm>
                        ),
                      ].filter(Boolean) : []
                    }
                  >
                    <div
                      onClick={() => router.push(`/items/${item.id}`)}
                      style={{ padding: '16px 20px', cursor: 'pointer' }}
                    >
                      {/* 标题 + 双标签 */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        flexWrap: 'wrap',
                        gap: 6,
                      }}>
                        <Text strong style={{ fontSize: 16, color: '#1F2937', flex: 1, lineHeight: 1.4 }}>
                          {item.title}
                        </Text>
                        <Space size={4}>
                          <Tag
                            color={item.item_type === 'found' ? 'green' : 'orange'}
                            style={{
                              borderRadius: 6,
                              fontWeight: 600,
                              fontSize: 11,
                              marginRight: 0,
                            }}
                          >
                            {item.item_type === 'found' ? '招领' : '寻物'}
                          </Tag>
                          <Tag
                            color={item.claim_status === 'claimed' ? 'blue' : 'default'}
                            style={{ borderRadius: 6, fontWeight: 600, fontSize: 11, marginRight: 0 }}
                          >
                            {item.claim_status === 'claimed' ? '已认领' : '未认领'}
                          </Tag>
                        </Space>
                      </div>

                      {/* 描述 */}
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ color: '#6B7280', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}
                      >
                        {item.description}
                      </Paragraph>

                      {/* 信息行 */}
                      <Space direction="vertical" size={6} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <EnvironmentOutlined style={{ color: '#9CA3AF', fontSize: 13 }} />
                          <Text style={{ color: '#6B7280', fontSize: 13 }}>{item.location}</Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CalendarOutlined style={{ color: '#9CA3AF', fontSize: 13 }} />
                          <Text style={{ color: '#6B7280', fontSize: 13 }}>
                            {item.lost_time ? item.lost_time : '未填写时间'}
                          </Text>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <UserOutlined style={{ color: '#9CA3AF', fontSize: 13 }} />
                          <Text style={{ color: '#6B7280', fontSize: 13 }}>{item.contact_name}</Text>
                          <Text style={{ color: '#D1D5DB', fontSize: 13 }}>|</Text>
                          <PhoneOutlined style={{ color: '#9CA3AF', fontSize: 13 }} />
                          <Text style={{ color: '#6B7280', fontSize: 13 }}>{item.contact_phone}</Text>
                        </div>
                      </Space>
                    </div>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>
        ) : (
          <Card style={{ borderRadius: 16, border: '1px solid #ECEEF5', textAlign: 'center', padding: '60px 20px' }}>
            <Empty
              image={<InboxOutlined style={{ fontSize: 64, color: '#C4B5FD' }} />}
              description={
                <div>
                  <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
                    {search || typeFilter !== 'all' ? '没有匹配的信息' : '暂无招领信息'}
                  </Text>
                  <Text type="secondary">
                    {search || typeFilter !== 'all' ? '试试其他搜索条件' : '还没有人发布招领信息'}
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </Spin>
    </div>
  );
}
