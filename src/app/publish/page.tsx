'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Typography,
  message,
  Space,
} from 'antd';
import { createLostItem } from '@/lib/api';
import type { CreateLostItemPayload } from '@/types/lost-item';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * 发布招领信息表单页
 * 调用 POST /api/items 提交数据
 */
export default function PublishPage() {
  const [form] = Form.useForm<CreateLostItemPayload>();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  /** 提交表单，发布招领信息 */
  const handleSubmit = async (values: CreateLostItemPayload) => {
    setSubmitting(true);
    try {
      await createLostItem(values);
      message.success('发布成功！');
      form.resetFields();
      // 发布成功后跳转到列表页
      router.push('/items');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        发布招领信息
      </Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ item_type: 'found' }}
        >
          {/* 信息类型：失物招领 / 寻物启事 */}
          <Form.Item
            name="item_type"
            label="信息类型"
            rules={[{ required: true, message: '请选择信息类型' }]}
          >
            <Select
              options={[
                { value: 'found', label: '失物招领（我捡到了物品）' },
                { value: 'lost', label: '寻物启事（我丢失了物品）' },
              ]}
            />
          </Form.Item>

          {/* 物品名称 */}
          <Form.Item
            name="title"
            label="物品名称"
            rules={[
              { required: true, message: '请输入物品名称' },
              { max: 100, message: '名称不超过 100 字' },
            ]}
          >
            <Input placeholder="例如：黑色钱包、校园卡、雨伞" />
          </Form.Item>

          {/* 物品描述 */}
          <Form.Item
            name="description"
            label="物品描述"
            rules={[
              { required: true, message: '请输入物品描述' },
              { max: 500, message: '描述不超过 500 字' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请描述物品特征、颜色、品牌等详细信息"
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* 拾取/丢失地点 */}
          <Form.Item
            name="location"
            label="地点"
            rules={[
              { required: true, message: '请输入地点' },
              { max: 200, message: '地点不超过 200 字' },
            ]}
          >
            <Input placeholder="例如：图书馆三楼、食堂门口、教学楼 A 栋" />
          </Form.Item>

          {/* 联系人 */}
          <Form.Item
            name="contact_name"
            label="联系人"
            rules={[
              { required: true, message: '请输入联系人姓名' },
              { max: 50, message: '姓名不超过 50 字' },
            ]}
          >
            <Input placeholder="您的姓名" />
          </Form.Item>

          {/* 联系电话 */}
          <Form.Item
            name="contact_phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              {
                pattern: /^1[3-9]\d{9}$/,
                message: '请输入有效的手机号码',
              },
            ]}
          >
            <Input placeholder="11 位手机号码" maxLength={11} />
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                发布信息
              </Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
