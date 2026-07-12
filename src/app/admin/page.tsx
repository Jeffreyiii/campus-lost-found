'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Button,
  Typography,
  message,
  Spin,
  Card,
  Row,
  Col,
  Popconfirm,
  Space,
  Avatar,
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
  CrownOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getAllUsers, deleteUser, updateUserRole, getAllLostItems } from '@/lib/api';
import type { LostItem } from '@/types/lost-item';

const { Title, Text } = Typography;

function stringToColor(str: string): string {
  const colors = ['#6C5CE7', '#A855F7', '#EC4899', '#F97316', '#14B8A6', '#3B82F6', '#EF4444'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setItemsLoading(true);
    try {
      const [usersResult, itemsResult] = await Promise.all([
        getAllUsers(),
        getAllLostItems(),
      ]);
      setUsers(usersResult.data || []);
      setItems(itemsResult.data || []);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) { router.push('/'); return; }
    fetchData();
  }, [isAdmin, router, fetchData]);

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      message.success('用户已删除');
      fetchData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await updateUserRole(userId, newRole);
      message.success('角色已更新');
      fetchData();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新失败');
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  const userColumns = [
    {
      title: '用户',
      key: 'user',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar size={36} style={{ backgroundColor: stringToColor(record.username), fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {(record.nickname || record.username).charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: '#1F2937' }}>{record.nickname || record.username}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>@{record.username}</Text>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag
          color={role === 'admin' ? 'purple' : 'default'}
          style={{ borderRadius: 6, fontWeight: 600, fontSize: 12 }}
          icon={role === 'admin' ? <CrownOutlined /> : <UserOutlined />}
        >
          {role === 'admin' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {new Date(text).toLocaleDateString('zh-CN')}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          {record.role === 'admin' ? (
            <Button
              type="link"
              size="small"
              style={{ borderRadius: 8 }}
              onClick={() => handleRoleChange(record.id, 'user')}
            >
              降级为用户
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              style={{ borderRadius: 8, color: '#A855F7' }}
              onClick={() => handleRoleChange(record.id, 'admin')}
            >
              升级为管理员
            </Button>
          )}
          <Popconfirm
            title="确认删除"
            description={`确定要删除 @${record.username} 吗？`}
            onConfirm={() => handleDeleteUser(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />} style={{ borderRadius: 8 }}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (!isAdmin) return null;

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <Link href="/">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginBottom: 12, fontWeight: 600, color: '#6B7280' }}>
            返回首页
          </Button>
        </Link>
        <Title level={3} style={{ marginBottom: 4, fontWeight: 700 }}>
          <SecurityScanOutlined style={{ marginRight: 10, color: '#A855F7' }} />
          后台管理
        </Title>
        <Text type="secondary">管理用户和查看系统状态</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={6}>
          <div className="stat-card">
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">
              <TeamOutlined /> 总用户数
            </div>
          </div>
        </Col>
        <Col xs={24} sm={6}>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#A855F7' }}>{adminCount}</div>
            <div className="stat-label">
              <CrownOutlined style={{ color: '#A855F7' }} /> 管理员
            </div>
          </div>
        </Col>
        <Col xs={24} sm={6}>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#3B82F6' }}>{userCount}</div>
            <div className="stat-label">
              <UserOutlined style={{ color: '#3B82F6' }} /> 普通用户
            </div>
          </div>
        </Col>
        <Col xs={24} sm={6}>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#00B894' }}>{items.length}</div>
            <div className="stat-label">
              <SafetyOutlined style={{ color: '#00B894' }} /> 物品总数
            </div>
          </div>
        </Col>
      </Row>

      {/* 用户列表 */}
      <Card
        style={{ borderRadius: 16, border: '1px solid #ECEEF5', marginBottom: 24 }}
        styles={{ body: { padding: '24px 28px' } }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>用户管理</span>
            <Button icon={<ReloadOutlined />} onClick={fetchData} style={{ borderRadius: 8 }}>
              刷新
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          {users.length > 0 ? (
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 位用户` }}
            />
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <TeamOutlined />
              <h3>暂无用户</h3>
              <p>还没有用户注册</p>
            </div>
          )}
        </Spin>
      </Card>

      {/* 物品概览 */}
      <Card
        style={{ borderRadius: 16, border: '1px solid #ECEEF5' }}
        styles={{ body: { padding: '24px 28px' } }}
        title={<span style={{ fontWeight: 700, fontSize: 16 }}>物品概览</span>}
      >
        <Spin spinning={itemsLoading}>
          <Row gutter={[20, 20]}>
            <Col xs={24} sm={8}>
              <div className="stat-card" style={{ padding: '24px 16px' }}>
                <div className="stat-number" style={{ fontSize: 36 }}>{items.length}</div>
                <div className="stat-label">总物品数</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="stat-card" style={{ padding: '24px 16px' }}>
                <div className="stat-number" style={{ fontSize: 36, color: '#00B894' }}>
                  {items.filter(i => i.item_type === 'found').length}
                </div>
                <div className="stat-label">失物招领</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="stat-card" style={{ padding: '24px 16px' }}>
                <div className="stat-number" style={{ fontSize: 36, color: '#F97316' }}>
                  {items.filter(i => i.item_type === 'lost').length}
                </div>
                <div className="stat-label">寻物启事</div>
              </div>
            </Col>
          </Row>
        </Spin>
      </Card>
    </div>
  );
}
