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
import { UserOutlined, LockOutlined, SafetyOutlined, LoginOutlined } from '@ant-design/icons';
import { login as loginApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setSubmitting(true);
    try {
      const result = await loginApi(values.username, values.password);
      if (result.success && result.data) {
        const { token, user } = result.data;
        login(token, user);
        message.success(`欢迎回来，${user.nickname || user.username}！`);
        router.push(user.role === 'admin' ? '/admin' : '/');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败');
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
      background: 'linear-gradient(180deg, #F5F3FF 0%, #F5F6FA 100%)',
    }}>
      <div className="form-card animate-fade-in-up" style={{ maxWidth: 440, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 68,
            height: 68,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #6C5CE7 0%, #A855F7 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(108, 92, 231, 0.35)',
          }}>
            <SafetyOutlined style={{ fontSize: 34, color: '#fff' }} />
          </div>
          <Title level={3} style={{ marginBottom: 4, fontWeight: 800, color: '#1F2937' }}>
            欢迎回来
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>登录您的账号继续使用</Text>
        </div>

        <Form form={form} onFinish={handleSubmit} size="large" layout="vertical">
          <Form.Item
            name="username"
            label={<span style={{ fontWeight: 600 }}>用户名</span>}
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#A0A0B8' }} />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600 }}>密码</span>}
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#A0A0B8' }} />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              size="large"
              className="btn-gradient-primary"
              icon={<LoginOutlined />}
              style={{ height: 48, fontSize: 16 }}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '28px 0 20px' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            还没有账号？
          </Text>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <Link href="/register">
            <Button block size="large" style={{ borderRadius: 10, height: 46, fontWeight: 600 }}>
              立即注册
            </Button>
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            管理员测试账号：admin / admin123
          </Text>
        </div>
      </div>
    </div>
  );
}
