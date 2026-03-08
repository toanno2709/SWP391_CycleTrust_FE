import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Tabs, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MainLayout } from '../../layouts/MainLayout';
import { orderService } from '../../services/order';
import type { Order } from '../../types';
import { formatCurrency } from '../../utils/format';

const { TabPane } = Tabs;

export default function BuyerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error: any) {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'blue';
      case 'DEPOSIT_PENDING':
        return 'orange';
      case 'DEPOSIT_PAID':
        return 'cyan';
      case 'CONFIRMED':
        return 'green';
      case 'SHIPPING':
        return 'purple';
      case 'DELIVERED':
        return 'lime';
      case 'COMPLETED':
        return 'success';
      case 'CANCELED':
        return 'red';
      case 'DISPUTED':
        return 'magenta';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
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
    return statusMap[status] || status;
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'listingTitle',
      key: 'listingTitle',
      ellipsis: true,
    },
    {
      title: 'Người bán',
      dataIndex: 'sellerName',
      key: 'sellerName',
      width: 150,
    },
    {
      title: 'Giá',
      dataIndex: 'priceAmount',
      key: 'priceAmount',
      width: 150,
      render: (amount, record) => formatCurrency(amount, record.currency),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending')
      return ['PLACED', 'DEPOSIT_PENDING', 'DEPOSIT_PAID', 'CONFIRMED'].includes(
        order.status
      );
    if (activeTab === 'shipping')
      return ['SHIPPING', 'DELIVERED'].includes(order.status);
    if (activeTab === 'completed') return order.status === 'COMPLETED';
    if (activeTab === 'canceled')
      return ['CANCELED', 'DISPUTED'].includes(order.status);
    return true;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Đơn hàng của tôi</h1>

        <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-6">
          <TabPane tab={`Tất cả (${orders.length})`} key="all" />
          <TabPane
            tab={`Chờ xử lý (${
              orders.filter((o) =>
                ['PLACED', 'DEPOSIT_PENDING', 'DEPOSIT_PAID', 'CONFIRMED'].includes(
                  o.status
                )
              ).length
            })`}
            key="pending"
          />
          <TabPane
            tab={`Đang giao (${
              orders.filter((o) => ['SHIPPING', 'DELIVERED'].includes(o.status))
                .length
            })`}
            key="shipping"
          />
          <TabPane
            tab={`Hoàn thành (${
              orders.filter((o) => o.status === 'COMPLETED').length
            })`}
            key="completed"
          />
          <TabPane
            tab={`Đã hủy (${
              orders.filter((o) => ['CANCELED', 'DISPUTED'].includes(o.status))
                .length
            })`}
            key="canceled"
          />
        </Tabs>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          loading={loading}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => navigate(`/buyer/orders/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
        />
      </div>
    </MainLayout>
  );
}
