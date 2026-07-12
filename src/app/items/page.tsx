'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  message,
  Spin,
  Card,
  Input,
  Select,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  InboxOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { getAllLostItems, deleteLostItem } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { LostItem } from '@/types/lost-item';

const { Title, Text } = Typography;

export default function ItemsPage() {
  const { user, token, isAdmin } = useAuth();
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

  const filteredItems = items.filter((item) => {
    const matchSearch = !search || item.title.includes(search) || item.description.includes(search) || item.location.includes(search);
    const matchType = typeFilter === 'all' || item.item_type === typeFilter;
    return matchSearch && matchType;
  });

  const columns = [
    {
      title: '类型',
      dataIndex: 'item_type',
      key: 'item_type',
      width: 110,
      render: (type: string) => (
        <Tag
          color={type === 'found' ? 'success' : 'warning'}
          style={{ borderRadius: 6, fontWeight: 600, fontSize: 13, padding: '2px 12px' }}
        >
          {type === 'found' ? '失物招领' : '寻物启事'}
        </Tag>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <span style={{ fontWeight: 600, color: '#1F2937' }}>{text}</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => <span style={{ color: '#6B7280' }}>{text}</span>,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 130,
      render: (text: string) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
          <SafetyOutlined style={{ color: '#9CA3AF' }} /> {text}
        </span>
      ),
    },
    {
      title: '联系人',
      dataIndex: 'contact_name',
      key: 'contact_name',
      width: 100,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {new Date(text).toLocaleDateString('zh-CN')}
        </Text>
      ),
    },
    ...(user ? [{
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: LostItem) => (
        <Popconfirm
          title="确认删除"
          description="删除后无法恢复"
          onConfirm={() => handleDelete(record.id)}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" style={{ borderRadius: 8 }}>
            删除
          </Button>
        </Popconfirm>
      ),
    }] : []),
  ];

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

      {/* 统计 + 搜索 */}
      <Row gutter={[20, 16]} style={{ marginBottom: 20 }}>
        <Col xs={12} sm={6}>
          <div className="stat-card" style={{ padding: '20px 16px' }}>
            <div className="stat-number" style={{ fontSize: 32 }}>{items.length}</div>
            <div className="stat-label">全部</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card" style={{ padding: '20px 16px' }}>
            <div className="stat-number" style={{ fontSize: 32, color: '#00B894' }}>
              {items.filter(i => i.item_type === 'found').length}
            </div>
            <div className="stat-label" style={{ color: '#00B894' }}>失物招领</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card" style={{ padding: '20px 16px' }}>
            <div className="stat-number" style={{ fontSize: 32, color: '#F97316' }}>
              {items.filter(i => i.item_type === 'lost').length}
            </div>
            <div className="stat-label" style={{ color: '#F97316' }}>寻物启事</div>
          </div>
        </Col>
        <Col xs={12} sm={6}>
          <div className="stat-card" style={{ padding: '20px 16px' }}>
            <div className="stat-number" style={{ fontSize: 32, color: '#A855F7' }}>
              {items.length > 0 ? Math.round(items.filter(i => i.item_type === 'found').length / items.length * 100) : 0}%
            </div>
            <div className="stat-label" style={{ color: '#A855F7' }}>找回率</div>
          </div>
        </Col>
      </Row>

      {/* 搜索栏 */}
      <Card style={{ borderRadius: 16, marginBottom: 20, border: '1px solid #ECEEF5' }} styles={{ body: { padding: '20px 24px' } }}>
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
                { value: 'all', label: '全部' },
                { value: 'found', label: '失物招领' },
                { value: 'lost', label: '寻物启事' },
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

      {/* 表格 */}
      <Spin spinning={loading}>
        {filteredItems.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredItems}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            style={{ background: '#fff', borderRadius: 16, overflow: 'hidden' }}
          />
        ) : (
          <div className="empty-state">
            <InboxOutlined />
            <h3>{search || typeFilter !== 'all' ? '没有匹配的信息' : '暂无招领信息'}</h3>
            <p>{search || typeFilter !== 'all' ? '试试其他搜索条件' : '还没有人发布招领信息'}</p>
          </div>
        )}
      </Spin>
    </div>
  );
}
