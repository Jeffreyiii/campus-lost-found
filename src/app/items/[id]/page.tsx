'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Tag,
  Button,
  Typography,
  message,
  Spin,
  Card,
  Image,
  Empty,
  Space,
  Input,
  Divider,
  List,
  Avatar,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  PictureOutlined,
  CalendarOutlined,
  InboxOutlined,
  SendOutlined,
  DeleteOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { getItemDetail, createComment, deleteComment } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { LostItem, Comment } from '@/types/lost-item';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isAdmin } = useAuth();

  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await getItemDetail(id);
      setItem(result.data || null);
    } catch {
      message.error('加载详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text) {
      message.warning('请输入评论内容');
      return;
    }
    if (!user) {
      message.warning('请先登录');
      return;
    }
    setSubmitting(true);
    try {
      await createComment(id, text);
      message.success('评论成功');
      setCommentText('');
      fetchDetail();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(id, commentId);
      message.success('删除成功');
      fetchDetail();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const comments: Comment[] = item?.comments ?? [];

  return (
    <div className="page-container animate-fade-in">
      <Spin spinning={loading}>
        {item ? (
          <>
            {/* 返回按钮 */}
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push('/items')}
              style={{ marginBottom: 16, borderRadius: 8 }}
            >
              返回列表
            </Button>

            <Card
              style={{ borderRadius: 16, border: '1px solid #ECEEF5', marginBottom: 20 }}
              styles={{ body: { padding: 0 } }}
            >
              {/* 图片区 */}
              <div style={{
                height: 280,
                background: 'linear-gradient(135deg, #F8F7FF 0%, #EEEDFD 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    preview={{ mask: '查看大图' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#B0AEC8' }}>
                    <PictureOutlined style={{ fontSize: 64, marginBottom: 8 }} />
                    <div style={{ fontSize: 14 }}>暂无图片</div>
                  </div>
                )}
              </div>

              <div style={{ padding: '24px 28px' }}>
                {/* 标题 + 标签 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <Title level={3} style={{ margin: 0, fontWeight: 700, color: '#1F2937' }}>
                    {item.title}
                  </Title>
                  <Space size={8}>
                    <Tag color={item.item_type === 'found' ? 'green' : 'orange'} style={{ borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                      {item.item_type === 'found' ? '失物招领' : '寻物启事'}
                    </Tag>
                    <Tag color={item.claim_status === 'claimed' ? 'blue' : 'default'} style={{ borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                      {item.claim_status === 'claimed' ? '已认领' : '未认领'}
                    </Tag>
                  </Space>
                </div>

                {/* 描述 */}
                <Paragraph style={{ color: '#4B5563', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
                  {item.description}
                </Paragraph>

                {/* 信息卡片 */}
                <Card style={{ borderRadius: 12, background: '#F9FAFB', border: 'none', marginBottom: 20 }}>
                  <Space direction="vertical" size={14} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <EnvironmentOutlined style={{ color: '#6C5CE7', fontSize: 16 }} />
                      <Text style={{ color: '#374151', fontSize: 14 }}>地点：{item.location}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CalendarOutlined style={{ color: '#6C5CE7', fontSize: 16 }} />
                      <Text style={{ color: '#374151', fontSize: 14 }}>时间：{item.lost_time || '未填写时间'}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <UserOutlined style={{ color: '#6C5CE7', fontSize: 16 }} />
                      <Text style={{ color: '#374151', fontSize: 14 }}>联系人：{item.contact_name}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <PhoneOutlined style={{ color: '#6C5CE7', fontSize: 16 }} />
                      <Text style={{ color: '#374151', fontSize: 14 }}>电话：{item.contact_phone}</Text>
                    </div>
                  </Space>
                </Card>

                <Text type="secondary" style={{ fontSize: 12 }}>
                  发布时间：{new Date(item.created_at).toLocaleString('zh-CN')}
                </Text>
              </div>
            </Card>

            {/* 评论区 */}
            <Card
              title={
                <Space>
                  <MessageOutlined style={{ color: '#6C5CE7' }} />
                  <span style={{ fontWeight: 600 }}>评论 ({comments.length})</span>
                </Space>
              }
              style={{ borderRadius: 16, border: '1px solid #ECEEF5' }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              {/* 发表评论 */}
              {user && (
                <div style={{ marginBottom: 24 }}>
                  <TextArea
                    rows={3}
                    placeholder="说点什么..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={500}
                    showCount
                    style={{ borderRadius: 10, resize: 'none' }}
                  />
                  <div style={{ marginTop: 12, textAlign: 'right' }}>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={submitting}
                      onClick={handleSubmitComment}
                      style={{ borderRadius: 8, background: '#6C5CE7', fontWeight: 600 }}
                    >
                      发表评论
                    </Button>
                  </div>
                </div>
              )}

              {!user && (
                <div style={{ marginBottom: 20, textAlign: 'center', color: '#9CA3AF' }}>
                  <Text type="secondary">请登录后发表评论</Text>
                </div>
              )}

              <Divider style={{ margin: '12px 0 20px' }} />

              {/* 评论列表 */}
              {comments.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={comments}
                  renderItem={(comment) => (
                    <List.Item
                      actions={
                        user && (isAdmin || comment.user_id === user.id) ? [
                          <Popconfirm
                            key="del"
                            title="删除这条评论？"
                            onConfirm={() => handleDeleteComment(comment.id)}
                            okText="删除"
                            cancelText="取消"
                            okButtonProps={{ danger: true, size: 'small' }}
                          >
                            <Button type="text" danger size="small" icon={<DeleteOutlined />}>
                              删除
                            </Button>
                          </Popconfirm>,
                        ] : []
                      }
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ background: '#6C5CE7' }}>
                            {(comment.nickname || '匿')[0]}
                          </Avatar>
                        }
                        title={
                          <Text strong style={{ fontSize: 14 }}>
                            {comment.nickname || '匿名用户'}
                          </Text>
                        }
                        description={
                          <div>
                            <Text style={{ color: '#4B5563', fontSize: 14 }}>{comment.content}</Text>
                            <div style={{ marginTop: 4 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {new Date(comment.created_at).toLocaleString('zh-CN')}
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={<InboxOutlined style={{ fontSize: 48, color: '#C4B5FD' }} />}
                  description="暂无评论，来说两句吧"
                />
              )}
            </Card>
          </>
        ) : (
          !loading && (
            <Card style={{ borderRadius: 16, textAlign: 'center', padding: 60 }}>
              <Empty description="未找到该物品信息" />
              <Button style={{ marginTop: 16 }} onClick={() => router.push('/items')}>
                返回列表
              </Button>
            </Card>
          )
        )}
      </Spin>
    </div>
  );
}
