'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Divider,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SmileOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { register as registerApi } from '@/lib/api';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: {
    username: string;
    nickname: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setSubmitting(true);
    try {
      await registerApi(values.username, values.password, values.nickname);
      message.success('注册成功！即将跳转登录页');
      setTimeout(() => router.push('/login'), 800);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '注册失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 180px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      background: 'linear-gradient(180deg, #ECFDF5 0%, #F5F6FA 100%)',
    }}>
      <div className="form-card animate-fade-in-up" style={{ maxWidth: 460, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 68,
            height: 68,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #00B894 0%, #14B8A6 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(0, 184, 148, 0.35)',
          }}>
            <SafetyOutlined style={{ fontSize: 34, color: '#fff' }} />
          </div>
          <Title level={3} style={{ marginBottom: 4, fontWeight: 800, color: '#1F2937' }}>
            创建账号
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>注册后即可发布招领信息</Text>
        </div>

        <Form form={form} onFinish={handleSubmit} size="large" layout="vertical">
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 600 }}>用户名</span>}
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少 2 个字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '仅支持字母、数字和下划线' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#A0A0B8' }} />}
              placeholder="用户名（字母/数字/下划线）"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="nickname"
            label={<span style={{ fontWeight: 600 }}>昵称</span>}
            rules={[{ max: 20, message: '昵称不超过 20 字' }]}
          >
            <Input
              prefix={<SmileOutlined style={{ color: '#A0A0B8' }} />}
              placeholder="昵称（选填，默认同用户名）"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600 }}>密码</span>}
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#A0A0B8' }} />}
              placeholder="密码（至少 6 位）"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span style={{ fontWeight: 600 }}>确认密码</span>}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#A0A0B8' }} />}
              placeholder="再次输入密码"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              size="large"
              style={{
                height: 48,
                fontSize: 16,
                borderRadius: 10,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #00B894 0%, #14B8A6 100%)',
                border: 'none',
                boxShadow: '0 4px 16px rgba(0, 184, 148, 0.3)',
              }}
            >
              注 册
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '28px 0 20px' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            已有账号？
          </Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link href="/login">
            <Button block size="large" icon={<ArrowLeftOutlined />} style={{ borderRadius: 10, height: 46, fontWeight: 600 }}>
              返回登录
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
