import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { 
  ShoppingOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined
} from '@ant-design/icons';
import { listingService } from '../../services/listing';
import type { Listing } from '../../types';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    verified: 0,
  });
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allListings = await listingService.getAll();
        setStats({
          total: allListings.length,
          pending: allListings.filter(l => l.status === 'PENDING_APPROVAL').length,
          approved: allListings.filter(l => l.status === 'APPROVED').length,
          verified: allListings.filter(l => l.status === 'VERIFIED').length,
        });
        setRecentListings(allListings.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Người bán',
      dataIndex: 'seller',
      key: 'seller',
      render: (seller: any) => seller?.fullName || '-',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Listings"
              value={stats.total}
              prefix={<ShoppingOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã xác thực"
              value={stats.verified}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#2ecc70' }}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Listings gần đây">
        <Table
          columns={columns}
          dataSource={recentListings}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <div className="mt-6">
        <Link to="/admin/listings" className="text-green-600 hover:underline">
          Xem tất cả listings →
        </Link>
      </div>
    </div>
  );
};
