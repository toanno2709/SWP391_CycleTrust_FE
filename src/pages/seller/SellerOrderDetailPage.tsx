import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Image } from "antd";
import { MainLayout } from "../../layouts/MainLayout";
import { orderService } from "../../services/order";
import { listingService } from "../../services/listing";
import type { Order, Listing } from "../../types";
import toast from "react-hot-toast";
import { formatDateTime } from "../../utils/format";
import { ORDER_STATUS_LABELS } from "../../config/constants";

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500/10 text-green-600 border-green-600';
    case 'CANCELED':
      return 'bg-red-500/10 text-red-600 border-red-600';
    case 'DISPUTED':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-600';
    case 'DELIVERED':
      return 'bg-indigo-500/10 text-indigo-600 border-indigo-600';
    case 'SHIPPING':
      return 'bg-purple-500/10 text-purple-600 border-purple-600';
    case 'DEPOSIT_PAID':
      return 'bg-blue-500/10 text-blue-600 border-blue-600';
    default:
      return 'bg-slate-500/10 text-slate-600 border-slate-600';
  }
};

export default function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(Number(id));
      setOrder(data);
      
      if (data.listingId) {
        try {
          const listingData = await listingService.getById(data.listingId);
          setListing(listingData);
        } catch (err) {
          console.error('Failed to load listing details:', err);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tải order");
      navigate("/seller/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!order) return;
    try {
      await orderService.updateStatus(order.id, status as any);
      toast.success("Cập nhật trạng thái thành công");
      await loadOrder();
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const getTimelineSteps = (): Array<{ label: string; completed: boolean; date?: string | null }> => {
    if (!order) return [];
    
    const baseSteps: Array<{ label: string; completed: boolean; date?: string | null }> = [
      { label: 'Đặt hàng', completed: true, date: order.createdAt },
    ];

    if (order.depositRequired) {
      baseSteps.push({ 
        label: 'Cọc', 
        completed: !!order.depositPaidAt, 
        date: order.depositPaidAt 
      });
    }

    baseSteps.push(
      { label: 'Giao hàng', completed: ['SHIPPING', 'DELIVERED', 'COMPLETED'].includes(order.status), date: null },
      { label: 'Đã nhận', completed: ['DELIVERED', 'COMPLETED'].includes(order.status) || !!order.deliveredAt, date: order.deliveredAt },
      { label: 'Hoàn thành', completed: order.status === 'COMPLETED' || !!order.completedAt, date: order.completedAt }
    );

    return baseSteps;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Đang tải...</div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-xl">Không tìm thấy order</div>
        </div>
      </MainLayout>
    );
  }

  const timelineSteps = getTimelineSteps();
  const isCanceled = order.status === "CANCELED";

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/seller/dashboard")}
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            ← Quay lại
          </button>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-gray-800">Đơn hàng #{order.id}</span>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusBadgeClass(order.status)}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-6 text-gray-800">Tiến trình đơn hàng</h2>
          {isCanceled ? (
            <div className="flex items-center justify-center p-6 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  ✗
                </div>
                <div>
                  <p className="font-semibold text-red-700 text-lg">Đã hủy</p>
                  {order.canceledReason && (
                    <p className="text-sm text-red-600 mt-1">{order.canceledReason}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-between">
                {timelineSteps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center flex-1 relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg z-10 transition-all ${
                      step.completed 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </div>
                    
                    {index < timelineSteps.length - 1 && (
                      <div className={`absolute top-6 left-1/2 w-full h-1 -z-0 ${
                        timelineSteps[index + 1].completed ? 'bg-green-500' : 'bg-gray-200'
                      }`} style={{ transform: 'translateY(-50%)' }} />
                    )}
                    
                    <div className="text-center mt-3">
                      <p className={`font-semibold text-sm ${step.completed ? 'text-green-700' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(step.date).split(' ')[0]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin đơn hàng</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người mua</p>
                  <p className="font-semibold text-gray-800">{order.buyerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                  <p className="font-semibold text-gray-800">{formatDateTime(order.createdAt).split(' ')[0]}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                  <p className="font-bold text-xl text-green-600">{order.priceAmount.toLocaleString()} {order.currency}</p>
                </div>
                {order.depositRequired && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tiền cọc</p>
                    <p className="font-semibold text-gray-800">{order.depositAmount.toLocaleString()} {order.currency}</p>
                  </div>
                )}
                {order.shippingNote && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Ghi chú giao hàng</p>
                    <p className="font-semibold text-gray-800 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      📝 {order.shippingNote}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {listing && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin xe đạp</h3>
                
                {listing.media && listing.media.length > 0 && (
                  <div className="mb-6">
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4 h-80">
                      <Image
                        src={listing.media[selectedImageIndex].url}
                        alt={listing.title}
                        className="w-full h-full object-contain"
                        preview={{
                          mask: <div className="text-white">🔍 Xem ảnh lớn</div>
                        }}
                      />
                    </div>
                    

                    {listing.media.length > 1 && (
                      <div className="grid grid-cols-5 gap-2">
                        {listing.media.map((media, index) => (
                          <div
                            key={media.id}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all h-20 ${
                              selectedImageIndex === index
                                ? 'border-blue-500 shadow-lg'
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={media.url}
                              alt={`${listing.title} - ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm text-gray-500">Tên xe</p>
                    <p className="font-semibold text-gray-800">{listing.title}</p>
                  </div>
                  {listing.brandName && (
                    <div>
                      <p className="text-sm text-gray-500">Thương hiệu</p>
                      <p className="font-semibold text-gray-800">{listing.brandName}</p>
                    </div>
                  )}
                  {listing.categoryName && (
                    <div>
                      <p className="text-sm text-gray-500">Loại xe</p>
                      <p className="font-semibold text-gray-800">{listing.categoryName}</p>
                    </div>
                  )}
                  {listing.sizeLabel && (
                    <div>
                      <p className="text-sm text-gray-500">Kích cỡ</p>
                      <p className="font-semibold text-gray-800">{listing.sizeLabel}</p>
                    </div>
                  )}
                  {listing.yearModel && (
                    <div>
                      <p className="text-sm text-gray-500">Năm sản xuất</p>
                      <p className="font-semibold text-gray-800">{listing.yearModel}</p>
                    </div>
                  )}
                  {listing.conditionNote && (
                    <div>
                      <p className="text-sm text-gray-500">Tình trạng</p>
                      <p className="font-semibold text-gray-800">{listing.conditionNote}</p>
                    </div>
                  )}
                </div>

                {listing.description && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Mô tả</p>
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{listing.description}</p>
                  </div>
                )}
              </div>
            )}

            {order.payments && order.payments.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">💳 Lịch sử thanh toán</h3>
                <div className="space-y-3">
                  {order.payments.map((payment, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{payment.type}</p>
                        <p className="text-sm text-gray-600">{formatDateTime(payment.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          payment.status === 'PAID' ? 'text-green-600' : 
                          payment.status === 'FAILED' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {payment.amount.toLocaleString()} {payment.currency}
                        </p>
                        <p className={`text-xs font-semibold ${
                          payment.status === 'PAID' ? 'text-green-600' : 
                          payment.status === 'FAILED' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {payment.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Thao tác</h3>
              <div className="space-y-3">
                {(order.status === "CONFIRMED" || order.status === "DEPOSIT_PAID") && (
                  <>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                      <p className="text-sm font-medium text-blue-800 mb-1">Người mua đã thanh toán</p>
                      <p className="text-xs text-blue-600">Vui lòng xác nhận và gửi hàng</p>
                    </div>
                    <button
                      onClick={() => handleUpdateStatus("SHIPPING")}
                      className="w-full px-4 py-3 bg-blue-600 !text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg transition-colors"
                    >
                      Xác nhận và gửi hàng
                    </button>
                  </>
                )}

                {order.status === "SHIPPING" && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 mb-1">Đang giao hàng</p>
                    <p className="text-xs text-purple-600">
                      Chờ người mua xác nhận đã nhận hàng
                    </p>
                  </div>
                )}

                {order.status === "DELIVERED" && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm font-medium text-indigo-800 mb-1">Đã giao hàng</p>
                    <p className="text-xs text-indigo-600">
                      {order.depositRequired 
                        ? 'Chờ người mua thanh toán phần còn lại (tự động hoàn thành)' 
                        : 'Chờ người mua xác nhận hoàn thành'}
                    </p>
                  </div>
                )}

                {order.status === "COMPLETED" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-1">Đơn hàng hoàn thành</p>
                    <p className="text-xs text-green-600">Cảm ơn bạn đã bán hàng!</p>
                  </div>
                )}

                {(order.status === "PLACED" || order.status === "DEPOSIT_PENDING") && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Chờ thanh toán</p>
                    <p className="text-xs text-yellow-600">Chờ người mua thanh toán {order.status === "DEPOSIT_PENDING" ? 'tiền cọc' : ''}</p>
                  </div>
                )}


              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
