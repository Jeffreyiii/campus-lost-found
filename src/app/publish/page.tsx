'use client';

import { useState, useEffect } from 'react';
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
  Upload,
  Image,
  DatePicker,
  Tag,
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
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
  LoadingOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import { createLostItem, uploadImage } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

export default function PublishPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // 未登录跳转
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
      message.info('请先登录后再发布');
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  /** 图片上传到后端 -> Supabase Storage */
  const handleCustomUpload = async (options: any) => {
    const { file, onSuccess, onError } = options as {
      file: RcFile;
      onSuccess: (body: any, xhr?: XMLHttpRequest) => void;
      onError: (body: any) => void;
    };

    setUploading(true);
    try {
      const result = await uploadImage(file as File);
      const url = result.data!.url;
      setUploadedUrl(url);
      onSuccess(result, undefined as any);
      message.success('图片上传成功！');
    } catch (err: any) {
      onError(err);
      message.error(err?.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

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
        image_url: uploadedUrl || undefined,
        lost_time: values.lost_time ? values.lost_time.format('YYYY-MM-DD') : undefined,
      });
      message.success('发布成功！');
      router.push('/items');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return Upload.LIST_IGNORE;
    }
    return true; // 使用自定义上传
  };

  const handleRemove = () => {
    setUploadedUrl(null);
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
        <Text type="secondary">填写物品详细信息，上传图片让失主更容易辨认</Text>
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
                { title: '上传图片', icon: <PictureOutlined /> },
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
              {/* ---- Step 0: 基本信息（始终渲染，只控制显隐） ---- */}
              <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
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
                    placeholder="描述物品的颜色、品牌、特征等，越详细越好"
                    rows={4}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="lost_time"
                      label={<span style={{ fontWeight: 600 }}>丢失/捡到时间</span>}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="选择日期"
                        format="YYYY-MM-DD"
                      />
                    </Form.Item>
                  </Col>
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
                </Row>

                <Row gutter={16}>
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
                  <Col xs={24} sm={12}>
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
                  </Col>
                </Row>

                <Divider />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="primary"
                    onClick={() => form.validateFields().then(() => setCurrentStep(1)).catch(() => { })}
                    size="large"
                    style={{ borderRadius: 10, height: 44 }}
                  >
                    下一步 &rarr;
                  </Button>
                </div>
              </div>

              {/* ---- Step 1: 上传图片（始终渲染） ---- */}
              <div className="animate-fade-in" style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                <div style={{
                  background: '#F8F7FF',
                  borderRadius: 16,
                  padding: 28,
                  textAlign: 'center',
                  border: '2px dashed #C4B5FD',
                }}>
                  <PictureOutlined style={{ fontSize: 48, color: '#8B5CF6', marginBottom: 16, display: 'block' }} />
                  <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 8 }}>
                    上传物品图片（选填）
                  </Text>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>
                    清晰的照片能让失主更快辨认出物品
                  </Text>

                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    customRequest={handleCustomUpload}
                    onChange={({ fileList: newList }) => setFileList(newList)}
                    onRemove={handleRemove}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                  >
                    {fileList.length < 1 && (
                      <div>
                        {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                        <div style={{ marginTop: 8 }}>{uploading ? '上传中...' : '上传图片'}</div>
                      </div>
                    )}
                  </Upload>

                  {uploadedUrl && (
                    <div style={{ marginTop: 12 }}>
                      <Tag color="success" style={{ borderRadius: 6 }}>
                        图片已上传成功
                      </Tag>
                    </div>
                  )}
                </div>

                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    onClick={() => setCurrentStep(0)}
                    size="large"
                    style={{ borderRadius: 10, height: 44 }}
                  >
                    &larr; 上一步
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => setCurrentStep(2)}
                    size="large"
                    style={{ borderRadius: 10, height: 44 }}
                  >
                    下一步 &rarr;
                  </Button>
                </div>
              </div>

              {/* ---- Step 2: 确认发布（始终渲染） ---- */}
              <div className="animate-fade-in" style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                {/* 预览卡片 */}
                <div style={{
                  background: '#F9FAFB',
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 24,
                }}>
                  <Title level={5} style={{ fontWeight: 700, marginBottom: 16 }}>
                    信息预览
                  </Title>
                  {uploadedUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <Image
                        src={uploadedUrl}
                        alt="物品图片"
                        style={{ maxHeight: 200, borderRadius: 12 }}
                        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iMTQiPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4="
                      />
                    </div>
                  )}
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <Text type="secondary">类型：</Text>
                      <Text strong>
                        {form.getFieldValue('item_type') === 'found' ? '🔍 失物招领' : '📢 寻物启事'}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">物品：</Text>
                      <Text strong>{form.getFieldValue('title')}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">地点：</Text>
                      <Text strong>{form.getFieldValue('location')}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">时间：</Text>
                      <Text strong>{form.getFieldValue('lost_time')?.format('YYYY-MM-DD') || '未填写'}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">联系人：</Text>
                      <Text strong>{form.getFieldValue('contact_name')}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">电话：</Text>
                      <Text strong>{form.getFieldValue('contact_phone')}</Text>
                    </Col>
                    <Col span={24}>
                      <Text type="secondary">描述：</Text>
                      <Text>{form.getFieldValue('description')}</Text>
                    </Col>
                  </Row>
                </div>

                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    onClick={() => setCurrentStep(1)}
                    size="large"
                    style={{ borderRadius: 10, height: 44 }}
                  >
                    &larr; 上一步
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    size="large"
                    icon={<SendOutlined />}
                    className="btn-gradient-primary"
                    style={{ height: 48, fontSize: 16, borderRadius: 10 }}
                  >
                    确认发布
                  </Button>
                </div>
              </div>
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
                  { num: '03', title: '上传图片', desc: '清晰照片能大大提高找回成功率' },
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


