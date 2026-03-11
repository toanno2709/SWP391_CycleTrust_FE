import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Select, Space, Card, Statistic, Row, Col, Dropdown } from 'antd';
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
      render: (status: string) => {
        let colorClass = '';
        switch (status) {
          case 'COMPLETED':
            colorClass = 'bg-green-100 text-green-700 border-green-300';
            break;
          case 'CANCELED':
            colorClass = 'bg-red-100 text-red-700 border-red-300';
            break;
          case 'DISPUTED':
            colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-300';
            break;
          case 'SHIPPING':
            colorClass = 'bg-blue-100 text-blue-700 border-blue-300';
            break;
          case 'DELIVERED':
            colorClass = 'bg-indigo-100 text-indigo-700 border-indigo-300';
            break;
          case 'DEPOSIT_PENDING':
          case 'DEPOSIT_PAID':
          case 'CONFIRMED':
            colorClass = 'bg-cyan-100 text-cyan-700 border-cyan-300';
            break;
          default:
            colorClass = 'bg-gray-100 text-gray-700 border-gray-300';
        }
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium border ${colorClass}`}>
            {ORDER_STATUS_LABELS[status]}
          </span>
        );
      },
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
