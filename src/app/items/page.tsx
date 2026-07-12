'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Popconfirm,
  message,
  Empty,
  Spin,
} from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getAllLostItems, deleteLostItem } from '@/lib/api';
import type { LostItem } from '@/types/lost-item';

const { Title } = Typography;

/**
 * 失物招领列表页
 * 调用 GET /api/items 获取全部数据，支持删除操作
 */
export default function ItemsPage() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);

  /** 从后端拉取全部招领信息 */
  const fetchItems = async () => {
    setLoading(true);
    try {
      const result = await getAllLostItems();
      setItems(result.data || []);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  /** 删除指定招领信息 */
  const handleDelete = async (id: string) => {
    try {
      await deleteLostItem(id);
      message.success('删除成功');
      // 删除后刷新列表
      fetchItems();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<LostItem> = [
    {
      title: '类型',
      dataIndex: 'item_type',
      key: 'item_type',
      width: 100,
      render: (type: LostItem['item_type']) =>
        type === 'found' ? (
          <Tag color="green">失物招领</Tag>
        ) : (
          <Tag color="orange">寻物启事</Tag>
        ),
    },
    {
      title: '物品名称',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '联系人',
      dataIndex: 'contact_name',
      key: 'contact_name',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
      width: 130,
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="确认删除"
          description="删除后无法恢复，确定要删除这条信息吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space
        style={{
          width: '100%',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          失物招领列表
        </Title>
        <Button icon={<ReloadOutlined />} onClick={fetchItems} loading={loading}>
          刷新
        </Button>
      </Space>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          locale={{ emptyText: <Empty description="暂无招领信息" /> }}
        />
      </Spin>
    </div>
  );
}
