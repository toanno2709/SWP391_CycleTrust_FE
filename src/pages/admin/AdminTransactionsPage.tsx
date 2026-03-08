import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Select, Space, Card, Statistic, Row, Col, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { orderService } from '../../services/order';
import type { Order } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { ORDER_STATUS_LABELS } from '../../config/constants';
import toast from 'react-hot-toast';

const { Option } = Select;

export default function AdminTransactionsPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    fromDate: '',
    toDate: '',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllForAdmin(filters);
      setOrders(data);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'CANCELED':
        return 'red';
      case 'DISPUTED':
        return 'orange';
      case 'SHIPPING':
        return 'blue';
      case 'DEPOSIT_PENDING':
      case 'DEPOSIT_PAID':
        return 'cyan';
      case 'CONFIRMED':
        return 'geekblue';
      default:
        return 'default';
    }
  };

  const totalRevenue = orders
    .filter(o => o.status === 'COMPLETED')
    .reduce((sum, o) => sum + o.priceAmount, 0);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => `#${id}`,
    },
    {
      title: 'Listing',
      dataIndex: 'listingTitle',
      key: 'listingTitle',
    },
    {
      title: 'Buyer',
      dataIndex: 'buyerName',
      key: 'buyerName',
    },
    {
      title: 'Seller',
      dataIndex: 'sellerName',
      key: 'sellerName',
    },
    {
      title: 'Giá',
      dataIndex: 'priceAmount',
      key: 'priceAmount',
      render: (amount: number, record: Order) => formatCurrency(amount, record.currency),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {ORDER_STATUS_LABELS[status]}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 80,
      render: (_: any, record: Order) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            label: 'Chi tiết',
            icon: <EyeOutlined />,
            onClick: () => navigate(`/admin/orders/${record.id}`)
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
      <h1 className="text-2xl font-bold mb-6">Quản lý Giao dịch</h1>

      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic title="Tổng đơn" value={orders.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Hoàn thành" 
              value={orders.filter(o => o.status === 'COMPLETED').length}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Đang giao" 
              value={orders.filter(o => o.status === 'SHIPPING').length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Tổng doanh thu" 
              value={totalRevenue}
              suffix="VND"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-6">
        <Space size="middle" wrap>
          <Select
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            style={{ width: 200 }}
            placeholder="Tất cả trạng thái"
          >
            <Option value="">Tất cả trạng thái</Option>
            <Option value="PLACED">Đã đặt</Option>
            <Option value="DEPOSIT_PENDING">Chờ cọc</Option>
            <Option value="DEPOSIT_PAID">Đã cọc</Option>
            <Option value="CONFIRMED">Xác nhận</Option>
            <Option value="SHIPPING">Đang giao</Option>
            <Option value="DELIVERED">Đã giao</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="CANCELED">Đã hủy</Option>
            <Option value="DISPUTED">Tranh chấp</Option>
          </Select>
          <Button type="primary" onClick={handleFilter}>
            Lọc
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: 'Không có transaction nào' }}
        />
      </Card>
    </div>
  );
}
