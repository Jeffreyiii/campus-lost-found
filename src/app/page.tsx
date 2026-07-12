'use client';

import { Button, Card, Col, Row, Typography } from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

/**
 * 首页
 * 展示系统简介与快捷入口
 */
export default function HomePage() {
  return (
    <div>
      {/* Hero 横幅 */}
      <div className="hero-section">
        <Title level={1} style={{ color: '#fff', marginBottom: 12 }}>
          校园失物招领系统
        </Title>
        <Paragraph style={{ color: '#fff', fontSize: 16, marginBottom: 24 }}>
          丢了东西？捡到物品？在这里快速发布和查找，让失物早日回家。
        </Paragraph>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link href="/items">
            <Button type="default" size="large" icon={<SearchOutlined />}>
              浏览招领列表
            </Button>
          </Link>
          <Link href="/publish">
            <Button type="primary" size="large" icon={<PlusOutlined />}>
              发布招领信息
            </Button>
          </Link>
        </div>
      </div>

      {/* 功能介绍卡片 */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={8}>
          <Card className="feature-card" bordered={false}>
            <SearchOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 12 }} />
            <Title level={4}>快速查找</Title>
            <Paragraph type="secondary">
              浏览全部失物招领信息，按类型筛选寻物启事或失物招领，快速找到你需要的物品。
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="feature-card" bordered={false}>
            <PlusOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 12 }} />
            <Title level={4}>便捷发布</Title>
            <Paragraph type="secondary">
              填写物品名称、描述、地点和联系方式，一键发布招领信息，让更多人看到。
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="feature-card" bordered={false}>
            <TeamOutlined style={{ fontSize: 32, color: '#fa8c16', marginBottom: 12 }} />
            <Title level={4}>互助社区</Title>
            <Paragraph type="secondary">
              连接校园师生，互帮互助，让每一件失物都能回到主人身边。
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
