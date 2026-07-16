'use client';

import {
  Typography,
  Card,
  Space,
  Steps,
  Tag,
  Alert,
} from 'antd';
import {
  SearchOutlined,
  PlusCircleOutlined,
  SafetyOutlined,
  PhoneOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  TeamOutlined,
  FormOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph, Text } = Typography;

const rules = [
  {
    icon: <FormOutlined />,
    title: '如实填写物品信息',
    desc: '发布时请尽可能详细描述物品特征（颜色、品牌、特殊标记等），帮助失主快速辨认。虚假信息将被删除并封禁账号。',
  },
  {
    icon: <PhoneOutlined />,
    title: '保护个人联系方式',
    desc: '平台仅展示您填写的联系方式。建议使用电话或微信联系，避免在评论区公开敏感个人信息（如身份证号、银行卡号等）。',
  },
  {
    icon: <CheckCircleOutlined />,
    title: '认领后及时标记',
    desc: '物品已被认领后，请及时点击"去认领"标记为已认领状态，避免他人重复联系。',
  },
  {
    icon: <ExclamationCircleOutlined />,
    title: '禁止发布违规内容',
    desc: '严禁发布广告、诈骗、违法等与失物招领无关的内容。一经发现，立即封禁账号。',
  },
  {
    icon: <LockOutlined />,
    title: '仅本人可管理',
    desc: '您发布的信息只有您自己可以删除或标记已认领。管理员有权管理所有信息。',
  },
  {
    icon: <TeamOutlined />,
    title: '友好互助，共建校园',
    desc: '评论时请保持友善，相互帮助。这是一个连接校园师生的社区，让我们共同维护温暖互助的氛围。',
  },
];

const steps = [
  {
    title: '注册/登录账号',
    description: '使用用户名和密码注册，登录后才能发布和管理物品信息。',
  },
  {
    title: '发布招领信息',
    description: '捡到物品 → 选择"失物招领"，丢失物品 → 选择"寻物启事"。填写物品标题、描述、地点、联系方式，上传物品照片（可选）。',
  },
  {
    title: '浏览与认领',
    description: '在"招领信息"页面浏览所有记录，点击卡片可查看详情并在评论区留言沟通。发布者可标记物品为已认领。',
  },
  {
    title: '管理我的发布',
    description: '在"我的发布"页面集中查看和管理自己发布的所有物品信息。',
  },
];

export default function GuidePage() {
  return (
    <div className="page-container" style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
      {/* 页面标题 */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #EEEDFD 0%, #DDD6FE 100%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          marginBottom: 16,
        }}>
          <SafetyOutlined style={{ color: '#6C5CE7' }} />
        </div>
        <Title level={2} style={{ marginBottom: 8, fontWeight: 700 }}>
          使用指南与规范
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          了解如何使用校园失物招领平台，熟悉平台规范，共建诚信互助校园
        </Text>
      </div>

      {/* 平台简介 */}
      <Card
        style={{ borderRadius: 16, marginBottom: 32, border: '1px solid #ECEEF5' }}
        styles={{ body: { padding: '28px 32px' } }}
      >
        <Title level={4} style={{ marginBottom: 16, fontWeight: 600 }}>
          <SearchOutlined style={{ marginRight: 8, color: '#6C5CE7' }} />
          平台介绍
        </Title>
        <Paragraph style={{ fontSize: 14, lineHeight: 1.9, color: '#4B5563', marginBottom: 0 }}>
          校园失物招领平台是一个专为校园师生打造的互助工具。无论你在校园中捡到他人遗失的物品，还是自己不小心丢失了贵重物品，都可以在这里发布信息。通过平台，丢失者和拾到者可以快速建立联系，让每一件遗失的物品都能找到回家的路。
        </Paragraph>
      </Card>

      {/* 使用流程 */}
      <Card
        style={{ borderRadius: 16, marginBottom: 32, border: '1px solid #ECEEF5' }}
        styles={{ body: { padding: '28px 32px' } }}
      >
        <Title level={4} style={{ marginBottom: 24, fontWeight: 600 }}>
          <PlusCircleOutlined style={{ marginRight: 8, color: '#6C5CE7' }} />
          使用流程
        </Title>
        <Steps
          direction="vertical"
          current={-1}
          items={steps.map((s, i) => ({
            title: <Text strong style={{ fontSize: 15 }}>{s.title}</Text>,
            description: <Text type="secondary" style={{ fontSize: 14, lineHeight: 1.7 }}>{s.description}</Text>,
            icon: <Tag color="#6C5CE7" style={{ borderRadius: 10, padding: '2px 10px', fontWeight: 700 }}>{i + 1}</Tag>,
          }))}
        />
      </Card>

      {/* 发布规范 */}
      <Card
        style={{ borderRadius: 16, marginBottom: 32, border: '1px solid #ECEEF5' }}
        styles={{ body: { padding: '28px 32px' } }}
      >
        <Title level={4} style={{ marginBottom: 8, fontWeight: 600 }}>
          <SafetyOutlined style={{ marginRight: 8, color: '#F97316' }} />
          平台规范与注意事项
        </Title>
        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24 }}>
          请仔细阅读以下规范，共同维护平台的良好秩序
        </Text>

        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          {rules.map((rule, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 16,
              padding: '16px 20px',
              background: '#F8FAFC',
              borderRadius: 12,
              border: '1px solid #EEF2F7',
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
                color: '#6C5CE7',
                border: '1px solid #EEEDFD',
              }}>
                {rule.icon}
              </div>
              <div>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>{rule.title}</Text>
                <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.7 }}>{rule.desc}</Text>
              </div>
            </div>
          ))}
        </Space>
      </Card>

      {/* 温馨提示 */}
      <Alert
        type="info"
        showIcon
        icon={<MessageOutlined />}
        style={{ borderRadius: 12, marginBottom: 32 }}
        message={
          <Text strong style={{ fontSize: 14 }}>温馨提示</Text>
        }
        description={
          <Paragraph style={{ fontSize: 13, lineHeight: 1.8, marginBottom: 0, color: '#4B5563' }}>
            首次使用？建议先浏览<Link href="/items" style={{ color: '#6C5CE7', fontWeight: 600 }}>招领信息</Link>页面了解当前有哪些失物。
            确定需要发布时，点击导航栏的<Text strong>发布信息</Text>即可开始。
            如有任何疑问或建议，欢迎联系平台管理员。
          </Paragraph>
        }
      />

      {/* 底部行动号召 */}
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <Space size={16}>
          <Link href="/items">
            <Tag
              style={{
                fontSize: 14,
                padding: '8px 20px',
                borderRadius: 10,
                cursor: 'pointer',
                border: '1px solid #DDD6FE',
                background: '#F8F7FF',
                color: '#6C5CE7',
                fontWeight: 600,
              }}
            >
              <SearchOutlined /> 浏览招领信息
            </Tag>
          </Link>
          <Link href="/publish">
            <Tag
              style={{
                fontSize: 14,
                padding: '8px 20px',
                borderRadius: 10,
                cursor: 'pointer',
                border: '1px solid #A7F3D0',
                background: '#ECFDF5',
                color: '#059669',
                fontWeight: 600,
              }}
            >
              <PlusCircleOutlined /> 发布招领信息
            </Tag>
          </Link>
        </Space>
      </div>
    </div>
  );
}
