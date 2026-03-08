import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Tabs, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { MainLayout } from '../../layouts/MainLayout';
import { orderService } from '../../services/order';
import type { Order, OrderStatus } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';

const { TabPane } = Tabs;

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: 'Đã đặt',
  DEPOSIT_PENDING: 'Chờ cọc',
  DEPOSIT_PAID: 'Đã cọc',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  COMPLETED: 'Hoàn thành',
  CANCELED: 'Đã hủy',
  DISPUTED: 'Tranh chấp',
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PLACED: 'blue',
  DEPOSIT_PENDING: 'orange',
  DEPOSIT_PAID: 'cyan',
  CONFIRMED: 'green',
  SHIPPING: 'processing',
  DELIVERED: 'success',
  COMPLETED: 'default',
  CANCELED: 'error',
  DISPUTED: 'warning',
};

export const SellerOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === activeTab);

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => `#${id}`,
    },
    {
      title: 'Xe',
      dataIndex: 'listing',
      key: 'listing',
      render: (_: any, record: Order) => (
        <div>
          <div className="font-semibold">{record.listingTitle || 'N/A'}</div>
          <div className="text-xs text-slate-500">ID Listing: {record.listingId}</div>
        </div>
      ),
    },
    {
      title: 'Người mua',
      dataIndex: 'buyerName',
      key: 'buyer',
      render: (name: string, record: Order) => (
        <div>
          <div>{name || 'N/A'}</div>
          <div className="text-xs text-slate-500">ID: {record.buyerId}</div>
        </div>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'priceAmount',
      key: 'priceAmount',
      render: (amount: number, record: Order) => (
        <div>
          <div className="font-semibold text-green-600">
            {formatCurrency(amount, record.currency)}
          </div>
          {record.depositRequired && (
            <div className="text-xs text-slate-500">
              Cọc: {formatCurrency(record.depositAmount, record.currency)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus) => (
        <Tag color={ORDER_STATUS_COLORS[status]}>
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
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Order) => (
        <button
          onClick={() => navigate(`/seller/orders/${record.id}`)}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <EyeOutlined /> Xem chi tiết
        </button>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Quản lý Đơn hàng</h1>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tất cả" key="ALL" />
          <TabPane tab="Chờ cọc" key="DEPOSIT_PENDING" />
          <TabPane tab="Đã cọc" key="DEPOSIT_PAID" />
          <TabPane tab="Đã xác nhận" key="CONFIRMED" />
          <TabPane tab="Đang giao" key="SHIPPING" />
          <TabPane tab="Đã giao" key="DELIVERED" />
          <TabPane tab="Hoàn thành" key="COMPLETED" />
          <TabPane tab="Tranh chấp" key="DISPUTED" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </MainLayout>
  );
};
