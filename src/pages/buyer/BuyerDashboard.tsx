import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../layouts/MainLayout';
import { orderService } from '../../services/order';
import type { Order } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { ORDER_STATUS_LABELS } from '../../config/constants';
import { Card, Loading } from '../../components/ui';

export const BuyerDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black mb-8">Dashboard Người mua</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-2xl">shopping_cart</span>
              </div>
              <div>
                <p className="text-3xl font-black">{orders.length}</p>
                <p className="text-sm text-slate-500">Đơn hàng</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-500 text-2xl">pending</span>
              </div>
              <div>
                <p className="text-3xl font-black">
                  {orders.filter(o => ['PLACED', 'DEPOSIT_PENDING', 'DEPOSIT_PAID', 'CONFIRMED'].includes(o.status)).length}
                </p>
                <p className="text-sm text-slate-500">Đang xử lý</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-500 text-2xl">check_circle</span>
              </div>
              <div>
                <p className="text-3xl font-black">
                  {orders.filter(o => o.status === 'COMPLETED').length}
                </p>
                <p className="text-sm text-slate-500">Hoàn thành</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link to="/buyer/wishlist">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-red-600 text-2xl">favorite</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold">Danh sách yêu thích</p>
                    <p className="text-sm text-slate-500">Xem xe đã lưu</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
              </div>
            </Card>
          </Link>

          <Link to="/buyer/disputes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-orange-600 text-2xl">report_problem</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold">Tranh chấp của tôi</p>
                    <p className="text-sm text-slate-500">Quản lý khiếu nại</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
              </div>
            </Card>
          </Link>
        </div>

        <Card>
          <h2 className="text-2xl font-bold mb-6">Đơn hàng gần đây</h2>
          
          {loading ? (
            <Loading />
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">shopping_cart</span>
              <p className="text-slate-500">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div
                  key={order.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-green-600 transition-colors"
                >
                  <img
                    src={order.listing?.media?.[0]?.url || 'https://via.placeholder.com/100'}
                    alt={order.listing?.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{order.listing?.title}</h3>
                    <p className="text-sm text-slate-500 mb-2">{formatDateTime(order.createdAt)}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        order.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                        order.status === 'CANCELED' ? 'bg-red-500/10 text-red-600' :
                        'bg-blue-500/10 text-blue-600'
                      }`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(order.priceAmount, order.currency)}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/buyer/orders/${order.id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Chi tiết
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};
