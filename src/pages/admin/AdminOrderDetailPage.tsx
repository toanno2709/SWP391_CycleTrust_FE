import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { orderService } from '../../services/order';
import type { Order, Payment } from '../../types';
import { formatDateTime } from '../../utils/format';

const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await orderService.getById(Number(id));
      setOrder(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải thông tin đơn hàng');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-gray-100 text-gray-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'DEPOSIT_PAID':
        return 'bg-purple-100 text-purple-800';
      case 'SHIPPING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELIVERED':
        return 'bg-teal-100 text-teal-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'DISPUTED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'Đã đặt';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'DEPOSIT_PAID':
        return 'Đã đặt cọc';
      case 'SHIPPING':
        return 'Đang vận chuyển';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'DISPUTED':
        return 'Tranh chấp';
      default:
        return status;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Đặt cọc';
      case 'FULL_PAYMENT':
        return 'Thanh toán đầy đủ';
      case 'REFUND':
        return 'Hoàn tiền';
      default:
        return type;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600';
      case 'COMPLETED':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      case 'REFUNDED':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Order Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Thông tin đơn hàng</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Thời gian tạo:</span>
                  <span className="font-medium">{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật:</span>
                  <span className="font-medium">{formatDateTime(order.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá xe:</span>
                  <span className="font-medium text-blue-600">
                    {order.priceAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiền cọc:</span>
                  <span className="font-medium text-purple-600">
                    {order.depositAmount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                {order.remainingAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền còn lại:</span>
                    <span className="font-medium text-green-600">
                      {order.remainingAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                )}
                {order.totalAmount && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-800 font-semibold">Tổng cộng:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {order.totalAmount.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">Thông tin liên quan</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Listing ID:</span>
                  <span className="font-medium">{order.listingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên xe:</span>
                  <span className="font-medium">{order.listingTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người mua (ID):</span>
                  <span className="font-medium">{order.buyerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên người mua:</span>
                  <span className="font-medium">{order.buyerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người bán (ID):</span>
                  <span className="font-medium">{order.sellerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên người bán:</span>
                  <span className="font-medium">{order.sellerName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dispute Info */}
          {order.status === 'DISPUTED' && (
            <div className="bg-orange-50 border border-orange-200 rounded p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-orange-800">⚠️ Đơn hàng đang có tranh chấp</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Đơn hàng này đang trong quá trình giải quyết tranh chấp.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/admin/disputes')}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm"
                >
                  Xem tranh chấp
                </button>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Trạng thái đơn hàng</h2>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>
              <div className="space-y-4">
                {['PLACED', 'CONFIRMED', 'DEPOSIT_PAID', 'SHIPPING', 'DELIVERED', 'COMPLETED'].map((status, index) => {
                  const isActive = 
                    status === 'PLACED' ||
                    (order.status === 'CONFIRMED' && ['PLACED', 'CONFIRMED'].includes(status)) ||
                    (order.status === 'DEPOSIT_PAID' && ['PLACED', 'CONFIRMED', 'DEPOSIT_PAID'].includes(status)) ||
                    (order.status === 'SHIPPING' && ['PLACED', 'CONFIRMED', 'DEPOSIT_PAID', 'SHIPPING'].includes(status)) ||
                    (order.status === 'DELIVERED' && ['PLACED', 'CONFIRMED', 'DEPOSIT_PAID', 'SHIPPING', 'DELIVERED'].includes(status)) ||
                    (order.status === 'COMPLETED' && true);

                  return (
                    <div key={status} className="relative flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isActive ? '✓' : index + 1}
                      </div>
                      <div className="ml-4">
                        <div className={`font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                          {getStatusText(status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment History */}
          {order.payments && order.payments.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Lịch sử thanh toán</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Loại</th>
                      <th className="px-4 py-2 text-right">Số tiền</th>
                      <th className="px-4 py-2 text-left">Trạng thái</th>
                      <th className="px-4 py-2 text-left">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.payments.map((payment: Payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-2">#{payment.id}</td>
                        <td className="px-4 py-2">{getPaymentTypeText(payment.type)}</td>
                        <td className="px-4 py-2 text-right font-medium">
                          {payment.amount.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className={`px-4 py-2 font-medium ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {formatDateTime(payment.paidAt || payment.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
