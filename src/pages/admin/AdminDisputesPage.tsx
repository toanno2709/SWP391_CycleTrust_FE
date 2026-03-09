import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Select, Space, Card, Statistic, Row, Col, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { disputeService } from '../../services/dispute';
import type { Dispute } from '../../services/dispute';
import toast from 'react-hot-toast';
import { toVietnamDate } from '../../utils/format';

const { Option } = Select;

export default function AdminDisputesPage() {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const data = await disputeService.getAll(statusFilter || undefined);
      setDisputes(data);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải disputes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'red';
      case 'ASSIGNED':
        return 'orange';
      case 'IN_PROGRESS':
        return 'blue';
      case 'RESOLVED':
        return 'green';
      case 'CLOSED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Mới mở';
      case 'ASSIGNED':
        return 'Đã giao';
      case 'IN_PROGRESS':
        return 'Đang xử lý';
      case 'RESOLVED':
        return 'Đã giải quyết';
      case 'CLOSED':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => `#${id}`,
    },
    {
      title: 'Order',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
      render: (orderId: number) => `#${orderId}`,
    },
    {
      title: 'Người tạo',
      dataIndex: 'openedByName',
      key: 'openedByName',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: 'Người xử lý',
      key: 'assigned',
      render: (_: any, record: Dispute) => 
        record.assignedInspectorName || record.assignedAdminName || '-',
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => toVietnamDate(date),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 80,
      render: (_: any, record: Dispute) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Xem chi tiết',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/admin/disputes/${record.id}`)
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý Tranh chấp</h1>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic title="Tổng dispute" value={disputes.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Mới mở" 
              value={disputes.filter(d => d.status === 'OPEN').length}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Đang xử lý" 
              value={disputes.filter(d => d.status === 'IN_PROGRESS').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Đã giải quyết" 
              value={disputes.filter(d => d.status === 'RESOLVED').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-6">
        <Space size="middle" wrap>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 200 }}
            placeholder="Tất cả trạng thái"
          >
            <Option value="">Tất cả trạng thái</Option>
            <Option value="OPEN">Mới mở</Option>
            <Option value="ASSIGNED">Đã giao</Option>
            <Option value="IN_PROGRESS">Đang xử lý</Option>
            <Option value="RESOLVED">Đã giải quyết</Option>
            <Option value="CLOSED">Đã đóng</Option>
          </Select>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={disputes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: 'Không có dispute nào' }}
        />
      </Card>
    </div>
  );
}
