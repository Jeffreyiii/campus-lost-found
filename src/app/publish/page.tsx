'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  message,
  Card,
  Space,
  Divider,
  Row,
  Col,
  Steps,
  Alert,
} from 'antd';
import {
  InboxOutlined,
  SendOutlined,
  SafetyOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { createLostItem } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function PublishPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  // 未登录跳转
  if (!user && typeof window !== 'undefined') {
    message.info('请先登录后再发布');
    router.push('/login');
    return null;
  }

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await createLostItem({
        title: values.title,
        description: values.description,
        location: values.location,
        contact_name: values.contact_name,
        contact_phone: values.contact_phone,
        item_type: values.item_type,
      });
      message.success('发布成功！');
      router.push('/items');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: 24 }}>
        <Link href="/items">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginBottom: 12, fontWeight: 600, color: '#6B7280' }}>
            返回列表
          </Button>
        </Link>
        <Title level={3} style={{ marginBottom: 4, fontWeight: 700 }}>
          <SendOutlined style={{ marginRight: 10, color: '#6C5CE7' }} />
          发布招领信息
        </Title>
        <Text type="secondary">填写物品详细信息，帮助他人找到失物</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧表单 */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 16, border: '1px solid #ECEEF5' }} styles={{ body: { padding: '28px 32px' } }}>
            <Steps
              current={currentStep}
              onChange={setCurrentStep}
              size="small"
              style={{ marginBottom: 32 }}
              items={[
                { title: '填写信息', icon: <FileTextOutlined /> },
                { title: '确认发布', icon: <SendOutlined /> },
              ]}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
              initialValues={{ item_type: 'found' }}
            >
              <Form.Item
                name="item_type"
                label={<span style={{ fontWeight: 600 }}>信息类型</span>}
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: 'found', label: '🔍 失物招领（捡到了物品）' },
                    { value: 'lost', label: '📢 寻物启事（丢失了物品）' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="title"
                label={<span style={{ fontWeight: 600 }}>物品名称</span>}
                rules={[{ required: true, message: '请输入物品名称' }]}
              >
                <Input
                  prefix={<InboxOutlined style={{ color: '#A0A0B8' }} />}
                  placeholder="例如：黑色钱包、校园卡"
                  maxLength={50}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span style={{ fontWeight: 600 }}>详细描述</span>}
                rules={[{ required: true, message: '请描述物品特征' }]}
              >
                <Input.TextArea
                  placeholder="描述物品的颜色、品牌、特征等"
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="location"
                    label={<span style={{ fontWeight: 600 }}>地点</span>}
                    rules={[{ required: true, message: '请输入地点' }]}
                  >
                    <Input
                      prefix={<EnvironmentOutlined style={{ color: '#A0A0B8' }} />}
                      placeholder="捡到/丢失的地点"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="contact_name"
                    label={<span style={{ fontWeight: 600 }}>联系人</span>}
                    rules={[{ required: true, message: '请输入联系人' }]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: '#A0A0B8' }} />}
                      placeholder="您的姓名或昵称"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="contact_phone"
                label={<span style={{ fontWeight: 600 }}>联系电话</span>}
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#A0A0B8' }} />}
                  placeholder="手机号码"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                block
                size="large"
                icon={<SendOutlined />}
                className="btn-gradient-primary"
                style={{ height: 48, fontSize: 16, marginTop: 8 }}
              >
                确认发布
              </Button>
            </Form>
          </Card>
        </Col>

        {/* 右侧提示 */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Card style={{ borderRadius: 16, border: '1px solid #ECEEF5', background: '#F8F7FF' }}>
              <Title level={5} style={{ fontWeight: 700, marginBottom: 16 }}>
                <InfoCircleOutlined style={{ marginRight: 8, color: '#6C5CE7' }} />
                发布指南
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { num: '01', title: '选择类型', desc: '捡到物品选"失物招领"，丢失选"寻物启事"' },
                  { num: '02', title: '填写信息', desc: '尽量详细描述物品特征，方便失主辨认' },
                  { num: '03', title: '留下联系方式', desc: '方便他人联系您，信息会进行安全保护' },
                  { num: '04', title: '确认发布', desc: '检查无误后点击发布，信息将公开展示' },
                ].map((step) => (
                  <div key={step.num} style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: '#EEEDFD',
                      color: '#6C5CE7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 12,
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      {step.num}
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 14 }}>{step.title}</Text>
                      <Paragraph style={{ color: '#6B7280', fontSize: 13, marginBottom: 0 }}>{step.desc}</Paragraph>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Alert
              message="安全提示"
              description="为了保护您的隐私，请不要在描述中透露过多的个人信息。线下交接物品时，建议在人多的公共场所进行。"
              type="info"
              showIcon
              style={{ borderRadius: 12 }}
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
}
